import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'api_service.dart';

class CaptureScreen extends StatefulWidget {
  @override
  _CaptureScreenState createState() => _CaptureScreenState();
}

class _CaptureScreenState extends State<CaptureScreen> {
  final ImagePicker _picker = ImagePicker();
  File? _imageFile;
  String? _detectedText;
  String? _detectedFace;
  String? _additionalInfo;
  String? _errorMessage;

  Future<void> pickImage() async {
    try {
      final XFile? pickedFile = await _picker.pickImage(source: ImageSource.camera);

      if (pickedFile != null) {
        setState(() {
          _imageFile = File(pickedFile.path);
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = "Failed to pick image: $e";
      });
    }
  }

  Future<void> processImage() async {
    if (_imageFile == null) {
      setState(() {
        _errorMessage = "Please capture an image first.";
      });
      return;
    }

    try {
      final bytes = _imageFile!.readAsBytesSync();
      final base64Image = "data:image/jpeg;base64,${base64Encode(bytes)}";

      final response = await ApiService.captureAndProcess(base64Image);

      setState(() {
        _detectedText = response['extractedText'];
        _detectedFace = response['detectedFace'];
        _additionalInfo = response['additionalInfo'];
        _errorMessage = response['error'];
      });
    } catch (e) {
      setState(() {
        _errorMessage = "An error occurred: $e";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Capture & Process Image"),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_imageFile != null)
                Image.file(
                  _imageFile!,
                  height: 200,
                  fit: BoxFit.cover,
                ),
              SizedBox(height: 16),
              ElevatedButton(
                onPressed: pickImage,
                child: Text("Capture Image"),
              ),
              SizedBox(height: 16),
              ElevatedButton(
                onPressed: processImage,
                child: Text("Send Image for Processing"),
              ),
              SizedBox(height: 16),
              if (_detectedText != null) Text("Extracted Text: $_detectedText"),
              if (_additionalInfo != null) Text("Additional Info: $_additionalInfo"),
              if (_detectedFace != null)
                Column(
                  children: [
                    Text("Detected Face:"),
                    SizedBox(height: 8),
                    Image.memory(
                      base64Decode(_detectedFace!.split(',')[1]),
                      height: 150,
                      fit: BoxFit.cover,
                    ),
                  ],
                ),
              if (_errorMessage != null) Text("Error: $_errorMessage", style: TextStyle(color: Colors.red)),
            ],
          ),
        ),
      ),
    );
  }
}
