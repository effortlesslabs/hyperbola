import type { Context } from "hono";

export const rootController = (c: Context) => {
  return c.text("Hello from Auth Service!");
};
