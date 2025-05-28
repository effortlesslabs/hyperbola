import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { getAuthUrl, getProviderConfig, handleOAuthCallback } from "./oauth";
import { verifyJwtHS256 } from "./lib/jwt";
import type { User } from "./userDb";

type Variables = {
  userId: string;
};
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Generic auth redirect handler
app.get(
  "/auth/:provider",
  zValidator(
    "param",
    z.object({
      provider: z.enum(["google", "github"]),
    })
  ),
  (c) => {
    const { provider } = c.req.valid("param");
    const state = crypto.randomUUID();
    const config = getProviderConfig(provider, c.env);

    return c.redirect(getAuthUrl(config, state));
  }
);

// Generic callback handler
app.get(
  "/auth/:provider/callback",
  zValidator(
    "param",
    z.object({
      provider: z.enum(["google", "github"]),
    })
  ),
  zValidator(
    "query",
    z.object({
      code: z.string().min(1),
    })
  ),
  async (c) => {
    return handleOAuthCallback(c);
  }
);

app.get("/", (c) => {
  return c.text("Hello from Auth Service!");
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/version", (c) => {
  return c.json({ version: "1.0.0" });
});

// Auth middleware
app.use("/user", async (c, next) => {
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
    return c.json({ error: "Invalid or expired token" }, 401);
  }
});
// Refresh token endpoint
app.post("/auth/refresh", async (c) => {
  const { refresh_token } = await c.req.json().catch(() => ({}));
  if (!refresh_token) {
    return c.json({ error: "Missing refresh_token" }, 400);
  }
  const db = c.env.DB;
  const jwtSecret = c.env.JWT_SECRET;
  if (!jwtSecret) return c.json({ error: "Server misconfigured" }, 500);

  // Look up refresh token in DB
  const row = await db
    .prepare("SELECT user_id, expires_at FROM refresh_tokens WHERE token = ?")
    .bind(refresh_token)
    .first();

  if (!row) {
    return c.json({ error: "Invalid refresh token" }, 401);
  }
  // Check expiry
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return c.json({ error: "Refresh token expired" }, 401);
  }

  // Get user info
  const userDb = new (await import("./userDb")).UserDb(db);
  let user: User;
  try {
    user = await userDb.getUserById(row.user_id);
  } catch {
    return c.json({ error: "User not found" }, 404);
  }

  // Issue new JWT
  const { signJwtHS256 } = await import("./lib/jwt");
  const jwt = await signJwtHS256(
    {
      sub: String(user.id),
      provider: user.provider,
      provider_id: user.providerId,
      email: user.email,
      name: user.name,
      avatar_url: user.avatarUrl,
    },
    jwtSecret,
    60 * 60 * 24 // 24h
  );

  return c.json({ jwt });
});

export default app;
