
from prisma import Prisma
from datetime import datetime, timedelta
import random
import uuid
from uuid import uuid4
import os
import asyncio
from faker import Faker
from dotenv import load_dotenv

fake = Faker()
load_dotenv()
print("DATABASE_URL:", os.getenv("DATABASE_URL"))  # Debugging
# Initialize Prisma client
db = Prisma()

# Store IDs for reference
template_ids = []
grade_ids = []
class_ids = []
student_ids = []
teacher_ids = []
admin_ids = []
parent_ids = []
librarian_ids = []
gym_master_ids = []
hostel_warden_ids = []
subject_ids = []
lesson_ids = []
book_ids = []

async def main():
    """Main function to seed the database"""
    print("Starting database seeding...")
    
    await db.connect()
    
    try:
        # Create core data structures
        await create_templates()
        await create_grades()
        await create_subjects()
        await create_classes()
        
        # Create users
        await create_parents()
        await create_teachers()
        await create_students()
        await create_admins()
        await create_special_staff()
        
        # Create academic resources
        await create_lessons()
        await create_exams_and_assignments()
        await create_attendance()
        await create_class_attendance()
        
        # Create facilities data
        await create_books()
        await create_facility_logs()
        
        # Create events and announcements
        await create_events_and_announcements()
        
        print("Database seeded successfully!")
    
    except Exception as e:
        print(f"Error seeding database: {e}")
    
    finally:
        await db.disconnect()

async def create_templates():
    """Create ID templates for users"""
    print("Creating templates...")
    
    templates = []
    
    # Template types and organizations
    template_types = [
        {"name": "School Admin Template", "organization": "School Admin Office", "templateClass": "ADMIN"},
        {"name": "Student Template", "organization": "School Student", "templateClass": "STUDENT"},
        {"name": "Teacher Template", "organization": "School Faculty", "templateClass": "TEACHER"},
        {"name": "Library Staff Template", "organization": "School Library", "templateClass": "LIBRARIAN"},
        {"name": "Gym Staff Template", "organization": "School Gym", "templateClass": "GYM_MASTER"},
        {"name": "Hostel Staff Template", "organization": "School Hostel", "templateClass": "HOSTEL_WARDEN"}
    ]
    
    for template_info in template_types:
        template_id = str(uuid4())
        template = await db.template.create({
            "id": template_id,
            "name": template_info["name"],
            "organization": template_info["organization"],
            "templateClass": template_info["templateClass"]
        })
        templates.append(template)
        template_ids.append(template_id)
    
    print(f"Created {len(templates)} templates")
    return templates

async def create_grades():
    """Create grades (1-12)"""
    print("Creating grades...")
    
    grades = []
    for level in range(1, 13):  # Grades 1-12
        grade = await db.grade.create({
            "level": level
        })
        grades.append(grade)
        grade_ids.append(grade.id)
    
    print(f"Created {len(grades)} grades")
    return grades

async def create_subjects():
    """Create academic subjects"""
    print("Creating subjects...")
    
    subject_names = [
        "Mathematics", "Physics", "Chemistry", "Biology", 
        "English", "History", "Geography", "Computer Science",
        "Art", "Music", "Physical Education", "Economics"
    ]
    
    subjects = []
    for subject_name in subject_names:
        subject = await db.subject.create({
            "name": subject_name
        })
        subjects.append(subject)
        subject_ids.append(subject.id)
    
    print(f"Created {len(subjects)} subjects")
    return subjects

async def create_classes():
    """Create classes for each grade"""
    print("Creating classes...")
    
    classes = []
    sections = ["A", "B", "C"]
    
    for grade_id in grade_ids:
        grade = await db.grade.find_unique(where={"id": grade_id})
        for section in sections:
            class_name = f"Grade {grade.level}-{section}"
            class_ = await db.class_.create({
                "name": class_name,
                "capacity": 30,
                "gradeId": grade_id
            })
            classes.append(class_)
            class_ids.append(class_.id)
    
    print(f"Created {len(classes)} classes")
    return classes

async def create_parents():
    """Create parent accounts"""
    print("Creating parents...")
    
    parents = []
    for i in range(1, 101):  # Create 100 parents
        parent_id = str(uuid4())
        username = f"parent{i}"
        parent = await db.parent.create({
            "id": parent_id,
            "username": username,
            "name": fake.first_name(),
            "surname": fake.last_name(),
            "email": f"{username}@example.com",
            "phone": fake.phone_number(),
            "address": fake.address()
        })
        parents.append(parent)
        parent_ids.append(parent_id)
    
    print(f"Created {len(parents)} parents")
    return parents

