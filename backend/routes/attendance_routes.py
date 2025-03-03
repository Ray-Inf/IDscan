import logging
from flask import Blueprint, request, jsonify, Response
from database_setup import get_db_connection
from datetime import datetime

# Create a logger
logger = logging.getLogger(__name__)

attendance_bp = Blueprint('attendance', __name__)

# Helper function to safely parse datetime values
def parse_datetime(datetime_str):
    """Parse datetime strings from various formats into MySQL-compatible format."""
    if not datetime_str:
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    try:
        # Try ISO 8601 format (from frontend)
        dt = datetime.strptime(datetime_str, "%Y-%m-%dT%H:%M:%S.%fZ")
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except ValueError:
        try:
            # Try ISO 8601 without milliseconds
            dt = datetime.strptime(datetime_str, "%Y-%m-%dT%H:%M:%SZ")
            return dt.strftime('%Y-%m-%d %H:%M:%S')
        except ValueError:
            try:
                # Try ISO 8601 without Z
                dt = datetime.strptime(datetime_str, "%Y-%m-%dT%H:%M:%S.%f")
                return dt.strftime('%Y-%m-%d %H:%M:%S')
            except ValueError:
                try:
                    # Try standard MySQL format
                    dt = datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S")
                    return dt.strftime('%Y-%m-%d %H:%M:%S')
                except ValueError:
                    # If all parsing attempts fail, log error and use current time
                    logger.error(f"Could not parse datetime: {datetime_str}")
                    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

