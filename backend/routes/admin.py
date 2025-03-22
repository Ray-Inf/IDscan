from flask import Blueprint, jsonify

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin', methods=['GET'])
def get_admin_data():
    # Mock data for admin page
    data = {
        "userCards": [
            {"type": "admin", "count": 5},
            {"type": "teacher", "count": 20},
            {"type": "student", "count": 200},
            {"type": "parent", "count": 150},
        ],
        "countChart": {"boys": 100, "girls": 100},
        "attendanceChart": [
            {"name": "Mon", "present": 80, "absent": 20},
            {"name": "Tue", "present": 85, "absent": 15},
            {"name": "Wed", "present": 90, "absent": 10},
            {"name": "Thu", "present": 75, "absent": 25},
            {"name": "Fri", "present": 95, "absent": 5},
        ],
        "financeChart": [
            {"name": "Jan", "income": 4000, "expense": 2400},
            {"name": "Feb", "income": 3000, "expense": 1398},
            {"name": "Mar", "income": 2000, "expense": 9800},
            {"name": "Apr", "income": 2780, "expense": 3908},
            {"name": "May", "income": 1890, "expense": 4800},
            {"name": "Jun", "income": 2390, "expense": 3800},
            {"name": "Jul", "income": 3490, "expense": 4300},
            {"name": "Aug", "income": 3490, "expense": 4300},
            {"name": "Sep", "income": 3490, "expense": 4300},
            {"name": "Oct", "income": 3490, "expense": 4300},
            {"name": "Nov", "income": 3490, "expense": 4300},
            {"name": "Dec", "income": 3490, "expense": 4300},
        ],
        "events": [
            {"title": "Event 1", "date": "2024-01-01"},
            {"title": "Event 2", "date": "2024-02-01"},
        ],
        "announcements": [
            {"title": "Announcement 1", "date": "2024-01-01"},
            {"title": "Announcement 2", "date": "2024-02-01"},
        ],
    }
    return jsonify(data)