import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final MobileScannerController controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
  );
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _checkPermission();
  }

  Future<void> _checkPermission() async {
    final status = await Permission.camera.request();
    if (status.isDenied || status.isPermanentlyDenied) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Permissão de câmera necessária')),
        );
        context.pop();
      }
    }
  }

  void _onDetect(BarcodeCapture capture) {
    if (_isProcessing) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;
    
    final String? code = barcodes.first.rawValue;
    if (code != null && code.isNotEmpty) {
      setState(() => _isProcessing = true);
      
      // Validação básica do formato (ex: A-12-34)
      // Aceita qualquer string por enquanto conforme MVP, mas evita URLs longas sem sentido
      if (code.length > 20) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('QR Code inválido')),
        );
        setState(() => _isProcessing = false);
        return;
      }

      context.pushReplacement('/pixel', extra: {'seatId': code});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Escanear Assento')),
      body: MobileScanner(
        controller: controller,
        onDetect: _onDetect,
        overlay: Container(
          decoration: BoxDecoration(
            border: Border.all(color: Colors.white.withOpacity(0.5), width: 2),
            borderRadius: BorderRadius.circular(12),
          ),
          margin: const EdgeInsets.symmetric(horizontal: 40, vertical: 150),
        ),
      ),
    );
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
}
