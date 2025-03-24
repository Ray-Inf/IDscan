
#
from flask import Blueprint, request, jsonify, current_app  # Import current_app
from prisma import Prisma
from datetime import datetime
import asyncio
import threading
import os
import numpy as np
import logging
from werkzeug.utils import secure_filename


# Initialize Flask Blueprint
api_bp = Blueprint('api', __name__)

UPLOAD_FOLDER = "assets"

# Initialize database client
prisma = Prisma()
prisma_lock = threading.Lock()
connected = False


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# Helper function to run async code in a new thread with a new event loop
def run_async(coro):
    global connected
    
    # Create a new event loop for this thread
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Connect to Prisma if not already connected
        if not connected:
            with prisma_lock:
                if not connected:
                    loop.run_until_complete(prisma.connect())
                    connected = True
        
        # Run the coroutine
        return loop.run_until_complete(coro)
    finally:
        loop.close()
def create_user_folders(user_type, card_id):
    """Create folders for a user based on their type and card ID."""
    user_folder = os.path.join(UPLOAD_FOLDER, user_type, card_id)
    id_card_folder = os.path.join(user_folder, "idcard")
    face_folder = os.path.join(user_folder, "face")

    # Create folders if they don't exist
    os.makedirs(id_card_folder, exist_ok=True)
    os.makedirs(face_folder, exist_ok=True)

    return id_card_folder, face_folder

