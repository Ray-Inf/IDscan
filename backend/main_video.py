# import cv2
# from simple_facerec import SimpleFacerec
# from flask import Flask, request
# from flask_cors import CORS
# import numpy as np

# app = Flask('__name__')
# CORS(app)

# @app.route('/login', methods=['POST'])
# def login():
#     # Encode faces from a folder
#     sfr = SimpleFacerec()
#     sfr.load_encoding_images("OpenCV/images")  # Path to images for encoding

#     # Read the uploaded image (assuming an image file is uploaded via a POST request)
#     uploaded_image = request.files.get('image')  # Make sure to send the image as form data with key 'image'

#     # Convert the uploaded image to an OpenCV format
#     img_array = np.frombuffer(uploaded_image.read(), np.uint8)
#     img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

#     # Detect Faces in the uploaded image
#     face_locations, face_names = sfr.detect_known_faces(img)

#     # Draw rectangles around faces and display names
#     for face_loc, name in zip(face_locations, face_names):
#         y1, x2, y2, x1 = face_loc
#         cv2.putText(img, name, (x1, y1 - 10), cv2.FONT_HERSHEY_DUPLEX, 1, (0, 0, 200), 2)
#         cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 200), 4)

#     # Save or return the result
#     cv2.imwrite("output_image.jpg", img)  # Save the processed image
#     return "Image processed successfully."

# if __name__ == "__main__":
#     app.run(debug=True, host="127.0.0.1", port=5000)
#////////////////////////////////////major project working//////////////////////////////////////////////////////////////

# import cv2
# from simple_facerec import SimpleFacerec
# from flask import Flask, request,jsonify
# from flask_cors import CORS
# import numpy as np
# import os

# app = Flask('__name__')
# CORS(app)

# os.makedirs('Opencv/images', exist_ok=True)


# @app.route('/register', methods=['POST'])
# def register():
#     name = request.form.get('name')
#     if not name:
#         return jsonify({"error": "Name is required!"}), 400

#     # Get the image from the request
#     image_file = request.files.get('image')
#     if not image_file:
#         return jsonify({"error": "Image is required!"}), 400

#     # Convert image file to OpenCV format
#     in_memory_file = np.frombuffer(image_file.read(), np.uint8)
#     image = cv2.imdecode(in_memory_file, cv2.IMREAD_COLOR)

#     # Save the image with the user's name in the filename
#     filename = f"Opencv/images/{name}.jpg"
#     cv2.imwrite(filename, image)

#     return jsonify({"message": "Registration successful!", "status": "Done"})

# @app.route('/login', methods=['POST'])
# def login():
#     # Initialize SimpleFacerec and load known face encodings
#     print(1)
#     sfr = SimpleFacerec()
#     sfr.load_encoding_images("OpenCV/images")  # Path to images for encoding

#     # Read the uploaded image (image sent as form-data with key 'image')
#     uploaded_image = request.files.get('image')
#     img_array = np.frombuffer(uploaded_image.read(), np.uint8)
#     img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

#     # Detect faces in the uploaded image
#     face_locations, face_names = sfr.detect_known_faces(img)

#     # If no faces are detected or multiple faces are detected, reject the login attempt

#     # If an unknown face is detected, reject login
#     if "Unknown" in face_names:
#         return "Error: Unknown face detected. Please try again."
    
#     if len(face_locations) != 1:
#         return "Error: Please ensure only one face is present in the image."

#     # If a known face is detected, log the user in
#     logged_in_user = face_names[0]
#     return f"Welcome, {logged_in_user}!"

# if __name__ == "__main__":
#     app.run(debug=True, host="127.0.0.1", port=5000)
#//////////////////////////////////////////////////partially working but text extraction is not working ////////////////////////////
# import cv2
# from simple_facerec import SimpleFacerec
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import numpy as np
# import os
# import easyocr
# import base64

# app = Flask('__name__')
# CORS(app)

# os.makedirs('Opencv/images', exist_ok=True)

# # Initialize the OCR reader and face detection model
# reader = easyocr.Reader(['en'])
# face_classifier = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# def preprocess_image(image):
#     gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#     if len(image.shape) == 3:
#         image = cv2.fastNlMeansDenoisingColored(image, None, 10, 7, 21)
#     _, image = cv2.threshold(image, 150, 255, cv2.THRESH_BINARY)
#     kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
#     image = cv2.filter2D(image, -1, kernel)
#     return gray_image

