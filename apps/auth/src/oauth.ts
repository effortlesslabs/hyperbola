import { getGoogleConfig } from './provider/google';
import { getGithubConfig } from './provider/github';

export type OAuthProviderConfig = {
	name: string;
	authUrl: string;
	tokenUrl: string;
	clientId: string;
	clientSecret: string;
	scope: string;
	extraAuthParams?: Record<string, string>;
	extraTokenParams?: Record<string, string>;
	getRedirectUri: () => string;
};

export function getAuthUrl(config: OAuthProviderConfig, state: string) {
	const params = new URLSearchParams({
		client_id: config.clientId,
		redirect_uri: config.getRedirectUri(),
		response_type: 'code',
		scope: config.scope,
		state,
		...config.extraAuthParams,
	});
	return `${config.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(config: OAuthProviderConfig, code: string): Promise<{ [key: string]: any }> {
	const params = new URLSearchParams({
		client_id: config.clientId,
		client_secret: config.clientSecret,
		code,
		grant_type: 'authorization_code',
		redirect_uri: config.getRedirectUri(),
		...config.extraTokenParams,
	});

	const headers: Record<string, string> = {
		'Content-Type': 'application/x-www-form-urlencoded',
	};
	// GitHub expects Accept: application/json
	if (config.name === 'github') {
		headers.Accept = 'application/json';
	}

	const res = await fetch(config.tokenUrl, {
		method: 'POST',
		headers,
		body: params,
	});
	return (await res.json()) as { [key: string]: any };
}
/**
 * Returns the provider config for a given provider name.
 * Throws if the provider is not supported.
 */
export function getProviderConfig(provider: string, env: any): OAuthProviderConfig {
	if (provider === 'google') {
		return getGoogleConfig(env);
	}
	if (provider === 'github') {
		return getGithubConfig(env);
	}
	throw new Error('Unsupported provider');
}
