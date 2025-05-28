import type { OAuthProviderConfig } from "../oauth";

/**
 * Returns the GitHub OAuth provider config.
 */
export function getGithubConfig(env: {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  OAUTH_REDIRECT_URI: string;
}): OAuthProviderConfig {
  return {
    name: "github",
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    scope: "read:user user:email",
    extraAuthParams: {
      allow_signup: "true",
    },
    getRedirectUri: () => env.OAUTH_REDIRECT_URI + "/auth/github/callback",
  };
}

export interface GithubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
}

export async function getGithubUser(accessToken: string): Promise<GithubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  const user = (await response.json()) as GithubUser;
  return {
    id: user.id,
    login: user.login,
    name: user.name ?? null,
    email: user.email ?? null,
    avatar_url: user.avatar_url ?? null,
    bio: user.bio ?? null,
    location: user.location ?? null,
  };
}
