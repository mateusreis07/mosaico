interface CacheItem {
  value: any;
  expiresAt: number;
  version: number;
  cachedAt: number;
}

export class SeatCache {
  private cache: Map<string, CacheItem>;
  private validSeats: Set<string>; // Registry of ALL valid seat IDs for the current event
  private readonly TTL_SECONDS = 60 * 60 * 3; // Extended during warm-up (3 hours)

  constructor() {
    this.cache = new Map<string, CacheItem>();
    this.validSeats = new Set<string>();
  }

  /**
   * Register a list of valid seat IDs during warm-up.
   * This is the "Truth Source" during the game.
   */
  public registerValidSeats(seatIds: string[]): void {
    seatIds.forEach(id => this.validSeats.add(id));
  }

  /**
   * Check if a seat ID serves as a valid key.
   * If false, we should return fallback immediately.
   */
  public isValid(seatId: string): boolean {
    return this.validSeats.has(seatId);
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
    // 1. Strict Validation: If seat is not in our registry, it's invalid.
    // This assumes warm-up HAS run. If validSeats is empty, we might allow pass-through (or ideally block).
    if (this.validSeats.size > 0 && !this.validSeats.has(seatId)) {
      return 'fallback_needed'; // Special marker to signal fallback immediately
    }

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

    // Also mark as valid if setting individually
    this.validSeats.add(seatId);

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
