
from flask import Blueprint, jsonify, request
from prisma import Prisma

subjects_bp = Blueprint("subjects", __name__)
prisma = Prisma()

def serialize_subjects(subjects):
    return [subject.dict() for subject in subjects]

@subjects_bp.route("/subjects", methods=["GET"])
async def get_subjects():
    try:
        page = int(request.args.get("page", 1))
        search = request.args.get("search", "")

        await prisma.connect()
        query = {}
        if search:
            query["name"] = {"contains": search}

        subjects = await prisma.subject.find_many(
            where=query,
            skip=(page - 1) * 10,
            take=10,
            include={"teachers": True},
        )
        count = await prisma.subject.count(where=query)

        return jsonify({"data": serialize_subjects(subjects), "count": count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@subjects_bp.route("/subjects/<id>", methods=["GET"])
async def get_subject(id):
    try:
        await prisma.connect()
        subject = await prisma.subject.find_unique(
            where={"id": int(id)},
            include={"teachers": True},
        )
        if not subject:
            return jsonify({"error": "Subject not found"}), 404
        return jsonify(subject.dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@subjects_bp.route("/subjects", methods=["POST"])
async def create_subject():
    try:
        data = request.json
        await prisma.connect()
        subject = await prisma.subject.create(data=data)
        return jsonify(subject.dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@subjects_bp.route("/subjects/<id>", methods=["PUT"])
async def update_subject(id):
    try:
        data = request.json
        await prisma.connect()
        subject = await prisma.subject.update(where={"id": int(id)}, data=data)
        return jsonify(subject.dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@subjects_bp.route("/subjects/<id>", methods=["DELETE"])
async def delete_subject(id):
    try:
        await prisma.connect()
        await prisma.subject.delete(where={"id": int(id)})
        return jsonify({"message": "Subject deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()