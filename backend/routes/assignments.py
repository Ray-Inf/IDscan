from flask import Blueprint, jsonify, request
from prisma import Prisma

assignments_bp = Blueprint('assignments', __name__)
prisma = Prisma()

def serialize_assignments(assignments):
    """Convert Prisma ORM objects to JSON-serializable dictionaries."""
    result = []
    for assignment in assignments:
        # Create a copy of the assignment dict
        assignment_dict = assignment.dict()
        
        # Ensure the lesson object exists and is properly structured
        if assignment_dict.get('lesson'):
            # Make sure all required nested objects exist
            if not assignment_dict['lesson'].get('subject'):
                assignment_dict['lesson']['subject'] = {'name': ''}
            if not assignment_dict['lesson'].get('class_'):
                assignment_dict['lesson']['class_'] = {'name': ''}
            if not assignment_dict['lesson'].get('teacher'):
                assignment_dict['lesson']['teacher'] = {'name': ''}
                
        result.append(assignment_dict)
    return result


@assignments_bp.route('/assignments', methods=['GET'])
async def get_assignments():
    try:
        page = request.args.get('page', default=1, type=int)
        search = request.args.get('search', default='', type=str)
        teacher_id = request.args.get('teacherId', default=None, type=str)
        page_size = 10

        await prisma.connect()
        
        # Query with error handling
        try:
            # Build where condition
            where_condition = {}
            
            if search:
                where_condition = {
                    "OR": [
                        {"title": {"contains": search}},
                        {"lesson": {"subject": {"name": {"contains": search}}}}
                    ]
                }
            
            # Add teacher filter if provided
            if teacher_id:
                # If we already have conditions, add to them
                if where_condition:
                    where_condition["AND"] = [{"lesson": {"teacherId": teacher_id}}]
                else:
                    where_condition = {"lesson": {"teacherId": teacher_id}}
            
            assignments = await prisma.assignment.find_many(
                where=where_condition,
                skip=(page - 1) * page_size,
                take=page_size,
                include={
                    "lesson": {
                        "include": {
                            "subject": True, 
                            "class_": True, 
                            "teacher": True
                        }
                    }
                }
            )
            
            count = await prisma.assignment.count(
                where=where_condition
            )
            
            # Debug
            print(f"Found {count} assignments")
            for assignment in assignments:
                print(f"Assignment: {assignment.title}, Lesson ID: {assignment.lessonId}")
                
        except Exception as e:
            # Log the error for debugging
            print(f"Prisma query error: {str(e)}")
            # Return empty results rather than crashing
            await prisma.disconnect()
            return jsonify({"data": [], "count": 0, "error": str(e)})
            
        await prisma.disconnect()
        
        # Serialize the data with proper error handling
        serialized_data = serialize_assignments(assignments)
        return jsonify({"data": serialized_data, "count": count})
        
    except Exception as e:
        # Global error handler
        print(f"Error in get_assignments: {str(e)}")
        return jsonify({"data": [], "count": 0, "error": str(e)}), 500

@assignments_bp.route('/assignments/<id>', methods=['GET'])
async def get_assignment(id):
    try:
        await prisma.connect()
        assignment = await prisma.assignment.find_unique(
            where={'id': int(id)},
            include={"lesson": {"include": {"subject": True, "class_": True, "teacher": True}}}
        )
        await prisma.disconnect()
        
        if not assignment:
            return jsonify({"error": "Assignment not found"}), 404
        
        return jsonify(assignment.dict())
    except Exception as e:
        print(f"Error in get_assignment: {str(e)}")
        return jsonify({"error": str(e)}), 500

@assignments_bp.route('/assignments', methods=['POST'])
async def create_assignment():
    try:
        data = request.json
        
        # Ensure required fields are present
        required_fields = ['title', 'startDate', 'dueDate', 'lessonId']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Ensure lessonId is an integer
        data['lessonId'] = int(data['lessonId'])
        
        await prisma.connect()
        assignment = await prisma.assignment.create(data=data)
        await prisma.disconnect()
        return jsonify(assignment.dict()), 201
    except Exception as e:
        print(f"Error in create_assignment: {str(e)}")
        return jsonify({"error": str(e)}), 500

@assignments_bp.route('/assignments/<id>', methods=['PUT'])
async def update_assignment(id):
    try:
        data = request.json
        
        # Ensure lessonId is an integer if provided
        if 'lessonId' in data:
            data['lessonId'] = int(data['lessonId'])
            
        await prisma.connect()
        assignment = await prisma.assignment.update(where={'id': int(id)}, data=data)
        await prisma.disconnect()
        
        if not assignment:
            return jsonify({"error": "Assignment not found"}), 404
        
        return jsonify(assignment.dict())
    except Exception as e:
        print(f"Error in update_assignment: {str(e)}")
        return jsonify({"error": str(e)}), 500

@assignments_bp.route('/assignments/<id>', methods=['DELETE'])
async def delete_assignment(id):
    try:
        await prisma.connect()
        assignment = await prisma.assignment.find_unique(where={"id": int(id)})
        
        if not assignment:
            await prisma.disconnect()
            return jsonify({"error": "Assignment not found"}), 404
        
        await prisma.assignment.delete(where={'id': int(id)})
        await prisma.disconnect()
        return jsonify({'message': 'Assignment deleted'})
    except Exception as e:
        print(f"Error in delete_assignment: {str(e)}")
        return jsonify({"error": str(e)}), 500