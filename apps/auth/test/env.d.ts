declare module 'cloudflare:test' {
	interface ProvidedEnv extends Env {
		GOOGLE_CLIENT_ID: string;
		GOOGLE_CLIENT_SECRET: string;
		GITHUB_CLIENT_ID: string;
		GITHUB_CLIENT_SECRET: string;
		OAUTH_REDIRECT_URI: string;
	}
}
