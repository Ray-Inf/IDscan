from flask import Blueprint, jsonify

performance_bp = Blueprint('performance', __name__)

@performance_bp.route('/performance', methods=['GET'])
def get_performance_data():
    # Mock data for performance chart
    data = [
        {"name": "Group A", "value": 92, "fill": "#C3EBFA"},
        {"name": "Group B", "value": 8, "fill": "#FAE27C"},
    ]
    return jsonify(data)