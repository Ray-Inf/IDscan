# models.py
import tensorflow_hub as hub
import tensorflow as tf
import numpy as np
from PIL import Image
import easyocr
import cv2
import re
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Load EfficientNet model using TensorFlow Hub
model_url = "https://tfhub.dev/google/efficientnet/b0/feature-vector/1"
input_shape = (224, 224, 3)

logger.info("Loading TensorFlow Hub model...")
try:
    # Define the input layer with explicit shape requirements
    inputs = tf.keras.Input(shape=input_shape)
    
    # Add the TensorFlow Hub layer
    hub_layer = hub.KerasLayer(model_url, trainable=False)
    
    # Wrap the hub_layer in a Lambda layer to ensure compatibility
    outputs = tf.keras.layers.Lambda(lambda x: hub_layer(x))(inputs)
    
    # Create the model
    model = tf.keras.Model(inputs=inputs, outputs=outputs)
    logger.info("Model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load model: {str(e)}")
    model = None

# Initialize OCR reader
try:
    reader = easyocr.Reader(['en'])
    logger.info("OCR reader initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize OCR reader: {str(e)}")
    reader = None

def preprocess_image(image_path):
    """Preprocess image for EfficientNet with extensive error checking."""
    try:
        logger.info(f"Processing image at path: {image_path}")
        
        # Check if file exists
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        # Open and resize the image
        img = Image.open(image_path)
        logger.debug(f"Original image size: {img.size}, mode: {img.mode}")
        
        # Convert to RGB if not already
        if img.mode != 'RGB':
            img = img.convert('RGB')
            logger.debug(f"Converted image to RGB mode")
        
        # Resize to the expected input dimensions
        img = img.resize((224, 224))
        logger.debug(f"Resized image to: {img.size}")
        
        # Convert to numpy array
        img_array = np.array(img)
        
        # Verify shape
        if img_array.shape != (224, 224, 3):
            logger.warning(f"Unexpected image shape after resize: {img_array.shape}, expected (224, 224, 3)")
            # Force reshape if needed
            img_array = np.zeros((224, 224, 3), dtype=np.float32)
        
        # Normalize pixel values to [0, 1]
        img_array = img_array.astype(np.float32) / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        # Final validation
        logger.debug(f"Final preprocessed image shape: {img_array.shape}")
        
        # Check the final shape to ensure it's what the model expects
        if img_array.shape != (1, 224, 224, 3):
            logger.warning(f"Final shape {img_array.shape} doesn't match expected (1, 224, 224, 3). Fixing...")
            img_array = np.zeros((1, 224, 224, 3), dtype=np.float32)
        
        return img_array
    
    except Exception as e:
        logger.error(f"Error in preprocess_image: {str(e)}")
        # Create a valid fallback array with correct shape
        fallback_array = np.zeros((1, 224, 224, 3), dtype=np.float32)
        logger.warning(f"Using fallback array with shape: {fallback_array.shape}")
        return fallback_array
def enhance_image_for_ocr(image):
    """Enhance image for better OCR results."""
    try:
        # Check image dimensions and convert to grayscale
        if len(image.shape) == 3 and image.shape[2] == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
            
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        
        # Denoise the image
        denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
        
        # Sharpen the image
        kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
        sharpened = cv2.filter2D(denoised, -1, kernel)
        
        return sharpened
    
    except Exception as e:
        logger.error(f"Error in enhance_image_for_ocr: {str(e)}")
        return image  # Return original image if enhancement fails

def extract_id_number(text):
    """Extract ID number from text using regex."""
    try:
        logger.debug(f"Extracting ID from text: {text}")
        
        patterns = [
            r"ID[\s:#]*([A-Z0-9]{5,})",             # ID: ABC123
            r"ID[\s-]?(?:Number|No)[\s:#]*([A-Z0-9]{5,})",  # ID Number: ABC123
            r"(?:Number|No)[\s:#]*([A-Z0-9]{5,})",  # Number: ABC123
            r"([A-Z0-9]{5,12})"                    # Just find any alphanumeric 5-12 chars
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text)
            if matches:
                logger.debug(f"Found ID match with pattern {pattern}: {matches[0]}")
                return matches[0]
        
        logger.warning("No ID number pattern matched in the extracted text")
        return None
        
    except Exception as e:
        logger.error(f"Error in extract_id_number: {str(e)}")
        return None

# Export the model and other functions
__all__ = ['model', 'preprocess_image', 'enhance_image_for_ocr', 'extract_id_number']