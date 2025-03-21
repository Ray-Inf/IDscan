
from flask import Blueprint, jsonify, request
from prisma import Prisma

exams_bp = Blueprint("exams", __name__)
prisma = Prisma()

def serialize_exams(exams):
    return [exam.dict() for exam in exams]

@exams_bp.route("/exams", methods=["GET"])
async def get_exams():
    try:
        page = int(request.args.get("page", 1))
        search = request.args.get("search", "")

        await prisma.connect()
        query = {}
        if search:
            query["title"] = {"contains": search}

        exams = await prisma.exam.find_many(
            where=query,
            skip=(page - 1) * 10,
            take=10,
            include={"lesson": {"include": {"subject": True, "class_": True, "teacher": True}}},
        )
        count = await prisma.exam.count(where=query)

        return jsonify({"data": serialize_exams(exams), "count": count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@exams_bp.route("/exams/<id>", methods=["GET"])
async def get_exam(id):
    try:
        await prisma.connect()
        exam = await prisma.exam.find_unique(
            where={"id": int(id)},
            include={"lesson": {"include": {"subject": True, "class_": True, "teacher": True}}},
        )
        if not exam:
            return jsonify({"error": "Exam not found"}), 404
        return jsonify(exam.dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@exams_bp.route("/exams", methods=["POST"])
async def create_exam():
    try:
        data = request.json
        await prisma.connect()
        exam = await prisma.exam.create(data=data)
        return jsonify(exam.dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@exams_bp.route("/exams/<id>", methods=["PUT"])
async def update_exam(id):
    try:
        data = request.json
        await prisma.connect()
        exam = await prisma.exam.update(where={"id": int(id)}, data=data)
        return jsonify(exam.dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@exams_bp.route("/exams/<id>", methods=["DELETE"])
async def delete_exam(id):
    try:
        await prisma.connect()
        await prisma.exam.delete(where={"id": int(id)})
        return jsonify({"message": "Exam deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()