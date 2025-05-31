import { Hono } from "hono";

import { authRedirectController, authRedirectValidator } from "./controller/authRedirectController";
import {
  authCallbackController,
  authCallbackParamValidator,
  authCallbackQueryValidator,
} from "./controller/authCallbackController";
import { authMiddleware } from "./controller/authMiddleware";
import { refreshTokenController } from "./controller/refreshTokenController";
import { rootController } from "./controller/rootController";
import { healthController } from "./controller/healthController";
import { versionController } from "./controller/versionController";

import { getCurrentUserController, getUserByIdController } from "./controller/userController";

type Variables = {
  userId: string;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.get("/auth/:provider", authRedirectValidator, authRedirectController);

app.get(
  "/auth/:provider/callback",
  authCallbackParamValidator,
  authCallbackQueryValidator,
  authCallbackController
);

app.use("/user", authMiddleware);
app.get("/user", getCurrentUserController);
app.get("/user/:id", getUserByIdController);

app.post("/auth/refresh", refreshTokenController);

app.get("/", rootController);

app.get("/health", healthController);

app.get("/version", versionController);

export default app;
