(function(module) {
	"use strict";

	var User = module.parent.require('./user'),
		meta = module.parent.require('./meta'),
		db = module.parent.require('../src/database'),
		passport = module.parent.require('passport'),
		passportLinkedIn = require('passport-linkedin-oauth2').Strategy,
		fs = module.parent.require('fs'),
		path = module.parent.require('path'),
		async = module.parent.require('async'),
		winston = module.parent.require('winston'),
		nconf = module.parent.require('nconf');

	var constants = Object.freeze({
		'name': "LinkedIn",
		'admin': {
			'route': '/plugins/sso-linkedin',
			'icon': 'fa-linkedin-square'
		}
	});

	var LinkedIn = {};

	LinkedIn.init = function(params, callback) {
		function render(req, res, next) {
			res.render('admin/plugins/sso-linkedin', {});
		}

		params.router.get('/admin/plugins/sso-linkedin', params.middleware.admin.buildHeader, render);
		params.router.get('/api/admin/plugins/sso-linkedin', render);

		callback();
	}

	LinkedIn.getStrategy = function(strategies, callback) {
		meta.settings.get('sso-linkedin', function(err, settings) {
			if (!err && settings['id'] && settings['secret']) {
				passport.use(new passportLinkedIn({
					clientID: settings['id'],
					clientSecret: settings['secret'],
					callbackURL: nconf.get('url') + '/auth/linkedin/callback',
					scope: ['r_basicprofile', 'r_emailaddress'],
					state: true
				}, function(accessToken, refreshToken, profile, done) {
					LinkedIn.login(profile.id, profile.displayName, profile._json.emailAddress, profile._json.pictureUrl, (profile._json.location ? profile._json.location.name : null), profile._json.publicProfileUrl, function(err, user) {
						if (err) {
							return done(err);
						}
						done(null, user);
					});
				}));

				strategies.push({
					name: 'linkedin',
					url: '/auth/linkedin',
					callbackURL: '/auth/linkedin/callback',
					icon: 'fa-linkedin-square',
					scope: ''
				});
			}

			callback(null, strategies);
		});
	};

	LinkedIn.login = function(linkedInId, handle, email, picture, location, website, callback) {
		LinkedIn.getUidByLinkedInId(linkedInId, function(err, uid) {
			if(err) {
				return callback(err);
			}

			if (uid !== null) {
				// Existing User
				callback(null, {
					uid: uid
				});
			} else {
				// New User
				var success = function(uid, merge) {
					// Save linkedin-specific information to the user
					var data = {
						linkedInId: linkedInId,
						fullname: handle
					};

					if (!merge) {
						if (picture && 0 < picture.length) {
							data.uploadedpicture = picture;
							data.picture = picture;
						}

						if (location && 0 < location.length) {
							data.location = location;
						}

						if (website && 0 < website.length) {
							data.website = website;
						}
					}

					async.parallel([
						function(callback2) {
							db.setObjectField('linkedInId:uid', linkedInId, uid, callback2);
						},
						function(callback2) {
							User.setUserFields(uid, data, callback2);
						}
					], function(err, results) {
						if (err) {
							return callback(err);
						}

						callback(null, {
							uid: uid
						});
					});
				};

				User.getUidByEmail(email, function(err, uid) {
					if(err) {
						return callback(err);
					}

					if (!uid) {
						User.create({username: handle, email: email}, function(err, uid) {
							if(err) {
								return callback(err);
							}

							success(uid, false);
						});
					} else {
						success(uid, true); // Existing account -- merge
					}
				});
			}
		});
	};

	LinkedIn.getUidByLinkedInId = function(linkedInId, callback) {
		db.getObjectField('linkedInId:uid', linkedInId, function(err, uid) {
			if (err) {
				return callback(err);
			}
			callback(null, uid);
		});
	};

	LinkedIn.addMenuItem = function(custom_header, callback) {
		custom_header.authentication.push({
			"route": constants.admin.route,
			"icon": constants.admin.icon,
			"name": constants.name
		});

		callback(null, custom_header);
	};

	LinkedIn.deleteUserData = function(uid, callback) {
		async.waterfall([
			async.apply(User.getUserField, uid, 'linkedInId'),
			function(oAuthIdToDelete, next) {
				db.deleteObjectField('linkedInId:uid', oAuthIdToDelete, next);
			}
		], function(err) {
			if (err) {
				winston.error('[sso-linkedin] Could not remove OAuthId data for uid ' + uid + '. Error: ' + err);
				return callback(err);
			}
			callback(null, uid);
		});
	};

	module.exports = LinkedIn;
}(module));
