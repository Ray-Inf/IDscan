from flask import Blueprint, request, jsonify, Response
import mysql.connector
from mysql.connector import Error
import logging
import csv
import io
from datetime import datetime
from database_setup import get_db_connection

library_bp = Blueprint('library', __name__)
logger = logging.getLogger(__name__)

@library_bp.route('/users', methods=['GET'])
def get_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute('''
            SELECT id, name, card_id, email, role, department
            FROM users
            ORDER BY name
        ''')
        
        users = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "users": users})
    except Error as e:
        logger.error(f"Error fetching users: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@library_bp.route('/books', methods=['GET'])
def get_books():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute('''
            SELECT id, title, author, isbn, status
            FROM books
        ''')
        
        books = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "books": books})
    except Error as e:
        logger.error(f"Error fetching books: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@library_bp.route('/library-logs', methods=['GET'])
def get_library_logs():
    try:
        card_id = request.args.get('card_id')
        book_id = request.args.get('book_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = '''
            SELECT l.id, u.id as user_id, u.name, u.card_id, 
                   l.book_id, b.title as book_title, 
                   l.login_time, l.logout_time
            FROM library_logs l
            JOIN users u ON l.card_id = u.card_id
            LEFT JOIN books b ON l.book_id = b.id
            WHERE 1=1
        '''
        params = []
        
        if card_id:
            query += " AND u.id = %s"
            params.append(card_id)
        
        if book_id:
            query += " AND l.book_id = %s"
            params.append(book_id)
        
        if start_date:
            query += " AND DATE(l.login_time) >= %s"
            params.append(start_date)
        
        if end_date:
            query += " AND DATE(l.login_time) <= %s"
            params.append(end_date)
        
        query += " ORDER BY l.login_time DESC"
        
        cursor.execute(query, params)
        logs = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "logs": logs})
    except Error as e:
        logger.error(f"Error fetching library logs: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@library_bp.route('/log-library-entry', methods=['POST'])
def log_library_entry():
    try:
        data = request.get_json()
        card_id = data.get('card_id')
        book_id = data.get('book_id')
        login_time = data.get('login_time')
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get card_id from user_id
        cursor.execute("SELECT card_id FROM users WHERE id = %s", (card_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        
        card_id = user['card_id']
        
        # Insert new log entry
        cursor.execute('''
            INSERT INTO library_logs (card_id, book_id, login_time)
            VALUES (%s, %s, %s)
        ''', (card_id, book_id, login_time))
        
        log_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "log_id": log_id})
    except Error as e:
        logger.error(f"Error logging library entry: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@library_bp.route('/log-library-exit/<int:log_id>', methods=['POST'])
def log_library_exit(log_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get current login time
        cursor.execute("SELECT login_time FROM library_logs WHERE id = %s", (log_id,))
        log = cursor.fetchone()
        if not log:
            return jsonify({"success": False, "error": "Log entry not found"}), 404
        
        # Calculate time spent
        login_time = datetime.strptime(log['login_time'], '%Y-%m-%d %H:%M:%S')
        logout_time = datetime.now()
        time_spent = int((logout_time - login_time).total_seconds() / 60)  # Time in minutes
        
        # Update log with logout time and time spent
        cursor.execute('''
            UPDATE library_logs 
            SET logout_time = %s, time_spent = %s 
            WHERE id = %s
        ''', (logout_time.strftime('%Y-%m-%d %H:%M:%S'), time_spent, log_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"success": True})
    except Error as e:
        logger.error(f"Error logging library exit: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@library_bp.route('/export-library-csv', methods=['GET'])
def export_library_csv():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = '''
            SELECT u.name, u.card_id, u.role, u.department,
                   b.title as book_title, b.isbn,
                   l.login_time, l.logout_time, l.time_spent
            FROM library_logs l
            JOIN users u ON l.card_id = u.card_id
            LEFT JOIN books b ON l.book_id = b.id
            WHERE 1=1
        '''
        params = []
        
        if start_date:
            query += " AND DATE(l.login_time) >= %s"
            params.append(start_date)
        
        if end_date:
            query += " AND DATE(l.login_time) <= %s"
            params.append(end_date)
        
        query += " ORDER BY l.login_time DESC"
        
        cursor.execute(query, params)
        logs = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Name', 'Card ID', 'Role', 'Department', 'Book', 'ISBN',
                         'Login Time', 'Logout Time', 'Time Spent (minutes)'])
        
        # Write data
        for log in logs:
            writer.writerow([
                log['name'],
                log['card_id'],
                log['role'],
                log['department'],
                log['book_title'] or 'No book',
                log['isbn'] or 'N/A',
                log['login_time'],
                log['logout_time'] or 'Still in library',
                log['time_spent'] or 'N/A'
            ])
        
        output.seek(0)
        
        # Return CSV file
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-disposition": f"attachment; filename=library_logs_{start_date}_to_{end_date}.csv"}
        )
    except Error as e:
        logger.error(f"Error exporting CSV: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500
