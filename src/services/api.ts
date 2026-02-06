import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PixelConfig {
    event: string;
    color: string;
    fallbackColor?: string;
    expiresAt?: string;
    brightness: number;
}

const CACHE_KEY = 'last_seat_config';

export const getPixelConfig = async (seatId: string): Promise<PixelConfig> => {
    try {
        // 1. Try Fetching from API (Level 1)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s Timeout

        // Replace with your computer's IP address
        const API_URL = 'http://192.168.250.135:3333';

        try {
            const response = await fetch(`${API_URL}/seat/${seatId}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            const config: PixelConfig = {
                event: data.event || 'Evento',
                color: data.color || '#000000',
                fallbackColor: data.fallbackColor || '#000000',
                expiresAt: data.expiresAt,
                brightness: data.brightness || 100,
            };

            // 2. Save to Cache (Level 2)
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
                ...config,
                seatId, // Store seatId to ensure cache validity
                savedAt: Date.now()
            }));

            return config;

        } catch (fetchError) {
            console.warn('Network request failed, attempting fallback...', fetchError);
            throw fetchError; // Rethrow to trigger catch block below
        }

    } catch (error) {
        // 3. Fallback Logic (Level 2 & 3 & 4)
        console.log('entering fallback logic...');

        try {
            const cachedData = await AsyncStorage.getItem(CACHE_KEY);
            if (cachedData) {
                const cache = JSON.parse(cachedData);

                // Validate Cache
                if (cache.seatId === seatId) {
                    const now = Date.now();
                    const expiresAt = cache.expiresAt ? new Date(cache.expiresAt).getTime() : 0;

                    // Level 2: Valid Cache
                    if (expiresAt > now) {
                        console.log('Using valid cached color');
                        return cache;
                    }

                    // Level 3: Expired, use Fallback Color
                    if (cache.fallbackColor) {
                        console.log('Using fallback color from cache');
                        return {
                            ...cache,
                            color: cache.fallbackColor // Force fallback
                        };
                    }
                }
            }
        } catch (cacheError) {
            console.error('Cache read error:', cacheError);
        }

        // Level 4: Hardcoded Safety (The Show Must Go On)
        console.log('Using hardcoded safety black');
        return {
            event: 'Modo Offline',
            color: '#000000',
            brightness: 100
        };
    }
};
