import face_recognition
import numpy as np

def verify_face(stored_image_path, live_image_path):
    """Verify a live face image against a stored face image."""
    stored_img = face_recognition.load_image_file(stored_image_path)
    live_img = face_recognition.load_image_file(live_image_path)

    stored_encoding = face_recognition.face_encodings(stored_img)[0]
    live_encodings = face_recognition.face_encodings(live_img)

    if not live_encodings:
        return False

    matches = face_recognition.compare_faces([stored_encoding], live_encodings[0])
    face_distance = face_recognition.face_distance([stored_encoding], live_encodings[0])[0]
    similarity = (1 - min(face_distance, 1.0)) * 100

    return {"match": matches[0], "similarity": similarity}