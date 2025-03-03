from flask import Blueprint, request, jsonify
from utils.face_recognition_utils import verify_face
from config import IMAGE_DIRS
import os
from database_setup import get_db_connection
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    logger.debug("Received login request")
    
    if 'live_image' not in request.files or 'user_id' not in request.form:
        return jsonify({"error": "Missing live image or user ID"}), 400
    
    live_image = request.files['live_image']
    user_id = request.form['user_id']
    logger.debug(f"Login attempt for user_id: {user_id}")
    
    # Save the live image temporarily
    temp_path = f"{IMAGE_DIRS['temp']}/{live_image.filename}"
    live_image.save(temp_path)
    logger.debug(f"Live image saved to: {temp_path}")
    
    # Fetch user information from database
    conn = None
    try:
        conn = get_db_connection()
        if not conn:
            logger.error("Failed to connect to the database")
            return jsonify({"error": "Database connection failed"}), 500
            
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, role, image_path FROM users WHERE card_id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            logger.warning(f"User with card_id {user_id} not found")
            os.remove(temp_path)
            return jsonify({"error": "User not found", "match": False}), 404
        
        # Get stored image path for face verification
        stored_image_path = user['image_path']
        logger.debug(f"Retrieved stored image path: {stored_image_path}")
        
        if not os.path.exists(stored_image_path):
            logger.error(f"Stored image file not found at: {stored_image_path}")
            os.remove(temp_path)
            return jsonify({"error": "User reference image not found", "match": False}), 404
        
        # Perform face verification
        verification_result = verify_face(stored_image_path, temp_path)
        logger.debug(f"Face verification result: {verification_result}")
        
        # Clean up temporary file
        os.remove(temp_path)
        
        if verification_result['match']:
            # Log successful attendance
            cursor.execute("""
              INSERT INTO attendance_logs (card_id, status) 
               VALUES (%s, %s)
           """, (user_id, "Present"))

            conn.commit()
            logger.info(f"Attendance logged for user {user['id']} ({user['name']})")
            
            return jsonify({
                "message": "Authentication successful",
                "match": True,
                "name": user['name'],
                "role": user['role'],
                "similarity": verification_result['similarity']
            }), 200
        else:
            return jsonify({
                "message": "Face verification failed",
                "match": False,
                "similarity": verification_result['similarity']
            }), 401
            
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"error": f"Authentication error: {str(e)}"}), 500
        
    finally:
        if conn:
            conn.close()