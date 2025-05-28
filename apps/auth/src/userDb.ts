export interface User {
  id: string;
  provider: string;
  providerId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  createdAt?: string;
}

export class UserDb {
  private db: any; // D1Database

  constructor(db: any) {
    this.db = db;
  }

  // Upsert user by provider/providerId
  async upsertUser(user: {
    provider: string;
    providerId: string;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
  }): Promise<User> {
    await this.db
      .prepare(
        `INSERT INTO users (provider, providerId, email, name, avatarUrl, createdAt)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(provider, providerId) DO UPDATE SET
           email=excluded.email, name=excluded.name, avatarUrl=excluded.avatarUrl`
      )
      .bind(user.provider, user.providerId, user.email, user.name, user.avatarUrl)
      .run();

    return await this.getUserByProviderId(user.provider, user.providerId);
  }

  // Get user by provider/providerId
  async getUserByProviderId(provider: string, providerId: string): Promise<User> {
    const row = await this.db
      .prepare(
        "SELECT id, provider, providerId, email, name, avatarUrl, createdAt FROM users WHERE provider = ? AND providerId = ?"
      )
      .bind(provider, providerId)
      .first();
    if (!row) throw new Error("User not found");
    return row as User;
  }

  // Get user by id
  async getUserById(id: string): Promise<User> {
    const row = await this.db
      .prepare(
        "SELECT id, provider, providerId, email, name, avatarUrl, createdAt FROM users WHERE id = ?"
      )
      .bind(id)
      .first();
    if (!row) throw new Error("User not found");
    return row as User;
  }
}
