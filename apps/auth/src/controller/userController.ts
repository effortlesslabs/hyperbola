import type { Context } from "hono";
import { UserDb } from "../userDb";

// GET /user - get current user (from authMiddleware)
export const getCurrentUserController = async (c: Context) => {
  const userId = c.get("userId");
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const db = c.env.DB;
  const userDb = new UserDb(db);
  try {
    const user = await userDb.getUserById(userId);
    return c.json({ user });
  } catch (e) {
    return c.json({ error: "User not found" }, 404);
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
    return c.json({ error: "User not found" }, 404);
  }
};
