import asyncio
import random
from datetime import datetime, timedelta
from prisma import Prisma
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env file
print("DATABASE_URL:", os.getenv("DATABASE_URL"))  # Debugging

from prisma import Prisma
prisma = Prisma()


async def main():
    await prisma.connect()  # ✅ Await the connection

    # ADMIN
    await prisma.admin.create(data={"id": "admin1", "username": "admin1"})
    await prisma.admin.create(data={"id": "admin2", "username": "admin2"})

    # GRADE
    for i in range(1, 7):
        await prisma.grade.create(data={"level": i})

    # CLASS
    for i in range(1, 7):
        await prisma.class_.create(data={  # ✅ `class_` to avoid Python keyword conflict
            "name": f"{i}A",
            "gradeId": i,
            "capacity": random.randint(15, 20),
        })

    # SUBJECTS
    subjects = ["Mathematics", "Science", "English", "History", "Geography",
                "Physics", "Chemistry", "Biology", "Computer Science", "Art"]
    for name in subjects:
        await prisma.subject.create(data={"name": name})

    # TEACHER
    for i in range(1, 16):
        await prisma.teacher.create(data={
            "id": f"teacher{i}",
            "username": f"teacher{i}",
            "name": f"TName{i}",
            "surname": f"TSurname{i}",
            "email": f"teacher{i}@example.com",
            "phone": f"123-456-789{i}",
            "address": f"Address{i}",
            "bloodType": "A+",
            "sex": "MALE" if i % 2 == 0 else "FEMALE",
            "birthday": datetime.now() - timedelta(days=365 * 30),
        })

    # LESSON
    days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
    for i in range(1, 31):
        await prisma.lesson.create(data={
            "name": f"Lesson{i}",
            "day": random.choice(days),
            "startTime": datetime.now() + timedelta(hours=1),
            "endTime": datetime.now() + timedelta(hours=3),
            "subjectId": (i % 10) + 1,
            "classId": (i % 6) + 1,
            "teacherId": f"teacher{(i % 15) + 1}",
        })

    # PARENT
    for i in range(1, 26):
        await prisma.parent.create(data={
            "id": f"parent{i}",
            "username": f"parent{i}",
            "name": f"PName{i}",
            "surname": f"PSurname{i}",
            "email": f"parent{i}@example.com",
            "phone": f"123-456-789{i}",
            "address": f"Address{i}",
        })

    # STUDENT
    for i in range(1, 51):
        await prisma.student.create(data={
            "id": f"student{i}",
            "username": f"student{i}",
            "name": f"SName{i}",
            "surname": f"SSurname{i}",
            "email": f"student{i}@example.com",
            "phone": f"987-654-321{i}",
            "address": f"Address{i}",
            "bloodType": "O-",
            "sex": "MALE" if i % 2 == 0 else "FEMALE",
            "parentId": f"parent{((i // 2) % 25) or 25}",
            "gradeId": (i % 6) + 1,
            "classId": (i % 6) + 1,
            "birthday": datetime.now() - timedelta(days=365 * 10),
        })

    # EXAM
    for i in range(1, 11):
        await prisma.exam.create(data={
            "title": f"Exam{i}",
            "startTime": datetime.now() + timedelta(hours=1),
            "endTime": datetime.now() + timedelta(hours=2),
            "lessonId": (i % 30) + 1,
        })

    # ASSIGNMENT
    for i in range(1, 11):
        await prisma.assignment.create(data={
            "title": f"Assignment{i}",
            "startDate": datetime.now() + timedelta(hours=1),
            "dueDate": datetime.now() + timedelta(days=1),
            "lessonId": (i % 30) + 1,
        })

    # RESULT
    for i in range(1, 11):
        await prisma.result.create(data={
            "score": 90,
            "studentId": f"student{i}",
            **({"examId": i} if i <= 5 else {"assignmentId": i - 5}),
        })

    # ATTENDANCE
    for i in range(1, 11):
        await prisma.attendance.create(data={
            "date": datetime.now(),
            "present": True,
            "studentId": f"student{i}",
            "lessonId": (i % 30) + 1,
        })

    # EVENT
    for i in range(1, 6):
        await prisma.event.create(data={
            "title": f"Event{i}",
            "description": f"Description for Event{i}",
            "startTime": datetime.now() + timedelta(hours=1),
            "endTime": datetime.now() + timedelta(hours=2),
            "classId": (i % 5) + 1,
        })

    # ANNOUNCEMENT
    for i in range(1, 6):
        await prisma.announcement.create(data={
            "title": f"Announcement{i}",
            "description": f"Description for Announcement{i}",
            "date": datetime.now(),
            "classId": (i % 5) + 1,
        })

    print("Seeding completed successfully.")

    await prisma.disconnect()  # ✅ Properly disconnect from Prisma

# ✅ Run the async function properly
if __name__ == "__main__":
    asyncio.run(main())

# from prisma import Prisma
# from prisma.enums import Day, UserSex
# import asyncio
# from datetime import datetime, timedelta