@api_bp.route("/upload-image", methods=["POST"])
def upload_image():
    # Verify all required data is present
    if "file" not in request.files:
        return jsonify({"error": "Missing file"}), 400
    
    if "user_type" not in request.form:
        return jsonify({"error": "Missing user_type"}), 400
        
    if "card_id" not in request.form:
        return jsonify({"error": "Missing card_id"}), 400

    file = request.files["file"]
    user_type = request.form["user_type"]
    card_id = request.form["card_id"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    # Create folders for the user
    id_card_folder, face_folder = create_user_folders(user_type, card_id)

    # Determine image type and file path
    if "id_card" in request.form:
        target_folder = id_card_folder
        image_type = "idcard"
    elif "face_image" in request.form:
        target_folder = face_folder
        image_type = "face"
    else:
        return jsonify({"error": "Invalid image type - must specify id_card or face_image"}), 400

    # Generate a filename with timestamp to avoid conflicts
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    file_extension = os.path.splitext(file.filename)[1]
    if not file_extension:
        file_extension = ".jpg"  # Default to jpg if no extension
        
    filename = f"{image_type}_{timestamp}{file_extension}"
    file_path = os.path.join(target_folder, secure_filename(filename))

    # Save the file
    file.save(file_path)
    
    # Make the path relative for storage in the database
    relative_path = os.path.relpath(file_path, UPLOAD_FOLDER)

    # Return the file path
    return jsonify({"file_path": relative_path}), 200
# --- Template Endpoints ---
@api_bp.route("/templates", methods=["GET", "POST"])
def templates():
    if request.method == "GET":
        """Get all templates"""
        try:
            templates = run_async(prisma.template.find_many())
            return jsonify([template.dict() for template in templates])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new template"""
        try:
            data = request.get_json()
            template = run_async(prisma.template.create(data=data))
            return jsonify(template.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/templates/<string:template_id>", methods=["GET", "PUT", "DELETE"])
def template(template_id):
    if request.method == "GET":
        """Get a specific template by ID"""
        try:
            template = run_async(prisma.template.find_unique(where={"id": template_id}))
            if not template:
                return jsonify({"error": "Template not found"}), 404
            return jsonify(template.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific template by ID"""
        try:
            data = request.get_json()
            template = run_async(prisma.template.update(where={"id": template_id}, data=data))
            return jsonify(template.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific template by ID"""
        try:
            template = run_async(prisma.template.delete(where={"id": template_id}))
            return jsonify({"message": "Template deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# --- Grade Endpoints ---
@api_bp.route("/grades", methods=["GET", "POST"])
def grades():
    if request.method == "GET":
        """Get all grades"""
        try:
            grades = run_async(prisma.grade.find_many())
            return jsonify([grade.dict() for grade in grades])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new grade"""
        try:
            data = request.get_json()
            grade = run_async(prisma.grade.create(data=data))
            return jsonify(grade.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/grades/<int:grade_id>", methods=["GET", "PUT", "DELETE"])
def grade(grade_id):
    if request.method == "GET":
        """Get a specific grade by ID"""
        try:
            grade = run_async(prisma.grade.find_unique(where={"id": grade_id}))
            if not grade:
                return jsonify({"error": "Grade not found"}), 404
            return jsonify(grade.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific grade by ID"""
        try:
            data = request.get_json()
            grade = run_async(prisma.grade.update(where={"id": grade_id}, data=data))
            return jsonify(grade.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific grade by ID"""
        try:
            grade = run_async(prisma.grade.delete(where={"id": grade_id}))
            return jsonify({"message": "Grade deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# --- Class Endpoints ---
@api_bp.route("/classes", methods=["GET", "POST"])
def classes():
    if request.method == "GET":
        """Get all classes"""
        try:
            classes = run_async(prisma.class_.find_many())
            return jsonify([class_.dict() for class_ in classes])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new class"""
        try:
            data = request.get_json()
            class_ = run_async(prisma.class_.create(data=data))
            return jsonify(class_.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/classes/<int:class_id>", methods=["GET", "PUT", "DELETE"])
def class_(class_id):
    if request.method == "GET":
        """Get a specific class by ID"""
        try:
            class_ = run_async(prisma.class_.find_unique(
                where={"id": class_id},
                include={"grade": True, "supervisor": True}
            ))
            if not class_:
                return jsonify({"error": "Class not found"}), 404
            return jsonify(class_.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific class by ID"""
        try:
            data = request.get_json()
            class_ = run_async(prisma.class_.update(where={"id": class_id}, data=data))
            return jsonify(class_.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific class by ID"""
        try:
            class_ = run_async(prisma.class_.delete(where={"id": class_id}))
            return jsonify({"message": "Class deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# --- Student Endpoints ---

# #----Admin Endpoints----#
@api_bp.route("/students", methods=["GET", "POST"])
def students():
    if request.method == "GET":
        """Get all students with optional filtering"""
        try:
            class_id = request.args.get("class_id", type=int)
            grade_id = request.args.get("grade_id", type=int)
            limit = request.args.get("limit", default=100, type=int)
            offset = request.args.get("offset", default=0, type=int)

            where_clause = {}
            if class_id:
                where_clause["classId"] = class_id
            if grade_id:
                where_clause["gradeId"] = grade_id

            students = run_async(prisma.student.find_many(
                where=where_clause,
                include={"class_": True, "grade": True, "parent": True},
                skip=offset,
                take=limit
            ))
            return jsonify([student.dict() for student in students])
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == "POST":
        """Create a new student"""
        try:
            # Get data from form
            data = request.form.to_dict()
            
            # Debug received data
            print("🚀 Received Form Data:", data)
            
            # Required fields validation
            required_fields = ["cardId", "username", "name", "surname", "email", "sex", "parentId", "classId", "gradeId", "templateId", "address"]
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
            
            # Convert IDs to integers for class and grade
            try:
                class_id = int(data["classId"])
                grade_id = int(data["gradeId"])
            except ValueError:
                return jsonify({"error": "classId and gradeId must be valid integers"}), 400

            # Process birthday if provided
            birthday = data.get("birthday")
            if birthday:
                try:
                    birthday = datetime.strptime(birthday, "%Y-%m-%d").isoformat() + "Z"
                except ValueError:
                    return jsonify({"error": "Invalid birthday format. Use YYYY-MM-DD"}), 400
            else:
                # Birthday is required according to schema
                return jsonify({"error": "Birthday is required"}), 400

            # Prepare student data exactly according to schema
            student_data = {
                "cardId": data["cardId"],
                "username": data["username"],
                "name": data["name"],
                "surname": data["surname"],
                "email": data.get("email"),  # Optional in schema
                "phone": data.get("phone"),  # Optional in schema
                "address": data["address"],  # Required in schema
                "bloodType": data.get("bloodType"),  # Optional
                "sex": data["sex"],
                "birthday": birthday,
                "parent": {
                    "connect": {
                        "id": data["parentId"]
                    }
                },
                "class_": {
                    "connect": {
                        "id": class_id
                    }
                },
                "grade": {
                    "connect": {
                        "id": grade_id
                    }
                },
                "template": {
                    "connect": {
                        "id": data["templateId"]
                    }
                }
            }
            
            # Handle optional image fields - use proper field names from schema
            if data.get("idCardImage"):
                student_data["img"] = data["idCardImage"]  # Or "imagePath" depending on your schema
            
            if data.get("faceImage"):
                student_data["imagePath"] = data["faceImage"]  # Or adjust field name as needed
                
            # Log the final data structure being sent to Prisma
            print("✅ Final Student Data:", student_data)
            
            # Create student
            student = run_async(prisma.student.create(data=student_data))
            return jsonify(student.dict()), 201
            
        except Exception as e:
            print("❌ Error:", str(e))
            import traceback
            traceback.print_exc()
            return jsonify({"error": str(e)}), 500
@api_bp.route("/students/<string:card_id>", methods=["GET", "PUT", "DELETE"])
def student(card_id):
    if request.method == "GET":
        """Get a specific student by card ID"""
        try:
            student = run_async(prisma.student.find_unique(
                where={"cardId": card_id},
                include={"class_": True, "grade": True, "parent": True, "template": True}
            ))
            if not student:
                return jsonify({"error": "Student not found"}), 404
            return jsonify(student.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == "PUT":
        """Update a specific student by card ID"""
        try:
            # ✅ Handle both JSON and FormData input
            data = request.get_json() if request.is_json else request.form.to_dict()

            # ✅ Convert IDs to integers where necessary
            class_id = int(data["classId"]) if data.get("classId") else None
            grade_id = int(data["gradeId"]) if data.get("gradeId") else None

            # ✅ Convert birthday to ISO-8601 format
            birthday = data.get("birthday")
            

            # ✅ Prepare Prisma update data
            student_data = {
                "username": data.get("username"),
                "name": data.get("name"),
                "surname": data.get("surname"),
                "email": data.get("email"),
                "phone": data.get("phone"),
                "address": data.get("address"),
                "bloodType": data.get("bloodType"),
                "sex": data.get("sex"),
                "birthday": birthday,
                "templateId": data.get("templateId"),
                "idCardImage": data.get("idCardImage"),
                "faceImage": data.get("faceImage"),
            }

            # ✅ Link foreign keys if provided
            if data.get("parentId"):
                student_data["parent"] = {"connect": {"id": data["parentId"]}}
            if class_id:
                student_data["class_"] = {"connect": {"id": class_id}}
            if grade_id:
                student_data["grade"] = {"connect": {"id": grade_id}}

            # ✅ Remove None values from the update data
            student_data = {k: v for k, v in student_data.items() if v is not None}

            # ✅ Update student in the database
            student = run_async(prisma.student.update(where={"cardId": card_id}, data=student_data))
            return jsonify(student.dict())

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == "DELETE":
        """Delete a specific student by card ID"""
        try:
            student = run_async(prisma.student.delete(where={"cardId": card_id}))
            return jsonify({"message": "Student deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
@api_bp.route("/admins", methods=["GET", "POST"])
def admins():
    if request.method == "GET":
        """Get all admins"""
        try:
            admins = run_async(prisma.admin.find_many(
                include={"libraryLogs": True, "gymLogs": True, "hostelLogs": True, "template": True}
            ))
            return jsonify([admin.dict() for admin in admins])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new admin"""
        try:
            data = request.form.to_dict()
            id_card_image = data.get("idCardImage")
            face_image = data.get("faceImage")

            admin_data = {
                
                "username": data["username"],
                "cardId": data["cardId"],
                "name": data["name"],
                "email": data["email"],
                "role": data["role"],
                "templateId": data["templateId"],
                "img": id_card_image,
                "imagePath": face_image,
            }

            admin = run_async(prisma.admin.create(data=admin_data))
            return jsonify(admin.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/admins/<string:card_id>", methods=["GET", "PUT", "DELETE"])
def admin(card_id):
    if request.method == "GET":
        """Get a specific admin by card ID"""
        try:
            admin = run_async(prisma.admin.find_unique(
                where={"cardId": card_id},
                include={
                    "libraryLogs": True,
                    "gymLogs": True,
                    "hostelLogs": True,
                    "template": True
                }
            ))
            if not admin:
                return jsonify({"error": "Admin not found"}), 404
            return jsonify(admin.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific admin by card ID"""
        try:
            data = request.form.to_dict()
            id_card_image = data.get("idCardImage")
            face_image = data.get("faceImage")

            admin_data = {
                "username": data.get("username"),
                "name": data.get("name"),
                "email": data.get("email"),
                "role": data.get("role"),
                "templateId": data.get("templateId"),
                "idCardImage": id_card_image,
                "faceImage": face_image,
            }

            # Remove None values from the update data
            admin_data = {k: v for k, v in admin_data.items() if v is not None}

            admin = run_async(prisma.admin.update(where={"cardId": card_id}, data=admin_data))
            return jsonify(admin.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific admin by card ID"""
        try:
            admin = run_async(prisma.admin.delete(where={"cardId": card_id}))
            return jsonify({"message": "Admin deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
# --- Teacher Endpoints ---
@api_bp.route("/teachers", methods=["GET", "POST"])
def teachers():
    if request.method == "GET":
        """Get all teachers"""
        try:
            teachers = run_async(prisma.teacher.find_many(
                include={"subjects": True, "teacherClasses": True}
            ))
            return jsonify([teacher.dict() for teacher in teachers])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new teacher"""
        try:
            data = request.form.to_dict()
            id_card_image = data.get("idCardImage")
            face_image = data.get("faceImage")
            birthday = data.get("birthday")
            if birthday:
                try:
                    birthday = datetime.strptime(birthday, "%Y-%m-%d").isoformat() + "Z"
                except ValueError:
                    return jsonify({"error": "Invalid birthday format. Use YYYY-MM-DD"}), 400
            else:
                # Birthday is required according to schema
                return jsonify({"error": "Birthday is required"}), 400

            teacher_data = {
                "cardId": data["cardId"],
                "username": data["username"],
                "name": data["name"],
                "surname": data["surname"],
                "email": data["email"],
                "phone": data["phone"],
                "address": data["address"],
                "department": data.get("department"),
                "img": id_card_image,
                "imagePath": face_image,
                "templateId": data["templateId"],
                "sex": data["sex"],
                "birthday": birthday,
            }

            teacher = run_async(prisma.teacher.create(data=teacher_data))
            return jsonify(teacher.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/teachers/<string:card_id>", methods=["GET", "PUT", "DELETE"])
def teacher(card_id):
    if request.method == "GET":
        """Get a specific teacher by card ID"""
        try:
            teacher = run_async(prisma.teacher.find_unique(
                where={"cardId": card_id},
                include={
                    "subjects": True,
                    "lessons": True,
                    "teacherClasses": True,
                    "template": True
                }
            ))
            if not teacher:
                return jsonify({"error": "Teacher not found"}), 404
            return jsonify(teacher.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific teacher by card ID"""
        try:
            data = request.form.to_dict()
            id_card_image = data.get("idCardImage")
            face_image = data.get("faceImage")

            teacher_data = {
                "username": data.get("username"),
                "name": data.get("name"),
                "surname": data.get("surname"),
                "email": data.get("email"),
                "phone": data.get("phone"),
                "address": data.get("address"),
                "department": data.get("department"),
                "idCardImage": id_card_image,
                "faceImage": face_image,
                "templateId": data.get("templateId"),
            }

            # Remove None values from the update data
            teacher_data = {k: v for k, v in teacher_data.items() if v is not None}

            teacher = run_async(prisma.teacher.update(where={"cardId": card_id}, data=teacher_data))
            return jsonify(teacher.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific teacher by card ID"""
        try:
            teacher = run_async(prisma.teacher.delete(where={"cardId": card_id}))
            return jsonify({"message": "Teacher deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# --- Subject Endpoints ---
@api_bp.route("/subjects", methods=["GET", "POST"])
def subjects():
    if request.method == "GET":
        """Get all subjects"""
        try:
            subjects = run_async(prisma.subject.find_many(include={"teachers": True}))
            return jsonify([subject.dict() for subject in subjects])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new subject"""
        try:
            data = request.get_json()
            subject = run_async(prisma.subject.create(data=data))
            return jsonify(subject.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/subjects/<int:subject_id>", methods=["GET", "PUT", "DELETE"])
def subject(subject_id):
    if request.method == "GET":
        """Get a specific subject by ID"""
        try:
            subject = run_async(prisma.subject.find_unique(
                where={"id": subject_id},
                include={"teachers": True, "lessons": True}
            ))
            if not subject:
                return jsonify({"error": "Subject not found"}), 404
            return jsonify(subject.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific subject by ID"""
        try:
            data = request.get_json()
            subject = run_async(prisma.subject.update(where={"id": subject_id}, data=data))
            return jsonify(subject.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific subject by ID"""
        try:
            subject = run_async(prisma.subject.delete(where={"id": subject_id}))
            return jsonify({"message": "Subject deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# --- Lesson Endpoints ---
@api_bp.route("/lessons", methods=["GET", "POST"])
def lessons():
    if request.method == "GET":
        """Get all lessons"""
        try:
            lessons = run_async(prisma.lesson.find_many(
                include={"subject": True, "class_": True, "teacher": True}
            ))
            return jsonify([lesson.dict() for lesson in lessons])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new lesson"""
        try:
            data = request.get_json()
            lesson = run_async(prisma.lesson.create(data=data))
            return jsonify(lesson.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/lessons/<int:lesson_id>", methods=["GET", "PUT", "DELETE"])
def lesson(lesson_id):
    if request.method == "GET":
        """Get a specific lesson by ID"""
        try:
            lesson = run_async(prisma.lesson.find_unique(
                where={"id": lesson_id},
                include={
                    "subject": True,
                    "class_": True,
                    "teacher": True,
                    "exams": True,
                    "assignments": True
                }
            ))
            if not lesson:
                return jsonify({"error": "Lesson not found"}), 404
            return jsonify(lesson.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific lesson by ID"""
        try:
            data = request.get_json()
            lesson = run_async(prisma.lesson.update(where={"id": lesson_id}, data=data))
            return jsonify(lesson.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific lesson by ID"""
        try:
            lesson = run_async(prisma.lesson.delete(where={"id": lesson_id}))
            return jsonify({"message": "Lesson deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# --- Exam Endpoints ---
@api_bp.route("/exams", methods=["GET", "POST"])
def exams():
    if request.method == "GET":
        """Get all exams"""
        try:
            exams = run_async(prisma.exam.find_many(include={"lesson": True}))
            return jsonify([exam.dict() for exam in exams])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new exam"""
        try:
            data = request.get_json()
            exam = run_async(prisma.exam.create(data=data))
            return jsonify(exam.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/exams/<int:exam_id>", methods=["GET", "PUT", "DELETE"])
def exam(exam_id):
    if request.method == "GET":
        """Get a specific exam by ID"""
        try:
            exam = run_async(prisma.exam.find_unique(
                where={"id": exam_id},
                include={"lesson": True, "results": {"include": {"student": True}}}
            ))
            if not exam:
                return jsonify({"error": "Exam not found"}), 404
            return jsonify(exam.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific exam by ID"""
        try:
            data = request.get_json()
            exam = run_async(prisma.exam.update(where={"id": exam_id}, data=data))
            return jsonify(exam.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific exam by ID"""
        try:
            exam = run_async(prisma.exam.delete(where={"id": exam_id}))
            return jsonify({"message": "Exam deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# --- Assignment Endpoints ---
@api_bp.route("/assignments", methods=["GET", "POST"])
def assignments():
    if request.method == "GET":
        """Get all assignments"""
        try:
            assignments = run_async(prisma.assignment.find_many(include={"lesson": True}))
            return jsonify([assignment.dict() for assignment in assignments])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new assignment"""
        try:
            data = request.get_json()
            assignment = run_async(prisma.assignment.create(data=data))
            return jsonify(assignment.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/assignments/<int:assignment_id>", methods=["GET", "PUT", "DELETE"])
def assignment(assignment_id):
    if request.method == "GET":
        """Get a specific assignment by ID"""
        try:
            assignment = run_async(prisma.assignment.find_unique(
                where={"id": assignment_id},
                include={"lesson": True, "results": {"include": {"student": True}}}
            ))
            if not assignment:
                return jsonify({"error": "Assignment not found"}), 404
            return jsonify(assignment.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific assignment by ID"""
        try:
            data = request.get_json()
            assignment = run_async(prisma.assignment.update(where={"id": assignment_id}, data=data))
            return jsonify(assignment.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific assignment by ID"""
        try:
            assignment = run_async(prisma.assignment.delete(where={"id": assignment_id}))
            return jsonify({"message": "Assignment deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# --- Event Endpoints ---
@api_bp.route("/events", methods=["GET", "POST"])
def events():
    if request.method == "GET":
        """Get all events with optional filtering"""
        try:
            class_id = request.args.get("class_id", type=int)
            date = request.args.get("date")
            
            where_clause = {}
            if class_id:
                where_clause["classId"] = class_id
            if date:
                try:
                    event_date = datetime.strptime(date, "%Y-%m-%d").date()
                    where_clause["startTime"] = {
                        "gte": datetime.combine(event_date, datetime.min.time()),
                        "lte": datetime.combine(event_date, datetime.max.time())
                    }
                except ValueError:
                    return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
            
            events = run_async(prisma.event.find_many(
                where=where_clause,
                include={"class_": True}
            ))
            return jsonify([event.dict() for event in events])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new event"""
        try:
            data = request.get_json()
            event = run_async(prisma.event.create(data=data))
            return jsonify(event.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/events/<int:event_id>", methods=["GET", "PUT", "DELETE"])
def event(event_id):
    if request.method == "GET":
        """Get a specific event by ID"""
        try:
            event = run_async(prisma.event.find_unique(
                where={"id": event_id},
                include={"class_": True}
            ))
            if not event:
                return jsonify({"error": "Event not found"}), 404
            return jsonify(event.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific event by ID"""
        try:
            data = request.get_json()
            event = run_async(prisma.event.update(where={"id": event_id}, data=data))
            return jsonify(event.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific event by ID"""
        try:
            event = run_async(prisma.event.delete(where={"id": event_id}))
            return jsonify({"message": "Event deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# --- Announcement Endpoints ---
@api_bp.route("/announcements", methods=["GET", "POST"])
def announcements():
    if request.method == "GET":
        """Get all announcements with optional filtering"""
        try:
            class_id = request.args.get("class_id", type=int)
            date = request.args.get("date")
            
            where_clause = {}
            if class_id:
                where_clause["classId"] = class_id
            if date:
                try:
                    announcement_date = datetime.strptime(date, "%Y-%m-%d").date()
                    where_clause["date"] = {
                        "gte": datetime.combine(announcement_date, datetime.min.time()),
                        "lte": datetime.combine(announcement_date, datetime.max.time())
                    }
                except ValueError:
                    return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
            
            announcements = run_async(prisma.announcement.find_many(
                where=where_clause,
                include={"class_": True}
            ))
            return jsonify([announcement.dict() for announcement in announcements])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new announcement"""
        try:
            data = request.get_json()
            announcement = run_async(prisma.announcement.create(data=data))
            return jsonify(announcement.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/announcements/<int:announcement_id>", methods=["GET", "PUT", "DELETE"])
def announcement(announcement_id):
    if request.method == "GET":
        """Get a specific announcement by ID"""
        try:
            announcement = run_async(prisma.announcement.find_unique(
                where={"id": announcement_id},
                include={"class_": True}
            ))
            if not announcement:
                return jsonify({"error": "Announcement not found"}), 404
            return jsonify(announcement.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific announcement by ID"""
        try:
            data = request.get_json()
            announcement = run_async(prisma.announcement.update(where={"id": announcement_id}, data=data))
            return jsonify(announcement.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific announcement by ID"""
        try:
            announcement = run_async(prisma.announcement.delete(where={"id": announcement_id}))
            return jsonify({"message": "Announcement deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# --- ID Template Endpoints ---
@api_bp.route("/id-templates", methods=["GET", "POST"])
def id_templates():
    if request.method == "GET":
        """Get all ID templates"""
        try:
            templates = run_async(prisma.idtemplate.find_many())
            return jsonify([template.dict() for template in templates])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new ID template"""
        try:
            data = request.get_json()
            template = run_async(prisma.idtemplate.create(data=data))
            return jsonify(template.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/id-templates/<string:template_id>", methods=["GET", "PUT", "DELETE"])
def id_template(template_id):
    if request.method == "GET":
        """Get a specific ID template by ID"""
        try:
            template = run_async(prisma.idtemplate.find_unique(where={"id": template_id}))
            if not template:
                return jsonify({"error": "ID template not found"}), 404
            return jsonify(template.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific ID template by ID"""
        try:
            data = request.get_json()
            template = run_async(prisma.idtemplate.update(where={"id": template_id}, data=data))
            return jsonify(template.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific ID template by ID"""
        try:
            template = run_async(prisma.idtemplate.delete(where={"id": template_id}))
            return jsonify({"message": "ID template deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

# --- Facility Attendance Log Endpoints ---
@api_bp.route("/facility-attendance-logs", methods=["GET", "POST"])
def facility_attendance_logs():
    if request.method == "GET":
        """Get all facility attendance logs with optional filtering"""
        try:
            student_id = request.args.get("student_id")
            facility_id = request.args.get("facility_id")
            date = request.args.get("date")
            
            where_clause = {}
            if student_id:
                where_clause["cardId"] = student_id
            if facility_id:
                where_clause["facilityId"] = facility_id
            if date:
                try:
                    log_date = datetime.strptime(date, "%Y-%m-%d").date()
                    where_clause["loginTime"] = {
                        "gte": datetime.combine(log_date, datetime.min.time()),
                        "lte": datetime.combine(log_date, datetime.max.time())
                    }
                except ValueError:
                    return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
            
            logs = run_async(prisma.facilityattendancelog.find_many(
                where=where_clause,
                include={"student": True}
            ))
            return jsonify([log.dict() for log in logs])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new facility attendance log"""
        try:
            data = request.get_json()
            log = run_async(prisma.facilityattendancelog.create(data=data))
            return jsonify(log.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/facility-attendance-logs/<int:log_id>", methods=["GET", "PUT", "DELETE"])
def facility_attendance_log(log_id):
    if request.method == "GET":
        """Get a specific facility attendance log by ID"""
        try:
            log = run_async(prisma.facilityattendancelog.find_unique(where={"id": log_id}))
            if not log:
                return jsonify({"error": "Facility attendance log not found"}), 404
            return jsonify(log.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific facility attendance log by ID"""
        try:
            data = request.get_json()
            log = run_async(prisma.facilityattendancelog.update(where={"id": log_id}, data=data))
            return jsonify(log.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific facility attendance log by ID"""
        try:
            log = run_async(prisma.facilityattendancelog.delete(where={"id": log_id}))
            return jsonify({"message": "Facility attendance log deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
#---------librarian------#
@api_bp.route("/librarians", methods=["GET", "POST"])
def librarians():
    if request.method == "GET":
        """Get all librarians"""
        try:
            librarians = run_async(prisma.librarian.find_many(
                include={"libraryLogs": True, "template": True}
            ))
            return jsonify([librarian.dict() for librarian in librarians])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new librarian"""
        try:
            data = request.form.to_dict()
            id_card_image = data.get("idCardImage")
            face_image = data.get("faceImage")
            birthday = data.get("birthday")
            if birthday:
                try:
                    birthday = datetime.strptime(birthday, "%Y-%m-%d").isoformat() + "Z"
                except ValueError:
                    return jsonify({"error": "Invalid birthday format. Use YYYY-MM-DD"}), 400
            else:
                # Birthday is required according to schema
                return jsonify({"error": "Birthday is required"}), 400

            librarian_data = {
                "cardId": data["cardId"],
                "staffId": data["staffId"],
                "name": data["name"],
                "email": data["email"],
                "phone": data["phone"],
                "address": data["address"],
                "librarySection": data["librarySection"],
                "bloodType": data.get("bloodType"),
                "birthday": birthday,
                "templateId": data["templateId"],
                "idCardImage": id_card_image,
                "faceImage": face_image,
            }

            librarian = run_async(prisma.librarian.create(data=librarian_data))
            return jsonify(librarian.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/librarians/<string:card_id>", methods=["GET", "PUT", "DELETE"])
def librarian(card_id):
    if request.method == "GET":
        """Get a specific librarian by card ID"""
        try:
            librarian = run_async(prisma.librarian.find_unique(
                where={"cardId": card_id},
                include={
                    "libraryLogs": True,
                    "template": True
                }
            ))
            if not librarian:
                return jsonify({"error": "Librarian not found"}), 404
            return jsonify(librarian.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific librarian by card ID"""
        try:
            data = request.form.to_dict()
            id_card_image = data.get("idCardImage")
            face_image = data.get("faceImage")
            birthday = data.get("birthday")
            if birthday:
                try:
                    birthday = datetime.strptime(birthday, "%Y-%m-%d").isoformat() + "Z"
                except ValueError:
                    return jsonify({"error": "Invalid birthday format. Use YYYY-MM-DD"}), 400
            else:
                # Birthday is required according to schema
                return jsonify({"error": "Birthday is required"}), 400
            librarian_data = {
                "staffId": data.get("staffId"),
                "name": data.get("name"),
                "email": data.get("email"),
                "phone": data.get("phone"),
                "address": data.get("address"),
                "librarySection": data.get("librarySection"),
                "bloodType": data.get("bloodType"),
                "birthday": birthday,
                "templateId": data.get("templateId"),
                "idCardImage": id_card_image,
                "faceImage": face_image,
            }

            # Remove None values from the update data
            librarian_data = {k: v for k, v in librarian_data.items() if v is not None}

            librarian = run_async(prisma.librarian.update(where={"cardId": card_id}, data=librarian_data))
            return jsonify(librarian.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific librarian by card ID"""
        try:
            librarian = run_async(prisma.librarian.delete(where={"cardId": card_id}))
            return jsonify({"message": "Librarian deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
#-----gym master ----#
@api_bp.route("/gym-masters", methods=["GET", "POST"])
def gym_masters():
    if request.method == "GET":
        """Get all gym masters"""
        try:
            gym_masters = run_async(prisma.gymmaster.find_many(
                include={"gymLogs": True, "template": True}
            ))
            return jsonify([gym_master.dict() for gym_master in gym_masters])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new gym master"""
        try:
            data = request.form.to_dict()
            id_card_image = data.get("idCardImage")
            face_image = data.get("faceImage")
            birthday = data.get("birthday")
            if birthday:
                try:
                    birthday = datetime.strptime(birthday, "%Y-%m-%d").isoformat() + "Z"
                except ValueError:
                    return jsonify({"error": "Invalid birthday format. Use YYYY-MM-DD"}), 400
            else:
                # Birthday is required according to schema
                return jsonify({"error": "Birthday is required"}), 400
            gym_master_data = {
                "cardId": data["cardId"],
                "staffId": data["staffId"],
                "name": data["name"],
                "email": data["email"],
                "phone": data["phone"],
                "address": data["address"],
                "specialization": data["specialization"],
                "bloodType": data.get("bloodType"),
                "birthday": birthday,
                "templateId": data["templateId"],
                "idCardImage": id_card_image,
                "faceImage": face_image,
            }

            gym_master = run_async(prisma.gymmaster.create(data=gym_master_data))
            return jsonify(gym_master.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/gym-masters/<string:card_id>", methods=["GET", "PUT", "DELETE"])
def gym_master(card_id):
    if request.method == "GET":
        """Get a specific gym master by card ID"""
        try:
            gym_master = run_async(prisma.gymmaster.find_unique(
                where={"cardId": card_id},
                include={
                    "gymLogs": True,
                    "template": True
                }
            ))
            if not gym_master:
                return jsonify({"error": "Gym Master not found"}), 404
            return jsonify(gym_master.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific gym master by card ID"""
        try:
            data = request.form.to_dict()
            id_card_image = data.get("idCardImage")
            face_image = data.get("faceImage")

            gym_master_data = {
                "staffId": data.get("staffId"),
                "name": data.get("name"),
                "email": data.get("email"),
                "phone": data.get("phone"),
                "address": data.get("address"),
                "specialization": data.get("specialization"),
                "bloodType": data.get("bloodType"),
                "birthday": data.get("birthday"),
                "templateId": data.get("templateId"),
                "idCardImage": id_card_image,
                "faceImage": face_image,
            }

            # Remove None values from the update data
            gym_master_data = {k: v for k, v in gym_master_data.items() if v is not None}

            gym_master = run_async(prisma.gymmaster.update(where={"cardId": card_id}, data=gym_master_data))
            return jsonify(gym_master.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific gym master by card ID"""
        try:
            gym_master = run_async(prisma.gymmaster.delete(where={"cardId": card_id}))
            return jsonify({"message": "Gym Master deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
#-----hostel waredn-----#
@api_bp.route("/hostel-wardens", methods=["GET", "POST"])
def hostel_wardens():
    if request.method == "GET":
        """Get all hostel wardens"""
        try:
            hostel_wardens = run_async(prisma.hostelwarden.find_many(
                include={"hostelLogs": True, "template": True}
            ))
            return jsonify([hostel_warden.dict() for hostel_warden in hostel_wardens])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new hostel warden"""
        try:
            data = request.form.to_dict()
            id_card_image = data.get("idCardImage")
            face_image = data.get("faceImage")
            birthday = data.get("birthday")
            if birthday:
                try:
                    birthday = datetime.strptime(birthday, "%Y-%m-%d").isoformat() + "Z"
                except ValueError:
                    return jsonify({"error": "Invalid birthday format. Use YYYY-MM-DD"}), 400
            else:
                # Birthday is required according to schema
                return jsonify({"error": "Birthday is required"}), 400
            hostel_warden_data = {
                "cardId": data["cardId"],
                "staffId": data["staffId"],
                "name": data["name"],
                "email": data["email"],
                "phone": data["phone"],
                "address": data["address"],
                "hostelName": data["hostelName"],
                "bloodType": data.get("bloodType"),
                "birthday": birthday,
                "templateId": data["templateId"],
                "idCardImage": id_card_image,
                "faceImage": face_image,
            }

            hostel_warden = run_async(prisma.hostelwarden.create(data=hostel_warden_data))
            return jsonify(hostel_warden.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/hostel-wardens/<string:card_id>", methods=["GET", "PUT", "DELETE"])
def hostel_warden(card_id):
    if request.method == "GET":
        """Get a specific hostel warden by card ID"""
        try:
            hostel_warden = run_async(prisma.hostelwarden.find_unique(
                where={"cardId": card_id},
                include={
                    "hostelLogs": True,
                    "template": True
                }
            ))
            if not hostel_warden:
                return jsonify({"error": "Hostel Warden not found"}), 404
            return jsonify(hostel_warden.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific hostel warden by card ID"""
        try:
            data = request.form.to_dict()
            id_card_image = data.get("idCardImage")
            face_image = data.get("faceImage")

            hostel_warden_data = {
                "staffId": data.get("staffId"),
                "name": data.get("name"),
                "email": data.get("email"),
                "phone": data.get("phone"),
                "address": data.get("address"),
                "hostelName": data.get("hostelName"),
                "bloodType": data.get("bloodType"),
                "birthday": data.get("birthday"),
                "templateId": data.get("templateId"),
                "idCardImage": id_card_image,
                "faceImage": face_image,
            }

            # Remove None values from the update data
            hostel_warden_data = {k: v for k, v in hostel_warden_data.items() if v is not None}

            hostel_warden = run_async(prisma.hostelwarden.update(where={"cardId": card_id}, data=hostel_warden_data))
            return jsonify(hostel_warden.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific hostel warden by card ID"""
        try:
            hostel_warden = run_async(prisma.hostelwarden.delete(where={"cardId": card_id}))
            return jsonify({"message": "Hostel Warden deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
#-----------Parent routes-----------#
@api_bp.route("/parents", methods=["GET", "POST"])
def parents():
    if request.method == "GET":
        """Get all parents"""
        try:
            parents = run_async(prisma.parent.find_many(
                include={"students": True}
            ))
            return jsonify([parent.dict() for parent in parents])
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "POST":
        """Create a new parent"""
        try:
            data = request.form.to_dict()

            parent_data = {
                "id": data["id"],
                "username": data["username"],
                "name": data["name"],
                "surname": data["surname"],
                "email": data.get("email"),
                "phone": data["phone"],
                "address": data["address"],
            }

            parent = run_async(prisma.parent.create(data=parent_data))
            return jsonify(parent.dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@api_bp.route("/parents/<string:parent_id>", methods=["GET", "PUT", "DELETE"])
def parent(parent_id):
    if request.method == "GET":
        """Get a specific parent by ID"""
        try:
            parent = run_async(prisma.parent.find_unique(
                where={"id": parent_id},
                include={"students": True}
            ))
            if not parent:
                return jsonify({"error": "Parent not found"}), 404
            return jsonify(parent.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "PUT":
        """Update a specific parent by ID"""
        try:
            data = request.form.to_dict()

            parent_data = {
                "username": data.get("username"),
                "name": data.get("name"),
                "surname": data.get("surname"),
                "email": data.get("email"),
                "phone": data.get("phone"),
                "address": data.get("address"),
            }

            # Remove None values from the update data
            parent_data = {k: v for k, v in parent_data.items() if v is not None}

            parent = run_async(prisma.parent.update(where={"id": parent_id}, data=parent_data))
            return jsonify(parent.dict())
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    elif request.method == "DELETE":
        """Delete a specific parent by ID"""
        try:
            parent = run_async(prisma.parent.delete(where={"id": parent_id}))
            return jsonify({"message": "Parent deleted successfully"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500




# --- Cleanup Function ---
def cleanup():
    """Properly close Prisma connection on app shutdown"""
    disconnect_prisma()

# --- Disconnect Prisma ---
def disconnect_prisma():
    """Disconnect from Prisma database"""
    global connected
    if connected:
        run_async(prisma.disconnect())
        connected = False