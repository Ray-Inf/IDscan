
from flask import Blueprint, jsonify, request
from prisma import Prisma
import asyncio
from functools import wraps

# Blueprint for teachers
teachers_bp = Blueprint("teachers", __name__)
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

# Helper function to serialize ORM objects
def serialize_model(obj):
    """Convert Prisma ORM object to JSON-serializable dictionary."""
    if obj is None:
        return None
    return obj.dict()

@teachers_bp.route("/teachers", methods=["GET"])
@async_route
async def get_teachers():
    try:
        page = int(request.args.get('page', 1))
        search = request.args.get('search', '')
        class_id = request.args.get('classId', '')
        query = {}

        # Add search filters
        if search:
            query['OR'] = [
                {'name': {'contains': search}},
                {'surname': {'contains': search}}
            ]
        if class_id:
            query['lessons'] = {
                'some': {'classId': int(class_id)}
            }

        # Connect to Prisma
        await prisma.connect()

        # Fetch teachers with pagination and relationships
        teachers = await prisma.teacher.find_many(
            where=query,
            include={
                'subjects': True,
                'classes': True
            },
            skip=(page - 1) * 10,
            take=10
        )

        # Count associated records separately
        teacher_counts = {
            teacher.id: await prisma.lesson.count(where={'teacherId': teacher.id})
            for teacher in teachers
        }

        # Add count data manually
        teacher_dicts = []
        for teacher in teachers:
            teacher_dict = teacher.dict()
            teacher_dict['lessonCount'] = teacher_counts.get(teacher.id, 0)
            teacher_dicts.append(teacher_dict)

        count = await prisma.teacher.count(where=query)

        return jsonify({
            'data': teacher_dicts,
            'count': count
        })
    except Exception as e:
        print(f"Error in get_teachers: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@teachers_bp.route("/teachers/<id>", methods=["GET"])
@async_route
async def get_teacher(id):
    try:
        await prisma.connect()

        # Fetch teacher details
        teacher = await prisma.teacher.find_unique(
            where={"id": id},
            include={
                "subjects": True,
                "lessons": True,
                "classes": True
            }
        )

        if not teacher:
            return jsonify({"error": f"Teacher with ID {id} not found"}), 404

        # Manually count related records
        subject_count = await prisma.subject.count(where={"teachers": {"some": {"id": id}}})
        lesson_count = await prisma.lesson.count(where={"teacherId": id})
        class_count = await prisma.class_.count(where={"supervisorId": id})

        # Convert teacher object to dictionary
        teacher_dict = teacher.dict()
        teacher_dict["subjectCount"] = subject_count
        teacher_dict["lessonCount"] = lesson_count
        teacher_dict["classCount"] = class_count

        return jsonify(teacher_dict)
    except Exception as e:
        print(f"Error in get_teacher: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()


@teachers_bp.route("/teachers", methods=["POST"])
@async_route
async def create_teacher():
    try:
        data = request.json
        print("Received data for teacher creation:", data)
        
        # Extract subjects and classes from data
        subjects = data.pop('subjects', [])
        classes = data.pop('classes', [])
        
        # Prepare data for creation
        teacher_data = {key: value for key, value in data.items() if value not in [None, '']}
        
        # Handle subjects connection if any
        if subjects:
            teacher_data['subjects'] = {
                'connect': [{'id': subject_id} for subject_id in subjects]
            }

        # Handle classes connection if any
        if classes:
            teacher_data['classes'] = {
                'connect': [{'id': class_id} for class_id in classes]
            }

        # Ensure the `id` field is treated as a string
        if 'id' in teacher_data:
            teacher_data['id'] = str(teacher_data['id'])

        

        await prisma.connect()
        teacher = await prisma.teacher.create(data=teacher_data)
        
        # Fetch the created teacher with subjects and classes
        created_teacher = await prisma.teacher.find_unique(
            where={"id": teacher.id},
            include={"subjects": True, "classes": True}
        )
        
        return jsonify(serialize_model(created_teacher)), 201
    except Exception as e:
        print(f"Error in create_teacher: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

# @teachers_bp.route("/teachers/<id>", methods=["PUT"])
# @async_route
# async def update_teacher(id):
#     try:
#         data = request.json
#         print("Received data for teacher update:", data)
        
#         # Extract subjects and classes from data
#         subjects = data.pop('subjects', [])
#         classes = data.pop('classes', [])
        
#         # Prepare data for update
#         update_data = {key: value for key, value in data.items() if value not in [None, ''] and key != 'password'}
        
      
        
#         # Handle subjects connection if any
#         if subjects:
#             # First disconnect all existing subjects
#             current_teacher = await prisma.teacher.find_unique(
#                 where={"id": id},
#                 include={"subjects": True}
#             )
            
#             if current_teacher and current_teacher.subjects:
#                 subject_ids = [subject.id for subject in current_teacher.subjects]
                
#                 # Set new subjects
#                 update_data['subjects'] = {
#                     'disconnect': [{'id': subject_id} for subject_id in subject_ids],
#                     'connect': [{'id': subject_id} for subject_id in subjects]
#                 }
#             else:
#                 update_data['subjects'] = {
#                     'connect': [{'id': subject_id} for subject_id in subjects]
#                 }

#         # Handle classes connection if any
#         if classes:
#             # First disconnect all existing classes
#             current_teacher = await prisma.teacher.find_unique(
#                 where={"id": id},
#                 include={"classes": True}
#             )
            
#             if current_teacher and current_teacher.classes:
#                 class_ids = [cls.id for cls in current_teacher.classes]
                
#                 # Set new classes
#                 update_data['classes'] = {
#                     'disconnect': [{'id': class_id} for class_id in class_ids],
#                     'connect': [{'id': class_id} for class_id in classes]
#                 }
#             else:
#                 update_data['classes'] = {
#                     'connect': [{'id': class_id} for class_id in classes]
#                 }

#         await prisma.connect()
#         teacher = await prisma.teacher.update(
#             where={'id': id},
#             data=update_data,
#             include={"subjects": True, "classes": True}
#         )
        
#         return jsonify(serialize_model(teacher))
#     except Exception as e:
#         print(f"Error in update_teacher: {str(e)}")
#         return jsonify({"error": str(e)}), 500
#     finally:
#         if prisma.is_connected():
#             await prisma.disconnect()
@teachers_bp.route("/teachers/<id>", methods=["PUT"])
@async_route
async def update_teacher(id):
    try:
        await prisma.connect()  # Ensure Prisma is connected before querying

        data = request.json
        print("Received data for teacher update:", data)

        # Extract subjects and classes from data
        subjects = data.pop('subjects', [])
        classes = data.pop('classes', [])

        # Prepare data for update
        update_data = {key: value for key, value in data.items() if value not in [None, ''] and key != 'password'}

        # Fetch the current teacher with subjects and classes before updating
        current_teacher = await prisma.teacher.find_unique(
            where={"id": id},
            include={"subjects": True, "classes": True}
        )

        if not current_teacher:
            return jsonify({"error": "Teacher not found"}), 404

        # Handle subjects connection if any
        if subjects:
            subject_ids = [subject.id for subject in current_teacher.subjects]
            update_data['subjects'] = {
                'disconnect': [{'id': subject_id} for subject_id in subject_ids],
                'connect': [{'id': subject_id} for subject_id in subjects]
            }

        # Handle classes connection if any
        if classes:
            class_ids = [cls.id for cls in current_teacher.classes]
            update_data['classes'] = {
                'disconnect': [{'id': class_id} for class_id in class_ids],
                'connect': [{'id': class_id} for class_id in classes]
            }

        # Perform the update
        teacher = await prisma.teacher.update(
            where={'id': id},
            data=update_data,
            include={"subjects": True, "classes": True}
        )

        return jsonify(serialize_model(teacher))
    
    except Exception as e:
        print(f"Error in update_teacher: {str(e)}")
        return jsonify({"error": str(e)}), 500

    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@teachers_bp.route("/teachers/<id>", methods=["DELETE"])
@async_route
async def delete_teacher(id):
    try:
        await prisma.connect()
        await prisma.teacher.delete(where={'id': id})
        return jsonify({'message': 'Teacher deleted successfully'}), 200
    except Exception as e:
        print(f"Error in delete_teacher: {str(e)}")
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@teachers_bp.route("/subjects", methods=["GET"])
@async_route
async def get_subjects():
    try:
        await prisma.connect()
        subjects = await prisma.subject.find_many()
        subjects_dict = [subject.dict() for subject in subjects]
        return jsonify(subjects_dict)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

# Keep other routes unchanged
@teachers_bp.route("/announcements", methods=["GET"])
@async_route
async def get_announcements():
    try:
        await prisma.connect()
        announcements = await prisma.announcement.find_many(
            order_by={'createdAt': 'desc'},
            take=5
        )
        
        announcements_dict = [announcement.dict() for announcement in announcements]
        return jsonify(announcements_dict)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        await prisma.disconnect()

# Keep other routes unchanged as they are