

from flask import Blueprint, request, jsonify
from prisma import Prisma
from prisma.models import Student, Teacher, Class_, Grade, Subject, Lesson, Admin
from prisma.models import Librarian, GymMaster, HostelWarden, Parent, Template
from prisma.models import Book, Event, Announcement, Attendance, ClassAttendance
from prisma.models import LibraryLog, GymLog, HostelLog, Exam, Assignment, Result
from datetime import datetime

# Initialize database client
db = Prisma()

# Create Flask Blueprint
api_bp = Blueprint('api', __name__)

# Connect to the database when the application starts
@api_bp.before_app_request
def connect_db():
    db.connect()

# Disconnect from the database when the application shuts down
@api_bp.teardown_app_request
def disconnect_db(exception=None):
    if db.is_connected():
        db.disconnect()

# --- Template Endpoints ---
@api_bp.route("/templates", methods=["GET"])
def get_templates():
    """Get all templates"""
    try:
        templates = db.template.find_many()
        return jsonify(templates)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/templates/<string:template_id>", methods=["GET"])
def get_template(template_id):
    """Get a specific template by ID"""
    try:
        template = db.template.find_unique(where={"id": template_id})
        if not template:
            return jsonify({"error": "Template not found"}), 404
        return jsonify(template)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Grade Endpoints ---
@api_bp.route("/grades", methods=["GET"])
def get_grades():
    """Get all grades"""
    try:
        grades = db.grade.find_many()
        return jsonify(grades)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/grades/<int:grade_id>", methods=["GET"])
def get_grade(grade_id):
    """Get a specific grade by ID"""
    try:
        grade = db.grade.find_unique(where={"id": grade_id})
        if not grade:
            return jsonify({"error": "Grade not found"}), 404
        return jsonify(grade)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/grades/<int:grade_id>/classes", methods=["GET"])