async def create_teachers():
    """Create teacher accounts"""
    print("Creating teachers...")
    
    # Find the teacher template
    teacher_template = await db.template.find_first(
        where={"templateClass": "TEACHER"}
    )
    
    teachers = []
    for i in range(1, 51):  # Create 50 teachers
        card_id = f"T{i:06d}"
        username = f"teacher{i}"
        
        # Assign 1-3 random subjects to each teacher
        teacher_subjects = random.sample(subject_ids, random.randint(1, 3))
        
        teacher = await db.teacher.create({
            "cardId": card_id,
            "username": username,
            "name": fake.first_name(),
            "surname": fake.last_name(),
            "email": f"{username}@example.com",
            "phone": fake.phone_number(),
            "address": fake.address(),
            "img": f"teacher{i}.jpg",
            "imagePath": f"/static/images/teachers/teacher{i}.jpg",
            "bloodType": random.choice(["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"]),
            "sex": random.choice(["MALE", "FEMALE"]),
            "birthday": datetime.combine(fake.date_of_birth(minimum_age=30, maximum_age=65), datetime.min.time()).isoformat() + "Z",
            "department": random.choice(["Science", "Arts", "Languages", "Mathematics"]),
            "templateId": teacher_template.id
        })
        
        # Connect teacher to subjects
        for subject_id in teacher_subjects:
            await db.subject.update(
                where={"id": subject_id},
                data={"teachers": {"connect": {"cardId": card_id}}}
            )
        
        teachers.append(teacher)
        teacher_ids.append(card_id)
    
    # Assign teachers as class supervisors
    for class_id in class_ids:
        if random.random() < 0.8:  # 80% of classes get a supervisor
            teacher_id = random.choice(teacher_ids)
            await db.class_.update(
                where={"id": class_id},
                data={"supervisor": {"connect": {"cardId": teacher_id}}}
            )
            
            # Also add to teacherClasses relation
            await db.teacher.update(
                where={"cardId": teacher_id},
                data={"teacherClasses": {"connect": {"id": class_id}}}
            )
    
    print(f"Created {len(teachers)} teachers")
    return teachers

async def create_students():
    """Create student accounts"""
    print("Creating students...")
    
    # Find the student template
    student_template = await db.template.find_first(
        where={"templateClass": "STUDENT"}
    )
    
    students = []
    student_count = 0
    
    for class_id in class_ids:
        # Get 15-25 students per class
        num_students = random.randint(15, 25)
        
        # Get class and grade info
        class_ = await db.class_.find_unique(
            where={"id": class_id},
            include={"grade": True}
        )
        
        for i in range(num_students):
            student_count += 1
            card_id = f"S{student_count:06d}"
            username = f"student{student_count}"
            parent_id = random.choice(parent_ids)
            
            student = await db.student.create({
                "cardId": card_id,
                "username": username,
                "name": fake.first_name(),
                "surname": fake.last_name(),
                "email": f"{username}@example.com",
                "phone": fake.phone_number(),
                "address": fake.address(),
                "img": f"student{student_count}.jpg",
                "imagePath": f"/static/images/students/student{student_count}.jpg",
                "bloodType": random.choice(["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"]),
                "sex": random.choice(["MALE", "FEMALE"]),
                "birthday": datetime.combine(fake.date_of_birth(minimum_age=6, maximum_age=18), datetime.min.time()).isoformat() + "Z",
                "parentId": parent_id,
                "classId": class_id,
                "gradeId": class_.grade.id,
                "templateId": student_template.id,
                "admissionYear": str(datetime.now().year - random.randint(1, 5)),
                "yearOfStudy": str(random.randint(1, 5)),
                "division": random.choice(["Science", "Arts", "Commerce"]),
                "department": random.choice(["Science", "Math", "English", "History", "None"])
            })
            
            students.append(student)
            student_ids.append(card_id)
    
    print(f"Created {len(students)} students")
    return students

