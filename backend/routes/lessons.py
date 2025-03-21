
# from flask import Blueprint, jsonify, request
# from prisma import Prisma
# import asyncio
# from functools import wraps
# from datetime import datetime, timedelta

# lessons_bp = Blueprint("lessons", __name__)
# prisma = Prisma()

# # Helper to handle async routes in Flask
# def async_route(f):
#     @wraps(f)
#     def wrapper(*args, **kwargs):
#         try:
#             loop = asyncio.get_event_loop()
#         except RuntimeError:
#             loop = asyncio.new_event_loop()
#             asyncio.set_event_loop(loop)
#         return loop.run_until_complete(f(*args, **kwargs))
#     return wrapper
# @lessons_bp.route("/lessons", methods=["GET"])
# @async_route
# async def get_lessons():
#     try:
#         if not prisma.is_connected():
#             await prisma.connect()
        
#         # Get query parameters
#         type_param = request.args.get("type")
#         id_param = request.args.get("id")
#         user_role = request.args.get("role")
#         page = int(request.args.get("page", 1))  # Default to page 1
#         items_per_page = 10  # Number of items per page
        
#         # Validate parameters for non-admin users
#         if user_role != "admin" and (not type_param or not id_param):
#             return jsonify({"error": "Missing required parameters for non-admin users"}), 400
            
#         # Convert id to appropriate type for non-admin users
#         if user_role != "admin" and type_param == "classId":
#             try:
#                 id_param = int(id_param)
#             except ValueError:
#                 return jsonify({"error": "Invalid ID format"}), 400
        
#         # Build query based on type and user role
#         filter_criteria = {}
        
#         # Admin can see all lessons
#         if user_role == "admin":
#             filter_criteria = {}  # No filter, fetch all lessons
#         else:
#             # Non-admin users can only see lessons related to their ID
#             if type_param == "teacherId":
#                 filter_criteria["teacherId"] = id_param
#             elif type_param == "classId":
#                 filter_criteria["classId"] = id_param
#             elif type_param == "subjectId":
#                 filter_criteria["subjectId"] = id_param
#             else:
#                 return jsonify({"error": "Invalid type parameter"}), 400
            
#         # Fetch lessons with pagination
#         lessons = await prisma.lesson.find_many(
#             where=filter_criteria,
#             skip=(page - 1) * items_per_page,  # Skip items for pagination
#             take=items_per_page,  # Limit number of items per page
#             include={
#                 "subject": True,
#                 "teacher": True,
#                 "class_": True
#             }
#         )
        
#         # Get total count of lessons for pagination
#         total_count = await prisma.lesson.count(where=filter_criteria)
        
#         # Format for calendar
#         formatted_lessons = [
#             {
#                 "title": f"{lesson.name} - {lesson.subject.name if lesson.subject else 'No Subject'} - {lesson.teacher.name if lesson.teacher else 'No Teacher'}",
#                 "start": lesson.startTime.isoformat() if lesson.startTime else None,
#                 "end": lesson.endTime.isoformat() if lesson.endTime else None,
#                 "subject": lesson.subject.name if lesson.subject else "No Subject",
#                 "class_": lesson.class_.name if lesson.class_ else "No Class",
#                 "teacher": lesson.teacher.name if lesson.teacher else "No Teacher",
#                 "day": lesson.day,
#                 "startTime": lesson.startTime.isoformat() if lesson.startTime else None,
#                 "endTime": lesson.endTime.isoformat() if lesson.endTime else None,
#             }
#             for lesson in lessons
#         ]
            
#         return jsonify({
#             "data": formatted_lessons,
#             "count": total_count  # Return total count for pagination
#         })
        
#     except Exception as e:
#         print(f"Error in get_lessons: {str(e)}")
#         return jsonify({"error": str(e)}), 500
#     finally:
#         # Don't disconnect here as it might be used by other requests
#         pass


# @lessons_bp.route('/lessons/teacher/<teacher_id>', methods=['GET'])
# async def get_teacher_lessons(teacher_id):
#     try:
#         lessons = await db.lesson.find_many(
#             where={
#                 'teacherId': teacher_id
#             }
#         )
        
#         formatted_lessons = [
#             {
#                 'title': lesson.name,
#                 'start': lesson.startTime.isoformat(),
#                 'end': lesson.endTime.isoformat()
#             }
#             for lesson in lessons
#         ]
        
#         return jsonify(formatted_lessons), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @lessons_bp.route('/lessons/class/<int:class_id>', methods=['GET'])
# async def get_class_lessons(class_id):
#     try:
#         lessons = await db.lesson.find_many(
#             where={
#                 'classId': class_id
#             }
#         )
        
#         formatted_lessons = [
#             {
#                 'title': lesson.name,
#                 'start': lesson.startTime.isoformat(),
#                 'end': lesson.endTime.isoformat()
#             }
#             for lesson in lessons
#         ]
        
