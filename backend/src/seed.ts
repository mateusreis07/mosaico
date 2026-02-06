import prisma from './prisma/client';
import { createActiveEvent, setSeatColor } from './services/eventService';

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Active Event
    console.log('Creating active event: "Grande Final"...');
    const event = await createActiveEvent("Grande Final 2026");
    console.log(`✅ Event created: ${event.id}`);

    // 2. Create Seats with Colors
    const seats = [
        { id: 'A-12-34', color: '#FF0000' }, // Red
        { id: 'A-12-35', color: '#00FF00' }, // Green
        { id: 'A-12-36', color: '#0000FF' }, // Blue
        { id: 'TEST-1', color: '#FFFF00' }, // Yellow
    ];

    for (const seat of seats) {
        await setSeatColor(seat.id, seat.color);
        console.log(`   📍 Seat ${seat.id} -> ${seat.color}`);
    }

    console.log('\n✅ Seeding complete!');
    console.log('------------------------------------------------');
    console.log('Try scanning QR Code: A-12-34 (Should be RED)');
    console.log('------------------------------------------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
