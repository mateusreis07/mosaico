import { seatCache } from '../cache/seatCache';
import { getSeatColor } from './eventService';

interface SeatData {
  event: string;
  seat: string;
  color: string;
  fallbackColor: string;
  expiresAt: string;
  version: number;
}

export class SeatService {
  // Mock current event ID for context
  // In a real scenario, this might come from the eventService or request context
  private readonly CURRENT_EVENT_ID_PREFIX = 'active-event';
  private readonly CONFIG_VERSION = 1;

  public async getSeatColor(seatId: string): Promise<any> {
    const startTotal = performance.now();

    const eventId = this.CURRENT_EVENT_ID_PREFIX; // We use a generic active key since event ID changes
    const version = this.CONFIG_VERSION;

    // 1. Check Cache
    const startCacheLookup = performance.now();
    const cachedData = seatCache.get(seatId, eventId, version);
    const endCacheLookup = performance.now();

    // Log sampling: 1% of requests to avoid flooding console during load test
    const shouldLog = Math.random() < 0.01;

    if (cachedData) {
      const endTotal = performance.now();

      if (shouldLog) {
        console.log(JSON.stringify({
          type: 'cache_hit',
          seat_id: seatId,
          total_ms: (endTotal - startTotal).toFixed(3),
          cache_lookup_ms: (endCacheLookup - startCacheLookup).toFixed(3)
        }));
      }

      return { ...cachedData, source: 'cache' };
    }

    // 2. Fetch from Source (Real DB Logic via eventService)
    const startDb = performance.now();
    const data = await this.fetchFromSource(seatId);
    const endDb = performance.now();

    // 3. Save to Cache
    // We only cache if we got valid data.
    const startCacheWrite = performance.now();
    if (data) {
      seatCache.set(seatId, eventId, data, version);
    }
    const endCacheWrite = performance.now();

    const endTotal = performance.now();

    // Always log cache misses or errors if needed, but for load test sampling missed too
    if (shouldLog) {
      console.log(JSON.stringify({
        type: 'cache_miss',
        seat_id: seatId,
        total_ms: (endTotal - startTotal).toFixed(3),
        cache_lookup_ms: (endCacheLookup - startCacheLookup).toFixed(3),
        db_query_ms: (endDb - startDb).toFixed(3),
        cache_write_ms: (endCacheWrite - startCacheWrite).toFixed(3)
      }));
    }

    return { ...data, source: 'db' };
  }

  public async warmupEvent(eventId: string): Promise<{ total: number; cached: number; timeMs: number }> {
    const start = performance.now();

    // Import dynamically to avoid circular dependency issues if any
    const { getAllEventSeats } = require('./eventService');

    const data = await getAllEventSeats(eventId);

    if (!data || !data.seats) {
      throw new Error(`Event ${eventId} not found or has no seats`);
    }

    const { event, seats } = data;
    let cachedCount = 0;
    const version = this.CONFIG_VERSION;
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(); // 3 hours

    for (const seat of seats) {
      const seatData: SeatData = {
        event: event.name,
        seat: seat.seatId,
        color: seat.color,
        fallbackColor: event.fallbackColor,
        expiresAt,
        version
      };

      // Populate cache for the active event prefix
      seatCache.set(seat.seatId, this.CURRENT_EVENT_ID_PREFIX, seatData, version);
      cachedCount++;
    }

    const end = performance.now();

    return {
      total: seats.length,
      cached: cachedCount,
      timeMs: Math.round(end - start)
    };
  }

  public invalidateSeat(seatId: string) {
    seatCache.invalidate(seatId, this.CURRENT_EVENT_ID_PREFIX);
    console.log(`[CACHE INVALIDATION] Seat: ${seatId}`);
  }

  private async fetchFromSource(seatId: string): Promise<SeatData> {
    // Call the existing service
    const result = await getSeatColor(seatId);

    if (!result) {
      // Default waiting state if no active event or seat not found (matches index.ts legacy logic)
      return {
        event: 'Aguardando Início...',
        seat: seatId,
        color: '#000000',
        fallbackColor: '#000000',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        version: 1
      };
    }

    return {
      event: result.event,
      seat: seatId, // Ensure seatId is present
      color: result.color || '#000000',
      fallbackColor: result.fallbackColor || '#000000',
      expiresAt: result.expiresAt || new Date(Date.now() + 3600000).toISOString(),
      version: 1
    };
  }
}

export const seatService = new SeatService();
