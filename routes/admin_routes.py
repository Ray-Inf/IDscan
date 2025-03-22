from flask import Blueprint, request, jsonify
from prisma import Prisma
import logging
from datetime import datetime

admin_bp = Blueprint('admin', __name__)
logger = logging.getLogger(__name__)
prisma = Prisma()

@admin_bp.route('/admin-users', methods=['GET'])
async def get_users():
    try:
        await prisma.connect()
        users = await prisma.user.find_many()
        await prisma.disconnect()
        return jsonify({"success": True, "users": [user.dict() for user in users]})
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/admin-users/<string:user_id>', methods=['DELETE'])
async def delete_user(user_id):
    try:
        await prisma.connect()
        user = await prisma.user.delete(where={'id': user_id})
        await prisma.disconnect()
        return jsonify({"success": True, "message": "User deleted successfully"})
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/templates', methods=['GET'])
async def get_templates():
    try:
        await prisma.connect()
        templates = await prisma.template.find_many()
        await prisma.disconnect()
        return jsonify({"success": True, "templates": [template.dict() for template in templates]})
    except Exception as e:
        logger.error(f"Error fetching templates: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/templates/<int:template_id>', methods=['DELETE'])
async def delete_template(template_id):
    try:
        await prisma.connect()
        template = await prisma.template.delete(where={'id': template_id})
        await prisma.disconnect()
        return jsonify({"success": True, "message": "Template deleted successfully"})
    except Exception as e:
        logger.error(f"Error deleting template: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@admin_bp.route('/monthly-report', methods=['GET'])
async def get_monthly_report():
    try:
        report_type = request.args.get('type')
        month = request.args.get('month', datetime.now().strftime('%Y-%m'))

        if not report_type:
            return jsonify({"success": False, "error": "Report type is required"}), 400

        await prisma.connect()
        if report_type == 'attendance':
            report_data = await prisma.facilityattendancelog.find_many(
                where={
                    "loginTime": {
                        "gte": f"{month}-01T00:00:00Z",
                        "lt": f"{month}-31T23:59:59Z"
                    }
                },
                include={"student": True}
            )
        elif report_type == 'library':
            report_data = await prisma.librarylog.find_many(
                where={
                    "loginTime": {
                        "gte": f"{month}-01T00:00:00Z",
                        "lt": f"{month}-31T23:59:59Z"
                    }
                },
                include={"student": True, "book": True}
            )
        elif report_type == 'gym':
            report_data = await prisma.gymlog.find_many(
                where={
                    "loginTime": {
                        "gte": f"{month}-01T00:00:00Z",
                        "lt": f"{month}-31T23:59:59Z"
                    }
                },
                include={"student": True}
            )
        elif report_type == 'class':
            report_data = await prisma.attendance.find_many(
                where={
                    "date": {
                        "gte": f"{month}-01T00:00:00Z",
                        "lt": f"{month}-31T23:59:59Z"
                    }
                },
                include={"student": True, "lesson": True}
            )
        else:
            return jsonify({"success": False, "error": "Invalid report type"}), 400

        await prisma.disconnect()
        return jsonify({
            "success": True,
            "reportType": report_type,
            "month": month,
            "data": [record.dict() for record in report_data]
        })
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500