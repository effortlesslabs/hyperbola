import type { OAuthProviderConfig } from '../oauth';

/**
 * Returns the GitHub OAuth provider config.
 */
export function getGithubConfig(env: {
	GITHUB_CLIENT_ID: string;
	GITHUB_CLIENT_SECRET: string;
	OAUTH_REDIRECT_URI: string;
}): OAuthProviderConfig {
	return {
		name: 'github',
		authUrl: 'https://github.com/login/oauth/authorize',
		tokenUrl: 'https://github.com/login/oauth/access_token',
		clientId: env.GITHUB_CLIENT_ID,
		clientSecret: env.GITHUB_CLIENT_SECRET,
		scope: 'read:user user:email',
		extraAuthParams: {
			allow_signup: 'true',
		},
		getRedirectUri: () => env.OAUTH_REDIRECT_URI + '/auth/github/callback',
	};
}
