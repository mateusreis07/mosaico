import 'package:go_router/go_router.dart';
import 'package:mosaico/features/home/presentation/home_screen.dart';
import 'package:mosaico/features/scanner/presentation/scanner_screen.dart';
import 'package:mosaico/features/pixel/presentation/pixel_screen.dart';

final router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/scanner',
      builder: (context, state) => const ScannerScreen(),
    ),
    GoRoute(
      path: '/pixel',
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        final seatId = extra?['seatId'] as String? ?? 'UNKNOWN';
        return PixelScreen(seatId: seatId);
      },
    ),
  ],
);