async def create_admins():
    """Create admin accounts"""
    print("Creating admins...")
    
    # Find the admin template
    admin_template = await db.template.find_first(
        where={"templateClass": "ADMIN"}
    )
    
    admins = []
    for i in range(1, 6):  # Create 5 admins
        admin_id = str(uuid4())
        card_id = f"A{i:06d}"
        username = f"admin{i}"
        
        admin = await db.admin.create({
            "id": admin_id,
            "username": username,
            "cardId": card_id,
            "name": fake.name(),
            "email": f"{username}@example.com",
            "role": random.choice(["ADMIN", "SUPER_ADMIN"]),
            "templateId": admin_template.id
        })
        
        admins.append(admin)
        admin_ids.append(card_id)
    
    print(f"Created {len(admins)} admins")
    return admins

async def create_special_staff():
    """Create librarians, gym masters, and hostel wardens"""
    print("Creating special staff...")
    
    # Find templates
    librarian_template = await db.template.find_first(where={"templateClass": "LIBRARIAN"})
    gym_template = await db.template.find_first(where={"templateClass": "GYM_MASTER"})
    hostel_template = await db.template.find_first(where={"templateClass": "HOSTEL_WARDEN"})
    
    # Create librarians
    librarians = []
    for i in range(1, 6):  # Create 5 librarians
        card_id = f"LIB{i:06d}"
        staff_id = f"LIB-{i:04d}"
        
        librarian = await db.librarian.create({
            "cardId": card_id,
            "staffId": staff_id,
            "name": fake.name(),
            "email": f"librarian{i}@example.com",
            "phone": fake.phone_number(),
            "address": fake.address(),
            "librarySection": random.choice(["Fiction", "Non-Fiction", "Reference", "Children", "Periodicals"]),
            "bloodType": random.choice(["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"]),
            "birthday": datetime.combine(fake.date_of_birth(minimum_age=25, maximum_age=60), datetime.min.time()).isoformat() + "Z",
            "templateId": librarian_template.id
        })
        
        librarians.append(librarian)
        librarian_ids.append(card_id)
    
    # Create gym masters
    gym_masters = []
    for i in range(1, 4):  # Create 3 gym masters
        card_id = f"GYM{i:06d}"
        staff_id = f"GYM-{i:04d}"
        
        gym_master = await db.gymmaster.create({
            "cardId": card_id,
            "staffId": staff_id,
            "name": fake.name(),
            "email": f"gym{i}@example.com",
            "phone": fake.phone_number(),
            "address": fake.address(),
            "specialization": random.choice(["Fitness", "Strength", "Cardio", "Swimming", "Team Sports"]),
            "bloodType": random.choice(["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"]),
            "birthday": datetime.combine(fake.date_of_birth(minimum_age=25, maximum_age=60), datetime.min.time()).isoformat() + "Z",
            "templateId": gym_template.id
        })
        
        gym_masters.append(gym_master)
        gym_master_ids.append(card_id)
    
    # Create hostel wardens
    hostel_wardens = []
    for i in range(1, 4):  # Create 3 hostel wardens
        card_id = f"HST{i:06d}"
        staff_id = f"HST-{i:04d}"
        
        hostel_warden = await db.hostelwarden.create({
            "cardId": card_id,
            "staffId": staff_id,
            "name": fake.name(),
            "email": f"hostel{i}@example.com",
            "phone": fake.phone_number(),
            "address": fake.address(),
            "hostelName": f"Hostel Block {chr(64 + i)}",
            "bloodType": random.choice(["A+", "B+", "AB+", "O+", "A-", "B-", "AB-", "O-"]),
            "birthday": datetime.combine(fake.date_of_birth(minimum_age=25, maximum_age=60), datetime.min.time()).isoformat() + "Z",
            "templateId": hostel_template.id
        })
        
        hostel_wardens.append(hostel_warden)
        hostel_warden_ids.append(card_id)
    
    print(f"Created {len(librarians)} librarians, {len(gym_masters)} gym masters, and {len(hostel_wardens)} hostel wardens")
    return librarians, gym_masters, hostel_wardens

