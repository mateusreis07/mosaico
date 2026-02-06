import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mosaico/features/pixel/data/pixel_repository.dart';
import 'package:mosaico/features/pixel/domain/pixel_model.dart';
import 'package:screen_brightness/screen_brightness.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

// Simple Riverpod provider for the repository
final pixelRepositoryProvider = Provider((ref) => PixelRepository());

// FutureProvider for fetching the config
final pixelConfigProvider = FutureProvider.family<PixelConfig, String>((ref, seatId) async {
  final repository = ref.watch(pixelRepositoryProvider);
  return repository.getPixelConfig(seatId);
});

class PixelScreen extends ConsumerStatefulWidget {
  final String seatId;

  const PixelScreen({super.key, required this.seatId});

  @override
  ConsumerState<PixelScreen> createState() => _PixelScreenState();
}

class _PixelScreenState extends ConsumerState<PixelScreen> {
  double _initialBrightness = 0.5;
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    _enterImmersiveMode();
  }

  Future<void> _enterImmersiveMode() async {
    try {
      // 1. Keep Screen On
      await WakelockPlus.enable();

      // 2. Hide System UI
      await SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);

      // 3. Maximize Brightness
      _initialBrightness = await ScreenBrightness().current;
      await ScreenBrightness().setScreenBrightness(1.0);
      
      setState(() => _initialized = true);
    } catch (e) {
      debugPrint('Erro ao configurar modo imersivo: $e');
    }
  }

  Future<void> _exitImmersiveMode() async {
    try {
      // 1. Restore Brightness
      await ScreenBrightness().setScreenBrightness(_initialBrightness);

      // 2. Show System UI
      await SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);

      // 3. Disable Wakelock
      await WakelockPlus.disable();
    } catch (e) {
      debugPrint('Erro ao sair do modo imersivo: $e');
    }
  }

  @override
  void dispose() {
    _exitImmersiveMode();
    super.dispose();
  }

  Color _parseColor(String hexString) {
    try {
      final buffer = StringBuffer();
      if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
      buffer.write(hexString.replaceFirst('#', ''));
      return Color(int.parse(buffer.toString(), radix: 16));
    } catch (e) {
      return Colors.white; // Fallback
    }
  }

  @override
  Widget build(BuildContext context) {
    final asyncConfig = ref.watch(pixelConfigProvider(widget.seatId));

    return PopScope(
      canPop: true,
      onPopInvoked: (didPop) async {
         // Logic handles in dispose
      },
      child: Scaffold(
        backgroundColor: Colors.black,
        body: asyncConfig.when(
          data: (config) {
            final color = _parseColor(config.color);
            return Container(
              width: double.infinity,
              height: double.infinity,
              color: color,
            );
          },
          loading: () => const Center(
            child: CircularProgressIndicator(color: Colors.white),
          ),
          error: (err, stack) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.red, size: 48),
                const SizedBox(height: 16),
                Text(
                  'Erro ao conectar: $err',
                  style: const TextStyle(color: Colors.white),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => ref.refresh(pixelConfigProvider(widget.seatId)),
                  child: const Text('TENTAR NOVAMENTE'),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => context.pop(),
                  child: const Text('SAIR', style: TextStyle(color: Colors.white70)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
