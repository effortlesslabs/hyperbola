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
  private db: any; // Type it as D1Database if using types

  constructor(db: any) {
    this.db = db;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const userRow = await this.db.prepare(SQL_GET_USER_BY_EMAIL).bind(email).first();
    if (!userRow) return null;

    const providers = await this.db.prepare(SQL_GET_PROVIDERS_BY_USER_ID).bind(userRow.id).all();

    return {
      ...userRow,
      providers: providers.results as ProviderAccount[],
    };
  }

  async getUserByProviderId(provider: string, providerId: string): Promise<User> {
    const providerRow = await this.db
      .prepare(SQL_GET_USER_ID_BY_PROVIDER)
      .bind(provider, providerId)
      .first();
    if (!providerRow) throw new Error("User not found via provider");
    return await this.getUserById(providerRow.userId);
  }

  async getUserById(id: string): Promise<User> {
    const userRow = await this.db.prepare(SQL_GET_USER_BY_ID).bind(id).first();
    if (!userRow) throw new Error("User not found");

    const providers = await this.db.prepare(SQL_GET_PROVIDERS_BY_USER_ID).bind(id).all();

    return {
      ...userRow,
      providers: providers.results as ProviderAccount[],
    };
  }

  /**
   * Main entry point for login: auto-link by email or create new user
   */
  async upsertUser(user: {
    provider: string;
    providerId: string;
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
  }): Promise<User> {
    let userId: string | null = null;

    // 1. Check if this provider is already linked
    const existingProvider = await this.db
      .prepare(SQL_GET_USER_ID_BY_PROVIDER)
      .bind(user.provider, user.providerId)
      .first();

    if (existingProvider) {
      userId = existingProvider.userId;
    }

    // 2. If not linked, check if user with same email exists
    if (!userId && user.email) {
      const existingUser = await this.db.prepare(SQL_GET_USER_ID_BY_EMAIL).bind(user.email).first();
      if (existingUser) {
        userId = existingUser.id;
      }
    }

    // 3. Create new user if needed
    if (!userId) {
      userId = crypto.randomUUID();
      await this.db
        .prepare(SQL_INSERT_USER)
        .bind(userId, user.email, user.name, user.avatarUrl)
        .run();
    } else {
      // Update user's name/avatar on login
      await this.db.prepare(SQL_UPDATE_USER_INFO).bind(user.name, user.avatarUrl, userId).run();
    }

    // 4. Ensure the provider is linked
    const providerExists = await this.db
      .prepare(SQL_GET_PROVIDER_BY_USER_ID_AND_PROVIDER)
      .bind(userId, user.provider)
      .first();

    if (!providerExists) {
      await this.db
        .prepare(SQL_INSERT_PROVIDER)
        .bind(crypto.randomUUID(), userId, user.provider, user.providerId, user.email)
        .run();
    }

    return await this.getUserById(userId);
  }

  /**
   * Manually link a new OAuth provider to an existing user (user is logged in)
   */
  async linkProviderToUser(
    userId: string,
    provider: string,
    providerId: string,
    email: string
  ): Promise<void> {
    const alreadyLinked = await this.db
      .prepare(SQL_GET_PROVIDER_BY_USER_ID_AND_PROVIDER)
      .bind(userId, provider)
      .first();

    if (!alreadyLinked) {
      await this.db
        .prepare(SQL_INSERT_PROVIDER)
        .bind(crypto.randomUUID, userId, provider, providerId, email)
        .run();
    }
  }
}