# def extract_face(image):
#     gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#     faces = face_classifier.detectMultiScale(gray, 1.3, 5)
#     if len(faces) == 0:
#         return None
#     x, y, w, h = faces[0]
#     x = max(0, x - 25)
#     y = max(0, y - 40)
#     face = image[y:y + h + 70, x:x + w + 50]
#     return face

# @app.route('/capture', methods=['POST'])
# def capture_and_process():
#     try:
#         # Decode base64 image
#         image_data = request.json.get('imageData')
#         img_data = base64.b64decode(image_data.split(',')[1])
#         np_arr = np.frombuffer(img_data, np.uint8)
#         image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

#         if image is None:
#             return jsonify({"error": "Invalid image data provided"})

#         # Extract face
#         face = extract_face(image)
#         if face is None:
#             return jsonify({"error": "No face detected in the image."})

#         # Resize face for consistency
#         resized_face = cv2.resize(face, (224, 224))  # Example resize
#         _, buffer = cv2.imencode('.jpg', resized_face)
#         face_base64 = base64.b64encode(buffer).decode('utf-8')

#         # Initialize SimpleFacerec and load known face encodings
#         sfr = SimpleFacerec()
#         sfr.load_encoding_images("Opencv/images")

#         # Compare the captured face with known faces
#         face_locations, face_names = sfr.detect_known_faces(resized_face)

#         if "Unknown" in face_names:
#             return jsonify({"error": "Unknown face detected. Please try again."})

#         if len(face_locations) != 1:
#             return jsonify({"error": "Multiple faces detected. Please ensure only one face is present."})

#         matched_name = face_names[0]
#         additional_info = "This image was captured during ID card scan and attendance marking."

#         return jsonify({
#             "extractedText": "No text detected.",
#             "detectedFace": f"data:image/jpeg;base64,{face_base64}",
#             "matchFound": True,
#             "matchedName": matched_name,
#             "additionalInfo": additional_info
#         })

#     except Exception as e:
#         return jsonify({"error": f"An error occurred: {str(e)}"})


# @app.route('/register', methods=['POST'])
# def register():
#     name = request.form.get('name')
#     if not name:
#         return jsonify({"error": "Name is required!"}), 400

#     image_file = request.files.get('image')
#     if not image_file:
#         return jsonify({"error": "Image is required!"}), 400

#     in_memory_file = np.frombuffer(image_file.read(), np.uint8)
#     image = cv2.imdecode(in_memory_file, cv2.IMREAD_COLOR)
#     filename = f"Opencv/images/{name}.jpg"
#     cv2.imwrite(filename, image)

#     return jsonify({"message": "Registration successful!", "status": "Done"})

# @app.route('/login', methods=['POST'])
# def login():
#     sfr = SimpleFacerec()
#     sfr.load_encoding_images("Opencv/images")

#     uploaded_image = request.files.get('image')
#     img_array = np.frombuffer(uploaded_image.read(), np.uint8)
#     img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

#     face_locations, face_names = sfr.detect_known_faces(img)

#     if "Unknown" in face_names:
#         return "Error: Unknown face detected. Please try again."
    
#     if len(face_locations) != 1:
#         return "Error: Please ensure only one face is present in the image."

#     logged_in_user = face_names[0]
#     return f"Welcome, {logged_in_user}!"

# if __name__ == "__main__":
#     app.run(debug=True, host="127.0.0.1", port=5000)
#//////////////////////////////updating code/////////////////////////////////////
import cv2
from simple_facerec import SimpleFacerec
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os
import easyocr
import base64

app = Flask('__name__')
CORS(app)

os.makedirs('Opencv/images', exist_ok=True)

# Initialize the OCR reader and face detection model
reader = easyocr.Reader(['en'])
face_classifier = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

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
def register():
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

    return jsonify({"message": "Registration successful!", "status": "Done"})

@app.route('/login', methods=['POST'])
def login():
    sfr = SimpleFacerec()
    sfr.load_encoding_images("Opencv/images")

    uploaded_image = request.files.get('image')
    img_array = np.frombuffer(uploaded_image.read(), np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    face_locations, face_names = sfr.detect_known_faces(img)

    if "Unknown" in face_names:
        return "Error: Unknown face detected. Please try again."
    
    if len(face_locations) != 1:
        return "Error: Please ensure only one face is present in the image."

    logged_in_user = face_names[0]
    return f"Welcome, {logged_in_user}!"

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
