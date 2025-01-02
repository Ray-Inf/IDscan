import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

class ApiService {
  static const String _baseUrl =;

  static Future<Map<String, dynamic>> registerUser(String name, File image) async {
    final uri = Uri.parse("$_baseUrl/register");
    final request = http.MultipartRequest('POST', uri)
      ..fields['name'] = name
      ..files.add(await http.MultipartFile.fromPath('image', image.path));

    final response = await request.send();
    final responseData = await http.Response.fromStream(response);

    return json.decode(responseData.body);
  }

  static Future<String> loginUser(File image) async {
    final uri = Uri.parse("$_baseUrl/login");
    final request = http.MultipartRequest('POST', uri)
      ..files.add(await http.MultipartFile.fromPath('image', image.path));

    final response = await request.send();
    final responseData = await http.Response.fromStream(response);

    return responseData.body;
  }

  // Capture and Process Image
  static Future<Map<String, dynamic>> captureAndProcess(String base64Image) async {
    final uri = Uri.parse("$_baseUrl/capture");
    final response = await http.post(
      uri,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"imageData": base64Image}),
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception("Failed to process image: ${response.body}");
    }
  }
}
