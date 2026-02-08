import prisma from '../prisma/client';

// Simple in-memory cache for active event to avoid DB hits on every request
// In a real scaled app, this would be Redis.
let cachedActiveEventId: string | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 30000; // 30 seconds

export const getActiveEventId = async (): Promise<string | null> => {
    const now = Date.now();
    if (cachedActiveEventId && (now - lastCacheUpdate < CACHE_TTL)) {
        return cachedActiveEventId;
    }

    const activeEvent = await prisma.event.findFirst({
        where: { isActive: true },
        select: { id: true }
    });

    cachedActiveEventId = activeEvent?.id || null;
    lastCacheUpdate = now;
    return cachedActiveEventId;
};

export const getSeatColor = async (seatId: string) => {
    const eventId = await getActiveEventId();

    if (!eventId) {
        return null; // No active event
    }

    const seatEvent = await prisma.seatEvent.findUnique({
        where: {
            seatId_eventId: {
                seatId,
                eventId
            }
        },
        select: { color: true, event: { select: { name: true, fallbackColor: true } } }
    });

    if (!seatEvent) {
        // Return default black if seat has no color assigned for this event
        const event = await prisma.event.findUnique({ where: { id: eventId }, select: { name: true, fallbackColor: true } });
        const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
        return {
            event: event?.name || 'Unknown',
            color: event?.fallbackColor || '#000000', // Default color is fallback
            fallbackColor: event?.fallbackColor || '#000000',
            expiresAt
        };
    }

    // Expiration: 3 hours from now (typical match duration)
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

    return {
        event: seatEvent.event.name,
        color: seatEvent.color,
        fallbackColor: seatEvent.event.fallbackColor,
        expiresAt
    };
};

// Admin Services
export const createActiveEvent = async (name: string, fallbackColor: string = '#000000') => {
    // Deactivate others
    await prisma.event.updateMany({
        data: { isActive: false }
    });

    const event = await prisma.event.create({
        data: { name, fallbackColor, isActive: true }
    });

    cachedActiveEventId = event.id; // Update cache
    return event;
};

export const setSeatColor = async (seatId: string, color: string) => {
    let eventId = await getActiveEventId();

    if (!eventId) {
        // Auto-create an event if none exists for convenience? Or fail?
        // Let's create a default one for MVP convenience
        const event = await createActiveEvent("Evento Padrão");
        eventId = event.id;
    }

    // Upsert Seat first (ensure it exists)
    // We parse A-12-34 to sector/row/number just for data quality, logical parsing
    const parts = seatId.split('-');
    const sector = parts[0] || 'X';
    const row = parts[1] || '0';
    const number = parts[2] || '0';

    await prisma.seat.upsert({
        where: { id: seatId },
        update: {},
        create: { id: seatId, sector, row, number }
    });

    // Start transaction or upsert SeatEvent
    const seatEvent = await prisma.seatEvent.upsert({
        where: {
            seatId_eventId: { seatId, eventId }
        },
        update: { color },
        create: {
            seatId,
            eventId,
            color
        }
    });

    return seatEvent;
};

export const resetEvent = async () => {
    const eventId = await getActiveEventId();
    if (eventId) {
        await prisma.seatEvent.deleteMany({
            where: { eventId }
        });
    }
    return { success: true };
}

export const getEventMap = async () => {
    const eventId = await getActiveEventId();
    if (!eventId) return {};

    const seats = await prisma.seatEvent.findMany({
        where: { eventId },
        select: { seatId: true, color: true }
    });

    // Convert to map { "A-1-1": "#F00" }
    return seats.reduce((acc, curr) => ({ ...acc, [curr.seatId]: curr.color }), {});
};

export const getAllEventSeats = async (eventId: string) => {
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { name: true, fallbackColor: true }
    });

    if (!event) return null;

    const seats = await prisma.seatEvent.findMany({
        where: { eventId },
        select: { seatId: true, color: true }
    });

    return {
        event,
        seats
    };
};
