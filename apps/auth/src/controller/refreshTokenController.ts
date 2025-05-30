import type { Context } from "hono";
import type { User } from "../userDb";
import { SQL_GET_REFRESH_TOKEN } from "../lib/sql";

export const refreshTokenController = async (c: Context) => {
  const { refresh_token } = await c.req.json().catch(() => ({}));
  if (!refresh_token) {
    return c.json({ error: "Missing refresh_token" }, 400);
  }
  const db = c.env.DB;
  const jwtSecret = c.env.JWT_SECRET;
  if (!jwtSecret) return c.json({ error: "Server misconfigured" }, 500);

  // Look up refresh token in DB
  const row = await db.prepare(SQL_GET_REFRESH_TOKEN).bind(refresh_token).first();

  if (!row) {
    return c.json({ error: "Invalid refresh token" }, 401);
  }
  // Check expiry
  if (row.expires_at && new Date(row.expires_at as string | number | Date) < new Date()) {
    return c.json({ error: "Refresh token expired" }, 401);
  }

  // Get user info
  const userDb = new (await import("../userDb")).UserDb(db);
  let user: User;
  try {
    user = await userDb.getUserById(row.user_id as string);
  } catch {
    return c.json({ error: "User not found" }, 404);
  }

  // Issue new JWT
  const { signJwtHS256 } = await import("../lib/jwt");
  const provider = user.providers?.[0]?.provider ?? null;
  const providerId = user.providers?.[0]?.providerId ?? null;
  const jwt = await signJwtHS256(
    {
      sub: String(user.id),
      provider,
      provider_id: providerId,
      email: user.email ?? null,
      name: user.name ?? null,
      avatar_url: user.avatarUrl ?? null,
    },
    jwtSecret,
    60 * 60 * 24 // 24h
  );

  return c.json({
    jwt,
    user: {
      id: user.id,
      provider,
      providerId,
      email: user.email ?? null,
      name: user.name ?? null,
      avatarUrl: user.avatarUrl ?? null,
    },
  });
};
