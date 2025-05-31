import type { Context } from "hono";
import { UserDb } from "../user-db";
import { ErrorCode, errorResponse } from "../errors";

// GET /user - get current user (from authMiddleware)
export const getCurrentUserController = async (c: Context) => {
  const userId = c.get("userId");
  if (!userId) {
    return errorResponse(c, ErrorCode.Unauthorized, 401);
  }
  const db = c.env.DB;
  const userDb = new UserDb(db);
  try {
    const user = await userDb.getUserById(userId);
    return c.json({ user });
  } catch (e) {
    return errorResponse(c, ErrorCode.UserNotFound, 404);
  }
};

// GET /user/:id - get user by ID (for admin or self)
export const getUserByIdController = async (c: Context) => {
  const { id } = c.req.param();
  const db = c.env.DB;
  const userDb = new UserDb(db);
  try {
    const user = await userDb.getUserById(id);
    return c.json({ user });
  } catch (e) {
    return errorResponse(c, ErrorCode.UserNotFound, 404);
  }
};
