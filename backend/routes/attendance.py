
# from flask import Blueprint, jsonify, request
# from prisma import Prisma
# from datetime import datetime
# import asyncio
# import functools

# # Create a Blueprint with the /api prefix
# attendance_bp = Blueprint('attendance', __name__, url_prefix='/api')

# prisma = Prisma()

# # Helper function to serialize Prisma objects
# def serialize(data):
#     if isinstance(data, list):
#         return [item.dict() for item in data]
#     return data.dict()

# # Async route decorator
# def async_route(f):
#     @functools.wraps(f)
#     def wrapped(*args, **kwargs):
#         try:
#             try:
#                 loop = asyncio.get_event_loop()
#             except RuntimeError:
#                 loop = asyncio.new_event_loop()
#                 asyncio.set_event_loop(loop)
            
#             return loop.run_until_complete(f(*args, **kwargs))
#         except Exception as e:
#             print(f"Async route error: {str(e)}")
#             return jsonify({'error': str(e)}), 500
#     return wrapped

# # Get attendance data based on role and id
# @attendance_bp.route('/attendance', methods=['GET'])
# @async_route
# async def get_attendance():
#     try:
#         await prisma.connect()

#         role = request.args.get('role')
#         type = request.args.get('type')
#         id = request.args.get('id')

#         where = {}

#         # For non-admin users, filter based on type and id
#         if role != "admin":
#             if type == "teacherId":
#                 # Fetch attendance for the teacher's classes
#                 classes = await prisma.class_.find_many(where={"supervisorId": id})
#                 class_ids = [cls.id for cls in classes]
#                 where["lesson"] = {"classId": {"in": class_ids}}
#             else:
#                 return jsonify({"error": "Invalid parameters for non-admin users"}), 400

#         # Fetch attendance records
#         attendance_records = await prisma.attendance.find_many(
#             where=where,
#             include={"student": True, "lesson": True}
#         )

#         # Convert to list of dictionaries for JSON response
#         attendance_data = [
#             {
#                 'id': record.id,
#                 'date': record.date.isoformat(),
#                 'present': record.present,
#                 'student': {
#                     'id': record.student.id,
#                     'name': record.student.name,
#                     'surname': record.student.surname,
#                 },
#                 'lesson': {
#                     'id': record.lesson.id,
#                     'name': record.lesson.name,
#                 }
#             }
#             for record in attendance_records
#         ]

#         return jsonify(attendance_data)
    
#     except Exception as e:
#         print(f"Error fetching attendance data: {str(e)}")
#         return jsonify({"error": str(e)}), 500
#     finally:
#         await prisma.disconnect()
from flask import Blueprint, jsonify, request
from prisma import Prisma
from datetime import datetime
import asyncio
import functools

attendance_bp = Blueprint('attendance', __name__, url_prefix='/api')

prisma = Prisma()

def serialize(data):
    if isinstance(data, list):
        return [item.dict() for item in data]
    return data.dict()

def async_route(f):
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        try:
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            return loop.run_until_complete(f(*args, **kwargs))
        except Exception as e:
            print(f"Async route error: {str(e)}")
            return jsonify({'error': str(e)}), 500
    return wrapped

@attendance_bp.route('/attendance', methods=['GET'])
@async_route
async def get_attendance():
    try:
        await prisma.connect()

        role = request.args.get('role')
        type = request.args.get('type')
        id = request.args.get('id')

        where = {}

        if role != "admin":
            if type == "teacherId":
                classes = await prisma.class_.find_many(where={"supervisorId": id})
                class_ids = [cls.id for cls in classes]
                where["lesson"] = {"classId": {"in": class_ids}}
            else:
                return jsonify({"error": "Invalid parameters for non-admin users"}), 400

        attendance_records = await prisma.attendance.find_many(
            where=where,
            include={"student": True, "lesson": True}
        )

        attendance_data = [
            {
                'id': record.id,
                'date': record.date.isoformat(),
                'present': record.present,
                'student': {
                    'id': record.student.id,
                    'name': record.student.name,
                    'surname': record.student.surname,
                },
                'lesson': {
                    'id': record.lesson.id,
                    'name': record.lesson.name,
                }
            }
            for record in attendance_records
        ]

        return jsonify(attendance_data)
    
    except Exception as e:
        print(f"Error fetching attendance data: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        await prisma.disconnect()

@attendance_bp.route('/students/<string:student_id>/attendance', methods=['GET'])
@async_route
async def get_student_attendance(student_id):
    try:
        await prisma.connect()
        
        start_date_str = request.args.get('startDate')
        
        if start_date_str:
            start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
        else:
            current_year = datetime.now().year
            start_date = datetime(current_year, 1, 1)
        
        attendance_records = await prisma.attendance.find_many(
            where={
                'studentId': student_id,
                'date': {
                    'gte': start_date
                }
            }
        )
        
        attendance_data = [
            {
                'date': record.date.isoformat(),
                'present': record.present,
                'id': record.id
            }
            for record in attendance_records
        ]
        
        return jsonify(attendance_data)
    
    except Exception as e:
        print(f"Error fetching attendance data: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        await prisma.disconnect()