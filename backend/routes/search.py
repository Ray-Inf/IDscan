from flask import Blueprint, jsonify, request
from prisma import Prisma
import asyncio

search_bp = Blueprint('search', __name__)
prisma = Prisma()

# Ensure Prisma connects only once at startup
asyncio.run(prisma.connect())

@search_bp.route('/search', methods=['GET'])
async def search():
    query = request.args.get('query', default='', type=str).strip()
    if not query:
        return jsonify([])

    try:
        await prisma.connect()

        # Search for lessons, subjects, teachers, etc.
        lessons = await prisma.lesson.find_many(
            where={
                "OR": [
                    {"subject": {"name": {"contains": query}}},
                    {"teacher": {"name": {"contains": query}}},
                ]
            },
            include={"subject": True, "teacher": True},
        )

        formatted_results = [
            {
                "id": lesson.id,
                "name": lesson.subject.name if lesson.subject else "No Subject",
                "type": "lesson",
            }
            for lesson in lessons
        ]

        return jsonify(formatted_results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        await prisma.disconnect()