import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mosaico/features/pixel/domain/pixel_model.dart';

class PixelRepository {
  final String baseUrl;

  PixelRepository({this.baseUrl = 'https://api.meudominio.com'});

  Future<PixelConfig> getPixelConfig(String seatId) async {
    // Para testes locais sem backend, descomente abaixo:
    // await Future.delayed(const Duration(seconds: 1));
    // return PixelConfig(event: "Simulação", color: "#FF0000", brightness: 100);

    try {
      final response = await http.get(Uri.parse('$baseUrl/seat/$seatId'));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return PixelConfig.fromJson(data);
      } else {
        throw Exception('Falha ao carregar configuração: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Erro de conexão: $e');
    }
  }
}
