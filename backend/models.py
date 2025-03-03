import tensorflow_hub as hub
import tensorflow as tf
import numpy as np
from PIL import Image
import easyocr
import cv2
import re  # Add this import for regex in extract_id_number
from config import MODEL_URL, INPUT_SHAPE

# Load EfficientNet model using TensorFlow Hub
model_url = "https://tfhub.dev/google/efficientnet/b0/feature-vector/1"
input_shape = (224, 224, 3)

# Define the input layer
inputs = tf.keras.Input(shape=input_shape)

# Add the TensorFlow Hub layer
hub_layer = hub.KerasLayer(model_url, trainable=False)

# Wrap the hub_layer in a Lambda layer to ensure compatibility
outputs = tf.keras.layers.Lambda(lambda x: hub_layer(x))(inputs)

# Create the model
model = tf.keras.Model(inputs=inputs, outputs=outputs)

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

def extract_id_number(text):
    """Extract ID number from text using regex."""
    patterns = [
        r"ID[\s:#]*([A-Z0-9]+)",
        r"ID[\s-]?(?:Number|No)[\s:#]*([A-Z0-9]+)",
        r"(?:Number|No)[\s:#]*([A-Z0-9]+)",
        r"([A-Z0-9]{5,12})"
    ]
    for pattern in patterns:
        matches = re.findall(pattern, text)
        if matches:
            return matches[0]
    return None

# Export the model and other functions
__all__ = ['model', 'preprocess_image', 'enhance_image_for_ocr', 'extract_id_number']