import axios from 'axios';

// Backend URL
// Replace with the actual IP/Domain for production
const API_URL = 'http://localhost:3333';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getSeat = async (seatId: string) => {
    const { data } = await api.get(`/seat/${seatId}`);
    return data;
};

// Admin Endpoints
export const createEvent = async (data: { name: string; fallbackColor: string }) => {
    const { data: response } = await api.post('/admin/event', data);
    return response;
};

export const setSeatColor = async (seatId: string, color: string) => {
    const { data } = await api.post('/admin/seat-color', { seatId, color });
    return data;
};

export const resetEvent = async () => {
    const { data } = await api.post('/admin/event/reset');
    return data;
};

export const getEventMap = async () => {
    const { data } = await api.get('/admin/event/map');
    return data;
};