#         return jsonify(formatted_lessons), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500


# # Helper function to adjust lesson times to current week
# def adjust_to_current_week(lessons):
#     today = datetime.now()
#     start_of_week = today - timedelta(days=today.weekday())
    
#     adjusted_lessons = []
#     for lesson in lessons:
#         # Extract day of week from the lesson's day enum
#         day_map = {
#             'MONDAY': 0,
#             'TUESDAY': 1,
#             'WEDNESDAY': 2,
#             'THURSDAY': 3,
#             'FRIDAY': 4
#         }
#         day_offset = day_map.get(lesson.day, 0)
        
#         # Create new dates for this week
#         lesson_date = start_of_week + timedelta(days=day_offset)
        
#         # Combine date with original lesson time
#         start_time = datetime.combine(
#             lesson_date.date(),
#             lesson.startTime.time()
#         )
#         end_time = datetime.combine(
#             lesson_date.date(),
#             lesson.endTime.time()
#         )
        
#         adjusted_lessons.append({
#             'title': lesson.name,
#             'start': start_time.isoformat(),
#             'end': end_time.isoformat()
#         })
    
#     return adjusted_lessons

from flask import Blueprint, jsonify, request
from prisma import Prisma
import asyncio
from functools import wraps
from datetime import datetime, timedelta

lessons_bp = Blueprint("lessons", __name__)
prisma = Prisma()

