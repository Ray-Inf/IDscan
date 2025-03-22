from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from utils.image_utils import preprocess_image, enhance_image_for_ocr, extract_id_number
from utils.face_recognition_utils import verify_face
from utils.file_utils import sanitize_filename
from prisma import Prisma
import numpy as np
from datetime import datetime
from models import model

user_bp = Blueprint('user', __name__)
prisma = Prisma()

@user_bp.route('/register-user', methods=['POST'])
async def register_user():
    print("Received request to register user")  # Debug statement
    if 'id_card' not in request.files or 'face_image' not in request.files:
        return jsonify({"error": "Missing ID card or face image"}), 400
    
    name = request.form.get('name')
    email = request.form.get('email', '')
    role = request.form.get('role', '').lower()
    department = request.form.get('department', '')
    template_id = request.form.get('template_id')
    card_id = request.form.get('card_id')
    admission_year = request.form.get('admission_year')
    division = request.form.get('division', '')
    
    print(f"User details: {name}, {email}, {role}, {department}, {template_id}, {card_id}, {admission_year}, {division}")  # Debug statement
    
    if not name or not template_id or not card_id or not admission_year:
        return jsonify({"error": "Name, template ID, card ID, and admission year are required"}), 400
    
    # Validate role
    if role and role not in ['teacher', 'guest_teacher', 'student']:
        return jsonify({"error": "Invalid role. Must be 'teacher', 'guest_teacher', or 'student'."}), 400

    # Calculate year of study
    try:
        admission_year = int(admission_year)
        current_year = datetime.now().year
        year_of_study = max(1, current_year - admission_year + 1)
        # Cap year of study at a reasonable number (e.g., 4 for a typical undergraduate program)
        if role == 'student':
            year_of_study = min(year_of_study, 4)
        else:
            # For teachers, we don't need year of study, set to None
            year_of_study = None
    except ValueError:
        return jsonify({"error": "Invalid admission year format"}), 400

    # Save ID card image temporarily
    id_card = request.files['id_card']
    id_card_path = f"temp/{sanitize_filename(id_card.filename)}"
    id_card.save(id_card_path)
    print(f"ID card saved to: {id_card_path}")  # Debug statement
    
    # Preprocess and extract features from the ID card
    try:
        img = preprocess_image(id_card_path)
        id_features = model.predict(img).flatten()
        print("ID card processed successfully")  # Debug statement
    except Exception as e:
        print(f"Error processing ID card: {e}")  # Debug statement
        return jsonify({"error": f"Failed to process ID card: {str(e)}"}), 500
    
    try:
        await prisma.connect()
        
        # Check if the template ID exists
        template = await prisma.template.find_unique(where={"id": int(template_id)})
        if not template:
            return jsonify({"error": "Template ID not found"}), 404
        
        # Verify the card_id is unique
        existing_user = await prisma.student.find_unique(where={"cardId": card_id})
        if existing_user:
            return jsonify({"error": "Card ID already exists"}), 400
        
        # Save face image
        face_image = request.files['face_image']
        face_path = f"images/users/{sanitize_filename(card_id)}.jpg"
        face_image.save(face_path)
        print(f"Face image saved to: {face_path}")  # Debug statement
        
        # Insert user data into the database
        user = await prisma.student.create({
            "name": name,
            "cardId": card_id,
            "email": email,
            "role": role,
            "department": department,
            "admissionYear": str(admission_year),
            "yearOfStudy": str(year_of_study) if year_of_study else None,
            "division": division,
            "template": {"connect": {"id": int(template_id)}},
            "imagePath": face_path
        })
        
        print(f"User registered successfully with ID: {user.id}")  # Debug statement
        
        return jsonify({
            "message": "User registered successfully",
            "user_id": user.id,
            "card_id": card_id,
            "year_of_study": year_of_study
        })
    except Exception as e:
        print(f"Database error: {e}")  # Debug statement
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()
        if os.path.exists(id_card_path):
            os.remove(id_card_path)

@user_bp.route('/lookup', methods=['GET'])
async def lookup_user():
    """Look up a user by card ID."""
    card_id = request.args.get('card_id')
    
    if not card_id:
        return jsonify({"error": "Card ID is required"}), 400
    
    try:
        await prisma.connect()
        user = await prisma.student.find_unique(where={"cardId": card_id})
        
        if user:
            return jsonify({"user": user.dict()})
        else:
            return jsonify({"user": None, "message": "No user found with this card ID"}), 404
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@user_bp.route('/<user_id>', methods=['GET'])
async def get_user_by_id(user_id):
    """Get a user by ID or card ID."""
    try:
        await prisma.connect()
        try:
            numeric_id = int(user_id)
            user = await prisma.student.find_unique(where={"id": str(numeric_id)})
        except ValueError:
            user = await prisma.student.find_unique(where={"cardId": user_id})
        
        if user:
            return jsonify(user.dict())
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()