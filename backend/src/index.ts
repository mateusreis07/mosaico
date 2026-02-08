import express from 'express';
import cors from 'cors';
import { getSeatColor, createActiveEvent, setSeatColor, resetEvent, getEventMap } from './services/eventService';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3333;

// --- PUBLIC ROUTES ---

// Use the new Cached Seat Controller
import { seatRoutes } from './routes/seat.routes';
app.use('/seat', seatRoutes);

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
