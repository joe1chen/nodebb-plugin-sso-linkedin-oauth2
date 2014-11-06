<h1><i class="fa fa-linkedin-square"></i> LinkedIn Accounts Social Authentication</h1>
<hr />

<form class="sso-linkedin">
	<div class="alert alert-warning">
		<p>
			Create a <strong>LinkedIn Application</strong> via the
			<a href="http://developer.linkedin.com/">LinkedIn Developer Network</a> and then paste
			your application details here.
		</p>
		<br />
		<input type="text" name="id" title="API Key" class="form-control input-lg" placeholder="API Key"><br />
		<input type="text" name="secret" title="Secret Key" class="form-control" placeholder="Secret Key">
		<p class="help-block">
			The appropriate "OAuth 2.0 Redirect URLs" is your NodeBB's URL with `/auth/linkedin/callback` appended to it.
		</p>
	</div>
</form>

<button class="btn btn-lg btn-primary" type="button" id="save">Save</button>

<script>
	require(['settings'], function(Settings) {
		Settings.load('sso-linkedin', $('.sso-linkedin'));

		$('#save').on('click', function() {
			Settings.save('sso-linkedin', $('.sso-linkedin'));
		});
	});
</script>