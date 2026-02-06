import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import { colors } from '../src/theme/colors';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Bem-vindo ao Mosaico</Text>
                <Text style={styles.subtitle}>
                    Transforme seu celular em um pixel do show.{'\n'}
                    Aponte a câmera para o QR Code do seu assento para começar.
                </Text>

                <Pressable
                    style={({ pressed }) => [
                        styles.button,
                        pressed && styles.buttonPressed
                    ]}
                    onPress={() => router.push('/scanner')}
                >
                    <Text style={styles.buttonText}>ESCANEAR QR CODE</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 24,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        elevation: 4,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
