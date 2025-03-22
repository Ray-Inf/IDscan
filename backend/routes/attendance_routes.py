# from flask import Blueprint, request, jsonify, Response
# from prisma import Prisma
# import logging
# from datetime import datetime

# attendance_bp = Blueprint('attendance', __name__)
# logger = logging.getLogger(__name__)
# prisma = Prisma()

# @attendance_bp.route('/log-attendance', methods=['POST'])
# async def log_attendance():
#     try:
#         data = request.json
#         card_id = data.get('card_id')
#         status = data.get('status', 'present')

#         if not card_id:
#             return jsonify({"error": "Card ID is required"}), 400

#         await prisma.connect()
#         student = await prisma.student.find_unique(where={'cardId': card_id})
#         if not student:
#             return jsonify({"error": "Student not found"}), 404

#         await prisma.attendance.create(data={
#             "studentId": student.id,
#             "lessonId": None,
#             "date": datetime.now(),
#             "present": status == 'present'
#         })
#         await prisma.disconnect()

#         return jsonify({"message": "Attendance logged successfully"})
#     except Exception as e:
#         logger.error(f"Error logging attendance: {str(e)}")
#         return jsonify({"error": f"Database error: {str(e)}"}), 500

# @attendance_bp.route('/get-attendance-logs', methods=['GET'])
# async def get_attendance_logs():
#     try:
#         card_id = request.args.get('card_id')
#         start_date = request.args.get('start_date')
#         end_date = request.args.get('end_date')
#         limit = request.args.get('limit', default=10, type=int)

#         await prisma.connect()
#         where_clause = {}
#         if card_id:
#             where_clause["studentId"] = card_id
#         if start_date and end_date:
#             where_clause["date"] = {
#                 "gte": datetime.fromisoformat(start_date),
#                 "lte": datetime.fromisoformat(end_date)
#             }

#         logs = await prisma.attendance.find_many(
#             where=where_clause,
#             take=limit,
#             include={"student": True}
#         )
#         await prisma.disconnect()

#         return jsonify({"logs": [log.dict() for log in logs]})
#     except Exception as e:
#         logger.error(f"Error fetching attendance logs: {str(e)}")
#         return jsonify({"error": f"Database error: {str(e)}"}), 500

# @attendance_bp.route('/log-facility-attendance', methods=['POST'])
# async def log_facility_attendance():
#     try:
#         data = request.json
#         card_id = data.get('card_id')
#         facility_id = data.get('facility_id')
#         login_time = data.get('login_time', datetime.now())
#         book_id = data.get('book_id')
#         activity_type = data.get('activity_type')

#         if not card_id or not facility_id:
#             return jsonify({"error": "Card ID and Facility ID are required"}), 400

#         await prisma.connect()
#         student = await prisma.student.find_unique(where={'cardId': card_id})
#         if not student:
#             return jsonify({"error": "Student not found"}), 404

#         # Log facility attendance
#         facility_log = await prisma.facilityattendancelog.create(data={
#             "cardId": card_id,
#             "facilityId": facility_id,
#             "loginTime": login_time,
#             "student": {"connect": {"id": student.id}}
#         })

#         # Handle specific facility logs
#         if facility_id == 'library':
#             await prisma.librarylog.create(data={
#                 "cardId": card_id,
#                 "bookId": book_id,
#                 "loginTime": login_time,
#                 "student": {"connect": {"id": student.id}}
#             })
#         elif facility_id == 'gym':
#             await prisma.gymlog.create(data={
#                 "cardId": card_id,
#                 "loginTime": login_time,
#                 "activityType": activity_type,
#                 "student": {"connect": {"id": student.id}}
#             })

#         await prisma.disconnect()
#         return jsonify({"message": "Facility attendance logged successfully", "log": facility_log.dict()})
#     except Exception as e:
#         logger.error(f"Error logging facility attendance: {str(e)}")
#         return jsonify({"error": f"Database error: {str(e)}"}), 500

# @attendance_bp.route('/get-monthly-attendance', methods=['GET'])
# async def get_monthly_attendance():
#     try:
#         card_id = request.args.get('card_id')
#         month = request.args.get('month')  # Format: YYYY-MM
#         facility_id = request.args.get('facility_id')

