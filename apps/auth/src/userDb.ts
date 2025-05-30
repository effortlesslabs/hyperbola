import {
  SQL_GET_USER_BY_EMAIL,
  SQL_GET_PROVIDERS_BY_USER_ID,
  SQL_GET_USER_ID_BY_PROVIDER,
  SQL_GET_USER_BY_ID,
  SQL_GET_USER_ID_BY_EMAIL,
  SQL_UPDATE_USER_INFO,
  SQL_INSERT_USER,
  SQL_GET_PROVIDER_BY_USER_ID_AND_PROVIDER,
  SQL_INSERT_PROVIDER,
  SQL_UPDATE_PROVIDER_ID,
  SQL_GET_PROVIDER_BY_EMAIL,
} from "./lib/sql";

export interface ProviderAccount {
  provider: string;
  providerId: string;
  email: string | null;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  createdAt?: string;
  providers: ProviderAccount[];
}

export class UserDb {
  private db: any; // D1Database

  constructor(db: any) {
    this.db = db;
  }

  // Get user by email, including all linked providers
  async getUserByEmail(email: string): Promise<User | null> {
    const userRow = await this.db.prepare(SQL_GET_USER_BY_EMAIL).bind(email).first();
    if (!userRow) return null;

    const providers = await this.db.prepare(SQL_GET_PROVIDERS_BY_USER_ID).bind(userRow.id).all();

    return {
      ...userRow,
      providers: providers.results as ProviderAccount[],
    } as User;
  }

  // Get user by provider/providerId
  async getUserByProviderId(provider: string, providerId: string): Promise<User> {
    const providerRow = await this.db
      .prepare(SQL_GET_USER_ID_BY_PROVIDER)
      .bind(provider, providerId)
      .first();
    if (!providerRow) throw new Error("User not found");
    return await this.getUserById(providerRow.userId);
  }

  // Get user by id, including all linked providers
  async getUserById(id: string): Promise<User> {
    const userRow = await this.db.prepare(SQL_GET_USER_BY_ID).bind(id).first();
    if (!userRow) throw new Error("User not found");

    const providers = await this.db.prepare(SQL_GET_PROVIDERS_BY_USER_ID).bind(id).all();

    return {
      ...userRow,
      providers: providers.results as ProviderAccount[],
    } as User;
  }

  // Upsert user and link provider
  async upsertUser(user: {
    provider: string;
    providerId: string;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
  }): Promise<User> {
    const providerRow = await this.db.prepare(SQL_GET_PROVIDER_BY_EMAIL).bind(user.email).first();

    let userId: string;
    if (providerRow) {
      userId = providerRow.userId;
      // Update user info
      await this.db.prepare(SQL_UPDATE_USER_INFO).bind(user.name, user.avatarUrl, userId).run();
    } else {
      // Insert new user
      await this.db.prepare(SQL_INSERT_USER).bind(user.email, user.name, user.avatarUrl).run();
      // Get new user id
      const newUser = await this.db.prepare(SQL_GET_USER_ID_BY_EMAIL).bind(user.email).first();
      if (!newUser) throw new Error("User not found after insert");
      userId = newUser.id;
    }

    // Link provider if not already linked
    const existingProvider = await this.db
      .prepare(SQL_GET_PROVIDER_BY_USER_ID_AND_PROVIDER)
      .bind(userId, user.provider)
      .first();

    if (!existingProvider) {
      await this.db.prepare(SQL_INSERT_PROVIDER).bind(userId, user.provider, user.providerId).run();
    } else {
      // Update providerId if changed
      await this.db
        .prepare(SQL_UPDATE_PROVIDER_ID)
        .bind(user.providerId, existingProvider.id)
        .run();
    }

    return await this.getUserById(userId);
  }
}
