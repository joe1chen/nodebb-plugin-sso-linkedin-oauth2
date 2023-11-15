(function(module) {
	"use strict";

	var User = require.main.require('./src/user'),
		meta = require.main.require('./src/meta'),
		db = require.main.require('./src/database'),
		passport = require.main.require('passport'),
		passportLinkedIn = require('passport-linkedin-oauth2').Strategy,
		winston = require.main.require('winston'),
		nconf = require.main.require('nconf'),
		routeHelpers = require.main.require('./src/routes/helpers');

	const async = require('async');

	var constants = Object.freeze({
		'name': "LinkedIn",
		'admin': {
			'route': '/plugins/sso-linkedin',
			'icon': 'fa-linkedin-square'
		}
	});

	var LinkedIn = {};

	LinkedIn.init = function(params, callback) {
		const { router } = params;
		routeHelpers.setupAdminPageRoute(router, '/admin/plugins/sso-linkedin', function (req, res, next) {
			res.render('admin/plugins/sso-linkedin', {
				title: 'LinkedIn SSO',
			});
		})

		callback();
	}

	LinkedIn.getStrategy = function(strategies, callback) {
		meta.settings.get('sso-linkedin', function(err, settings) {
			if (!err && settings['id'] && settings['secret']) {
				passport.use(new passportLinkedIn({
					clientID: settings['id'],
					clientSecret: settings['secret'],
					callbackURL: nconf.get('url') + '/auth/linkedin/callback',
					scope: ['email', 'profile', 'openid'],
					state: true
				}, function(accessToken, refreshToken, profile, done) {
					LinkedIn.login(profile.id, profile.displayName, profile.email, profile.picture, function(err, user) {
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
					icons: {
						normal: 'fa-brands fa-linkedin-in',
						square: 'fa-brands fa-linkedin',
					},
					labels: {
						login: '[[social:sign-in-with-linkedin]]',
						register: '[[social:sign-up-with-linkedin]]',
					},
					color: '#0a66c2',
					scope: '',
				});
			}

			callback(null, strategies);
		});
	};

	LinkedIn.login = function(linkedInId, handle, email, picture, callback) {
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
