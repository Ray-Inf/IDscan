
from flask import Blueprint, jsonify, request
from prisma import Prisma

classes_bp = Blueprint("classes", __name__)
prisma = Prisma()

def serialize_classes(classes):
    return [cls.dict() for cls in classes]

@classes_bp.route("/classes", methods=["GET"])
async def get_classes():
    try:
        page = int(request.args.get("page", 1))
        search = request.args.get("search", "")

        await prisma.connect()
        query = {}
        if search:
            query["name"] = {"contains": search}

        classes = await prisma.class_.find_many(
            where=query,
            skip=(page - 1) * 10,
            take=10,
            include={"supervisor": True},
        )
        count = await prisma.class_.count(where=query)

        return jsonify({"data": serialize_classes(classes), "count": count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@classes_bp.route("/classes/<id>", methods=["GET"])
async def get_class(id):
    try:
        await prisma.connect()
        class_item = await prisma.class_.find_unique(
            where={"id": int(id)},
            include={"supervisor": True},
        )
        if not class_item:
            return jsonify({"error": "Class not found"}), 404
        return jsonify(class_item.dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@classes_bp.route("/classes", methods=["POST"])
async def create_class():
    try:
        data = request.json
        await prisma.connect()
        class_item = await prisma.class_.create(data=data)
        return jsonify(class_item.dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@classes_bp.route("/classes/<id>", methods=["PUT"])
async def update_class(id):
    try:
        data = request.json
        await prisma.connect()
        class_item = await prisma.class_.update(where={"id": int(id)}, data=data)
        return jsonify(class_item.dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@classes_bp.route("/classes/<id>", methods=["DELETE"])
async def delete_class(id):
    try:
        await prisma.connect()
        await prisma.class_.delete(where={"id": int(id)})
        return jsonify({"message": "Class deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()