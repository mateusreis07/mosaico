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
    const eventId = this.CURRENT_EVENT_ID_PREFIX; // We use a generic active key since event ID changes
    const version = this.CONFIG_VERSION;

    // 1. Check Cache
    const cachedData = seatCache.get(seatId, eventId, version);
    if (cachedData) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[CACHE HIT] Seat: ${seatId}`);
      }
      return { ...cachedData, source: 'cache' };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[CACHE MISS] Seat: ${seatId}`);
    }

    // 2. Fetch from Source (Real DB Logic via eventService)
    const data = await this.fetchFromSource(seatId);

    // 3. Save to Cache
    // We only cache if we got valid data.
    // If eventService returns null (no active event), we might return a default "waiting" state.
    // Let's assume fetchFromSource handles defaults or we handle it here.

    if (data) {
      seatCache.set(seatId, eventId, data, version);
    }

    return { ...data, source: 'db' };
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
