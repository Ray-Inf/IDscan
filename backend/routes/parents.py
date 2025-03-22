# from flask import Blueprint, jsonify, request
# from prisma import Prisma
# import asyncio
# import functools

# parents_bp = Blueprint("parents", __name__, url_prefix='/api')  # Add the prefix here
# prisma = Prisma()

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

# @parents_bp.route("/parents", methods=["GET"])
# @async_route
# async def get_parents():
#     try:
#         if not prisma.is_connected():
#             await prisma.connect()
            
#         page = request.args.get("page", default=1, type=int)
#         search = request.args.get("search", default="", type=str).strip()

#         # Build filter criteria
#         filter_criteria = {}
#         if search:
#             filter_criteria["OR"] = [
#                 {"name": {"contains": search, "mode": "insensitive"}},
#                 {"email": {"contains": search, "mode": "insensitive"}},
#             ]

#         parents = await prisma.parent.find_many(
#             where=filter_criteria,
#             skip=(page - 1) * 10,
#             take=10,
#             include={"students": True},
#         )

#         count = await prisma.parent.count(where=filter_criteria)

#         # Format the response
#         formatted_parents = [parent.dict() for parent in parents]

#         return jsonify({"data": formatted_parents, "count": count})
#     except Exception as e:
#         print(f"Error in get_parents: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# @parents_bp.route("/parents/students", methods=["GET"])
# @async_route
# async def get_all_parent_students():
#     try:
#         # Ensure Prisma is connected
#         if not prisma.is_connected():
#             await prisma.connect()

#         # Fetch all students who have a parent
#         students = await prisma.student.find_many(
#             where={"parentId": {"not": ""}},  # ✅ Correct filter for non-empty parentId
#             include={"class_": True}
#         )

#         # Log the fetched students for debugging
#         print(f"Fetched students: {students}")

#         # Format response properly
#         formatted_students = [
#             {
#                 "id": student.id,
#                 "name": student.name,
#                 "surname": student.surname,
#                 "classId": student.classId,
#                 "className": student.class_.name if student.class_ else "No Class Assigned",
#             }
#             for student in students
#         ]

#         return jsonify(formatted_students)

#     except Exception as e:
#         print(f"Error in get_all_parent_students: {str(e)}")
#         return jsonify({"error": str(e)}), 500



# @parents_bp.route("/parents/<id>", methods=["GET"])
# @async_route
# async def get_parent(id):
#     try:
#         if not prisma.is_connected():
#             await prisma.connect()
            
#         parent = await prisma.parent.find_unique(
#             where={"id": id}, include={"students": True}
#         )

#         if not parent:
#             return jsonify({"error": "Parent not found"}), 404

#         return jsonify(parent.dict())
#     except Exception as e:
#         print(f"Error in get_parent: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# @parents_bp.route("/parents", methods=["POST"])
# @async_route
# async def create_parent():
#     try:
#         if not prisma.is_connected():
#             await prisma.connect()
            
#         data = request.json
        
#         parent = await prisma.parent.create(data=data)
#         return jsonify(parent.dict()), 201  # Return created status
#     except Exception as e:
#         print(f"Error in create_parent: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# @parents_bp.route("/parents/<id>", methods=["PUT"])
# @async_route
# async def update_parent(id):
#     try:
#         if not prisma.is_connected():
#             await prisma.connect()
            
#         data = request.json
        
#         parent = await prisma.parent.update(where={"id": id}, data=data)
#         return jsonify(parent.dict())
#     except Exception as e:
#         print(f"Error in update_parent: {str(e)}")
#         return jsonify({"error": str(e)}), 500

# @parents_bp.route("/parents/<id>", methods=["DELETE"])
# @async_route
# async def delete_parent(id):
#     try:
#         if not prisma.is_connected():
#             await prisma.connect()
            
#         parent = await prisma.parent.delete(where={"id": id})
#         return jsonify({"message": "Parent deleted"})
#     except Exception as e:
#         print(f"Error in delete_parent: {str(e)}")
#         return jsonify({"error": str(e)}), 500
from flask import Blueprint, jsonify, request
from prisma import Prisma
import asyncio
import functools

