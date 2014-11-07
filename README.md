# NodeBB LinkedIn SSO OAuth2

NodeBB Plugin that allows users to login/register via their LinkedIn account.

## Installation

    npm install nodebb-plugin-sso-linkedin-oauth2

## Configuration

1. Sign in at [LinkedIn Developer Network](http://developer.linkedin.com/)
1. From the account name dropdown menu select API Keys
1. It may ask you to sign in once again
1. Click + Add New Application button
1. Fill out all required fields
1. For Default Scope make sure at least the following is checked: r_fullprofile, r_emailaddress, r_network
1. Set your "OAuth 2.0 Redirect URLs" as the domain you access your NodeBB with `/auth/linkedin/callback` appended to it (e.g. `https://www.mygreatwebsite.com/auth/linkedin/callback`)
1. Locate your API Key and Secret Key
1. Finish by clicking Save button