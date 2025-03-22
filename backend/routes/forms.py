from flask import Blueprint, jsonify, request

forms_bp = Blueprint('forms', __name__)

@forms_bp.route('/forms/class', methods=['POST'])
def create_or_update_class():
    data = request.json
    # Mock response
    return jsonify({"success": True, "data": data})

@forms_bp.route('/forms/exam', methods=['POST'])
def create_or_update_exam():
    data = request.json
    # Mock response
    return jsonify({"success": True, "data": data})

@forms_bp.route('/forms/student', methods=['POST'])
def create_or_update_student():
    data = request.json
    # Mock response
    return jsonify({"success": True, "data": data})

@forms_bp.route('/forms/subject', methods=['POST'])
def create_or_update_subject():
    data = request.json
    # Mock response
    return jsonify({"success": True, "data": data})

@forms_bp.route('/forms/teacher', methods=['POST'])
def create_or_update_teacher():
    data = request.json
    # Mock response
    return jsonify({"success": True, "data": data})