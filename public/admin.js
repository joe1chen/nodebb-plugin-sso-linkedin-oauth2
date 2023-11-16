'use strict';

define('admin/plugins/sso-linkedin', ['settings'], function (Settings) {
	var ACP = {};

	ACP.init = function () {
		Settings.load('sso-linkedin', $('.sso-linkedin'));

		$('#save').on('click', function() {
			Settings.save('sso-linkedin', $('.sso-linkedin'));
		});
	};

	return ACP;
});