#         if not card_id or not month:
#             return jsonify({"error": "Missing required parameters (card_id and month)"}), 400

#         await prisma.connect()
#         where_clause = {
#             "cardId": card_id,
#             "loginTime": {
#                 "gte": f"{month}-01T00:00:00Z",
#                 "lt": f"{month}-31T23:59:59Z"
#             }
#         }
#         if facility_id:
#             where_clause["facilityId"] = facility_id

#         logs = await prisma.facilityattendancelog.find_many(
#             where=where_clause,
#             include={"student": True}
#         )
#         await prisma.disconnect()

#         return jsonify({"logs": [log.dict() for log in logs]})
#     except Exception as e:
#         logger.error(f"Error fetching monthly attendance: {str(e)}")
#         return jsonify({"error": f"Database error: {str(e)}"}), 500

# @attendance_bp.route('/export-attendance-csv', methods=['GET'])
# async def export_attendance_csv():
#     try:
#         facility_id = request.args.get('facility_id')
#         start_date = request.args.get('start_date')
#         end_date = request.args.get('end_date')

#         if not start_date or not end_date:
#             return jsonify({"error": "Start date and end date are required"}), 400

#         await prisma.connect()
#         where_clause = {
#             "loginTime": {
#                 "gte": start_date,
#                 "lte": end_date
#             }
#         }
#         if facility_id and facility_id != 'all':
#             where_clause["facilityId"] = facility_id

#         logs = await prisma.facilityattendancelog.find_many(
#             where=where_clause,
#             include={"student": True}
#         )
#         await prisma.disconnect()

#         # Generate CSV
#         csv_data = "Name,Card ID,Login Time,Logout Time,Facility\n"
#         for log in logs:
#             csv_data += f"{log.student.name},{log.cardId},{log.loginTime},{log.logoutTime or 'N/A'},{log.facilityId}\n"

#         return Response(
#             csv_data,
#             mimetype="text/csv",
#             headers={"Content-disposition": f"attachment; filename=attendance_{start_date}_to_{end_date}.csv"}
#         )
#     except Exception as e:
#         logger.error(f"Error exporting CSV: {str(e)}")
#         return jsonify({"error": f"Database error: {str(e)}"}), 500

# @attendance_bp.route('/user-status', methods=['GET'])
# async def get_user_status():
#     try:
#         card_id = request.args.get('card_id')
#         if not card_id:
#             return jsonify({"error": "Card ID is required"}), 400

#         await prisma.connect()
#         active_check_in = await prisma.facilityattendancelog.find_first(
#             where={
#                 "cardId": card_id,
#                 "logoutTime": None
#             },
#             order={"loginTime": "desc"}
#         )
#         await prisma.disconnect()

#         if active_check_in:
#             return jsonify({"active_check_in": active_check_in.dict()})
#         else:
#             return jsonify({"active_check_in": None})
#     except Exception as e:
#         logger.error(f"Error fetching user status: {str(e)}")
#         return jsonify({"error": f"Database error: {str(e)}"}), 500

# @attendance_bp.route('/update-facility-attendance', methods=['POST'])
# async def update_facility_attendance():
#     try:
#         data = request.json
#         card_id = data.get('card_id')
#         facility_id = data.get('facility_id')
#         logout_time = data.get('logout_time', datetime.now())

#         if not card_id or not facility_id:
#             return jsonify({"error": "Card ID and Facility ID are required"}), 400

#         await prisma.connect()
#         await prisma.facilityattendancelog.update_many(
#             where={
#                 "cardId": card_id,
#                 "facilityId": facility_id,
#                 "logoutTime": None
#             },
#             data={"logoutTime": logout_time}
#         )

#         if facility_id == 'library':
#             await prisma.librarylog.update_many(
#                 where={
#                     "cardId": card_id,
#                     "logoutTime": None
#                 },
#                 data={"logoutTime": logout_time}
#             )
#         elif facility_id == 'gym':
#             await prisma.gymlog.update_many(
#                 where={
#                     "cardId": card_id,
#                     "logoutTime": None
#                 },
#                 data={"logoutTime": logout_time}
#             )

