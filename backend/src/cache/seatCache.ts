interface CacheItem {
  value: any;
  expiresAt: number;
  version: number;
  cachedAt: number;
}

export class SeatCache {
  private cache: Map<string, CacheItem>;
  private readonly TTL_SECONDS = 60; // 60 seconds

  constructor() {
    this.cache = new Map<string, CacheItem>();
  }

  /**
   * Generate a unique cache key
   */
  private generateKey(seatId: string, eventId: string): string {
    return `seat:${seatId}:event:${eventId}`;
  }

  /**
   * Get item from cache
   */
  public get(seatId: string, eventId: string, version: number): any | null {
    const key = this.generateKey(seatId, eventId);
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    const now = Date.now();

    // Check expiration
    if (item.expiresAt < now) {
      this.cache.delete(key);
      return null;
    }

    // Check version
    if (item.version !== version) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set item in cache
   */
  public set(seatId: string, eventId: string, data: any, version: number): void {
    const key = this.generateKey(seatId, eventId);
    const now = Date.now();

    const item: CacheItem = {
      value: data,
      expiresAt: now + (this.TTL_SECONDS * 1000),
      version: version,
      cachedAt: now
    };

    this.cache.set(key, item);
  }

  /**
   * Invalidate specific item (e.g., when color changes)
   */
  public invalidate(seatId: string, eventId: string): void {
    const key = this.generateKey(seatId, eventId);
    this.cache.delete(key);
  }

  /**
   * Clear entire cache (useful for testing or panic mode)
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  public size(): number {
    return this.cache.size;
  }
}

export const seatCache = new SeatCache();
