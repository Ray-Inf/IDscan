from flask import Blueprint, request, jsonify, Response
import logging
import csv
import io
from datetime import datetime
from prisma import Prisma

library_bp = Blueprint('library', __name__)
logger = logging.getLogger(__name__)
prisma = Prisma()

@library_bp.route('/library-users', methods=['GET'])
async def get_users():
    try:
        await prisma.connect()
        
        users = await prisma.user.find_many(order={"name": "asc"})
        
        await prisma.disconnect()
        
        return jsonify({"success": True, "users": [user.dict() for user in users]})
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@library_bp.route('/books', methods=['GET'])
async def get_books():
    try:
        await prisma.connect()
        
        books = await prisma.book.find_many()
        
        await prisma.disconnect()
        
        return jsonify({"success": True, "books": [book.dict() for book in books]})
    except Exception as e:
        logger.error(f"Error fetching books: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@library_bp.route('/library-logs', methods=['GET'])
async def get_library_logs():
    try:
        card_id = request.args.get('card_id')
        book_id = request.args.get('book_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        await prisma.connect()
        
        where_condition = {}
        if card_id:
            where_condition["cardId"] = card_id
        if book_id:
            where_condition["bookId"] = int(book_id)
        if start_date:
            where_condition["loginTime"] = {"gte": datetime.strptime(start_date, "%Y-%m-%d")}
        if end_date:
            where_condition["loginTime"] = {"lte": datetime.strptime(end_date, "%Y-%m-%d")}
        
        logs = await prisma.librarylog.find_many(
            where=where_condition,
            include={"user": True, "book": True},
            order={"loginTime": "desc"}
        )
        
        await prisma.disconnect()
        
        return jsonify({"success": True, "logs": [log.dict() for log in logs]})
    except Exception as e:
        logger.error(f"Error fetching library logs: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@library_bp.route('/log-library-entry', methods=['POST'])
async def log_library_entry():
    try:
        data = request.get_json()
        card_id = data.get('card_id')
        book_id = data.get('book_id')
        login_time = data.get('login_time')
        
        await prisma.connect()
        
        user = await prisma.user.find_unique(where={"cardId": card_id})
        if not user:
            await prisma.disconnect()
            return jsonify({"success": False, "error": "User not found"}), 404
        
        new_log = await prisma.librarylog.create(
            data={
                "cardId": card_id,
                "bookId": int(book_id) if book_id else None,
                "loginTime": login_time
            }
        )
        
        await prisma.disconnect()
        
        return jsonify({"success": True, "log_id": new_log.id})
    except Exception as e:
        logger.error(f"Error logging library entry: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@library_bp.route('/log-library-exit/<int:log_id>', methods=['POST'])
async def log_library_exit(log_id):
    try:
        await prisma.connect()
        
        log = await prisma.librarylog.find_unique(where={"id": log_id})
        if not log:
            await prisma.disconnect()
            return jsonify({"success": False, "error": "Log entry not found"}), 404
        
        login_time = log.loginTime
        logout_time = datetime.now()
        time_spent = int((logout_time - login_time).total_seconds() / 60)
        
        updated_log = await prisma.librarylog.update(
            where={"id": log_id},
            data={
                "logoutTime": logout_time,
                "timeSpent": time_spent
            }
        )
        
        await prisma.disconnect()
        
        return jsonify({"success": True})
    except Exception as e:
        logger.error(f"Error logging library exit: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@library_bp.route('/export-library-csv', methods=['GET'])
async def export_library_csv():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        await prisma.connect()
        
        where_condition = {}
        if start_date:
            where_condition["loginTime"] = {"gte": datetime.strptime(start_date, "%Y-%m-%d")}
        if end_date:
            where_condition["loginTime"] = {"lte": datetime.strptime(end_date, "%Y-%m-%d")}
        
        logs = await prisma.librarylog.find_many(
            where=where_condition,
            include={"user": True, "book": True},
            order={"loginTime": "desc"}
        )
        
        await prisma.disconnect()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(['Name', 'Card ID', 'Role', 'Department', 'Book', 'ISBN',
                         'Login Time', 'Logout Time', 'Time Spent (minutes)'])
        
        for log in logs:
            writer.writerow([
                log.user.name,
                log.cardId,
                log.user.role,
                log.user.department,
                log.book.title if log.book else 'No book',
                log.book.isbn if log.book else 'N/A',
                log.loginTime,
                log.logoutTime if log.logoutTime else 'Still in library',
                log.timeSpent if log.timeSpent else 'N/A'
            ])
        
        output.seek(0)
        
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-disposition": f"attachment; filename=library_logs_{start_date}_to_{end_date}.csv"}
        )
    except Exception as e:
        logger.error(f"Error exporting CSV: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500