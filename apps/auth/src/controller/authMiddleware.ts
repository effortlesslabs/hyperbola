import { verifyJwtHS256 } from "../lib/jwt";
import type { Context, Next } from "hono";
import { ErrorCode, errorResponse } from "../errors";

export const authMiddleware = async (c: Context, next: Next) => {
  const auth = c.req.header("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return errorResponse(c, ErrorCode.Unauthorized, 401);
  }
  const token = auth.slice(7);
  const secret = c.env.JWT_SECRET;
  if (!secret) return errorResponse(c, ErrorCode.ServerMisconfigured, 500);
  try {
    const payload = await verifyJwtHS256(token, secret);
    if (!payload.sub) return errorResponse(c, ErrorCode.InvalidTokenNoSub, 401);
    c.set("userId", payload.sub);
    await next();
  } catch (e) {
    if (e instanceof Error && e.message === "Token expired") {
      return errorResponse(c, ErrorCode.TokenExpired, 401);
    }
    return errorResponse(c, ErrorCode.InvalidOrExpiredToken, 401);
  }
};