parents_bp = Blueprint("parents", __name__)
prisma = Prisma()

# Async route decorator
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

@parents_bp.route("/parents", methods=["GET"])
@async_route
async def get_parents():
    try:
        if not prisma.is_connected():
            await prisma.connect()
            
        page = request.args.get("page", default=1, type=int)
        search = request.args.get("search", default="", type=str).strip()

        # Build filter criteria
        filter_criteria = {}
        if search:
            filter_criteria["OR"] = [
                {"name": {"contains": search, "mode": "insensitive"}},
                {"email": {"contains": search, "mode": "insensitive"}},
            ]

        parents = await prisma.parent.find_many(
            where=filter_criteria,
            skip=(page - 1) * 10,
            take=10,
            include={"students": True},
        )

        count = await prisma.parent.count(where=filter_criteria)

        # Format the response
        formatted_parents = [parent.dict() for parent in parents]

        return jsonify({"data": formatted_parents, "count": count})
    except Exception as e:
        print(f"Error in get_parents: {str(e)}")
        return jsonify({"error": str(e)}), 500

@parents_bp.route("/parents/<id>", methods=["GET"])
@async_route
async def get_parent(id):
    try:
        if not prisma.is_connected():
            await prisma.connect()
            
        parent = await prisma.parent.find_unique(
            where={"id": id}, 
            include={"students": {
                "include": {"class_": True}
            }}
        )

        if not parent:
            return jsonify({"error": "Parent not found"}), 404

        return jsonify(parent.dict())
    except Exception as e:
        print(f"Error in get_parent: {str(e)}")
        return jsonify({"error": str(e)}), 500

@parents_bp.route("/parents/students", methods=["GET"])
@async_route
async def get_all_parent_students():
    try:
        # Ensure Prisma is connected
        if not prisma.is_connected():
            await prisma.connect()

        parent_id = request.args.get("parentId")
        
        # Build filter criteria
        filter_criteria = {"parentId": {"not": ""}}
        
        # If parentId is provided, filter by it
        if parent_id:
            filter_criteria = {"parentId": parent_id}

        # Fetch students
        students = await prisma.student.find_many(
            where=filter_criteria,
            include={"class_": True}
        )

        # Format response properly
        formatted_students = [
            {
                "id": student.id,
                "name": student.name,
                "surname": student.surname,
                "classId": student.classId,
                "className": student.class_.name if student.class_ else "No Class Assigned",
            }
            for student in students
        ]

        return jsonify(formatted_students)

    except Exception as e:
        print(f"Error in get_all_parent_students: {str(e)}")
        return jsonify({"error": str(e)}), 500

@parents_bp.route("/parents", methods=["POST"])
@async_route
async def create_parent():
    try:
        if not prisma.is_connected():
            await prisma.connect()
            
        data = request.json
        
        parent = await prisma.parent.create(data=data)
        return jsonify(parent.dict()), 201  # Return created status
    except Exception as e:
        print(f"Error in create_parent: {str(e)}")
        return jsonify({"error": str(e)}), 500

@parents_bp.route("/parents/<id>", methods=["PUT"])
@async_route
async def update_parent(id):
    try:
        if not prisma.is_connected():
            await prisma.connect()
            
        data = request.json
        
        parent = await prisma.parent.update(where={"id": id}, data=data)
        return jsonify(parent.dict())
    except Exception as e:
        print(f"Error in update_parent: {str(e)}")
        return jsonify({"error": str(e)}), 500

@parents_bp.route("/parents/<id>", methods=["DELETE"])
@async_route
async def delete_parent(id):
    try:
        if not prisma.is_connected():
            await prisma.connect()
            
        parent = await prisma.parent.delete(where={"id": id})
        return jsonify({"message": "Parent deleted"})
    except Exception as e:
        print(f"Error in delete_parent: {str(e)}")
        return jsonify({"error": str(e)}), 500