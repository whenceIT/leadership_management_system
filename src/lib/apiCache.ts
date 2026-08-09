export interface CacheEntry<T> {
  data: T | null;
  timestamp: number;
}

export class CachedAPI<T> {
  private store = new Map<string, CacheEntry<T>>();
  private pending = new Map<string, Promise<T | null>>();
  readonly ttlMs: number;

  constructor(ttlMs: number = 5 * 60 * 1000) {
    this.ttlMs = ttlMs;
  }

  private isFresh(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < this.ttlMs;
  }

  peek(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry || entry.data === null) return null;
    return entry.data;
  }

  async get(key: string, fetcher: () => Promise<T | null>): Promise<T | null> {
    const existing = this.store.get(key);

    if (existing && existing.data && this.isFresh(existing)) {
      return existing.data;
    }

    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    const promise = (async () => {
      try {
        return await fetcher();
      } catch (err) {
        return null;
      }
    })();

    this.pending.set(key, promise);
    try {
      const data = await promise;
      if (data !== null) {
        this.store.set(key, { data, timestamp: Date.now() });
      }
      return data ?? existing?.data ?? null;
    } finally {
      this.pending.delete(key);
    }
  }

  set(key: string, data: T) {
    this.store.set(key, { data, timestamp: Date.now() });
  }

  clear(key?: string) {
    if (key) {
      this.store.delete(key);
      this.pending.delete(key);
    } else {
      this.store.clear();
      this.pending.clear();
    }
  }
}
