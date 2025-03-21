from flask import Blueprint, jsonify, request
from prisma import Prisma
import asyncio

grades_bp = Blueprint("grades", __name__)
prisma = Prisma()

# Ensure Prisma connects only once at startup
asyncio.run(prisma.connect())

def serialize_grades(grades):
    """Convert Prisma ORM objects to JSON-serializable dictionaries."""
    return [grade.dict() for grade in grades]

@grades_bp.route("/grades", methods=["GET"])
async def get_grades():
    try:
        await prisma.connect()
        grades = await prisma.grade.find_many()
        return jsonify({"data": serialize_grades(grades)})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        await prisma.disconnect()

@grades_bp.route("/grades/<id>", methods=["GET"])
async def get_grade(id):
    try:
        await prisma.connect()
        grade = await prisma.grade.find_unique(where={"id": int(id)})
        
        if not grade:
            return jsonify({"error": "Grade not found"}), 404
        
        return jsonify(grade.dict())
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        await prisma.disconnect()

@grades_bp.route("/grades", methods=["POST"])
async def create_grade():
    try:
        data = request.json
        await prisma.connect()
        grade = await prisma.grade.create(data=data)
        return jsonify(grade.dict()), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        await prisma.disconnect()

@grades_bp.route("/grades/<id>", methods=["PUT"])
async def update_grade(id):
    try:
        data = request.json
        await prisma.connect()
        grade = await prisma.grade.update(where={"id": int(id)}, data=data)
        
        if not grade:
            return jsonify({"error": "Grade not found"}), 404
        
        return jsonify(grade.dict())
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        await prisma.disconnect()

@grades_bp.route("/grades/<id>", methods=["DELETE"])
async def delete_grade(id):
    try:
        await prisma.connect()
        await prisma.grade.delete(where={"id": int(id)})
        return jsonify({"message": "Grade deleted"})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        await prisma.disconnect()

@grades_bp.route("/grades/<int:id>", methods=["DELETE"])
def delete_grade_api(id):
    try:
        prisma.grade.delete(where={"id": id})
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500