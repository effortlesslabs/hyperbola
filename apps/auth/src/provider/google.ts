import type { OAuthProviderConfig } from '../oauth';

/**
 * Returns the Google OAuth provider config.
 */
export function getGoogleConfig(env: {
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	OAUTH_REDIRECT_URI: string;
}): OAuthProviderConfig {
	return {
		name: 'google',
		authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
		tokenUrl: 'https://oauth2.googleapis.com/token',
		clientId: env.GOOGLE_CLIENT_ID,
		clientSecret: env.GOOGLE_CLIENT_SECRET,
		scope: 'openid email profile',
		extraAuthParams: {
			access_type: 'offline',
			prompt: 'consent',
		},
		getRedirectUri: () => env.OAUTH_REDIRECT_URI + '/auth/google/callback',
	};
}
