import type { OAuthProviderConfig } from "../oauth";

/**
 * Returns the Google OAuth provider config.
 */
export function getGoogleConfig(env: {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  OAUTH_REDIRECT_URI: string;
}): OAuthProviderConfig {
  return {
    name: "google",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    scope: "openid email profile",
    extraAuthParams: {
      access_type: "offline",
      prompt: "consent",
    },
    getRedirectUri: () => env.OAUTH_REDIRECT_URI + "/auth/google/callback",
  };
}
/**
 * Fetches the Google user profile using the provided access token.
 * @param accessToken The OAuth2 access token.
 * @returns The Google user profile as an object.
 */
export async function getGoogleUser(accessToken: string): Promise<any> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch Google user: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
