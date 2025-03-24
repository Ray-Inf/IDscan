# import face_recognition
# import numpy as np

# def verify_face(stored_image_path, live_image_path):
#     """Verify a live face image against a stored face image."""
#     stored_img = face_recognition.load_image_file(stored_image_path)
#     live_img = face_recognition.load_image_file(live_image_path)

#     stored_encoding = face_recognition.face_encodings(stored_img)[0]
#     live_encodings = face_recognition.face_encodings(live_img)

#     if not live_encodings:
#         return False

#     matches = face_recognition.compare_faces([stored_encoding], live_encodings[0])
#     face_distance = face_recognition.face_distance([stored_encoding], live_encodings[0])[0]
#     similarity = (1 - min(face_distance, 1.0)) * 100

#     return {"match": matches[0], "similarity": similarity}
import numpy as np
from PIL import Image
import face_recognition

def verify_face(stored_image_path, live_image_path):
    # Load the stored image
    stored_image = face_recognition.load_image_file(stored_image_path)
    stored_encoding = face_recognition.face_encodings(stored_image)[0]

    # Load the live image
    live_image = face_recognition.load_image_file(live_image_path)
    live_encoding = face_recognition.face_encodings(live_image)[0]

    # Compare the faces
    results = face_recognition.compare_faces([stored_encoding], live_encoding)
    similarity = face_recognition.face_distance([stored_encoding], live_encoding)[0]

    return {
        'match': results[0],
        'similarity': float(similarity)
    }