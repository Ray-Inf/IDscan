from flask import Blueprint, request, jsonify
from models import model, preprocess_image
from utils.file_utils import sanitize_filename
from utils.image_utils import enhance_image_for_ocr, extract_id_number
from config import IMAGE_DIRS
import os
import numpy as np
import cv2
import logging
from scipy.spatial.distance import cosine
from paddleocr import PaddleOCR
from prisma.client import Prisma

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

id_card_bp = Blueprint('id_card', __name__)

# Initialize Prisma client
prisma = Prisma()

# Initialize PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en')  # Set language to English

@id_card_bp.route('/register-id-template', methods=['POST'])
async def register_template():
    logger.debug("Received request to register template")
    if 'file' not in request.files or 'template_name' not in request.form:
        return jsonify({"error": "Missing file or template name"}), 400
    
    file = request.files['file']
    template_name = request.form['template_name']
    logger.debug(f"Template name: {template_name}")
    organization = request.form.get('organization', 'Default Organization')
    template_class = request.form.get('template_class', 'Default Class')
    
    # Sanitize and validate the template name
    sanitized_template_name = sanitize_filename(template_name)
    if not sanitized_template_name:
        return jsonify({"error": "Invalid template name"}), 400
    
    # Ensure the templates directory exists
    try:
        os.makedirs(IMAGE_DIRS['templates'], exist_ok=True)
        logger.debug(f"Created directory: {IMAGE_DIRS['templates']}")
    except Exception as e:
        return jsonify({"error": f"Failed to create templates directory: {str(e)}"}), 500
    
    # Define paths for saving the template image and features
    template_path = f"{IMAGE_DIRS['templates']}/{sanitized_template_name}.jpg"
    features_path = f"{IMAGE_DIRS['templates']}/{sanitized_template_name}_features.npy"
    logger.debug(f"Template path: {template_path}")
    logger.debug(f"Features path: {features_path}")
    
    # Save the uploaded file
    try:
        file.save(template_path)
        logger.debug("File saved successfully")
    except Exception as e:
        return jsonify({"error": f"Failed to save template image: {str(e)}"}), 500
    
    # Process the template image
    try:
        logger.debug("Preprocessing image...")
        features = preprocess_image(template_path)
        logger.debug("Image preprocessed successfully")
        
        logger.debug("Predicting features using model...")
        model_features = model.predict(features)
        logger.debug("Features predicted successfully")
        
        logger.debug("Saving features...")
        np.save(features_path, model_features)
        logger.debug("Features saved successfully")
    except Exception as e:
        logger.error(f"Error processing template image: {str(e)}")
        if os.path.exists(template_path):
            os.remove(template_path)
        return jsonify({"error": f"Failed to process template image: {str(e)}"}), 500
    
    # Verify the features file was saved successfully
    if not os.path.exists(features_path):
        return jsonify({"error": "Template features could not be saved"}), 404
        
    # Insert the template into the database using Prisma
    try:
        logger.debug("Inserting template into database")
        await prisma.connect()
        
        # Check if template with this name already exists
        existing_template = await prisma.template.find_unique(
            where={"name": template_name}
        )
        
        if existing_template:
            logger.warning(f"Template with name '{template_name}' already exists")
            return jsonify({"error": f"Template with name '{template_name}' already exists"}), 400
            
        # Insert the new template
        import uuid
        template_id = str(uuid.uuid4())
        new_template = await prisma.template.create(
            data={
                "id": template_id,
                "name": template_name,
                "organization": organization,
                "templateClass": template_class,
                "image_path": template_path,
                "features_path": features_path
            }
        )
        
        logger.debug(f"Template inserted successfully with ID: {new_template.id}")
        
        return jsonify({
            "message": f"Template '{template_name}' registered successfully!",
            "template_id": new_template.id
        }), 200
        
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
        
    finally:
        await prisma.disconnect()