#         await prisma.disconnect()
#         return jsonify({"message": "Facility attendance updated successfully"})
#     except Exception as e:
#         logger.error(f"Error updating facility attendance: {str(e)}")
#         return jsonify({"error": f"Database error: {str(e)}"}), 500

# @attendance_bp.route('/recent', methods=['GET'])
# async def get_recent_activity():
#     try:
#         card_id = request.args.get('card_id')
#         limit = request.args.get('limit', default=5, type=int)

#         if not card_id:
#             return jsonify({"error": "Card ID is required"}), 400

#         await prisma.connect()
#         logs = await prisma.facilityattendancelog.find_many(
#             where={"cardId": card_id},
#             take=limit,
#             order={"loginTime": "desc"},
#             include={"student": True}
#         )
#         await prisma.disconnect()

#         return jsonify({"logs": [log.dict() for log in logs]})
#     except Exception as e:
#         logger.error(f"Error fetching recent activity: {str(e)}")
#         return jsonify({"error": f"Database error: {str(e)}"}), 500
from flask import Blueprint, request, jsonify, Response
from prisma import Prisma
from datetime import datetime
import logging

# Create a logger
logger = logging.getLogger(__name__)

attendance_bp = Blueprint('attendance', __name__)
prisma = Prisma()

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
async def log_attendance():
    """Log attendance for a user."""
    card_id = request.form.get('card_id')
    status = request.form.get('status', 'present')

    if not card_id:
        return jsonify({"error": "Card ID is required"}), 400

    try:
        await prisma.connect()
        await prisma.attendance.create({
            "date": datetime.now(),
            "present": status == 'present',
            "student": {"connect": {"cardId": card_id}}
        })
        return jsonify({"message": "Attendance logged successfully"})
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@attendance_bp.route('/get-attendance-logs', methods=['GET'])
async def get_attendance_logs():
    """Get attendance logs with optional filtering."""
    card_id = request.args.get('card_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    limit = request.args.get('limit')
    facility_id = request.args.get('facility_id')

    try:
        await prisma.connect()
        query = {
            "where": {
                "student": {"cardId": card_id} if card_id else None,
                "date": {
                    "gte": datetime.fromisoformat(start_date) if start_date else None,
                    "lte": datetime.fromisoformat(end_date) if end_date else None
                }
            },
            "take": int(limit) if limit else None,
            "order_by": {"date": "desc"}
        }
        logs = await prisma.attendance.find_many(**query)
        return jsonify({"logs": [log.dict() for log in logs]})
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@attendance_bp.route('/log-facility-attendance', methods=['POST'])
async def log_facility_attendance():
    """Log facility attendance and update specific logs for library/gym."""
    card_id = request.form.get('card_id')
    facility_id = request.form.get('facility_id')
    login_time = parse_datetime(request.form.get('login_time'))
    book_id = request.form.get('book_id', None)  # Optional, only for library
    activity_type = request.form.get('activity_type', None)  # Optional, only for gym

    if not card_id or not facility_id:
        return jsonify({"error": "Card ID and Facility ID are required"}), 400

    try:
        await prisma.connect()
        facility_log = await prisma.facilityattendancelog.create({
            "cardId": card_id,
            "facilityId": facility_id,
            "loginTime": login_time,
            "student": {"connect": {"cardId": card_id}}
        })

        if facility_id == 'library':
            await prisma.librarylog.create({
                "cardId": card_id,
                "bookId": int(book_id) if book_id else None,
                "loginTime": login_time,
                "student": {"connect": {"cardId": card_id}}
            })
        elif facility_id == 'gym':
            await prisma.gymlog.create({
                "cardId": card_id,
                "loginTime": login_time,
                "activityType": activity_type or 'General',
                "student": {"connect": {"cardId": card_id}}
            })

        return jsonify({"message": "Facility attendance logged successfully"})
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@attendance_bp.route('/get-monthly-attendance', methods=['GET'])
async def get_monthly_attendance():
    card_id = request.args.get('card_id')
    month = request.args.get('month')  # Format: YYYY-MM
    facility_id = request.args.get('facility_id', None)

    if not card_id or not month:
        return jsonify({"error": "Missing required parameters (card_id and month)"}), 400

    try:
        await prisma.connect()
        query = {
            "where": {
                "cardId": card_id,
                "loginTime": {
                    "gte": datetime.strptime(month, "%Y-%m"),
                    "lt": datetime.strptime(month, "%Y-%m").replace(month=datetime.strptime(month, "%Y-%m").month + 1)
                }
            }
        }
        if facility_id:
            query["where"]["facilityId"] = facility_id

        logs = await prisma.facilityattendancelog.find_many(**query)
        return jsonify({"logs": [log.dict() for log in logs]})
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@attendance_bp.route('/export-attendance-csv', methods=['GET'])
async def export_attendance_csv():
    facility_id = request.args.get('facility_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if not start_date or not end_date:
        return jsonify({"error": "Start date and end date are required"}), 400

    try:
        await prisma.connect()
        query = {
            "where": {
                "loginTime": {
                    "gte": datetime.fromisoformat(start_date),
                    "lte": datetime.fromisoformat(end_date)
                }
            },
            "include": {"student": True}
        }
        if facility_id and facility_id != 'all':
            query["where"]["facilityId"] = facility_id

        logs = await prisma.facilityattendancelog.find_many(**query)
        csv_data = "Name,Card ID,Login Time,Logout Time,Facility\n"
        for log in logs:
            logout = log.logoutTime if log.logoutTime else 'N/A'
            csv_data += f"{log.student.name},{log.cardId},{log.loginTime},{logout},{log.facilityId}\n"

        return Response(
            csv_data,
            mimetype="text/csv",
            headers={"Content-disposition": f"attachment; filename=attendance_{start_date}_to_{end_date}.csv"}
        )
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@attendance_bp.route('/user-status', methods=['GET'])
async def get_user_status():
    """Check if a user is currently checked in to a facility."""
    card_id = request.args.get('card_id')
    
    if not card_id:
        return jsonify({"error": "Card ID is required"}), 400
        
    try:
        await prisma.connect()
        active_check_in = await prisma.facilityattendancelog.find_first({
            "where": {
                "cardId": card_id,
                "logoutTime": None
            },
            "order_by": {"loginTime": "desc"}
        })
        
        if active_check_in:
            return jsonify({"active_check_in": active_check_in.dict()})
        else:
            return jsonify({"active_check_in": None})
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@attendance_bp.route('/update-facility-attendance', methods=['POST'])
async def update_facility_attendance():
    """Update facility attendance logs during check-out."""
    card_id = request.form.get('card_id')
    facility_id = request.form.get('facility_id')
    logout_time = parse_datetime(request.form.get('logout_time'))

    if not card_id or not facility_id:
        return jsonify({"error": "Card ID and Facility ID are required"}), 400

    try:
        await prisma.connect()
        await prisma.facilityattendancelog.update_many({
            "where": {
                "cardId": card_id,
                "facilityId": facility_id,
                "logoutTime": None
            },
            "data": {"logoutTime": logout_time}
        })

        if facility_id == 'library':
            await prisma.librarylog.update_many({
                "where": {
                    "cardId": card_id,
                    "logoutTime": None
                },
                "data": {"logoutTime": logout_time}
            })
        elif facility_id == 'gym':
            await prisma.gymlog.update_many({
                "where": {
                    "cardId": card_id,
                    "logoutTime": None
                },
                "data": {"logoutTime": logout_time}
            })

        return jsonify({"message": "Facility attendance updated successfully"})
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@attendance_bp.route('/recent', methods=['GET'])
async def get_recent_activity():
    """Get recent attendance logs for a user."""
    card_id = request.args.get('card_id')  # Changed from user_id to card_id
    limit = request.args.get('limit', 5)  # Default to 5 recent logs
    
    if not card_id:
        return jsonify({"error": "Card ID is required"}), 400
        
    try:
        await prisma.connect()
        logs = await prisma.facilityattendancelog.find_many({
            "where": {"cardId": card_id},
            "order_by": {"loginTime": "desc"},
            "take": int(limit),
            "include": {"student": True}
        })
        
        return jsonify({"logs": [log.dict() for log in logs]})
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if prisma.is_connected():
            await prisma.disconnect()