async def create_lessons():
    """Create lessons for each class"""
    print("Creating lessons...")
    
    days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
    lessons = []
    
    for class_id in class_ids:
        # Assign 5-8 subjects to each class
        class_subjects = random.sample(subject_ids, random.randint(5, 8))
        
        for subject_id in class_subjects:
            subject = await db.subject.find_unique(where={"id": subject_id})
            
            # Find teachers who teach this subject
            subject_teachers = await db.teacher.find_many(
                where={"subjects": {"some": {"id": subject_id}}}
            )
            
            if not subject_teachers:
                continue
            
            # Assign a random teacher from those who teach this subject
            teacher = random.choice(subject_teachers)
            
            # Create 2-3 lessons per subject per class
            lesson_count = random.randint(2, 3)
            for i in range(lesson_count):
                day = random.choice(days)
                hour = random.randint(8, 15)
                start_time = datetime.now().replace(hour=hour, minute=0, second=0, microsecond=0)
                end_time = start_time + timedelta(minutes=45)
                
                lesson = await db.lesson.create({
                    "name": f"{subject.name} Lesson {i+1}",
                    "day": day,
                    "startTime": start_time,
                    "endTime": end_time,
                    "subjectId": subject_id,
                    "classId": class_id,
                    "teacherId": teacher.cardId
                })
                
                lessons.append(lesson)
                lesson_ids.append(lesson.id)
    
    print(f"Created {len(lessons)} lessons")
    return lessons

async def create_exams_and_assignments():
    """Create exams and assignments for lessons"""
    print("Creating exams and assignments...")
    
    exams = []
    assignments = []
    results = []
    
    # Choose a subset of lessons to create exams and assignments for
    selected_lesson_ids = random.sample(lesson_ids, min(100, len(lesson_ids)))
    
    for lesson_id in selected_lesson_ids:
        # Create an exam
        if random.random() < 0.7:  # 70% of lessons have exams
            # Exam date in the next 30 days
            exam_date = datetime.now() + timedelta(days=random.randint(7, 30))
            exam_duration = random.randint(45, 120)  # 45-120 minutes
            
            exam = await db.exam.create({
                "title": f"Exam for Lesson {lesson_id}",
                "startTime": exam_date,
                "endTime": exam_date + timedelta(minutes=exam_duration),
                "lessonId": lesson_id
            })
            exams.append(exam)
            
            # Create results for this exam
            await create_exam_results(exam.id)
        
        # Create assignments
        if random.random() < 0.8:  # 80% of lessons have assignments
            # Assignment start date in the next 7 days
            start_date = datetime.now() + timedelta(days=random.randint(1, 7))
            due_date = start_date + timedelta(days=random.randint(7, 14))
            
            assignment = await db.assignment.create({
                "title": f"Assignment for Lesson {lesson_id}",
                "startDate": start_date,
                "dueDate": due_date,
                "lessonId": lesson_id
            })
            assignments.append(assignment)
            
            # Create results for this assignment
            await create_assignment_results(assignment.id)
    
    print(f"Created {len(exams)} exams and {len(assignments)} assignments")
    return exams, assignments

async def create_exam_results(exam_id):
    """Create results for a specific exam"""
    results = []
    
    exam = await db.exam.find_unique(
        where={"id": exam_id},
        include={"lesson": {"include": {"class_": True}}}
    )
    
    class_students = await db.student.find_many(
        where={"classId": exam.lesson.class_.id}
    )
    
    for student in class_students[:10]:  # Limit to first 10 students
        # Random score between 50 and 100
        score = random.randint(50, 100)
        
        result = await db.result.create({
            "score": score,
            "examId": exam_id,
            "studentId": student.cardId
        })
        results.append(result)
    
    return results

async def create_assignment_results(assignment_id):
    """Create results for a specific assignment"""
    results = []
    
    assignment = await db.assignment.find_unique(
        where={"id": assignment_id},
        include={"lesson": {"include": {"class_": True}}}
    )
    
    class_students = await db.student.find_many(
        where={"classId": assignment.lesson.class_.id}
    )
    
    for student in class_students[:10]:  # Limit to first 10 students
        # Random score between 50 and 100
        score = random.randint(50, 100)
        
        result = await db.result.create({
            "score": score,
            "assignmentId": assignment_id,
            "studentId": student.cardId
        })
        results.append(result)
    
    return results

async def create_attendance():
    """Create attendance records for students"""
    print("Creating attendance records...")
    
    attendances = []
    
    # Choose a subset of lessons to create attendance records for
    selected_lesson_ids = random.sample(lesson_ids, min(50, len(lesson_ids)))
    
    for lesson_id in selected_lesson_ids:
        lesson = await db.lesson.find_unique(
            where={"id": lesson_id},
            include={"class_": True}
        )
        
        class_students = await db.student.find_many(
            where={"classId": lesson.class_.id}
        )
        
        # Create attendance records for the past 5 days
        for day_offset in range(5, 0, -1):
            attendance_date = datetime.now() - timedelta(days=day_offset)
            
            for student in class_students:
                # 85% chance of being present
                present = random.random() < 0.85
                
                attendance = await db.attendance.create({
                    "date": attendance_date,
                    "present": present,
                    "studentId": student.cardId,
                    "lessonId": lesson_id
                })
                attendances.append(attendance)
    
    print(f"Created {len(attendances)} attendance records")
    return attendances

