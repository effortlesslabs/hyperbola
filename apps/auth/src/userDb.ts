export interface User {
  id: string;
  provider: string;
  provider_id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  created_at?: string;
}

export class UserDb {
  private db: any; // D1Database

  constructor(db: any) {
    this.db = db;
  }

  // Upsert user by provider/provider_id
  async upsertUser(user: {
    provider: string;
    provider_id: string;
    email: string | null;
    name: string | null;
    avatar_url: string | null;
  }): Promise<User> {
    await this.db
      .prepare(
        `INSERT INTO users (provider, provider_id, email, name, avatar_url, created_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(provider, provider_id) DO UPDATE SET
           email=excluded.email, name=excluded.name, avatar_url=excluded.avatar_url`
      )
      .bind(user.provider, user.provider_id, user.email, user.name, user.avatar_url)
      .run();

    return await this.getUserByProviderId(user.provider, user.provider_id);
  }

  // Get user by provider/provider_id
  async getUserByProviderId(provider: string, provider_id: string): Promise<User> {
    const row = await this.db
      .prepare(
        "SELECT id, provider, provider_id, email, name, avatar_url, created_at FROM users WHERE provider = ? AND provider_id = ?"
      )
      .bind(provider, provider_id)
      .first();
    if (!row) throw new Error("User not found");
    return row as User;
  }

  // Get user by id
  async getUserById(id: string): Promise<User> {
    const row = await this.db
      .prepare(
        "SELECT id, provider, provider_id, email, name, avatar_url, created_at FROM users WHERE id = ?"
      )
      .bind(id)
      .first();
    if (!row) throw new Error("User not found");
    return row as User;
  }
}
