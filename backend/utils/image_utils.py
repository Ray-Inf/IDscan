import cv2
import numpy as np
import easyocr
import re
from PIL import Image  # Add missing import

# Initialize OCR reader
reader = easyocr.Reader(['en'])

def preprocess_image(image_path):
    """Preprocess image for EfficientNet."""
    img = Image.open(image_path).resize((224, 224))
    img_array = np.array(img) / 255.0  # Normalize to [0, 1]
    return np.expand_dims(img_array, axis=0)

def enhance_image_for_ocr(image):
    """Enhance image for better OCR results."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    sharpened = cv2.filter2D(denoised, -1, kernel)
    return sharpened

# import re

# def extract_id_number(extracted_text):
#     """
#     Extracts the ID card number from the given OCR-extracted text.
    
#     The ID number is assumed to follow a numeric pattern (e.g., 8-digit or 10-digit format).
#     """
#     # Define possible ID number patterns (modify according to your ID card format)
#     id_patterns = [
#         r'\b\d{8,10}\b',  # Matches 8 to 10-digit numbers
#         r'StudentId[:\s]*\d{8,10}',  # Matches 'StudentId: 21020597'
#         r'ID[:\s]*\d{8,10}',  # Matches 'ID: 12345678'
#         r'Student Id[:\s]*\d{8,10}', 
#         r'Id*\d{8,10}', 
#     ]
    
#     # Try each pattern to extract the ID number
#     for pattern in id_patterns:
#         match = re.search(pattern, extracted_text, re.IGNORECASE)
#         if match:
#             # Extract only the numeric part if extra text is captured
#             id_number = re.findall(r'\d{8,10}', match.group())
#             if id_number:
#                 return id_number[0]  # Return the first valid ID found

#     return None  # Return None if no valid ID is found
import re

def extract_id_number(extracted_text):
    """
    Extracts the ID card number from OCR-extracted text.
    Handles inconsistencies in spacing, casing, and variations in the ID label.
    """
    # Step 1: Normalize text
    cleaned_text = extracted_text.lower().strip()
    
    # Step 2: Define patterns for ID number extraction
    id_patterns = [
        r'\b\d{8,10}\b',  # Matches standalone 8 to 10-digit numbers
        r'student\s*id[:\s]*\d{8,10}',  # Matches 'Student Id: 21020597'
        r'id[:\s]*\d{8,10}',  # Matches 'ID: 12345678'
        r'university\s*id[:\s]*\d{8,10}',  # Matches 'University ID: 9876543210'
        r'roll\s*no[:\s]*\d{8,10}',  # Matches 'Roll No: 21020597'
        r'registration\s*no[:\s]*\d{8,10}',  # Matches 'Registration No: 21020597'
        r'card\s*no[:\s]*\d{8,10}',  # Matches 'Card No: 21020597'
        r'\bid\d{3,10}\b'  # Matches 'id12345678', 'Id12345678', 'id123'
    ]
    
    # Step 3: Search for patterns in the text
    for pattern in id_patterns:
        match = re.search(pattern, cleaned_text, re.IGNORECASE)
        if match:
            # Extract only numeric part if extra text is captured
            id_number = re.findall(r'\d{3,10}', match.group())  # Extract numbers only
            if id_number:
                return id_number[0]  # Return the first valid ID found

    return None  # Return None if no valid ID is found