def get_grade_classes(grade_id):
    """Get all classes for a specific grade"""
    try:
        classes = db.class_.find_many(where={"gradeId": grade_id})
        return jsonify(classes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/grades/<int:grade_id>/students", methods=["GET"])
def get_grade_students(grade_id):
    """Get all students in a specific grade"""
    try:
        students = db.student.find_many(where={"gradeId": grade_id})
        return jsonify(students)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Class Endpoints ---
@api_bp.route("/classes", methods=["GET"])
def get_classes():
    """Get all classes"""
    try:
        classes = db.class_.find_many()
        return jsonify(classes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/classes/<int:class_id>", methods=["GET"])
def get_class(class_id):
    """Get a specific class by ID"""
    try:
        class_ = db.class_.find_unique(
            where={"id": class_id},
            include={"grade": True, "supervisor": True}
        )
        if not class_:
            return jsonify({"error": "Class not found"}), 404
        return jsonify(class_)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/classes/<int:class_id>/students", methods=["GET"])
def get_class_students(class_id):
    """Get all students in a specific class"""
    try:
        students = db.student.find_many(where={"classId": class_id})
        return jsonify(students)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/classes/<int:class_id>/lessons", methods=["GET"])
def get_class_lessons(class_id):
    """Get all lessons for a specific class"""
    try:
        lessons = db.lesson.find_many(
            where={"classId": class_id},
            include={"teacher": True, "subject": True}
        )
        return jsonify(lessons)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/classes/<int:class_id>/attendance", methods=["GET"])
def get_class_attendance(class_id):
    """Get attendance records for a specific class"""
    try:
        date = request.args.get("date")
        where_clause = {"classId": class_id}
        
        if date:
            try:
                attendance_date = datetime.strptime(date, "%Y-%m-%d").date()
                where_clause["date"] = attendance_date
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        attendance = db.classattendance.find_many(
            where=where_clause,
            include={"student": True}
        )
        return jsonify(attendance)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/classes/<int:class_id>/events", methods=["GET"])
def get_class_events(class_id):
    """Get all events for a specific class"""
    try:
        events = db.event.find_many(where={"classId": class_id})
        return jsonify(events)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/classes/<int:class_id>/announcements", methods=["GET"])
def get_class_announcements(class_id):
    """Get all announcements for a specific class"""
    try:
        announcements = db.announcement.find_many(where={"classId": class_id})
        return jsonify(announcements)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Student Endpoints ---
@api_bp.route("/students", methods=["GET"])
def get_students():
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
        
        students = db.student.find_many(
            where=where_clause,
            include={"class_": True, "grade": True, "parent": True},
            skip=offset,
            take=limit
        )
        return jsonify(students)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/students/<string:card_id>", methods=["GET"])
def get_student(card_id):
    """Get a specific student by card ID"""
    try:
        student = db.student.find_unique(
            where={"cardId": card_id},
            include={
                "class_": True,
                "grade": True,
                "parent": True,
                "template": True
            }
        )
        if not student:
            return jsonify({"error": "Student not found"}), 404
        return jsonify(student)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/students/<string:card_id>/attendance", methods=["GET"])
def get_student_attendance(card_id):
    """Get attendance records for a specific student"""
    try:
        attendance = db.attendance.find_many(
            where={"studentId": card_id},
            include={"lesson": True}
        )
        return jsonify(attendance)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/students/<string:card_id>/results", methods=["GET"])
def get_student_results(card_id):
    """Get exam and assignment results for a specific student"""
    try:
        results = db.result.find_many(
            where={"studentId": card_id},
            include={"exam": True, "assignment": True}
        )
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/students/<string:card_id>/library-logs", methods=["GET"])
def get_student_library_logs(card_id):
    """Get library logs for a specific student"""
    try:
        logs = db.librarylog.find_many(
            where={"studentId": card_id},
            include={"book": True}
        )
        return jsonify(logs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/students/<string:card_id>/gym-logs", methods=["GET"])
def get_student_gym_logs(card_id):
    """Get gym logs for a specific student"""
    try:
        logs = db.gymlog.find_many(where={"studentId": card_id})
        return jsonify(logs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/students/<string:card_id>/hostel-logs", methods=["GET"])
def get_student_hostel_logs(card_id):
    """Get hostel logs for a specific student"""
    try:
        logs = db.hostellog.find_many(where={"studentId": card_id})
        return jsonify(logs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Teacher Endpoints ---
@api_bp.route("/teachers", methods=["GET"])
def get_teachers():
    """Get all teachers"""
    try:
        teachers = db.teacher.find_many(
            include={"subjects": True, "teacherClasses": True}
        )
        return jsonify(teachers)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/teachers/<string:card_id>", methods=["GET"])
def get_teacher(card_id):
    """Get a specific teacher by card ID"""
    try:
        teacher = db.teacher.find_unique(
            where={"cardId": card_id},
            include={
                "subjects": True,
                "lessons": True,
                "teacherClasses": True,
                "template": True
            }
        )
        if not teacher:
            return jsonify({"error": "Teacher not found"}), 404
        return jsonify(teacher)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/teachers/<string:card_id>/classes", methods=["GET"])
def get_teacher_classes(card_id):
    """Get classes taught by a specific teacher"""
    try:
        teacher = db.teacher.find_unique(
            where={"cardId": card_id},
            include={"teacherClasses": True}
        )
        if not teacher:
            return jsonify({"error": "Teacher not found"}), 404
        return jsonify(teacher.teacherClasses)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/teachers/<string:card_id>/lessons", methods=["GET"])
def get_teacher_lessons(card_id):
    """Get lessons taught by a specific teacher"""
    try:
        lessons = db.lesson.find_many(
            where={"teacherId": card_id},
            include={"class_": True, "subject": True}
        )
        return jsonify(lessons)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Admin Endpoints ---
@api_bp.route("/admins", methods=["GET"])
def get_admins():
    """Get all admins"""
    try:
        admins = db.admin.find_many(include={"template": True})
        return jsonify(admins)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/admins/<string:id>", methods=["GET"])
def get_admin(id):
    """Get a specific admin by ID"""
    try:
        admin = db.admin.find_unique(
            where={"id": id},
            include={"template": True}
        )
        if not admin:
            return jsonify({"error": "Admin not found"}), 404
        return jsonify(admin)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Parent Endpoints ---
@api_bp.route("/parents", methods=["GET"])
def get_parents():
    """Get all parents"""
    try:
        parents = db.parent.find_many()
        return jsonify(parents)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/parents/<string:id>", methods=["GET"])
def get_parent(id):
    """Get a specific parent by ID"""
    try:
        parent = db.parent.find_unique(
            where={"id": id},
            include={"students": True}
        )
        if not parent:
            return jsonify({"error": "Parent not found"}), 404
        return jsonify(parent)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/parents/<string:id>/students", methods=["GET"])
def get_parent_students(id):
    """Get all students for a specific parent"""
    try:
        students = db.student.find_many(
            where={"parentId": id},
            include={"class_": True, "grade": True}
        )
        return jsonify(students)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Subject Endpoints ---
@api_bp.route("/subjects", methods=["GET"])
def get_subjects():
    """Get all subjects"""
    try:
        subjects = db.subject.find_many(include={"teachers": True})
        return jsonify(subjects)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/subjects/<int:subject_id>", methods=["GET"])
def get_subject(subject_id):
    """Get a specific subject by ID"""
    try:
        subject = db.subject.find_unique(
            where={"id": subject_id},
            include={"teachers": True, "lessons": True}
        )
        if not subject:
            return jsonify({"error": "Subject not found"}), 404
        return jsonify(subject)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/subjects/<int:subject_id>/lessons", methods=["GET"])
def get_subject_lessons(subject_id):
    """Get all lessons for a specific subject"""
    try:
        lessons = db.lesson.find_many(
            where={"subjectId": subject_id},
            include={"class_": True, "teacher": True}
        )
        return jsonify(lessons)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Lesson Endpoints ---
@api_bp.route("/lessons", methods=["GET"])
def get_lessons():
    """Get all lessons"""
    try:
        lessons = db.lesson.find_many(
            include={"subject": True, "class_": True, "teacher": True}
        )
        return jsonify(lessons)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/lessons/<int:lesson_id>", methods=["GET"])
def get_lesson(lesson_id):
    """Get a specific lesson by ID"""
    try:
        lesson = db.lesson.find_unique(
            where={"id": lesson_id},
            include={
                "subject": True,
                "class_": True,
                "teacher": True,
                "exams": True,
                "assignments": True
            }
        )
        if not lesson:
            return jsonify({"error": "Lesson not found"}), 404
        return jsonify(lesson)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/lessons/<int:lesson_id>/attendance", methods=["GET"])
def get_lesson_attendance(lesson_id):
    """Get attendance records for a specific lesson"""
    try:
        date = request.args.get("date")
        where_clause = {"lessonId": lesson_id}
        
        if date:
            try:
                attendance_date = datetime.strptime(date, "%Y-%m-%d").date()
                where_clause["date"] = attendance_date
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        attendance = db.attendance.find_many(
            where=where_clause,
            include={"student": True}
        )
        return jsonify(attendance)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Special Staff Endpoints ---
@api_bp.route("/librarians", methods=["GET"])
def get_librarians():
    """Get all librarians"""
    try:
        librarians = db.librarian.find_many(include={"template": True})
        return jsonify(librarians)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/librarians/<string:card_id>", methods=["GET"])
def get_librarian(card_id):
    """Get a specific librarian by card ID"""
    try:
        librarian = db.librarian.find_unique(
            where={"cardId": card_id},
            include={"template": True}
        )
        if not librarian:
            return jsonify({"error": "Librarian not found"}), 404
        return jsonify(librarian)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/gym-masters", methods=["GET"])
def get_gym_masters():
    """Get all gym masters"""
    try:
        gym_masters = db.gymmaster.find_many(include={"template": True})
        return jsonify(gym_masters)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/gym-masters/<string:card_id>", methods=["GET"])
def get_gym_master(card_id):
    """Get a specific gym master by card ID"""
    try:
        gym_master = db.gymmaster.find_unique(
            where={"cardId": card_id},
            include={"template": True}
        )
        if not gym_master:
            return jsonify({"error": "Gym master not found"}), 404
        return jsonify(gym_master)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/hostel-wardens", methods=["GET"])
def get_hostel_wardens():
    """Get all hostel wardens"""
    try:
        hostel_wardens = db.hostelwarden.find_many(include={"template": True})
        return jsonify(hostel_wardens)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/hostel-wardens/<string:card_id>", methods=["GET"])
def get_hostel_warden(card_id):
    """Get a specific hostel warden by card ID"""
    try:
        hostel_warden = db.hostelwarden.find_unique(
            where={"cardId": card_id},
            include={"template": True}
        )
        if not hostel_warden:
            return jsonify({"error": "Hostel warden not found"}), 404
        return jsonify(hostel_warden)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Facility Log Endpoints ---
@api_bp.route("/library-logs", methods=["GET"])
def get_library_logs():
    """Get library logs with optional filtering"""
    try:
        student_id = request.args.get("student_id")
        teacher_id = request.args.get("teacher_id")
        librarian_id = request.args.get("librarian_id")
        admin_id = request.args.get("admin_id")
        book_id = request.args.get("book_id")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        where_clause = {}
        
        if student_id:
            where_clause["studentId"] = student_id
        if teacher_id:
            where_clause["teacherId"] = teacher_id
        if librarian_id:
            where_clause["librarianId"] = librarian_id
        if admin_id:
            where_clause["adminId"] = admin_id
        if book_id:
            where_clause["bookId"] = book_id
        
        # Date filtering
        date_filter = {}
        if start_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                date_filter["gte"] = start
            except ValueError:
                return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD"}), 400
        
        if end_date:
            try:
                end = datetime.strptime(end_date, "%Y-%m-%d")
                date_filter["lte"] = end
            except ValueError:
                return jsonify({"error": "Invalid end_date format. Use YYYY-MM-DD"}), 400
        
        if date_filter:
            where_clause["loginTime"] = date_filter
        
        logs = db.librarylog.find_many(
            where=where_clause,
            include={
                "student": True,
                "teacher": True,
                "librarian": True,
                "admin": True,
                "book": True
            }
        )
        return jsonify(logs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/gym-logs", methods=["GET"])
def get_gym_logs():
    """Get gym logs with optional filtering"""
    try:
        student_id = request.args.get("student_id")
        teacher_id = request.args.get("teacher_id")
        gym_master_id = request.args.get("gym_master_id")
        admin_id = request.args.get("admin_id")
        activity_type = request.args.get("activity_type")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        where_clause = {}
        
        if student_id:
            where_clause["studentId"] = student_id
        if teacher_id:
            where_clause["teacherId"] = teacher_id
        if gym_master_id:
            where_clause["gymMasterId"] = gym_master_id
        if admin_id:
            where_clause["adminId"] = admin_id
        if activity_type:
            where_clause["activityType"] = activity_type
        
        # Date filtering
        date_filter = {}
        if start_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                date_filter["gte"] = start
            except ValueError:
                return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD"}), 400
        
        if end_date:
            try:
                end = datetime.strptime(end_date, "%Y-%m-%d")
                date_filter["lte"] = end
            except ValueError:
                return jsonify({"error": "Invalid end_date format. Use YYYY-MM-DD"}), 400
        
        if date_filter:
            where_clause["loginTime"] = date_filter
        
        logs = db.gymlog.find_many(
            where=where_clause,
            include={
                "student": True,
                "teacher": True,
                "gymMaster": True,
                "admin": True
            }
        )
        return jsonify(logs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/hostel-logs", methods=["GET"])
def get_hostel_logs():
    """Get hostel logs with optional filtering"""
    try:
        student_id = request.args.get("student_id")
        hostel_warden_id = request.args.get("hostel_warden_id")
        admin_id = request.args.get("admin_id")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        where_clause = {}
        
        if student_id:
            where_clause["studentId"] = student_id
        if hostel_warden_id:
            where_clause["hostelWardenId"] = hostel_warden_id
        if admin_id:
            where_clause["adminId"] = admin_id
        
        # Date filtering
        date_filter = {}
        if start_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                date_filter["gte"] = start
            except ValueError:
                return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD"}), 400
        
        if end_date:
            try:
                end = datetime.strptime(end_date, "%Y-%m-%d")
                date_filter["lte"] = end
            except ValueError:
                return jsonify({"error": "Invalid end_date format. Use YYYY-MM-DD"}), 400
        
        if date_filter:
            where_clause["loginTime"] = date_filter
        
        logs = db.hostellog.find_many(
            where=where_clause,
            include={
                "student": True,
                "hostelWarden": True,
                "admin": True
            }
        )
        return jsonify(logs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Book Endpoints ---
@api_bp.route("/books", methods=["GET"])
def get_books():
    """Get all books with optional status filter"""
    try:
        status = request.args.get("status")
        where_clause = {}
        if status:
            where_clause["status"] = status
        
        books = db.book.find_many(where=where_clause)
        return jsonify(books)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/books/<string:book_id>", methods=["GET"])
def get_book(book_id):
    """Get a specific book by ID"""
    try:
        book = db.book.find_unique(where={"id": book_id})
        if not book:
            return jsonify({"error": "Book not found"}), 404
        return jsonify(book)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Exam Endpoints ---
@api_bp.route("/exams", methods=["GET"])
def get_exams():
    """Get all exams"""
    try:
        exams = db.exam.find_many(include={"lesson": True})
        return jsonify(exams)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/exams/<int:exam_id>", methods=["GET"])
def get_exam(exam_id):
    """Get a specific exam by ID"""
    try:
        exam = db.exam.find_unique(
            where={"id": exam_id},
            include={"lesson": True, "results": True}
        )
        if not exam:
            return jsonify({"error": "Exam not found"}), 404
        return jsonify(exam)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/exams/<int:exam_id>/results", methods=["GET"])
def get_exam_results(exam_id):
    """Get all results for a specific exam"""
    try:
        results = db.result.find_many(
            where={"examId": exam_id},
            include={"student": True}
        )
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Assignment Endpoints ---
@api_bp.route("/assignments", methods=["GET"])
def get_assignments():
    """Get all assignments"""
    try:
        assignments = db.assignment.find_many(include={"lesson": True})
        return jsonify(assignments)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/assignments/<int:assignment_id>", methods=["GET"])
def get_assignment(assignment_id):
    """Get a specific assignment by ID"""
    try:
        assignment = db.assignment.find_unique(
            where={"id": assignment_id},
            include={"lesson": True, "results": True}
        )
        if not assignment:
            return jsonify({"error": "Assignment not found"}), 404
        return jsonify(assignment)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/assignments/<int:assignment_id>/results", methods=["GET"])
def get_assignment_results(assignment_id):
    """Get all results for a specific assignment"""
    try:
        results = db.result.find_many(
            where={"assignmentId": assignment_id},
            include={"student": True}
        )
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Result Endpoints ---
@api_bp.route("/results", methods=["GET"])
def get_results():
    """Get all results with optional filtering"""
    try:
        student_id = request.args.get("student_id")
        exam_id = request.args.get("exam_id", type=int)
        assignment_id = request.args.get("assignment_id", type=int)
        
        where_clause = {}
        if student_id:
            where_clause["studentId"] = student_id
        if exam_id:
            where_clause["examId"] = exam_id
        if assignment_id:
            where_clause["assignmentId"] = assignment_id
        
        results = db.result.find_many(
            where=where_clause,
            include={"student": True, "exam": True, "assignment": True}
        )
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/results/<int:result_id>", methods=["GET"])
def get_result(result_id):
    """Get a specific result by ID"""
    try:
        result = db.result.find_unique(
            where={"id": result_id},
            include={"student": True, "exam": True, "assignment": True}
        )
        if not result:
            return jsonify({"error": "Result not found"}), 404
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Event Endpoints ---
@api_bp.route("/events", methods=["GET"])
def get_events():
    """Get all events with optional filtering"""
    try:
        class_id = request.args.get("class_id", type=int)
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        where_clause = {}
        if class_id:
            where_clause["classId"] = class_id
        
        # Date filtering
        date_filter = {}
        if start_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                date_filter["gte"] = start
            except ValueError:
                return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD"}), 400
        
        if end_date:
            try:
                end = datetime.strptime(end_date, "%Y-%m-%d")
                date_filter["lte"] = end
            except ValueError:
                return jsonify({"error": "Invalid end_date format. Use YYYY-MM-DD"}), 400
        
        if date_filter:
            where_clause["startTime"] = date_filter
        
        events = db.event.find_many(
            where=where_clause,
            include={"class_": True}
        )
        return jsonify(events)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/events/<int:event_id>", methods=["GET"])
def get_event(event_id):
    """Get a specific event by ID"""
    try:
        event = db.event.find_unique(
            where={"id": event_id},
            include={"class_": True}
        )
        if not event:
            return jsonify({"error": "Event not found"}), 404
        return jsonify(event)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Announcement Endpoints ---
@api_bp.route("/announcements", methods=["GET"])
def get_announcements():
    """Get all announcements with optional filtering"""
    try:
        class_id = request.args.get("class_id", type=int)
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        where_clause = {}
        if class_id:
            where_clause["classId"] = class_id
        
        # Date filtering
        date_filter = {}
        if start_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                date_filter["gte"] = start
            except ValueError:
                return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD"}), 400
        
        if end_date:
            try:
                end = datetime.strptime(end_date, "%Y-%m-%d")
                date_filter["lte"] = end
            except ValueError:
                return jsonify({"error": "Invalid end_date format. Use YYYY-MM-DD"}), 400
        
        if date_filter:
            where_clause["date"] = date_filter
        
        announcements = db.announcement.find_many(
            where=where_clause,
            include={"class_": True}
        )
        return jsonify(announcements)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/announcements/<int:announcement_id>", methods=["GET"])
def get_announcement(announcement_id):
    """Get a specific announcement by ID"""
    try:
        announcement = db.announcement.find_unique(
            where={"id": announcement_id},
            include={"class_": True}
        )
        if not announcement:
            return jsonify({"error": "Announcement not found"}), 404
        return jsonify(announcement)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Facility Attendance Log Endpoints ---
@api_bp.route("/facility-logs", methods=["GET"])
def get_facility_logs():
    """Get all facility attendance logs with optional filtering"""
    try:
        student_id = request.args.get("student_id")
        facility_id = request.args.get("facility_id")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        where_clause = {}
        if student_id:
            where_clause["studentId"] = student_id
        if facility_id:
            where_clause["facilityId"] = facility_id
        
        # Date filtering
        date_filter = {}
        if start_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                date_filter["gte"] = start
            except ValueError:
                return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD"}), 400
        
        if end_date:
            try:
                end = datetime.strptime(end_date, "%Y-%m-%d")
                date_filter["lte"] = end
            except ValueError:
                return jsonify({"error": "Invalid end_date format. Use YYYY-MM-DD"}), 400
        
        if date_filter:
            where_clause["loginTime"] = date_filter
        
        logs = db.facilityattendancelog.find_many(
            where=where_clause,
            include={"student": True}
        )
        return jsonify(logs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/facility-logs/<string:log_id>", methods=["GET"])
def get_facility_log(log_id):
    """Get a specific facility attendance log by ID"""
    try:
        log = db.facilityattendancelog.find_unique(
            where={"id": log_id},
            include={"student": True}
        )
        if not log:
            return jsonify({"error": "Facility log not found"}), 404
        return jsonify(log)
    except Exception as e:
        return jsonify({"error": str(e)}), 500