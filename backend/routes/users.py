# from flask import Blueprint, jsonify
# from prisma import Prisma

# users_bp = Blueprint('users', __name__)
# prisma = Prisma()

# @users_bp.route('/users/count', methods=['GET'])
# async def get_user_count():
#     await prisma.connect()
#     admin_count = await prisma.admin.count()
#     teacher_count = await prisma.teacher.count()
#     student_count = await prisma.student.count()
#     parent_count = await prisma.parent.count()
#     await prisma.disconnect()
#     return jsonify({
#         "admin": admin_count,
#         "teacher": teacher_count,
#         "student": student_count,
#         "parent": parent_count
#     })
# @users_bp.route('/users', methods=['GET'])
# def get_user():
#     # In a real application, you would get the user ID from the session/token
#     # For this example, we'll use a query parameter
#     user_id = request.args.get('id')
#     user_type = request.args.get('type', 'admin')
    
#     try:
#         prisma.connect()
        
#         if user_type == 'admin':
#             admin = prisma.admin.find_unique(where={'id': user_id})
#             if admin:
#                 return jsonify({
#                     'id': admin.id,
#                     'name': admin.username,  # Assuming username is used as name
#                     'role': 'admin'
#                 })
#         elif user_type == 'teacher':
#             teacher = prisma.teacher.find_unique(where={'id': user_id})
#             if teacher:
#                 return jsonify({
#                     'id': teacher.id,
#                     'name': f"{teacher.name} {teacher.surname}",
#                     'role': 'teacher'
#                 })
#         elif user_type == 'student':
#             student = prisma.student.find_unique(where={'id': user_id})
#             if student:
#                 return jsonify({
#                     'id': student.id,
#                     'name': f"{student.name} {student.surname}",
#                     'role': 'student'
#                 })
#         elif user_type == 'parent':
#             parent = prisma.parent.find_unique(where={'id': user_id})
#             if parent:
#                 return jsonify({
#                     'id': parent.id,
#                     'name': f"{parent.name} {parent.surname}",
#                     'role': 'parent'
#                 })
        
#         # Default user for testing
#         return jsonify({
#             'id': 'default',
#             'name': 'John Doe',
#             'role': 'admin'
#         })
#     finally:
#         prisma.disconnect()
from flask import Blueprint, jsonify, request
from prisma import Prisma

users_bp = Blueprint('users', __name__)
prisma = Prisma()

@users_bp.route('/users/count', methods=['GET'])
async def get_user_count():
    await prisma.connect()
    admin_count = await prisma.admin.count()
    teacher_count = await prisma.teacher.count()
    student_count = await prisma.student.count()
    parent_count = await prisma.parent.count()
    await prisma.disconnect()
    return jsonify({
        "admin": admin_count,
        "teacher": teacher_count,
        "student": student_count,
        "parent": parent_count
    })

@users_bp.route('/users', methods=['GET'])
def get_user():
    user_id = request.args.get('id')
    user_type = request.args.get('type')

    if user_id and user_type:
        try:
            prisma.connect()
            
            if user_type == 'admin':
                admin = prisma.Admin.find_unique(where={'id': user_id})
                if admin:
                    return jsonify({
                        'id': admin.id,
                        'name': admin.username,
                        'role': 'admin'
                    })
            elif user_type == 'teacher':
                teacher = prisma.Teacher.find_unique(where={'id': user_id})
                if teacher:
                    return jsonify({
                        'id': teacher.id,
                        'name': f"{teacher.name} {teacher.surname}",
                        'role': 'teacher'
                    })
            elif user_type == 'student':
                student = prisma.Student.find_unique(where={'id': user_id})
                if student:
                    return jsonify({
                        'id': student.id,
                        'name': f"{student.name} {student.surname}",
                        'role': 'student'
                    })
            elif user_type == 'parent':
                parent = prisma.Parent.find_unique(where={'id': user_id})
                if parent:
                    return jsonify({
                        'id': parent.id,
                        'name': f"{parent.name} {parent.surname}",
                        'role': 'parent'
                    })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            prisma.disconnect()

    # Default user for testing
    return jsonify({
        'id': 'default',
        'name': 'John Doe',
        'role': 'admin'
    })
