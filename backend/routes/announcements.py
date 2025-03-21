# from flask import Blueprint, jsonify, request
# from prisma import Prisma
# from datetime import datetime

# announcements_bp = Blueprint('announcements', __name__)
# prisma = Prisma()

# @announcements_bp.route('/announcements', methods=['GET'])
# async def get_announcements():
#     page = request.args.get('page', default=1, type=int)
#     search = request.args.get('search', default='', type=str)

#     await prisma.connect()
#     announcements = await prisma.announcement.find_many(
#         where={
#             "title": {"contains": search, "mode": "insensitive"}
#         },
#         skip=(page - 1) * 10,
#         take=10,
#         include={"class_": True}
#     )
#     count = await prisma.announcement.count(
#         where={
#             "title": {"contains": search, "mode": "insensitive"}
#         }
#     )
#     await prisma.disconnect()
#     return jsonify({"data": announcements, "count": count})

# @announcements_bp.route('/announcements/<id>', methods=['GET'])
# async def get_announcement(id):
#     await prisma.connect()
#     announcement = await prisma.announcement.find_unique(where={'id': int(id)})
#     await prisma.disconnect()
#     return jsonify(announcement)

# @announcements_bp.route('/announcements', methods=['POST'])
# async def create_announcement():
#     data = request.json
#     await prisma.connect()
#     announcement = await prisma.announcement.create(data=data)
#     await prisma.disconnect()
#     return jsonify(announcement)

# @announcements_bp.route('/announcements/<id>', methods=['PUT'])
# async def update_announcement(id):
#     data = request.json
#     await prisma.connect()
#     announcement = await prisma.announcement.update(where={'id': int(id)}, data=data)
#     await prisma.disconnect()
#     return jsonify(announcement)

# @announcements_bp.route('/announcements/<id>', methods=['DELETE'])
# async def delete_announcement(id):
#     await prisma.connect()
#     await prisma.announcement.delete(where={'id': int(id)})
#     await prisma.disconnect()
#     return jsonify({'message': 'Announcement deleted'})
from flask import Blueprint, jsonify, request
from prisma import Prisma
from datetime import datetime

announcements_bp = Blueprint('announcements', __name__)
prisma = Prisma()

# @announcements_bp.route('/announcements', methods=['GET'])
# async def get_announcements():
#     page = request.args.get('page', default=1, type=int)
#     search = request.args.get('search', default='', type=str)

#     await prisma.connect()
#     announcements = await prisma.announcement.find_many(
#         where={
#             "title": {"contains": search, "mode": "insensitive"}
#         },
#         skip=(page - 1) * 10,
#         take=10,
#         include={"class_": True}
#     )
#     count = await prisma.announcement.count(
#         where={
#             "title": {"contains": search, "mode": "insensitive"}
#         }
#     )
#     await prisma.disconnect()
#     return jsonify({"data": announcements, "count": count})
@announcements_bp.route('/announcements', methods=['GET'])
async def get_announcements():
    page = request.args.get('page', default=1, type=int)
    search = request.args.get('search', default='', type=str)

    await prisma.connect()
    announcements = await prisma.announcement.find_many(
        where={
            "title": {"contains": search}
        },
        skip=(page - 1) * 10,
        take=10,
        include={"class_": True}
    )
    count = await prisma.announcement.count(
    where={
        "title": {
            "contains": search # ✅ Correct approach
        }
    }
)

    await prisma.disconnect()
    # return jsonify({"data": announcements, "count": count})
    return jsonify({
    "data": [announcement.dict() for announcement in announcements],  # Convert each object to a dictionary
    "count": count
})


@announcements_bp.route('/announcements/<id>', methods=['GET'])
async def get_announcement(id):
    await prisma.connect()
    announcement = await prisma.announcement.find_unique(
        where={'id': int(id)},
        include={"class_": True}
    )
    await prisma.disconnect()
    return jsonify(announcement)

@announcements_bp.route('/announcements', methods=['POST'])
async def create_announcement():
    data = request.json
    await prisma.connect()
    announcement = await prisma.announcement.create(data=data)
    await prisma.disconnect()
    return jsonify(announcement)

@announcements_bp.route('/announcements/<id>', methods=['PUT'])
async def update_announcement(id):
    data = request.json
    await prisma.connect()
    announcement = await prisma.announcement.update(
        where={'id': int(id)},
        data=data
    )
    await prisma.disconnect()
    return jsonify(announcement)

@announcements_bp.route('/announcements/<id>', methods=['DELETE'])
async def delete_announcement(id):
    await prisma.connect()
    await prisma.announcement.delete(where={'id': int(id)})
    await prisma.disconnect()
    return jsonify({'message': 'Announcement deleted'})