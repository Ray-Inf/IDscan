
# from flask import Blueprint, request, jsonify
# from utils.face_recognition_utils import verify_face
# from config import IMAGE_DIRS
# import os
# from prisma import Prisma
# import logging

# # Set up logging
# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)

# auth_bp = Blueprint('auth', __name__)

# @auth_bp.route('/login', methods=['POST'])
# async def login():  # Make the route asynchronous
#     logger.debug("Received login request")
    
#     if 'live_image' not in request.files or 'user_id' not in request.form:
#         return jsonify({"error": "Missing live image or user ID"}), 400
    
#     live_image = request.files['live_image']
#     user_id = request.form['user_id']
#     logger.debug(f"Login attempt for user_id: {user_id}")
    
#     # Save the live image temporarily
#     temp_path = f"{IMAGE_DIRS['temp']}/{live_image.filename}"
#     live_image.save(temp_path)
#     logger.debug(f"Live image saved to: {temp_path}")
    
#     # Initialize Prisma client
#     db = Prisma()
#     try:
#         await db.connect()  # Await the connection
        
#         # Fetch user information from database by checking all role models
#         user = None
#         role = None
        
#         # Check Admin
#         admin = await db.admin.find_first(where={'cardId': user_id})  # Await the query
#         if admin:
#             user = admin
#             role = "ADMIN"
        
#         # Check Student
#         if not user:
#             student = await db.student.find_first(where={'cardId': user_id})  # Await the query
#             if student:
#                 user = student
#                 role = "STUDENT"
        
#         # Check Teacher
#         if not user:
#             teacher = await db.teacher.find_first(where={'cardId': user_id})  # Await the query
#             if teacher:
#                 user = teacher
#                 role = "TEACHER"
        
#         # Check GymMaster
#         if not user:
#             gym_master = await db.gymmaster.find_first(where={'cardId': user_id})  # Await the query
#             if gym_master:
#                 user = gym_master
#                 role = "GYM_MASTER"
        
#         # Check Librarian
#         if not user:
#             librarian = await db.librarian.find_first(where={'cardId': user_id})  # Await the query
#             if librarian:
#                 user = librarian
#                 role = "LIBRARIAN"
        
#         # Check HostelWarden
#         if not user:
#             hostel_warden = await db.hostelwarden.find_first(where={'cardId': user_id})  # Await the query
#             if hostel_warden:
#                 user = hostel_warden
#                 role = "HOSTEL_WARDEN"
        
#         if not user:
#             logger.warning(f"User with card_id {user_id} not found")
#             os.remove(temp_path)
#             return jsonify({"error": "User not found", "match": False}), 404
        
#         # Get stored image path for face verification
#         stored_image_path = user.imagePath or user.faceImage  # Use the correct field
#         stored_image_path=f"assets/{stored_image_path}"
#         logger.debug(f"Retrieved stored image path: {stored_image_path}")
        
#         if not os.path.exists(stored_image_path):
#             logger.error(f"Stored image file not found at: {stored_image_path}")
#             os.remove(temp_path)
#             return jsonify({"error": "User reference image not found", "match": False}), 404
        
#         # Perform face verification
#         verification_result = verify_face(stored_image_path, temp_path)
#         logger.debug(f"Face verification result: {verification_result}")
        
#         # Clean up temporary file
#         os.remove(temp_path)
        
#         from datetime import datetime

# # Inside the login route, after face verification succeeds:
#         from datetime import datetime

#         # Inside the login route, after face verification succeeds:
#         if verification_result['match']:
#             print(type(user_id))  # ✅ Correct

            
#             user_exists = (
#                 await db.student.find_first(where={'cardId': user_id}) or
#                 await db.teacher.find_first(where={'cardId': user_id}) or
#                 await db.admin.find_first(where={'cardId': user_id}) or
#                 await db.librarian.find_first(where={'cardId': user_id}) or
#                 await db.gymmaster.find_first(where={'cardId': user_id}) or
#                 await db.hostelwarden.find_first(where={'cardId': user_id})
#             )

#             if not user_exists:
#                 logger.warning(f"User with cardId {user_id} not found in any role table")
#                 return jsonify({"error": "User not found in any role table", "match": False}), 404

#             # Insert attendance log only if the cardId exists
#             await db.attendancelog.create(data={  
#                 'cardId': user_id,
#                 'status': 'Present',
#                 'loginTime': datetime.now(),
#             })

            
#             logger.info(f"Attendance logged for user {user.id} ({user.name})")
            
#             return jsonify({
#                 "message": "Authentication successful",
#                 "match": True,
#                 "name": user.name,
#                 "role": role,
#                 "similarity": verification_result['similarity']
#             }), 200
#         else:
#             return jsonify({
#                 "message": "Face verification failed",
#                 "match": False,
#                 "similarity": verification_result['similarity']
#             }), 401
            
#     except Exception as e:
#         logger.error(f"Error during login: {str(e)}")
#         if os.path.exists(temp_path):
#             os.remove(temp_path)
#         return jsonify({"error": f"Authentication error: {str(e)}"}), 500
        
#     finally:
#         await db.disconnect()  # Await the disconnection
from flask import Blueprint, request, jsonify
from utils.face_recognition_utils import verify_face
from config import IMAGE_DIRS
import os
from prisma import Prisma
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
async def login():
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
    
    # Initialize Prisma client
    db = Prisma()
    try:
        await db.connect()
        
        # Fetch user information from database by checking all role models
        user = None
        role = None
        
        # Check Admin
        admin = await db.admin.find_first(where={'cardId': user_id})
        if admin:
            user = admin
            role = "ADMIN"
        
        # Check Student
        if not user:
            student = await db.student.find_first(where={'cardId': user_id})
            if student:
                user = student
                role = "STUDENT"
        
        # Check Teacher
        if not user:
            teacher = await db.teacher.find_first(where={'cardId': user_id})
            if teacher:
                user = teacher
                role = "TEACHER"
        
        # Check GymMaster
        if not user:
            gym_master = await db.gymmaster.find_first(where={'cardId': user_id})
            if gym_master:
                user = gym_master
                role = "GYM_MASTER"
        
        # Check Librarian
        if not user:
            librarian = await db.librarian.find_first(where={'cardId': user_id})
            if librarian:
                user = librarian
                role = "LIBRARIAN"
        
        # Check HostelWarden
        if not user:
            hostel_warden = await db.hostelwarden.find_first(where={'cardId': user_id})
            if hostel_warden:
                user = hostel_warden
                role = "HOSTEL_WARDEN"
        
        if not user:
            logger.warning(f"User with card_id {user_id} not found")
            os.remove(temp_path)
            return jsonify({"error": "User not found", "match": False}), 404
        
        # Get stored image path for face verification
        stored_image_path = user.imagePath or user.faceImage  # Use the correct field
        stored_image_path = f"assets/{stored_image_path}"
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
            logger.debug(f"Face verification succeeded for user {user_id}")
            
            try:
                # Create attendance log with proper error handling
                attendance_data = {
                    'cardId': user_id,
                    'status': 'Present',
                    'loginTime': datetime.now()
                }
                
                logger.debug(f"Creating attendance log with data: {attendance_data}")
                
                # Add unique ID to avoid conflicts
                attendance_log = await db.attendancelog.create(data=attendance_data)
                
                logger.info(f"Attendance logged successfully with ID: {attendance_log.id}")
            except Exception as e:
                logger.error(f"Error creating attendance log: {str(e)}")
                # Continue with login even if attendance logging fails
                pass
            
            return jsonify({
                "message": "Authentication successful",
                "match": True,
                "name": user.name,
                "role": role,
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
        await db.disconnect()