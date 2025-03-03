from paddleocr import PaddleOCR

# Initialize PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en')  # Set language

# Perform OCR on an image
image_path = r'images\templates\student.jpg'
result = ocr.ocr(image_path, cls=True)

# Extract text
for line in result:
    print(line)