import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),  # Sensitive information moved to .env

    'database': os.getenv('DB_NAME')
}

# API URLs and other settings
API_URL = "http://127.0.0.1:5000"
MODEL_URL = "https://tfhub.dev/google/efficientnet/b0/feature-vector/1"
INPUT_SHAPE = (224, 224, 3)

# Directories
IMAGE_DIRS = {
    'templates': 'images/templates',
    'users': 'images/users',
    'temp': 'temp',
     "id_cards": "uploads/id_cards",
    "face_images": "uploads/face_images"
}
# Facilities configuration
FACILITIES = {
    1: "Library",
    2: "Gym",
    3: "Cafeteria",
    4: "Class"
}

# Directories for facility-specific logs
FACILITY_DIRS = {
    'gym': 'logs/gym',
    'cafeteria': 'logs/cafeteria',
    'class': 'logs/class'
}
for directory in IMAGE_DIRS.values():
    os.makedirs(directory, exist_ok=True) 