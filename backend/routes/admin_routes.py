from flask import Blueprint, request, jsonify
import sqlite3
import logging
from datetime import datetime

admin_bp = Blueprint('admin', __name__)
logger = logging.getLogger(__name__)

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

@admin_bp.route('/users', methods=['GET'])
def get_users():
    try:
        conn = sqlite3.connect('attendance_system.db')
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM users
        ''')
        
        users = cursor.fetchall()
        conn.close()
        
        return jsonify({"success": True, "users": users})
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        conn = sqlite3.connect('attendance_system.db')
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"success": False, "error": "User not found"}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True})
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/templates', methods=['GET'])
def get_templates():
    try:
        conn = sqlite3.connect('attendance_system.db')
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM id_templates
        ''')
        
        templates = cursor.fetchall()
        conn.close()
        
        return jsonify({"success": True, "templates": templates})
    except Exception as e:
        logger.error(f"Error fetching templates: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/templates/<int:template_id>', methods=['DELETE'])
def delete_template(template_id):
    try:
        conn = sqlite3.connect('attendance_system.db')
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM id_templates WHERE id = ?', (template_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"success": False, "error": "Template not found"}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True})
    except Exception as e:
        logger.error(f"Error deleting template: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/monthly-report', methods=['GET'])
def get_monthly_report():
    try:
        report_type = request.args.get('type')
        month = request.args.get('month', datetime.now().strftime('%Y-%m'))
        
        if not report_type:
            return jsonify({"success": False, "error": "Report type is required"}), 400
        
        conn = sqlite3.connect('attendance_system.db')
        conn.row_factory = dict_factory
        cursor = conn.cursor()
        
        # Different queries based on report type
        if report_type == 'attendance':
            cursor.execute('''
                SELECT u.name, u.card_id, a.facility_id, 
                       COUNT(a.id) as visit_count,
                       SUM(CASE WHEN a.logout_time IS NOT NULL 
                           THEN (julianday(a.logout_time) - julianday(a.login_time))*24 
                           ELSE 0 END) as total_hours
                FROM attendance_logs a
                JOIN users u ON a.user_id = u.id
                WHERE strftime('%Y-%m', a.login_time) = ?
                GROUP BY u.id, a.facility_id
                ORDER BY u.name
            ''', (month,))
        elif report_type == 'library':
            cursor.execute('''
                SELECT u.name, u.card_id, 
                       COUNT(a.id) as visit_count,
                       SUM(CASE WHEN a.logout_time IS NOT NULL 
                           THEN (julianday(a.logout_time) - julianday(a.login_time))*24 
                           ELSE 0 END) as total_hours,
                       COUNT(DISTINCT a.book_id) as unique_books_read
                FROM attendance_logs a
                JOIN users u ON a.user_id = u.id
                WHERE a.facility_id = 'library'
                AND strftime('%Y-%m', a.login_time) = ?
                GROUP BY u.id
                ORDER BY visit_count DESC
            ''', (month,))
        elif report_type == 'gym':
            cursor.execute('''
                SELECT u.name, u.card_id, a.activity_type,
                       COUNT(a.id) as visit_count,
                       SUM(CASE WHEN a.logout_time IS NOT NULL 
                           THEN (julianday(a.logout_time) - julianday(a.login_time))*24 
                           ELSE 0 END) as total_hours
                FROM attendance_logs a
                JOIN users u ON a.user_id = u.id
                WHERE a.facility_id = 'gym'
                AND strftime('%Y-%m', a.login_time) = ?
                GROUP BY u.id, a.activity_type
                ORDER BY u.name
            ''', (month,))
        elif report_type == 'class':
            cursor.execute('''
                SELECT u.name, u.card_id, a.subject,
                       COUNT(a.id) as attendance_count
                FROM attendance_logs a
                JOIN users u ON a.user_id = u.id
                WHERE a.facility_id = 'class'
                AND strftime('%Y-%m', a.login_time) = ?
                GROUP BY u.id, a.subject
                ORDER BY u.name
            ''', (month,))
        else:
            conn.close()
            return jsonify({"success": False, "error": "Invalid report type"}), 400
        
        report_data = cursor.fetchall()
        conn.close()
        
        return jsonify({
            "success": True, 
            "reportType": report_type,
            "month": month,
            "data": report_data
        })
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500