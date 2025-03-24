import numpy as np
from PIL import Image
import os

def preprocess_image(image_path):
    # Load the image
    img = Image.open(image_path)
    # Resize and normalize the image (example)
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    return img_array

def save_features(features, features_path):
    np.save(features_path, features)