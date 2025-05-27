import type { KVNamespace } from "@cloudflare/workers-types";

class KVStore {
  private kv: KVNamespace;

  constructor(kvBinding: KVNamespace) {
    this.kv = kvBinding;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const stringified = JSON.stringify(value);
    await this.kv.put(key, stringified, ttl ? { expirationTtl: ttl } : undefined);
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.kv.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }

  async list(prefix?: string): Promise<string[]> {
    const list = await this.kv.list({ prefix: prefix ?? null });
    return list.keys.map((k) => k.name);
  }

  async getAll<T>(prefix?: string): Promise<Record<string, T>> {
    const result: Record<string, T> = {};
    const keys = await this.kv.list({ prefix: prefix ?? null });
    for (const { name } of keys.keys) {
      const value = await this.get<T>(name);
      if (value !== null) result[name] = value;
    }
    return result;
  }
}

export default KVStore;
