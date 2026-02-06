import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mosaico App')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.qr_code_scanner, size: 80, color: Colors.white70),
              const SizedBox(height: 32),
              const Text(
                'Bem-vindo ao Mosaico!',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              const Text(
                'Transforme seu celular em um pixel do show.\nAponte a câmera para o QR Code do seu assento para começar.',
                style: TextStyle(fontSize: 16, color: Colors.white60),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => context.push('/scanner'),
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('ESCANEAR QR CODE'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
