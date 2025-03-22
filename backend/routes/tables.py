from flask import Blueprint, jsonify, request
from prisma import Prisma
import asyncio

table_bp = Blueprint("tables", __name__)
prisma = Prisma()

# Ensure Prisma connects only once at startup
asyncio.run(prisma.connect())

# Helper function to serialize Prisma ORM objects
def serialize_data(data):
    if isinstance(data, list):
        return [item.dict() for item in data]
    return data.dict() if data else None

# Generic route for CRUD operations
@table_bp.route("/<table>s", methods=["GET", "POST"])
@table_bp.route("/<table>s/<id>", methods=["GET", "PUT", "DELETE"])
async def handle_table_operations(table, id=None):
    try:
        await prisma.connect()

        # GET all records
        if request.method == "GET" and not id:
            page = request.args.get("page", default=1, type=int)
            search = request.args.get("search", default="", type=str)

            # Dynamically call the Prisma model's find_many method
            records = await getattr(prisma, table).find_many(
                where={"name": {"contains": search}},
                skip=(page - 1) * 10,
                take=10,
            )
            count = await getattr(prisma, table).count(
                where={"name": {"contains": search}}
            )
            await prisma.disconnect()
            return jsonify({"data": serialize_data(records), "count": count})

        # GET a single record by ID
        elif request.method == "GET" and id:
            record = await getattr(prisma, table).find_unique(where={"id": int(id)})
            await prisma.disconnect()
            if not record:
                return jsonify({"error": f"{table.capitalize()} not found"}), 404
            return jsonify(serialize_data(record))

        # CREATE a new record
        elif request.method == "POST":
            data = request.json
            record = await getattr(prisma, table).create(data=data)
            await prisma.disconnect()
            return jsonify(serialize_data(record)), 201  # 201 = Created

        # UPDATE a record by ID
        elif request.method == "PUT" and id:
            data = request.json
            record = await getattr(prisma, table).update(where={"id": int(id)}, data=data)
            await prisma.disconnect()
            if not record:
                return jsonify({"error": f"{table.capitalize()} not found"}), 404
            return jsonify(serialize_data(record))

        # DELETE a record by ID
        elif request.method == "DELETE" and id:
            record = await getattr(prisma, table).find_unique(where={"id": int(id)})
            if not record:
                await prisma.disconnect()
                return jsonify({"error": f"{table.capitalize()} not found"}), 404
            await getattr(prisma, table).delete(where={"id": int(id)})
            await prisma.disconnect()
            return jsonify({"message": f"{table.capitalize()} deleted"})

    except Exception as e:
        print(f"Error in /api/{table}s: {str(e)}")
        await prisma.disconnect()
        return jsonify({"error": "Internal Server Error"}), 500