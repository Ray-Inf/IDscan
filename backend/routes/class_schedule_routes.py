
from flask import Blueprint, request, jsonify
import json
import logging
from database_setup import get_db_connection
from datetime import datetime, timedelta
from flask_cors import CORS  # Import CORS

class_schedule_bp = Blueprint('class_schedule', __name__)
logger = logging.getLogger(__name__)

# Enable CORS for all routes in this blueprint
CORS(class_schedule_bp)

@class_schedule_bp.route('/classes', methods=['GET'])
def get_classes():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        teacher_id = request.args.get('teacher_id')
        query = 'SELECT * FROM classes'
        params = []

        if teacher_id:
            query += ' WHERE teacher_id = %s'
            params.append(teacher_id)

        cursor.execute(query, params)
        classes = cursor.fetchall()
        cursor.close()
        conn.close()

        for class_item in classes:
            if 'days' in class_item and class_item['days']:
                try:
                    class_item['days'] = json.loads(class_item['days'])
                except:
                    class_item['days'] = []

        return jsonify({"success": True, "classes": classes})
    except Exception as e:
        logger.error(f"Error fetching classes: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@class_schedule_bp.route('/classes', methods=['POST'])
def add_class():
    try:
        data = request.json

        required_fields = [
            'class_name', 'instructor', 'teacher_id', 'department', 
            'start_time', 'end_time', 'days', 'year', 'division', 'admission_year'
        ]

        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400

        days_json = json.dumps(data['days'])

        conn = get_db_connection()
        cursor = conn.cursor()

        # Ensure the teacher exists (teacher or guest_teacher)
        cursor.execute(
            "SELECT id FROM users WHERE card_id = %s AND (role = 'teacher' OR role = 'guest_teacher')",
            (data['teacher_id'],)
        )
        teacher = cursor.fetchone()

        if not teacher:
            return jsonify({
                "success": False,
                "error": "Teacher ID not found or invalid role. Ensure you are registered as a teacher or guest teacher."
            }), 404

        query = """
            INSERT INTO classes (
                class_name, instructor, teacher_id, department, room, 
                start_time, end_time, days, year, division, admission_year
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(query, (
            data['class_name'], data['instructor'], data['teacher_id'], data['department'],
            data.get('room', ''), data['start_time'], data['end_time'],
            days_json, data['year'], data['division'], data['admission_year']
        ))

        class_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()

        created_class = data.copy()
        created_class['id'] = class_id

        return jsonify({"success": True, "class": created_class})
    except Exception as e:
        logger.error(f"Error adding class: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@class_schedule_bp.route('/classes/<int:class_id>', methods=['PUT'])
def update_class(class_id):
    """Update an existing class."""
    try:
        data = request.json

        required_fields = [
            'class_name', 'instructor', 'teacher_id', 'department', 
            'start_time', 'end_time', 'days', 'year', 'division', 'admission_year'
        ]

        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400

        days_json = json.dumps(data['days'])

        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First check if the class exists
        cursor.execute("SELECT id FROM classes WHERE id = %s", (class_id,))
        existing_class = cursor.fetchone()
        
        if not existing_class:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Class not found"}), 404

        query = """
            UPDATE classes SET
                class_name = %s, instructor = %s, teacher_id = %s, department = %s, 
                room = %s, start_time = %s, end_time = %s, days = %s, 
                year = %s, division = %s, admission_year = %s
            WHERE id = %s
        """

        cursor.execute(query, (
            data['class_name'], data['instructor'], data['teacher_id'], data['department'],
            data.get('room', ''), data['start_time'], data['end_time'],
            days_json, data['year'], data['division'], data['admission_year'], class_id
        ))

        conn.commit()
        cursor.close()
        conn.close()

        updated_class = data.copy()
        updated_class['id'] = class_id

        return jsonify({"success": True, "class": updated_class})
    except Exception as e:
        logger.error(f"Error updating class: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@class_schedule_bp.route('/classes/<int:class_id>', methods=['DELETE'])
def delete_class(class_id):
    """Delete an existing class."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # First check if the class exists
        cursor.execute("SELECT id FROM classes WHERE id = %s", (class_id,))
        existing_class = cursor.fetchone()
        
        if not existing_class:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Class not found"}), 404

        # Delete the class
        cursor.execute("DELETE FROM classes WHERE id = %s", (class_id,))
        conn.commit()
        
        cursor.close()
        conn.close()

        return jsonify({"success": True, "message": f"Class {class_id} deleted successfully"})
    except Exception as e:
        logger.error(f"Error deleting class: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@class_schedule_bp.route('/classes/<int:class_id>/attendance', methods=['GET'])
def get_class_attendance(class_id):
    """Get attendance logs for a specific class."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT a.card_id, a.status, a.timestamp
            FROM attendance_logs a
            WHERE a.class_id = %s
        """
        cursor.execute(query, (class_id,))
        attendance_logs = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({"success": True, "attendance": attendance_logs})
    except Exception as e:
        logger.error(f"Error fetching attendance for class {class_id}: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@class_schedule_bp.route('/student-classes', methods=['GET'])
def get_student_classes():
    """Get available classes for a student to check in."""
    try:
        card_id = request.args.get('card_id')
        if not card_id:
            return jsonify({"success": False, "error": "Student card ID is required"}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get current time and day of week with debug info
        current_time = datetime.now().strftime('%H:%M:%S')
        current_day = datetime.now().strftime('%A').lower()
        
        logger.info(f"Current time: {current_time}, Current day: {current_day}")
        
        # Create a buffer time (30 minutes before and after class time) to make the window more flexible
        time_buffer_minutes = 30
        
        # Modified query to show classes with a time buffer and better day matching
        # This will show classes that are coming up soon or have recently started
        query = """
            SELECT c.*, 
                (SELECT COUNT(*) > 0 FROM attendance_logs 
                 WHERE class_id = c.id AND card_id = %s AND DATE(timestamp) = CURDATE()) 
                AS already_attended
            FROM classes c
            WHERE JSON_CONTAINS(c.days, %s)
            AND (
                -- Class is currently in session (with buffer before)
                (
                    TIME(c.start_time) <= ADDTIME(%s, '00:30:00') 
                    AND TIME(c.end_time) >= %s
                )
                OR 
                -- Class is about to start (within the buffer)
                (
                    TIME(c.start_time) >= SUBTIME(%s, '00:30:00')
                    AND TIME(c.start_time) <= ADDTIME(%s, '00:30:00')
                )
            )
            AND CURDATE() BETWEEN 
                DATE_FORMAT(CONCAT(c.admission_year, '-01-01'), '%%Y-%%m-%%d') 
                AND DATE_ADD(DATE_FORMAT(CONCAT(c.admission_year, '-01-01'), '%%Y-%%m-%%d'), INTERVAL 1 YEAR)
        """
        
        cursor.execute(query, (
            card_id, 
            json.dumps(current_day), 
            current_time, 
            current_time,
            current_time,
            current_time
        ))
        
        available_classes = cursor.fetchall()
        
        # Log the available classes for debugging
        logger.info(f"Found {len(available_classes)} available classes")
        
        # Parse days JSON
        for class_item in available_classes:
            if 'days' in class_item and class_item['days']:
                try:
                    class_item['days'] = json.loads(class_item['days'])
                except:
                    class_item['days'] = []
                    
            # Format times for display
            if 'start_time' in class_item:
                class_item['start_time'] = str(class_item['start_time'])
            if 'end_time' in class_item:
                class_item['end_time'] = str(class_item['end_time'])
        
        cursor.close()
        conn.close()
        
        # Return debug info along with classes
        return jsonify({
            "success": True, 
            "classes": available_classes,
            "debug_info": {
                "current_time": current_time,
                "current_day": current_day,
                "card_id": card_id
            }
        })
    except Exception as e:
        logger.error(f"Error fetching student classes: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@class_schedule_bp.route('/classes/attendance', methods=['POST'])
def mark_attendance():
    """Mark a student's attendance for a class."""
    try:
        data = request.json
        required_fields = ['class_id', 'card_id', 'status']
        
        for field in required_fields:
            if field not in data:
                return jsonify({"success": False, "error": f"Missing required field: {field}"}), 400
        
        class_id = data['class_id']
        card_id = data['card_id']
        status = data['status']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if attendance already marked today
        cursor.execute(
            "SELECT id FROM attendance_logs WHERE class_id = %s AND card_id = %s AND DATE(timestamp) = CURDATE()",
            (class_id, card_id)
        )
        
        existing_attendance = cursor.fetchone()
        
        if existing_attendance:
            cursor.close()
            conn.close()
            return jsonify({"success": False, "error": "Attendance already marked for today"}), 400
        
        # Mark attendance
        cursor.execute(
            "INSERT INTO attendance_logs (class_id, card_id, status, timestamp) VALUES (%s, %s, %s, NOW())",
            (class_id, card_id, status)
        )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Attendance marked successfully"})
    except Exception as e:
        logger.error(f"Error marking attendance: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

# Add a test endpoint to help debug time issues
@class_schedule_bp.route('/debug/time', methods=['GET'])
def debug_time():
    """Debug endpoint to check server time and day."""
    try:
        current_time = datetime.now()
        return jsonify({
            "success": True,
            "server_time": current_time.strftime('%H:%M:%S'),
            "server_date": current_time.strftime('%Y-%m-%d'),
            "day_of_week": current_time.strftime('%A'),
            "day_lower": current_time.strftime('%A').lower(),
            "timestamp": str(current_time)
        })
    except Exception as e:
        logger.error(f"Error in debug time endpoint: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500