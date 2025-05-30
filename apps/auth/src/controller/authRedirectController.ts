import { getAuthUrl, getProviderConfig } from "../oauth";
import { z } from "zod";
import type { Context } from "hono";
import { zValidator } from "@hono/zod-validator";

export const authRedirectSchema = z.object({
  provider: z.enum(["google", "github"]),
});

export const authRedirectValidator = zValidator("param" as any, authRedirectSchema);

type AuthRedirectParams = z.infer<typeof authRedirectSchema>;

export const authRedirectController = (c: Context) => {
  // @ts-ignore
  const { provider } = c.req.valid("param") as AuthRedirectParams;
  const state = crypto.randomUUID();
  const config = getProviderConfig(provider, c.env);

  return c.redirect(getAuthUrl(config, state));
};
