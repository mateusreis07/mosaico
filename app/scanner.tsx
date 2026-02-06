import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { router } from 'expo-router';
import { colors } from '../src/theme/colors';

export default function ScannerScreen() {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (scanned) return;
        setScanned(true);

        if (data) {
            let seatId = data;

            // Check if it's a URL and extract the ID
            if (data.startsWith('http')) {
                const parts = data.split('/');
                seatId = parts[parts.length - 1];
            }

            if (seatId.length < 20) { // IDs like A-01-01 are short
                router.replace({ pathname: '/pixel', params: { seatId } });
                return;
            }
        }

        alert('QR Code inválido: ' + data);
        setScanned(false);
    };

    if (hasPermission === null) {
        return <View style={styles.container}><Text style={styles.text}>Solicitando permissão...</Text></View>;
    }
    if (hasPermission === false) {
        return <View style={styles.container}><Text style={styles.text}>Sem acesso à câmera</Text></View>;
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            />

            <View style={styles.overlay}>
                <View style={styles.scanFrame} />
                <Text style={styles.instruction}>Aponte para o QR Code</Text>
            </View>

            {scanned && (
                <View style={styles.loadingOverlay}>
                    <Text style={styles.text}>Processando...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontSize: 16,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: 'transparent',
        borderRadius: 16,
    },
    instruction: {
        position: 'absolute',
        bottom: 100,
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 12,
        borderRadius: 8,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
