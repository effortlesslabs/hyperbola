import { getGoogleConfig } from "./provider/google";
import { getGithubConfig } from "./provider/github";

import { UserDb } from "./userDb";

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
    response_type: "code",
    scope: config.scope,
    state,
    ...config.extraAuthParams,
  });
  return `${config.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  config: OAuthProviderConfig,
  code: string
): Promise<{ [key: string]: any }> {
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.getRedirectUri(),
    ...config.extraTokenParams,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  // GitHub expects Accept: application/json
  if (config.name === "github") {
    headers.Accept = "application/json";
  }

  const res = await fetch(config.tokenUrl, {
    method: "POST",
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
  if (provider === "google") {
    return getGoogleConfig(env);
  }
  if (provider === "github") {
    return getGithubConfig(env);
  }
  throw new Error("Unsupported provider");
}
/**
 * Handles the OAuth callback logic for supported providers.
 * @param c Hono context
 */
export async function handleOAuthCallback(c: any) {
  const { provider } = c.req.valid("param");
  const { code } = c.req.valid("query");

  const config = getProviderConfig(provider, c.env);
  const tokenData = await exchangeCodeForToken(config, code);

  // Fetch user profile from provider
  let userProfile: any;
  if (provider === "google") {
    const { getGoogleUser } = await import("./provider/google");
    userProfile = await getGoogleUser(tokenData.access_token);
  } else if (provider === "github") {
    const { getGithubUser } = await import("./provider/github");
    userProfile = await getGithubUser(tokenData.access_token);
  } else {
    return c.json({ error: "Unsupported provider" }, 400);
  }

  // Upsert or fetch user in D1 using UserDb
  const db = c.env.DB;
  const providerId = String(userProfile.id);
  const email = userProfile.email ?? null;
  const name = userProfile.name ?? null;
  const avatarUrl = userProfile.avatarUrl ?? userProfile.avatar_url ?? null;

  const userDb = new UserDb(db);
  // Upsert user and get user row
  const userRow = await userDb.upsertUser({
    provider,
    providerId,
    email,
    name,
    avatarUrl,
  });

  // Generate JWT
  const { signJwtHS256 } = await import("./lib/jwt");
  const jwtSecret = c.env.JWT_SECRET;
  const jwt = await signJwtHS256(
    {
      sub: String(userRow.id),
      provider,
      provider_id: providerId,
      email,
      name,
      avatar_url: avatarUrl,
    },
    jwtSecret,
    60 * 60 * 24 // 24h
  );

  // Generate refresh token (random UUID)
  const refreshToken = crypto.randomUUID();
  // Store refresh token in D1 (with expiry, e.g., 30d)
  await db
    .prepare(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES (?, ?, datetime('now', '+30 days'))`
    )
    .bind(userRow.id, refreshToken)
    .run();

  return c.json({
    jwt,
    refresh_token: refreshToken,
    user: {
      id: userRow.id,
      provider,
      providerId: providerId,
      email,
      name,
      avatarUrl: avatarUrl,
    },
  });
}
