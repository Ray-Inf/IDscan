from flask import Blueprint, request, jsonify
import logging
from prisma import Prisma
from datetime import datetime

class_schedule_bp = Blueprint('class_schedule', __name__)
logger = logging.getLogger(__name__)
prisma = Prisma()

@class_schedule_bp.route('/class-schedule', methods=['GET'])
async def get_classes():
    try:
        teacher_id = request.args.get('teacher_id')
        
        await prisma.connect()
        
        where_condition = {}
        if teacher_id:
            where_condition["teacherId"] = teacher_id
        
        classes = await prisma.class_.find_many(where=where_condition)
        
        await prisma.disconnect()
        
        return jsonify({"success": True, "classes": [class_.dict() for class_ in classes]})
    except Exception as e:
        logger.error(f"Error fetching classes: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@class_schedule_bp.route('/class-schedule', methods=['POST'])
async def add_class():
    try:
        data = request.json
        
        required_fields = [
            'class_name', 'instructor', 'teacher_id', 'department', 
            'start_time', 'end_time', 'days', 'year', 'division', 'admission_year'
        ]
        
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400
        
        await prisma.connect()
        
        # Ensure the teacher exists
        teacher = await prisma.teacher.find_unique(where={"cardId": data['teacher_id']})
        if not teacher:
            await prisma.disconnect()
            return jsonify({"success": False, "error": "Teacher ID not found or invalid role."}), 404
        
        new_class = await prisma.class_.create(data={
            "name": data['class_name'],
            "instructor": data['instructor'],
            "teacherId": data['teacher_id'],
            "department": data['department'],
            "startTime": data['start_time'],
            "endTime": data['end_time'],
            "days": json.dumps(data['days']),
            "year": data['year'],
            "division": data['division'],
            "admissionYear": data['admission_year']
        })
        
        await prisma.disconnect()
        
        return jsonify({"success": True, "class": new_class.dict()})
    except Exception as e:
        logger.error(f"Error adding class: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@class_schedule_bp.route('/class-schedule/<int:class_id>', methods=['PUT'])
async def update_class(class_id):
    try:
        data = request.json
        
        required_fields = [
            'class_name', 'instructor', 'teacher_id', 'department', 
            'start_time', 'end_time', 'days', 'year', 'division', 'admission_year'
        ]
        
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400
        
        await prisma.connect()
        
        existing_class = await prisma.class_.find_unique(where={"id": class_id})
        if not existing_class:
            await prisma.disconnect()
            return jsonify({"success": False, "error": "Class not found"}), 404
        
        updated_class = await prisma.class_.update(
            where={"id": class_id},
            data={
                "name": data['class_name'],
                "instructor": data['instructor'],
                "teacherId": data['teacher_id'],
                "department": data['department'],
                "startTime": data['start_time'],
                "endTime": data['end_time'],
                "days": json.dumps(data['days']),
                "year": data['year'],
                "division": data['division'],
                "admissionYear": data['admission_year']
            }
        )
        
        await prisma.disconnect()
        
        return jsonify({"success": True, "class": updated_class.dict()})
    except Exception as e:
        logger.error(f"Error updating class: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@class_schedule_bp.route('/class-schedule/<int:class_id>', methods=['DELETE'])
async def delete_class(class_id):
    try:
        await prisma.connect()
        
        existing_class = await prisma.class_.find_unique(where={"id": class_id})
        if not existing_class:
            await prisma.disconnect()
            return jsonify({"success": False, "error": "Class not found"}), 404
        
        await prisma.class_.delete(where={"id": class_id})
        
        await prisma.disconnect()
        
        return jsonify({"success": True, "message": f"Class {class_id} deleted successfully"})
    except Exception as e:
        logger.error(f"Error deleting class: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@class_schedule_bp.route('/class-schedule/<int:class_id>/attendance', methods=['GET'])
async def get_class_attendance(class_id):
    try:
        await prisma.connect()
        
        attendance_logs = await prisma.classattendance.find_many(where={"classId": class_id})
        
        await prisma.disconnect()
        
        return jsonify({"success": True, "attendance": [log.dict() for log in attendance_logs]})
    except Exception as e:
        logger.error(f"Error fetching attendance for class {class_id}: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@class_schedule_bp.route('/student-classes', methods=['GET'])
async def get_student_classes():
    try:
        card_id = request.args.get('card_id')
        if not card_id:
            return jsonify({"success": False, "error": "Student card ID is required"}), 400
        
        current_time = datetime.now().strftime('%H:%M:%S')
        current_day = datetime.now().strftime('%A').lower()
        
        await prisma.connect()
        
        available_classes = await prisma.class_.find_many(
            where={
                "days": {"contains": current_day},
                "startTime": {"lte": current_time},
                "endTime": {"gte": current_time}
            }
        )
        
        await prisma.disconnect()
        
        return jsonify({
            "success": True, 
            "classes": [class_.dict() for class_ in available_classes],
            "debug_info": {
                "current_time": current_time,
                "current_day": current_day,
                "card_id": card_id
            }
        })
    except Exception as e:
        logger.error(f"Error fetching student classes: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@class_schedule_bp.route('/class-schedule/attendance', methods=['POST'])
async def mark_attendance():
    try:
        data = request.json
        required_fields = ['class_id', 'card_id', 'status']
        
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400
        
        await prisma.connect()
        
        existing_attendance = await prisma.classattendance.find_first(
            where={
                "classId": data['class_id'],
                "cardId": data['card_id'],
                "date": datetime.now().date()
            }
        )
        
        if existing_attendance:
            await prisma.disconnect()
            return jsonify({"success": False, "error": "Attendance already marked for today"}), 400
        
        new_attendance = await prisma.classattendance.create(
            data={
                "classId": data['class_id'],
                "cardId": data['card_id'],
                "status": data['status'],
                "date": datetime.now().date(),
                "checkInTime": datetime.now()
            }
        )
        
        await prisma.disconnect()
        
        return jsonify({"success": True, "message": "Attendance marked successfully"})
    except Exception as e:
        logger.error(f"Error marking attendance: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500