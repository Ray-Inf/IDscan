from flask import Blueprint, request, jsonify
from prisma import Prisma
import logging
from datetime import datetime
from utils.face_recognition_utils import verify_face
auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)
prisma = Prisma()

@auth_bp.route('/login', methods=['POST'])
async def login():
    try:
        data = request.json
        card_id = data.get('card_id')
        live_image = data.get('live_image')

        if not card_id or not live_image:
            return jsonify({"error": "Missing card ID or live image"}), 400

        await prisma.connect()
        user = await prisma.user.find_unique(where={'cardId': card_id})
        if not user:
            return jsonify({"error": "User not found", "match": False}), 404

        # Perform face verification (pseudo-code)
        verification_result = verify_face(user.imagePath, live_image)
        if not verification_result['match']:
            return jsonify({"error": "Face verification failed", "match": False}), 401

        # Log attendance
        await prisma.attendance.create(data={
            "studentId": user.id,
            "lessonId": None,
            "date": datetime.now(),
            "present": True
        })

        await prisma.disconnect()
        return jsonify({
            "message": "Authentication successful",
            "match": True,
            "name": user.name,
            "role": user.role
        })
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        return jsonify({"error": f"Authentication error: {str(e)}"}), 500