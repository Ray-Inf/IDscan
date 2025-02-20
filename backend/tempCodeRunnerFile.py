import cv2
from simple_facerec import SimpleFacerec
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
import easyocr
import tensorflow_hub as hub
from PIL import Image
import base64
import tensorflow as tf
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# Create directories if they don't exist
os.makedirs('Opencv/images', exist_ok=True)
os.makedirs('temp', exist_ok=True)


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

# Store template features in memory (for simplicity)
template_features = {}

def preprocess_image2(image_path):
    """Preprocess image for EfficientNet."""
    img = Image.open(image_path).resize((224, 224))
    img_array = np.array(img) / 255.0  # Normalize to [0, 1]
    return np.expand_dims(img_array, axis=0)

@app.route('/register-id-template', methods=['POST'])
def register():
    """Register a new ID card template."""
    if 'file' not in request.files or 'template_name' not in request.form:
        return jsonify({"error": "Missing file or template name"}), 400

    file = request.files['file']
    template_name = request.form['template_name']

    # Save the uploaded file temporarily
    file_path = f"temp/{file.filename}"
    os.makedirs("temp", exist_ok=True)
    file.save(file_path)

    # Extract features using EfficientNet
    img = preprocess_image2(file_path)
    features = model.predict(img)

    # Store features in memory
    template_features[template_name] = features.flatten()

    # Clean up temporary file
    os.remove(file_path)

    return jsonify({"message": f"Template '{template_name}' registered successfully!"})

@app.route('/verify-id-card', methods=['POST'])
def verify():
    """Verify an ID card against registered templates."""
    if 'file' not in request.files:
        return jsonify({"error": "Missing file"}), 400

    file = request.files['file']

    # Save the uploaded file temporarily
    file_path = f"temp/{file.filename}"
    os.makedirs("temp", exist_ok=True)
    file.save(file_path)

    # Extract features using EfficientNet
    img = preprocess_image2(file_path)
    query_features = model.predict(img).flatten()

    # Compare with stored templates
    best_match = None
    highest_similarity = -1
    for template_name, template_feature in template_features.items():
        similarity = cosine_similarity([query_features], [template_feature])[0][0]
        if similarity > highest_similarity:
            highest_similarity = similarity
            best_match = template_name

    # Clean up temporary file
    os.remove(file_path)

    if highest_similarity > 0.8:  # Threshold for similarity
        return jsonify({"message": f"Matched with template '{best_match}'", "similarity": float(highest_similarity)})
    else:
        return jsonify({"message": "No match found", "similarity": float(highest_similarity)}), 404







# Initialize the OCR reader and face detection model
reader = easyocr.Reader(['en'])
face_classifier = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Store ID card template features in memory
template_features = {}

def preprocess_image(image):
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    if len(image.shape) == 3:
        image = cv2.fastNlMeansDenoisingColored(image, None, 10, 7, 21)
    _, image = cv2.threshold(image, 150, 255, cv2.THRESH_BINARY)
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    image = cv2.filter2D(image, -1, kernel)
    return gray_image

def extract_face(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_classifier.detectMultiScale(gray, 1.3, 5)
    if len(faces) == 0:
        return None
    x, y, w, h = faces[0]
    x = max(0, x - 25)
    y = max(0, y - 40)
    face = image[y:y + h + 70, x:x + w + 50]
    return face

@app.route('/capture', methods=['POST'])
def capture_and_process():
    try:
        # Decode base64 image
        image_data = request.json.get('imageData')
        img_data = base64.b64decode(image_data.split(',')[1])
        np_arr = np.frombuffer(img_data, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if image is None:
            return jsonify({"error": "Invalid image data provided"})
        
        # Extract face
        face = extract_face(image)
        if face is None:
            return jsonify({"error": "No face detected in the image."})
        
        # Resize face for consistency
        resized_face = cv2.resize(face, (224, 224))  # Example resize
        _, buffer = cv2.imencode('.jpg', resized_face)
        face_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Initialize SimpleFacerec and load known face encodings
        sfr = SimpleFacerec()
        sfr.load_encoding_images("Opencv/images")
        
        # Compare the captured face with known faces
        face_locations, face_names = sfr.detect_known_faces(resized_face)
        if "Unknown" in face_names:
            return jsonify({"error": "Unknown face detected. Please try again."})
        if len(face_locations) != 1:
            return jsonify({"error": "Multiple faces detected. Please ensure only one face is present."})
        
        matched_name = face_names[0]
        
        # Extract text from the image
        gray_image = preprocess_image(image)
        text_results = reader.readtext(gray_image)
        extracted_text = " ".join([result[1] for result in text_results])
        additional_info = "This image was captured during ID card scan and attendance marking."
        
        return jsonify({
            "extractedText": extracted_text if extracted_text else "No text detected.",
            "detectedFace": f"data:image/jpeg;base64,{face_base64}",
            "matchFound": True,
            "matchedName": matched_name,
            "additionalInfo": additional_info
        })
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"})

@app.route('/register', methods=['POST'])
def register_face():
    name = request.form.get('name')
    if not name:
        return jsonify({"error": "Name is required!"}), 400
    
    image_file = request.files.get('image')
    if not image_file:
        return jsonify({"error": "Image is required!"}), 400
    
    in_memory_file = np.frombuffer(image_file.read(), np.uint8)
    image = cv2.imdecode(in_memory_file, cv2.IMREAD_COLOR)
    filename = f"Opencv/images/{name}.jpg"
    cv2.imwrite(filename, image)
    
    return jsonify({"message": "Face registration successful!", "status": "Done"})

@app.route('/login', methods=['POST'])
def login_face():
    sfr = SimpleFacerec()
    sfr.load_encoding_images("Opencv/images")
    
    uploaded_image = request.files.get('image')
    img_array = np.frombuffer(uploaded_image.read(), np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    
    face_locations, face_names = sfr.detect_known_faces(img)
    if "Unknown" in face_names:
        return jsonify({"error": "Unknown face detected. Please try again."})
    
    if len(face_locations) != 1:
        return jsonify({"error": "Please ensure only one face is present in the image."})
    
    logged_in_user = face_names[0]
    return jsonify({"message": f"Welcome, {logged_in_user}!"})


# @app.route('/verify-id-card', methods=['POST'])
# def verify_id_card():
#     file = request.files.get('file')
#     if not file:
#         return jsonify({"error": "File is required!"}), 400
    
#     file_path = f"temp/{file.filename}"
#     file.save(file_path)
    
#     # Preprocess and extract features from the scanned ID card
#     img = cv2.imread(file_path)
#     processed_img = preprocess_image(img)
#     query_features = extract_features(processed_img).flatten()  # Implement this function based on your feature extraction logic
    
#     os.remove(file_path)
    
#     # Compare with stored templates
#     best_match = None
#     highest_similarity = -1
#     for template_name, template_feature in template_features.items():
#         similarity = cosine_similarity([query_features], [template_feature])[0][0]
#         if similarity > highest_similarity:
#             highest_similarity = similarity
#             best_match = template_name
    
#     if highest_similarity > 0.8:  # Threshold for similarity
#         return jsonify({"message": f"Matched with template '{best_match}'", "similarity": float(highest_similarity)})
#     else:
#         return jsonify({"message": "No match found", "similarity": float(highest_similarity)}), 404


# Placeholder for feature extraction logic
def extract_features(image):
    # Replace this with your actual feature extraction logic (e.g., using a pretrained model)
    return np.random.rand(128)  # Dummy features for demonstration

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)