# prisma = Prisma()

# async def main():
#     await prisma.connect()

#     # ADMIN
#     await prisma.admin.create(data={"id": "admin1", "username": "admin1"})
#     await prisma.admin.create(data={"id": "admin2", "username": "admin2"})

#     # GRADE
#     for i in range(1, 7):
#         await prisma.grade.create(data={"level": i})

#     # CLASS
#     for i in range(1, 7):
#         await prisma.class_.create(data={
#             "name": f"{i}A",
#             "gradeId": i,
#             "capacity": 15 + (i % 6),
#         })

#     # SUBJECT
#     subjects = ["Mathematics", "Science", "English", "History", "Geography",
#                 "Physics", "Chemistry", "Biology", "Computer Science", "Art"]
    
#     for name in subjects:
#         await prisma.subject.create(data={"name": name})

#     # TEACHER
#     for i in range(1, 16):
#         await prisma.teacher.create(data={
#             "id": f"teacher{i}",
#             "username": f"teacher{i}",
#             "name": f"TName{i}",
#             "surname": f"TSurname{i}",
#             "email": f"teacher{i}@example.com",
#             "phone": f"123-456-789{i}",
#             "address": f"Address{i}",
#             "bloodType": "A+",
#             "sex": UserSex.MALE if i % 2 == 0 else UserSex.FEMALE,
#             "subjects": {"connect": [{"id": (i % 10) + 1}]},
#             "classes": {"connect": [{"id": (i % 6) + 1}]},
#             "birthday": datetime.now() - timedelta(days=30*365),
#         })

#     # LESSON
#     for i in range(1, 31):
#         await prisma.lesson.create(data={
#             "name": f"Lesson{i}",
#             "day": list(Day)[i % len(Day)],
#             "startTime": datetime.now() + timedelta(hours=1),
#             "endTime": datetime.now() + timedelta(hours=3),
#             "subjectId": (i % 10) + 1,
#             "classId": (i % 6) + 1,
#             "teacherId": f"teacher{(i % 15) + 1}",
#         })

#     # PARENT
#     for i in range(1, 26):
#         await prisma.parent.create(data={
#             "id": f"parentId{i}",
#             "username": f"parentId{i}",
#             "name": f"PName {i}",
#             "surname": f"PSurname {i}",
#             "email": f"parent{i}@example.com",
#             "phone": f"123-456-789{i}",
#             "address": f"Address{i}",
#         })

#     # STUDENT
#     for i in range(1, 51):
#         await prisma.student.create(data={
#             "id": f"student{i}",
#             "username": f"student{i}",
#             "name": f"SName{i}",
#             "surname": f"SSurname{i}",
#             "email": f"student{i}@example.com",
#             "phone": f"987-654-321{i}",
#             "address": f"Address{i}",
#             "bloodType": "O-",
#             "sex": UserSex.MALE if i % 2 == 0 else UserSex.FEMALE,
#             "parentId": f"parentId{(i // 2) % 25 + 1}",
#             "gradeId": (i % 6) + 1,
#             "classId": (i % 6) + 1,
#             "birthday": datetime.now() - timedelta(days=10*365),
#         })

#     # EXAM
#     for i in range(1, 11):
#         await prisma.exam.create(data={
#             "title": f"Exam {i}",
#             "startTime": datetime.now() + timedelta(hours=1),
#             "endTime": datetime.now() + timedelta(hours=2),
#             "lessonId": (i % 30) + 1,
#         })

#     # ASSIGNMENT
#     for i in range(1, 11):
#         await prisma.assignment.create(data={
#             "title": f"Assignment {i}",
#             "startDate": datetime.now() + timedelta(hours=1),
#             "dueDate": datetime.now() + timedelta(days=1),
#             "lessonId": (i % 30) + 1,
#         })

#     # RESULT
#     for i in range(1, 11):
#         await prisma.result.create(data={
#             "score": 90,
#             "studentId": f"student{i}",
#             "examId": i if i <= 5 else None,
#             "assignmentId": i - 5 if i > 5 else None,
#         })

#     # ATTENDANCE
#     for i in range(1, 11):
#         await prisma.attendance.create(data={
#             "date": datetime.now(),
#             "present": True,
#             "studentId": f"student{i}",
#             "lessonId": (i % 30) + 1,
#         })

#     # EVENT
#     for i in range(1, 6):
#         await prisma.event.create(data={
#             "title": f"Event {i}",
#             "description": f"Description for Event {i}",
#             "startTime": datetime.now() + timedelta(hours=1),
#             "endTime": datetime.now() + timedelta(hours=2),
#             "classId": (i % 5) + 1,
#         })

#     # ANNOUNCEMENT
#     for i in range(1, 6):
#         await prisma.announcement.create(data={
#             "title": f"Announcement {i}",
#             "description": f"Description for Announcement {i}",
#             "date": datetime.now(),
#             "classId": (i % 5) + 1,
#         })

#     print("Seeding completed successfully.")
#     await prisma.disconnect()

# asyncio.run(main())
