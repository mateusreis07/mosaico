import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#121212',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="index" options={{ title: 'Mosaico' }} />
                <Stack.Screen name="scanner" options={{ title: 'Escanear Assento' }} />
                <Stack.Screen name="pixel" options={{ headerShown: false }} />
            </Stack>
        </View>
    );
}
