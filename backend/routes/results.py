# from flask import Blueprint, jsonify, request
# from prisma import Prisma

# results_bp = Blueprint("results", __name__)
# prisma = Prisma()

# def serialize_results(results):
#     """Convert Prisma ORM objects to JSON-serializable dictionaries."""
#     return [result.dict() for result in results]

# @results_bp.route("/results", methods=["GET"])
# async def get_results():
#     page = request.args.get("page", default=1, type=int)
#     search = request.args.get("search", default="", type=str)

#     await prisma.connect()
#     results = await prisma.result.find_many(
#         where={"student": {"name": {"contains": search, "mode": "insensitive"}}},
#         skip=(page - 1) * 10,
#         take=10,
#         include={
#             "student": True,
#             "exam": {
#                 "include": {
#                     "lesson": {
#                         "include": {"class_": True, "teacher": True}
#                     }
#                 }
#             },
#             "assignment": {
#                 "include": {
#                     "lesson": {
#                         "include": {"class_": True, "teacher": True}
#                     }
#                 }
#             }
#         },
#     )
#     count = await prisma.result.count(
#         where={"student": {"name": {"contains": search, "mode": "insensitive"}}}
#     )
#     await prisma.disconnect()

#     return jsonify({"data": serialize_results(results), "count": count})

# @results_bp.route("/results/<id>", methods=["GET"])
# async def get_result(id):
#     await prisma.connect()
#     result = await prisma.result.find_unique(
#         where={"id": int(id)},
#         include={"student": True, "exam": True, "assignment": True}
#     )
#     await prisma.disconnect()

#     if not result:
#         return jsonify({"error": "Result not found"}), 404

#     return jsonify(result.dict())

# @results_bp.route("/results", methods=["POST"])
# async def create_result():
#     data = request.json
#     await prisma.connect()
#     result = await prisma.result.create(data=data)
#     await prisma.disconnect()

#     return jsonify(result.dict()), 201  # 201 = Created

# @results_bp.route("/results/<id>", methods=["PUT"])
# async def update_result(id):
#     data = request.json
#     await prisma.connect()
#     result = await prisma.result.update(where={"id": int(id)}, data=data)
#     await prisma.disconnect()

#     if not result:
#         return jsonify({"error": "Result not found"}), 404

#     return jsonify(result.dict())

# @results_bp.route("/results/<id>", methods=["DELETE"])
# async def delete_result(id):
#     await prisma.connect()
#     result = await prisma.result.find_unique(where={"id": int(id)})

#     if not result:
#         await prisma.disconnect()
#         return jsonify({"error": "Result not found"}), 404

#     await prisma.result.delete(where={"id": int(id)})
#     await prisma.disconnect()

#     return jsonify({"message": "Result deleted"})
from flask import Blueprint, jsonify, request
from prisma import Prisma

results_bp = Blueprint('results', __name__)
prisma = Prisma()

def serialize_results(results):
    """Convert Prisma ORM objects to JSON-serializable dictionaries."""
    return [result.dict() for result in results]

@results_bp.route('/results', methods=['GET'])
async def get_results():
    page = request.args.get('page', default=1, type=int)
    search = request.args.get('search', default='', type=str).strip()

    query = {}
    if search:
        query = {
            "student": {
                "is": {
                    "name": {"contains": search}  # ✅ Ensure proper nested filtering
                }
            }
        }

    await prisma.connect()
    results = await prisma.result.find_many(
        where=query,
        skip=(page - 1) * 10,
        take=10,
        include={
            "student": True,
            "exam": {"include": {"lesson": {"include": {"class_": True, "teacher": True}}}},
            "assignment": {"include": {"lesson": {"include": {"class_": True, "teacher": True}}}}
        }
    )
    count = await prisma.result.count(where=query)
    await prisma.disconnect()

    return jsonify({"data": serialize_results(results), "count": count})

@results_bp.route('/results/<id>', methods=['GET'])
async def get_result(id):
    await prisma.connect()
    result = await prisma.result.find_unique(where={'id': int(id)}, include={"student": True})
    await prisma.disconnect()

    if not result:
        return jsonify({"error": "Result not found"}), 404

    return jsonify(result.dict())

@results_bp.route('/results', methods=['POST'])
async def create_result():
    data = request.json
    await prisma.connect()
    result = await prisma.result.create(data=data)
    await prisma.disconnect()
    return jsonify(result.dict()), 201  # ✅ HTTP 201 Created

@results_bp.route('/results/<id>', methods=['PUT'])
async def update_result(id):
    data = request.json
    await prisma.connect()
    result = await prisma.result.update(where={'id': int(id)}, data=data)
    await prisma.disconnect()

    if not result:
        return jsonify({"error": "Result not found"}), 404

    return jsonify(result.dict())

@results_bp.route('/results/<id>', methods=['DELETE'])
async def delete_result(id):
    await prisma.connect()
    result = await prisma.result.find_unique(where={'id': int(id)})

    if not result:
        await prisma.disconnect()
        return jsonify({"error": "Result not found"}), 404

    await prisma.result.delete(where={'id': int(id)})
    await prisma.disconnect()

    return jsonify({"message": "Result deleted"})
