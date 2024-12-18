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


import cv2
from simple_facerec import SimpleFacerec
from flask import Flask, request,jsonify
from flask_cors import CORS
import numpy as np
import os

app = Flask('__name__')
CORS(app)

os.makedirs('Opencv/images', exist_ok=True)


@app.route('/register', methods=['POST'])
def register():
    name = request.form.get('name')
    if not name:
        return jsonify({"error": "Name is required!"}), 400

    # Get the image from the request
    image_file = request.files.get('image')
    if not image_file:
        return jsonify({"error": "Image is required!"}), 400

    # Convert image file to OpenCV format
    in_memory_file = np.frombuffer(image_file.read(), np.uint8)
    image = cv2.imdecode(in_memory_file, cv2.IMREAD_COLOR)

    # Save the image with the user's name in the filename
    filename = f"Opencv/images/{name}.jpg"
    cv2.imwrite(filename, image)

    return jsonify({"message": "Registration successful!", "status": "Done"})

@app.route('/login', methods=['POST'])
def login():
    # Initialize SimpleFacerec and load known face encodings
    sfr = SimpleFacerec()
    sfr.load_encoding_images("OpenCV/images")  # Path to images for encoding

    # Read the uploaded image (image sent as form-data with key 'image')
    uploaded_image = request.files.get('image')
    img_array = np.frombuffer(uploaded_image.read(), np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    # Detect faces in the uploaded image
    face_locations, face_names = sfr.detect_known_faces(img)

    # If no faces are detected or multiple faces are detected, reject the login attempt

    # If an unknown face is detected, reject login
    if "Unknown" in face_names:
        return "Error: Unknown face detected. Please try again."
    
    if len(face_locations) != 1:
        return "Error: Please ensure only one face is present in the image."

    # If a known face is detected, log the user in
    logged_in_user = face_names[0]
    return f"Welcome, {logged_in_user}!"

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
