import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, ToastAndroid, Platform, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Brightness from 'expo-brightness';
import { useKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { getPixelConfig, PixelConfig } from '../src/services/api';

export default function PixelScreen() {
    useKeepAwake();
    const { seatId } = useLocalSearchParams<{ seatId: string }>();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [config, setConfig] = useState<PixelConfig | null>(null);
    const [initialBrightness, setInitialBrightness] = useState<number>(0.5);

    // Double tap logic
    const lastTap = useRef<number>(0);

    // 1. Setup Immersive Mode & Brightness
    useEffect(() => {
        const enterImmersive = async () => {
            try {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

                // Hide System Bars
                if (Platform.OS === 'android') {
                    await NavigationBar.setVisibilityAsync('hidden');
                    await NavigationBar.setBehaviorAsync('overlay-swipe');
                }

                // Brightness Logic
                const { status } = await Brightness.requestPermissionsAsync();
                if (status === 'granted') {
                    if (Platform.OS === 'android') {
                        // Crucial for Android: Disable adaptive brightness override
                        await Brightness.setSystemBrightnessModeAsync(Brightness.BrightnessMode.MANUAL);
                    }

                    const current = await Brightness.getBrightnessAsync();
                    setInitialBrightness(current);

                    // Force max brightness (retry to ensure it sticks)
                    await Brightness.setBrightnessAsync(1.0);

                    // Extra insurance mechanism
                    const interval = setInterval(async () => {
                        await Brightness.setBrightnessAsync(1.0);
                    }, 500);

                    // Clear interval after 2.5s
                    setTimeout(() => clearInterval(interval), 2500);
                }

                // Inform User how to exit
                if (Platform.OS === 'android') {
                    ToastAndroid.show('Toque duas vezes para sair', ToastAndroid.LONG);
                } else {
                    Alert.alert('Mosaico Ativo', 'Toque duas vezes na tela para sair.');
                }

            } catch (e) {
                console.warn('Immersive mode error:', e);
            }
        };

        enterImmersive();

        return () => {
            const exitImmersive = async () => {
                try {
                    await Brightness.setBrightnessAsync(initialBrightness);
                    if (Platform.OS === 'android') {
                        // Restore adaptive brightness if user had it
                        await Brightness.setSystemBrightnessModeAsync(Brightness.BrightnessMode.AUTOMATIC);
                    }
                    await ScreenOrientation.unlockAsync();
                    if (Platform.OS === 'android') {
                        await NavigationBar.setVisibilityAsync('visible');
                    }
                } catch (e) {
                    console.warn('Exit immersive error:', e);
                }
            };
            exitImmersive();
        };
    }, []);

    // 2. Fetch Data
    useEffect(() => {
        if (!seatId) return;

        getPixelConfig(seatId)
            .then(setConfig)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [seatId]);

    const handleDoubleTap = () => {
        const now = Date.now();
        const DOUBLE_PRESS_DELAY = 300;

        if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
            router.back();
        } else {
            lastTap.current = now;
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FFF" />
            </View>
        );
    }

    if (error || !config) {
        return (
            <View style={styles.center}>
                <StatusBar style="light" />
                <Text style={styles.errorText}>Erro: {error || 'Configuração não encontrada'}</Text>
                <Text style={styles.button} onPress={() => router.back()}>VOLTAR</Text>
            </View>
        );
    }

    return (
        <Pressable style={[styles.container, { backgroundColor: config.color }]} onPress={handleDoubleTap}>
            <StatusBar hidden />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    center: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#FF5555',
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        color: '#FFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#FFF',
        padding: 10,
        borderRadius: 8,
    }
});
