
<div class="acp-page-container">
	<!-- IMPORT admin/partials/settings/header.tpl -->

	<div class="row m-0">
		<div id="spy-container" class="col-12 px-0 mb-4" tabindex="0">
			<form class="sso-linkedin">
				<div class="alert alert-warning">
					<p>
						Create a <strong>LinkedIn Application</strong> via the
						<a href="http://developer.linkedin.com/">LinkedIn Developer Network</a> and then paste
						your application details here.
					</p>
					<div class="mb-3">
						<label class="form-label">Client ID</label>
						<input type="text" name="id" class="form-control input-lg">
					</div>
					<div class="mb-3">
						<label class="form-label">Client Secret</label>
						<input type="text" name="secret" title="Secret Key" class="form-control" placeholder="Secret Key">
					</div>

					<p class="form-text">
						The appropriate "OAuth 2.0 Redirect URLs" is your NodeBB's URL with `/auth/linkedin/callback` appended to it.
					</p>
				</div>
			</form>
		</div>
	</div>
</div>

