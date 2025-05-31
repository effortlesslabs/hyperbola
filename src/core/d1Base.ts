/**
 * Base class for interacting with a Cloudflare D1 database.
 * Extend this class to implement specific data access logic.
 */

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(columnName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; error?: string }>;
}

export abstract class DOneBase {
  protected db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Execute a query and return all results.
   * @param query SQL query string
   * @param params Parameters to bind
   */
  protected async queryAll<T = unknown>(query: string, params: unknown[] = []): Promise<T[]> {
    const stmt = this.db.prepare(query).bind(...params);
    const result = await stmt.all<T>();
    return result.results;
  }

  /**
   * Execute a query and return the first result.
   * @param query SQL query string
   * @param params Parameters to bind
   */
  protected async queryFirst<T = unknown>(
    query: string,
    params: unknown[] = []
  ): Promise<T | null> {
    const stmt = this.db.prepare(query).bind(...params);
    return await stmt.first<T>();
  }

  /**
   * Execute a statement (INSERT, UPDATE, DELETE).
   * @param query SQL query string
   * @param params Parameters to bind
   */
  protected async execute(
    query: string,
    params: unknown[] = []
  ): Promise<{ success: boolean; error?: string }> {
    const stmt = this.db.prepare(query).bind(...params);
    return await stmt.run();
  }

  /**
   * Run multiple statements in a transaction.
   * @param actions Array of functions that return a Promise (usually execute/query)
   */
  protected async transaction(actions: (() => Promise<unknown>)[]): Promise<void> {
    // D1 does not have explicit transaction API, but you can use BEGIN/COMMIT/ROLLBACK
    await this.execute("BEGIN");
    try {
      for (const action of actions) {
        await action();
      }
      await this.execute("COMMIT");
    } catch (err) {
      await this.execute("ROLLBACK");
      throw err;
    }
  }
}
