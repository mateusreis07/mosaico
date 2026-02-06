import express from 'express';
import cors from 'cors';
import { getSeatColor, createActiveEvent, setSeatColor, resetEvent, getEventMap } from './services/eventService';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3333;

// --- PUBLIC ROUTES ---

app.get('/seat/:seat_id', async (req, res) => {
    try {
        const { seat_id } = req.params;
        const result = await getSeatColor(seat_id);

        if (!result) {
            // Instead of 404, return a default "Waiting" state so the app doesn't crash
            return res.json({
                event: 'Aguardando Início...',
                seat: seat_id,
                color: '#000000', // Black screen
                fallbackColor: '#000000',
                expiresAt: new Date(Date.now() + 3600000).toISOString(),
                brightness: 100,
                version: 1
            });
        }

        res.json({
            event: result.event,
            seat: seat_id,
            color: result.color,
            fallbackColor: result.fallbackColor,
            expiresAt: result.expiresAt,
            brightness: 100,
            version: 1 // V1 of API
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- ADMIN ROUTES ---

app.get('/admin/event/map', async (req, res) => {
    try {
        const map = await getEventMap();
        res.json(map);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

app.post('/admin/event', async (req, res) => {
    try {
        const { name, fallbackColor } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const event = await createActiveEvent(name, fallbackColor || '#000000');
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

app.post('/admin/seat-color', async (req, res) => {
    try {
        const { seatId, color } = req.body;
        if (!seatId || !color) return res.status(400).json({ error: 'Missing fields' });

        const result = await setSeatColor(seatId, color);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: String(error) });
    }
});

app.post('/admin/event/reset', async (req, res) => {
    try {
        await resetEvent();
        res.json({ message: 'Event colors reset' });
    } catch (error) {
        res.status(500).json({ error: String(error) });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Mosaico Backend running on http://192.168.250.135:${PORT}`);
    console.log(`   Admin routes: /admin/event, /admin/seat-color`);
    console.log(`   Public route: /seat/:id`);
});
