import type { z } from "zod";
import type { authRedirectSchema } from "./controller/authRedirectController";

declare module "hono" {
  interface Env {
    Variables: {};
    Bindings: {};
    ValidatedData: {
      param: z.infer<typeof authRedirectSchema>;
    };
  }
}