# Helper to handle async routes in Flask
def async_route(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        return loop.run_until_complete(f(*args, **kwargs))
    return wrapper

# Helper function to adjust lesson times to current week
def adjust_to_current_week(lessons):
    today = datetime.now()
    start_of_week = today - timedelta(days=today.weekday())
    
    adjusted_lessons = []
    for lesson in lessons:
        # Extract day of week from the lesson's day enum
        day_map = {
            'MONDAY': 0,
            'TUESDAY': 1,
            'WEDNESDAY': 2,
            'THURSDAY': 3,
            'FRIDAY': 4
        }
        day_offset = day_map.get(lesson.get('day'), 0)
        
        # Create new dates for this week
        lesson_date = start_of_week + timedelta(days=day_offset)
        
        # Get time components from ISO strings
        start_time_str = lesson.get('startTime')
        end_time_str = lesson.get('endTime')
        
        if start_time_str and end_time_str:
            try:
                # Parse the ISO strings
                start_time = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
                end_time = datetime.fromisoformat(end_time_str.replace('Z', '+00:00'))
                
                # Combine date with original lesson time
                start_datetime = datetime.combine(
                    lesson_date.date(),
                    start_time.time()
                )
                end_datetime = datetime.combine(
                    lesson_date.date(),
                    end_time.time()
                )
                
                adjusted_lessons.append({
                    'title': lesson.get('title', 'Unnamed Lesson'),
                    'start': start_datetime.isoformat(),
                    'end': end_datetime.isoformat()
                })
            except Exception as e:
                print(f"Error adjusting lesson time: {str(e)}")
                # If there's an error, add the lesson without adjustment
                adjusted_lessons.append(lesson)
        else:
            # If time data is missing, add the lesson as is
            adjusted_lessons.append(lesson)
    
    return adjusted_lessons

# @lessons_bp.route("/lessons", methods=["GET"])
# @async_route
# async def get_lessons():
#     try:
#         if not prisma.is_connected():
#             await prisma.connect()
        
#         # Get query parameters
#         type_param = request.args.get("type")
#         id_param = request.args.get("id")
#         user_role = request.args.get("role")
        
#         # Validate parameters
#         if not type_param or not id_param:
#             return jsonify({"error": "Missing required parameters: type and id"}), 400
            
#         # Convert id to appropriate type for class ID
#         if type_param == "classId":
#             try:
#                 id_param = int(id_param)
#             except ValueError:
#                 return jsonify({"error": "Invalid class ID format"}), 400
        
#         # Build query based on type
#         filter_criteria = {}
        
#         if type_param == "teacherId":
#             filter_criteria["teacherId"] = id_param
#         elif type_param == "classId":
#             filter_criteria["classId"] = id_param
#         else:
#             return jsonify({"error": "Invalid type parameter"}), 400
            
#         # Fetch lessons with related data
#         lessons = await prisma.lesson.find_many(
#             where=filter_criteria,
#             include={
#                 "subject": True,
#                 "teacher": True,
#                 "class_": True
#             }
#         )
        
#         # Format for calendar
#         formatted_lessons = []
#         for lesson in lessons:
#             lesson_data = {
#                 "id": lesson.id,
#                 "title": f"{lesson.name} - {lesson.subject.name if lesson.subject else 'No Subject'}",
#                 "day": lesson.day,
#                 "startTime": lesson.startTime.isoformat() if lesson.startTime else None,
#                 "endTime": lesson.endTime.isoformat() if lesson.endTime else None,
#                 "subject": lesson.subject.name if lesson.subject else "No Subject",
#                 "class": lesson.class_.name if lesson.class_ else "No Class",
#                 "teacher": f"{lesson.teacher.name} {lesson.teacher.surname}" if lesson.teacher else "No Teacher",
#             }
#             formatted_lessons.append(lesson_data)
        
#         # Adjust lesson times to current week
#         adjusted_lessons = adjust_to_current_week(formatted_lessons)
            
#         return jsonify({
#             "data": adjusted_lessons,
#             "count": len(lessons)
#         })
        
#     except Exception as e:
#         print(f"Error in get_lessons: {str(e)}")
#         return jsonify({"error": str(e)}), 500
#     finally:
#         await prisma.disconnect()
@lessons_bp.route("/lessons", methods=["GET"])
@async_route
async def get_lessons():
    try:
        if not prisma.is_connected():
            await prisma.connect()
        
        # Get query parameters
        page = int(request.args.get("page", 1))  # Default to page 1
        items_per_page = 10  # Number of items per page
        
        # Fetch lessons with pagination
        lessons = await prisma.lesson.find_many(
            skip=(page - 1) * items_per_page,  # Skip items for pagination
            take=items_per_page,  # Limit number of items per page
            include={
                "subject": True,
                "teacher": True,
                "class_": True
            }
        )
        
        # Get total count of lessons for pagination
        total_count = await prisma.lesson.count()
        
        # Format for calendar
        formatted_lessons = [
            {
                "title": f"{lesson.name} - {lesson.subject.name if lesson.subject else 'No Subject'} - {lesson.teacher.name if lesson.teacher else 'No Teacher'}",
                "start": lesson.startTime.isoformat() if lesson.startTime else None,
                "end": lesson.endTime.isoformat() if lesson.endTime else None,
                "subject": lesson.subject.name if lesson.subject else "No Subject",
                "class_": lesson.class_.name if lesson.class_ else "No Class",
                "teacher": lesson.teacher.name if lesson.teacher else "No Teacher",
                "day": lesson.day,
                "startTime": lesson.startTime.isoformat() if lesson.startTime else None,
                "endTime": lesson.endTime.isoformat() if lesson.endTime else None,
            }
            for lesson in lessons
        ]
            
        return jsonify({
            "data": formatted_lessons,
            "count": total_count  # Return total count for pagination
        })
        
    except Exception as e:
        print(f"Error in get_lessons: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        # Don't disconnect here as it might be used by other requests
        pass

@lessons_bp.route('/lessons/teacher/<teacher_id>', methods=['GET'])
@async_route
async def get_teacher_lessons(teacher_id):
    try:
        await prisma.connect()
        
        lessons = await prisma.lesson.find_many(
            where={
                'teacherId': teacher_id
            },
            include={
                "subject": True,
                "class_": True
            }
        )
        
        formatted_lessons = []
        for lesson in lessons:
            lesson_data = {
                "id": lesson.id,
                "title": f"{lesson.name} - {lesson.subject.name if lesson.subject else 'No Subject'}",
                "day": lesson.day,
                "startTime": lesson.startTime.isoformat() if lesson.startTime else None,
                "endTime": lesson.endTime.isoformat() if lesson.endTime else None,
            }
            formatted_lessons.append(lesson_data)
        
        # Adjust lesson times to current week
        adjusted_lessons = adjust_to_current_week(formatted_lessons)
        
        return jsonify(adjusted_lessons)
    except Exception as e:
        print(f"Error in get_teacher_lessons: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        await prisma.disconnect()

@lessons_bp.route('/lessons/class/<int:class_id>', methods=['GET'])
@async_route
async def get_class_lessons(class_id):
    try:
        await prisma.connect()
        
        lessons = await prisma.lesson.find_many(
            where={
                'classId': class_id
            },
            include={
                "subject": True,
                "teacher": True
            }
        )
        
        formatted_lessons = []
        for lesson in lessons:
            lesson_data = {
                "id": lesson.id,
                "title": f"{lesson.name} - {lesson.subject.name if lesson.subject else 'No Subject'}",
                "day": lesson.day,
                "startTime": lesson.startTime.isoformat() if lesson.startTime else None,
                "endTime": lesson.endTime.isoformat() if lesson.endTime else None,
            }
            formatted_lessons.append(lesson_data)
        
        # Adjust lesson times to current week
        adjusted_lessons = adjust_to_current_week(formatted_lessons)
        
        return jsonify(adjusted_lessons)
    except Exception as e:
        print(f"Error in get_class_lessons: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        await prisma.disconnect()