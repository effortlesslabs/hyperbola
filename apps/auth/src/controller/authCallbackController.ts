import { handleOAuthCallback } from "../oauth";
import type { Context } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

export const authCallbackParamValidator = zValidator(
  "param",
  z.object({
    provider: z.enum(["google", "github"]),
  })
);

export const authCallbackQueryValidator = zValidator(
  "query",
  z.object({
    code: z.string().min(1),
  })
);

export const authCallbackController = async (c: Context) => {
  return handleOAuthCallback(c);
};