async def create_class_attendance():
    """Create class attendance records for students"""
    print("Creating class attendance records...")
    
    class_attendances = []
    
    for class_id in class_ids[:10]:  # Limit to first 10 classes
        class_students = await db.student.find_many(
            where={"classId": class_id}
        )
        
        # Create attendance for the past 5 days
        for day_offset in range(5, 0, -1):
            attendance_date = datetime.now() - timedelta(days=day_offset)
            
            for student in class_students:
                # 90% chance of being present
                if random.random() < 0.9:
                    check_in_time = attendance_date.replace(hour=8, minute=random.randint(0, 15))
                    check_out_time = attendance_date.replace(hour=15, minute=random.randint(0, 30))
                    
                    attendance = await db.classattendance.create({
                        "classId": class_id,
                        "cardId": student.cardId,
                        "date": attendance_date,
                        "checkInTime": check_in_time,
                        "checkOutTime": check_out_time,
                        "status": "present"
                    })
                    class_attendances.append(attendance)
                else:
                    # Student was absent
                    attendance = await db.classattendance.create({
                        "classId": class_id,
                        "cardId": student.cardId,
                        "date": attendance_date,
                        "checkInTime": attendance_date.replace(hour=0, minute=0),
                        "status": "absent"
                    })
                    class_attendances.append(attendance)
    
    print(f"Created {len(class_attendances)} class attendance records")
    return class_attendances

