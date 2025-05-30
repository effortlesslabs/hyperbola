import type { Context } from "hono";

export const versionController = (c: Context) => {
  return c.json({ version: "1.0.0" });
};
