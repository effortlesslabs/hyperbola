import type { Context } from "hono";
import type { User } from "../userDb";
import { SQL_GET_REFRESH_TOKEN } from "../lib/sql";
import { ErrorCode, errorResponse } from "../errors";

export const refreshTokenController = async (c: Context) => {
  const { refreshToken } = await c.req.json().catch(() => ({}));
  if (!refreshToken) {
    return errorResponse(c, ErrorCode.MissingRefreshToken, 400);
  }
  const db = c.env.DB;
  const jwtSecret = c.env.JWT_SECRET;
  if (!jwtSecret) return errorResponse(c, ErrorCode.ServerMisconfigured, 500);

  // Look up refresh token in DB
  const row = await db.prepare(SQL_GET_REFRESH_TOKEN).bind(refreshToken).first();

  if (!row) {
    return errorResponse(c, ErrorCode.InvalidRefreshToken, 401);
  }
  // Check expiry
  if (row.expiresAt && new Date(row.expiresAt as string | number | Date) < new Date()) {
    return errorResponse(c, ErrorCode.RefreshTokenExpired, 401);
  }

  // Get user info
  const userDb = new (await import("../userDb")).UserDb(db);
  let user: User;
  try {
    user = await userDb.getUserById(row.userId as string);
  } catch {
    return errorResponse(c, ErrorCode.UserNotFound, 404);
  }

  // Issue new JWT
  const { signJwtHS256 } = await import("../lib/jwt");
  if (!user.providers || user.providers.length === 0) {
    return errorResponse(c, ErrorCode.NoLinkedProvider, 400);
  }
  const provider = user.providers[0].provider;
  const providerId = user.providers[0].providerId;
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