@attendance_bp.route('/log-attendance', methods=['POST'])
def log_attendance():
    """Log attendance for a user."""
    card_id = request.form.get('card_id')
    status = request.form.get('status', 'present')

    if not card_id:
        return jsonify({"error": "Card ID is required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO attendance_logs (card_id, status) 
            VALUES (%s, %s)
        """, (card_id, status))
        conn.commit()

        return jsonify({"message": "Attendance logged successfully"})

    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    finally:
        if conn:
            conn.close()


@attendance_bp.route('/get-attendance-logs', methods=['GET'])
def get_attendance_logs():
    """Get attendance logs with optional filtering."""
    card_id = request.args.get('card_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    limit = request.args.get('limit')
    facility_id = request.args.get('facility_id')

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Change to use facility_attendance_logs
        query = """
            SELECT f.id, f.card_id, u.name, f.facility_id, 
                   f.login_time, f.logout_time,
                   l.book_id, g.activity_type
            FROM facility_attendance_logs f
            JOIN users u ON f.card_id = u.card_id
            LEFT JOIN library_logs l ON f.card_id = l.card_id AND DATE(f.login_time) = DATE(l.login_time)
            LEFT JOIN gym_logs g ON f.card_id = g.card_id AND DATE(f.login_time) = DATE(g.login_time)
            WHERE 1=1
        """
        params = []

        if card_id:
            query += " AND f.card_id = %s"
            params.append(card_id)

        if facility_id:
            query += " AND f.facility_id = %s"
            params.append(facility_id)

        if start_date:
            query += " AND f.login_time >= %s"
            params.append(start_date)

        if end_date:
            query += " AND f.login_time <= %s"
            params.append(end_date)
            
        query += " ORDER BY f.login_time DESC"
        
        if limit:
            query += " LIMIT %s"
            params.append(int(limit))

        cursor.execute(query, params)
        logs = cursor.fetchall()

        # Convert datetime objects to strings for JSON serialization
        for log in logs:
            for key, value in log.items():
                if isinstance(value, datetime):
                    log[key] = value.isoformat()

        return jsonify({"logs": logs})

    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    finally:
        if conn:
            conn.close()
            
@attendance_bp.route('/log-facility-attendance', methods=['POST'])
def log_facility_attendance():
    """Log facility attendance and update specific logs for library/gym."""
    card_id = request.form.get('card_id')
    facility_id = request.form.get('facility_id')
    login_time = parse_datetime(request.form.get('login_time'))
    book_id = request.form.get('book_id', None)  # Optional, only for library
    activity_type = request.form.get('activity_type', None)  # Optional, only for gym

    if not card_id or not facility_id:
        return jsonify({"error": "Card ID and Facility ID are required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert into facility_attendance_logs
        cursor.execute("""
            INSERT INTO facility_attendance_logs (card_id, facility_id, login_time)
            VALUES (%s, %s, %s)
        """, (card_id, facility_id, login_time))

        # Handle specific facility logs
        # Replace the specialized facility logs section with this improved version:
        if facility_id == 'library':
            try:
                if book_id:
                    cursor.execute("""
                        INSERT INTO library_logs (card_id, book_id, login_time)
                        VALUES (%s, %s, %s)
                    """, (card_id, book_id, login_time))
                else:
                    cursor.execute("""
                        INSERT INTO library_logs (card_id, login_time)
                        VALUES (%s, %s)
                    """, (card_id, login_time))
                logger.info(f"Library log created for card_id {card_id}")
            except Exception as e:
                logger.error(f"Error creating library log: {str(e)}")
                # Continue with the rest of the process even if this fails
                
        elif facility_id == 'gym':
            try:
                cursor.execute("""
                    INSERT INTO gym_logs (card_id, login_time, activity_type)
                    VALUES (%s, %s, %s)
                """, (card_id, login_time, activity_type or 'General'))
                logger.info(f"Gym log created for card_id {card_id}")
            except Exception as e:
                logger.error(f"Error creating gym log: {str(e)}")

        conn.commit()
        return jsonify({"message": "Facility attendance logged successfully"})

    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    finally:
        if conn:
            conn.close()

@attendance_bp.route('/get-monthly-attendance', methods=['GET'])
def get_monthly_attendance():
    card_id = request.args.get('card_id')
    month = request.args.get('month')  # Format: YYYY-MM
    facility_id = request.args.get('facility_id', None)

    if not card_id or not month:
        return jsonify({"error": "Missing required parameters (card_id and month)"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if facility attendance logs exist
        cursor.execute("""
            SHOW TABLES LIKE 'facility_attendance_logs'
        """)
        has_facility_table = cursor.fetchone() is not None

        if facility_id and has_facility_table:
            query = """
                SELECT * FROM facility_attendance_logs
                WHERE card_id = %s 
                AND facility_id = %s
                AND DATE_FORMAT(login_time, '%Y-%m') = %s
            """
            cursor.execute(query, (card_id, facility_id, month))
        else:
            # Fall back to regular attendance logs
            query = """
                SELECT * FROM attendance_logs
                WHERE card_id = %s
                AND DATE_FORMAT(timestamp, '%Y-%m') = %s
            """
            cursor.execute(query, (card_id, month))
            
        logs = cursor.fetchall()

        return jsonify({"logs": logs})

    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    finally:
        if conn:
            conn.close()

@attendance_bp.route('/export-attendance-csv', methods=['GET'])
def export_attendance_csv():
    facility_id = request.args.get('facility_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if not start_date or not end_date:
        return jsonify({"error": "Start date and end date are required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if facility attendance logs exist
        cursor.execute("""
            SHOW TABLES LIKE 'facility_attendance_logs'
        """)
        has_facility_table = cursor.fetchone() is not None

        if facility_id and facility_id != 'all' and has_facility_table:
            query = """
                SELECT u.name, f.card_id, f.login_time, f.logout_time, f.facility_id
                FROM facility_attendance_logs f
                JOIN users u ON f.card_id = u.card_id
                WHERE f.facility_id = %s AND f.login_time >= %s AND f.login_time <= %s
            """
            cursor.execute(query, (facility_id, start_date, end_date))
        elif has_facility_table:
            query = """
                SELECT u.name, f.card_id, f.login_time, f.logout_time, f.facility_id
                FROM facility_attendance_logs f
                JOIN users u ON f.card_id = u.card_id
                WHERE f.login_time >= %s AND f.login_time <= %s
            """
            cursor.execute(query, (start_date, end_date))
        else:
            # Fall back to regular attendance logs
            query = """
                SELECT u.name, a.card_id, a.timestamp as login_time, 
                       NULL as logout_time, 'general' as facility_id
                FROM attendance_logs a
                JOIN users u ON a.card_id = u.card_id
                WHERE a.timestamp >= %s AND a.timestamp <= %s
            """
            cursor.execute(query, (start_date, end_date))
            
        logs = cursor.fetchall()

        # Generate CSV
        csv_data = "Name,Card ID,Login Time,Logout Time,Facility\n"
        for log in logs:
            logout = log['logout_time'] if log['logout_time'] else 'N/A'
            csv_data += f"{log['name']},{log['card_id']},{log['login_time']},{logout},{log['facility_id']}\n"

        return Response(
            csv_data,
            mimetype="text/csv",
            headers={"Content-disposition": f"attachment; filename=attendance_{start_date}_to_{end_date}.csv"}
        )

    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    finally:
        if conn:
            conn.close()

@attendance_bp.route('/user-status', methods=['GET'])
def get_user_status():
    """Check if a user is currently checked in to a facility."""
    card_id = request.args.get('card_id')
    
    if not card_id:
        return jsonify({"error": "Card ID is required"}), 400
        
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # First check if we have the facility_attendance_logs table
        cursor.execute("""
            SHOW TABLES LIKE 'facility_attendance_logs'
        """)
        has_facility_table = cursor.fetchone() is not None
        
        if has_facility_table:
            # Look for active check-ins (where logout_time is NULL)
            cursor.execute("""
                SELECT * FROM facility_attendance_logs
                WHERE card_id = %s AND logout_time IS NULL
                ORDER BY login_time DESC LIMIT 1
            """, (card_id,))
            
            active_check_in = cursor.fetchone()
            
            if active_check_in:
                # Convert datetime objects to strings for JSON serialization
                for key, value in active_check_in.items():
                    if isinstance(value, datetime):
                        active_check_in[key] = value.isoformat()
                
                return jsonify({"active_check_in": active_check_in})
        
        # If no active check-in found
        return jsonify({"active_check_in": None})
            
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
        
    finally:
        if conn:
            conn.close()

@attendance_bp.route('/update-facility-attendance', methods=['POST'])
def update_facility_attendance():
    """Update facility attendance logs during check-out."""
    card_id = request.form.get('card_id')
    facility_id = request.form.get('facility_id')
    logout_time = parse_datetime(request.form.get('logout_time'))

    if not card_id or not facility_id:
        return jsonify({"error": "Card ID and Facility ID are required"}), 400

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Update facility_attendance_logs
        cursor.execute("""
            UPDATE facility_attendance_logs
            SET logout_time = %s
            WHERE card_id = %s AND facility_id = %s AND logout_time IS NULL
        """, (logout_time, card_id, facility_id))

        # Handle specific facility logs
        if facility_id == 'library':
            cursor.execute("""
                UPDATE library_logs
                SET logout_time = %s
                WHERE card_id = %s AND logout_time IS NULL
            """, (logout_time, card_id))
        elif facility_id == 'gym':
            cursor.execute("""
                UPDATE gym_logs
                SET logout_time = %s
                WHERE card_id = %s AND logout_time IS NULL
            """, (logout_time, card_id))

        conn.commit()
        return jsonify({"message": "Facility attendance updated successfully"})

    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    finally:
        if conn:
            conn.close()
@attendance_bp.route('/recent', methods=['GET'])
def get_recent_activity():
    """Get recent attendance logs for a user."""
    card_id = request.args.get('card_id')  # Changed from user_id to card_id
    limit = request.args.get('limit', 5)  # Default to 5 recent logs
    
    if not card_id:
        return jsonify({"error": "Card ID is required"}), 400
        
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Query recent logs from facility_attendance_logs
        # query = """
        #     SELECT f.id, f.card_id, f.facility_id, f.login_time, f.logout_time,
        #            l.book_id, g.activity_type, c.class_name
        #     FROM facility_attendance_logs f
        #     LEFT JOIN library_logs l ON f.card_id = l.card_id AND DATE(f.login_time) = DATE(l.login_time)
        #     LEFT JOIN gym_logs g ON f.card_id = g.card_id AND DATE(f.login_time) = DATE(g.login_time)
        #     LEFT JOIN classes c ON f.card_id = c.card_id AND DATE(f.login_time) = DATE(c.login_time)
        #     WHERE f.card_id = %s
        #     ORDER BY f.login_time DESC
        #     LIMIT %s
        # """
        query = """
    SELECT f.id, f.card_id, f.facility_id, f.login_time, f.logout_time,
           l.book_id, g.activity_type, c.class_name
    FROM facility_attendance_logs f
    LEFT JOIN library_logs l 
        ON f.card_id = l.card_id AND DATE(f.login_time) = DATE(l.login_time)
    LEFT JOIN gym_logs g 
        ON f.card_id = g.card_id AND DATE(f.login_time) = DATE(g.login_time)
    LEFT JOIN class_attendance ca 
        ON f.card_id = ca.card_id AND DATE(f.login_time) = ca.date
    LEFT JOIN classes c 
        ON ca.class_id = c.id
    WHERE f.card_id = %s
    ORDER BY f.login_time DESC
    LIMIT %s;
"""
        
        cursor.execute(query, (card_id, int(limit)))
        logs = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for log in logs:
            for key, value in log.items():
                if isinstance(value, datetime):
                    log[key] = value.isoformat()
        
        return jsonify({"logs": logs})
            
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
        
    finally:
        if conn:
            conn.close()