async def create_books():
    """Create library books"""
    print("Creating library books...")
    
    books = []
    
    # Book titles and authors
    book_data = [
        {"title": "To Kill a Mockingbird", "author": "Harper Lee"},
        {"title": "1984", "author": "George Orwell"},
        {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald"},
        {"title": "Pride and Prejudice", "author": "Jane Austen"},
        {"title": "The Catcher in the Rye", "author": "J.D. Salinger"},
        {"title": "The Hobbit", "author": "J.R.R. Tolkien"},
        {"title": "Harry Potter and the Sorcerer's Stone", "author": "J.K. Rowling"},
        {"title": "Lord of the Flies", "author": "William Golding"},
        {"title": "Animal Farm", "author": "George Orwell"},
        {"title": "The Alchemist", "author": "Paulo Coelho"}
    ]
    
    for i, book_info in enumerate(book_data):
        book_id = str(uuid4())
        
        book = await db.book.create({
            "id": book_id,
            "title": book_info["title"],
            "author": book_info["author"],
            "isbn": f"ISBN-{i+1:09d}",
            "status": random.choice(["available", "checked out", "reserved"])
        })
        
        books.append(book)
        book_ids.append(book_id)
    
    print(f"Created {len(books)} books")
    return books

async def create_facility_logs():
    """Create library, gym, and hostel logs"""
    print("Creating facility logs...")
    
    await create_library_logs()
    await create_gym_logs()
    await create_hostel_logs()
    
    print("Facility logs created")

async def create_library_logs():
    """Create library logs for students, teachers, and librarians"""
    print("Creating library logs...")
    
    library_logs = []
    
    # Student library logs
    for student_id in student_ids[:20]:  # Limit to first 20 students
        # Create 1-3 library logs per student
        log_count = random.randint(1, 3)
        for i in range(log_count):
            # Random login time in the past 30 days
            login_time = datetime.now() - timedelta(days=random.randint(1, 30))
            logout_time = login_time + timedelta(hours=random.randint(1, 4))
            time_spent = int((logout_time - login_time).total_seconds() / 60)
            
            log = await db.librarylog.create({
                "studentId": student_id,
                "bookId": random.choice(book_ids) if book_ids else None,
                "loginTime": login_time,
                "logoutTime": logout_time,
                "timeSpent": time_spent
            })
            library_logs.append(log)
    
    # Teacher library logs
    for teacher_id in teacher_ids[:5]:  # Limit to first 5 teachers
        # Create 1-2 library logs per teacher
        log_count = random.randint(1, 2)
        for i in range(log_count):
            login_time = datetime.now() - timedelta(days=random.randint(1, 30))
            logout_time = login_time + timedelta(hours=random.randint(1, 3))
            time_spent = int((logout_time - login_time).total_seconds() / 60)
            
            log = await db.librarylog.create({
                "teacherId": teacher_id,
                "bookId": random.choice(book_ids) if book_ids else None,
                "loginTime": login_time,
                "logoutTime": logout_time,
                "timeSpent": time_spent
            })
            library_logs.append(log)
    
    # Librarian logs (staff working in the library)
    for librarian_id in librarian_ids:
        # Create 3-5 logs per librarian (work shifts)
        log_count = random.randint(3, 5)
        for i in range(log_count):
            login_time = datetime.now() - timedelta(days=random.randint(1, 14))
            logout_time = login_time + timedelta(hours=random.randint(6, 8))
            time_spent = int((logout_time - login_time).total_seconds() / 60)
            
            log = await db.librarylog.create({
                "librarianId": librarian_id,
                "loginTime": login_time,
                "logoutTime": logout_time,
                "timeSpent": time_spent
            })
            library_logs.append(log)
    
    # Admin library visits
    for admin_id in admin_ids[:2]:  # Just a couple of admins visiting
        login_time = datetime.now() - timedelta(days=random.randint(1, 7))
        logout_time = login_time + timedelta(minutes=random.randint(30, 90))
        time_spent = int((logout_time - login_time).total_seconds() / 60)
        
        log = await db.librarylog.create({
            "adminId": admin_id,
            "loginTime": login_time,
            "logoutTime": logout_time,
            "timeSpent": time_spent
        })
        library_logs.append(log)
    
    print(f"Created {len(library_logs)} library logs")
    return library_logs

async def create_gym_logs():
    """Create gym logs for students, teachers, and gym masters"""
    print("Creating gym logs...")
    
    gym_logs = []
    
    # Student gym logs
    for student_id in student_ids[:20]:  # Limit to first 20 students
        # Create 1-3 gym logs per student
        log_count = random.randint(1, 3)
        for i in range(log_count):
            # Random login time in the past 30 days
            login_time = datetime.now() - timedelta(days=random.randint(1, 30))
            logout_time = login_time + timedelta(hours=random.randint(1, 2))
            
            log = await db.gymlog.create({
                "studentId": student_id,
                "loginTime": login_time,
                "logoutTime": logout_time,
                "activityType": random.choice(["Cardio", "Weight Training", "Yoga", "Sports"])
            })
            gym_logs.append(log)
    
    # Teacher gym logs
    for teacher_id in teacher_ids[:10]:  # Limit to first 10 teachers
        # Create 1-2 gym logs per teacher
        log_count = random.randint(1, 2)
        for i in range(log_count):
            login_time = datetime.now() - timedelta(days=random.randint(1, 30))
            logout_time = login_time + timedelta(hours=random.randint(1, 2))
            
            log = await db.gymlog.create({
                "teacherId": teacher_id,
                "loginTime": login_time,
                "logoutTime": logout_time,
                "teacherId": teacher_id,
                "loginTime": login_time,
                "logoutTime": logout_time,
                "activityType": random.choice(["Cardio", "Weight Training", "Yoga", "Sports"])
            })
            gym_logs.append(log)
    
    # Gym master logs (staff working in the gym)
    for gym_master_id in gym_master_ids:
        # Create 3-5 logs per gym master (work shifts)
        log_count = random.randint(3, 5)
        for i in range(log_count):
            login_time = datetime.now() - timedelta(days=random.randint(1, 14))
            logout_time = login_time + timedelta(hours=random.randint(6, 8))
            
            log = await db.gymlog.create({
                "gymMasterId": gym_master_id,
                "loginTime": login_time,
                "logoutTime": logout_time,
                "activityType": "Staff Duty"
            })
            gym_logs.append(log)
    
    print(f"Created {len(gym_logs)} gym logs")
    return gym_logs

async def create_hostel_logs():
    """Create hostel logs for students and hostel wardens"""
    print("Creating hostel logs...")
    
    hostel_logs = []
    
    # Get hostel student IDs (assume 30% of students live in hostels)
    hostel_student_ids = random.sample(student_ids, int(len(student_ids) * 0.3))
    
    # Student hostel logs (check-ins and check-outs)
    for student_id in hostel_student_ids:
        # Create 3-7 hostel logs per student (representing entries/exits)
        log_count = random.randint(3, 7)
        for i in range(log_count):
            # Logs from past 14 days
            log_date = datetime.now() - timedelta(days=random.randint(1, 14))
            login_time = log_date.replace(hour=random.choice([7, 8, 17, 18, 19]), minute=random.randint(0, 59))
            logout_time = None
            
            # 80% chance of having a check-out time
            if random.random() < 0.8:
                # If morning check-in, checkout in evening
                if login_time.hour < 12:
                    logout_time = login_time.replace(hour=random.choice([15, 16, 17]), minute=random.randint(0, 59))
                # If evening check-in, checkout next morning
                else:
                    next_day = login_time + timedelta(days=1)
                    logout_time = next_day.replace(hour=random.choice([7, 8, 9]), minute=random.randint(0, 59))
            
            log = await db.hostellog.create({
                "studentId": student_id,  # Use the field name from the schema
                "loginTime": login_time,
                "logoutTime": logout_time
                # No reason field as it doesn't exist in schema
            })
            hostel_logs.append(log)
    
    # Hostel warden logs (work shifts)
    for warden_id in hostel_warden_ids:
        # Create 5-10 duty logs per warden
        log_count = random.randint(5, 10)
        for i in range(log_count):
            log_date = datetime.now() - timedelta(days=random.randint(1, 30))
            
            # Morning or night shift
            is_night_shift = random.choice([True, False])
            
            if is_night_shift:
                login_time = log_date.replace(hour=20, minute=random.randint(0, 30))
                logout_time = (log_date + timedelta(days=1)).replace(hour=8, minute=random.randint(0, 30))
            else:
                login_time = log_date.replace(hour=8, minute=random.randint(0, 30))
                logout_time = log_date.replace(hour=20, minute=random.randint(0, 30))
            
            log = await db.hostellog.create({
                "hostelWardenId": warden_id,  # Use the field name from the schema
                "loginTime": login_time,
                "logoutTime": logout_time
                # No reason field as it doesn't exist in schema
            })
            hostel_logs.append(log)
    
    print(f"Created {len(hostel_logs)} hostel logs")
    return hostel_logs
async def create_events_and_announcements():
    """Create events and announcements for classes"""
    print("Creating events and announcements...")
    
    events = []
    announcements = []
    
    # Query all classes from the database
    all_classes = await db.class_.find_many()
    class_ids = [c.id for c in all_classes]
    
    # Create events
    event_titles = ["Field Trip", "Parent Teacher Meeting", "Sports Day", 
                   "Science Exhibition", "Cultural Festival", "Annual Day",
                   "Math Competition", "Career Counseling Session"]
    
    for class_id in class_ids:
        # Create 2-4 events per class
        event_count = random.randint(2, 4)
        for i in range(event_count):
            # Events in next 30 days
            event_date = datetime.now() + timedelta(days=random.randint(1, 30))
            
            # Set proper datetime objects for start and end times
            start_time = event_date.replace(
                hour=random.randint(8, 16),
                minute=random.choice([0, 15, 30, 45]),
                second=0,
                microsecond=0
            )
            
            # Event lasts 1-3 hours
            duration_hours = random.randint(1, 3)
            end_time = start_time + timedelta(hours=duration_hours)
            
            event = await db.event.create({
                "title": random.choice(event_titles),
                "description": f"Class {class_id} event: {random.choice(event_titles)}",
                "startTime": start_time,
                "endTime": end_time,
                "classId": class_id
            })
            events.append(event)
    
    # Create announcements
    announcement_titles = ["Homework Reminder", "Exam Schedule", "School Policy Update",
                          "Upcoming Event", "Holiday Announcement", "Project Deadline"]
    
    for class_id in class_ids:
        # Create 3-6 announcements per class
        announcement_count = random.randint(3, 6)
        for i in range(announcement_count):
            # Announcements in past 14 days
            announcement_date = datetime.now() - timedelta(days=random.randint(0, 14))
            
            announcement = await db.announcement.create({
                "title": random.choice(announcement_titles),
                "description": f"Important announcement for class {class_id}: {random.choice(announcement_titles)}",
                "date": announcement_date,
                "classId": class_id
            })
            announcements.append(announcement)
    
    print(f"Created {len(events)} events and {len(announcements)} announcements")
    return events, announcements

# Run the main function
if __name__ == "__main__":
    asyncio.run(main())