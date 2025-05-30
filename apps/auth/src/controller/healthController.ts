import type { Context } from "hono";

export const healthController = (c: Context) => {
  return c.json({ status: "ok" });
};
