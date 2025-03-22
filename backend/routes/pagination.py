from flask import Blueprint, jsonify, request

pagination_bp = Blueprint('pagination', __name__)

@pagination_bp.route('/pagination', methods=['GET'])
def get_pagination():
    page = max(request.args.get('page', default=1, type=int), 1)  # Ensure page is at least 1
    count = max(request.args.get('count', default=0, type=int), 0)  # Ensure count is non-negative
    items_per_page = 10

    has_prev = page > 1  # There is a previous page if current page > 1
    has_next = (page * items_per_page) < count  # Next page exists if there are more items

    return jsonify({
        "has_prev": has_prev,
        "has_next": has_next,
        "page": page,
        "total_items": count,
        "total_pages": (count // items_per_page) + (1 if count % items_per_page > 0 else 0),
    })