@id_card_bp.route('/scan', methods=['POST'])
async def scan_id_card():
    logger.debug("Received request to scan ID card")
    if 'id_image' not in request.files:
        return jsonify({"error": "Missing ID card image"}), 400
    
    id_image = request.files['id_image']
    temp_path = f"{IMAGE_DIRS['temp']}/{sanitize_filename(id_image.filename)}"
    
    try:
        # Save the uploaded file
        id_image.save(temp_path)
        logger.debug(f"ID card image saved to: {temp_path}")
        
        # Process the ID card image to extract features for template matching
        id_features = preprocess_image(temp_path)
        id_image_features = model.predict(id_features).flatten()
        
        # Connect to the database using Prisma
        await prisma.connect()
        
        # Get all templates from the database
        templates = await prisma.template.find_many()
        
        if not templates:
            return jsonify({"error": "No ID card templates found in system"}), 400
        
        # Match against templates
        best_match = None
        best_similarity = 0
        matched_template_id = None
        
        for template in templates:
            template_name = sanitize_filename(template.name)
            template_features_path = f"{IMAGE_DIRS['templates']}/{template_name}_features.npy"
            
            if os.path.exists(template_features_path):
                template_features = np.load(template_features_path)
                
                # Calculate similarity (1 - cosine distance)
                similarity = 1 - cosine(id_image_features, template_features.flatten())
                similarity = float(similarity) * 100  # Convert to percentage
                
                logger.debug(f"Similarity with template {template.name}: {similarity}%")
                
                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match = template.name
                    matched_template_id = template.id
        
        # Set a threshold for template matching
        if best_similarity < 55:  # Require at least 65% similarity
            logger.warning(f"Best template match is below threshold: {best_similarity}%")
            return jsonify({"error": "ID card type not recognized. Please use a valid ID card."}), 400
        
        logger.info(f"ID card matched with template: {best_match} (Similarity: {best_similarity}%)")
        
        # Read and process the image for OCR
        image = cv2.imread(temp_path)
        enhanced_image = enhance_image_for_ocr(image)
        
        # Extract text using PaddleOCR
        ocr_results = ocr.ocr(enhanced_image, cls=True)
        extracted_text = " ".join([line[1][0] for result in ocr_results for line in result])
        logger.debug(f"Extracted text: {extracted_text}")
        
        # Try to extract the ID number
        card_id = extract_id_number(extracted_text)
        logger.debug(f"Extracted ID number: {card_id}")
        
        if not card_id:
            return jsonify({"error": "Could not extract ID number from card"}), 400
        
        # Check for users with this card ID
        # First check if it's a student
        student = await prisma.student.find_unique(
            where={"cardId": card_id}
        )
        
        if student:
            logger.debug(f"Found existing student: {student.name}, ID: {student.cardId}")
            # Clean up the temporary file
            os.remove(temp_path)
            
            return jsonify({
                "message": "ID card successfully scanned and verified",
                "user_id": student.cardId,
                "name": student.name,
                "role": "STUDENT",
                "template_id": matched_template_id,
                "template_name": best_match,
                "similarity": best_similarity,
                "new_user": False
            }), 200
        
        # Check if it's a teacher
        teacher = await prisma.teacher.find_unique(
            where={"cardId": card_id}
        )
        
        if teacher:
            logger.debug(f"Found existing teacher: {teacher.name}, ID: {teacher.cardId}")
            # Clean up the temporary file
            os.remove(temp_path)
            
            return jsonify({
                "message": "ID card successfully scanned and verified",
                "user_id": teacher.cardId,
                "name": teacher.name,
                "role": "TEACHER",
                "template_id": matched_template_id,
                "template_name": best_match,
                "similarity": best_similarity,
                "new_user": False
            }), 200
        
        # Check if it's an admin
        admin = await prisma.admin.find_unique(
            where={"cardId": card_id}
        )
        
        if admin:
            logger.debug(f"Found existing admin: {admin.name}, ID: {admin.cardId}")
            # Clean up the temporary file
            os.remove(temp_path)
            
            return jsonify({
                "message": "ID card successfully scanned and verified",
                "user_id": admin.cardId,
                "name": admin.name,
                "role": admin.role,
                "template_id": matched_template_id,
                "template_name": best_match,
                "similarity": best_similarity,
                "new_user": False
            }), 200
        
        # Check if it's a librarian
        librarian = await prisma.librarian.find_unique(
            where={"cardId": card_id}
        )
        
        if librarian:
            logger.debug(f"Found existing librarian: {librarian.name}, ID: {librarian.cardId}")
            # Clean up the temporary file
            os.remove(temp_path)
            
            return jsonify({
                "message": "ID card successfully scanned and verified",
                "user_id": librarian.cardId,
                "name": librarian.name,
                "role": "LIBRARIAN",
                "template_id": matched_template_id,
                "template_name": best_match,
                "similarity": best_similarity,
                "new_user": False
            }), 200
        
        # Check if it's a gym master
        gym_master = await prisma.gymMaster.find_unique(
            where={"cardId": card_id}
        )
        
        if gym_master:
            logger.debug(f"Found existing gym master: {gym_master.name}, ID: {gym_master.cardId}")
            # Clean up the temporary file
            os.remove(temp_path)
            
            return jsonify({
                "message": "ID card successfully scanned and verified",
                "user_id": gym_master.cardId,
                "name": gym_master.name,
                "role": "GYM_MASTER",
                "template_id": matched_template_id,
                "template_name": best_match,
                "similarity": best_similarity,
                "new_user": False
            }), 200
        
        # Check if it's a hostel warden
        hostel_warden = await prisma.hostelWarden.find_unique(
            where={"cardId": card_id}
        )
        
        if hostel_warden:
            logger.debug(f"Found existing hostel warden: {hostel_warden.name}, ID: {hostel_warden.cardId}")
            # Clean up the temporary file
            os.remove(temp_path)
            
            return jsonify({
                "message": "ID card successfully scanned and verified",
                "user_id": hostel_warden.cardId,
                "name": hostel_warden.name,
                "role": "HOSTEL_WARDEN",
                "template_id": matched_template_id,
                "template_name": best_match,
                "similarity": best_similarity,
                "new_user": False
            }), 200
            
        # If no user found with this card ID, return as new user
        logger.debug(f"New ID card detected: {card_id}")
        
        return jsonify({
            "message": "New ID card detected", 
            "card_id": card_id,
            "template_id": matched_template_id,
            "template_name": best_match,
            "new_user": True
        }), 200
        
    except Exception as e:
        logger.error(f"Error processing ID card: {str(e)}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"error": f"Failed to process ID card: {str(e)}"}), 500
    
    finally:
        await prisma.disconnect()

