import { verifyJwtHS256 } from "../lib/jwt";
import type { Context, Next } from "hono";

export const authMiddleware = async (c: Context, next: Next) => {
  const auth = c.req.header("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = auth.slice(7);
  const secret = c.env.JWT_SECRET;
  if (!secret) return c.json({ error: "Server misconfigured" }, 500);
  try {
    const payload = await verifyJwtHS256(token, secret);
    if (!payload.sub) return c.json({ error: "Invalid token: no sub" }, 401);
    c.set("userId", payload.sub);
    await next();
  } catch (e) {
    if (e instanceof Error && e.message === "Token expired") {
      return c.json({ error: "TokenExpired" }, 401);
    }
    return c.json({ error: "Invalid or expired token" }, 401);
  }
};
