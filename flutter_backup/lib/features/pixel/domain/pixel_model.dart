class PixelConfig {
  final String event;
  final String color; // Hex string e.g. #FF0000
  final int brightness; // 0-100

  PixelConfig({
    required this.event,
    required this.color,
    required this.brightness,
  });

  factory PixelConfig.fromJson(Map<String, dynamic> json) {
    return PixelConfig(
      event: json['event'] as String? ?? 'Evento Mosaico',
      color: json['color'] as String? ?? '#FFFFFF',
      brightness: json['brightness'] as int? ?? 100,
    );
  }
}
