
from flask import Blueprint, jsonify, request
import asyncio
import functools


students_bp = Blueprint('students', __name__)

# Helper function to serialize Prisma objects
def serialize(data):
    if isinstance(data, list):
        return [item.dict() for item in data]
    return data.dict()

# Improved async route decorator to better handle event loops
def async_route(f):
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        try:
            # Get the current event loop or create a new one if necessary
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            # Run the async function in the event loop
            return loop.run_until_complete(f(*args, **kwargs))
        except Exception as e:
            print(f"Async route error: {str(e)}")
            return jsonify({'error': str(e)}), 500
    return wrapped

# Get all students
@students_bp.route('/students', methods=['GET'])
@async_route
async def get_students():
    from app import prisma  # Import here to avoid circular imports
    
    page = request.args.get('page', default=1, type=int)
    search = request.args.get('search', default='', type=str)

    try:
        filter_criteria = {}
        if search:
            filter_criteria['OR'] = [
                {'name': {'contains': search}},
                {'surname': {'contains': search}},
                {'username': {'contains': search}},
            ]

        students = await prisma.student.find_many(
            where=filter_criteria,
            skip=(page - 1) * 10,
            take=10,
            include={'class_': True, 'grade': True},
        )

        count = await prisma.student.count(where=filter_criteria)
        return jsonify({'data': serialize(students), 'count': count})
    except Exception as e:
        print(f"Error in get_students: {str(e)}")
        return jsonify({'error': str(e)}), 500

@students_bp.route('/students/<id>', methods=['GET'])
@async_route
async def get_student(id):
    from app import prisma  # Avoid circular imports

    try:
        # Try to find by string ID first
        student = None
        
        # Try as string ID
        student = await prisma.student.find_unique(
            where={'id': id},  # Try using the ID as is (string)
            include={'class_': True, 'grade': True, 'parent': True},
        )
        
        # If not found and it looks like a number, try as integer
        if not student and id.isdigit():
            try:
                numeric_id = int(id)
                student = await prisma.student.find_unique(
                    where={'id': numeric_id},
                    include={'class_': True, 'grade': True, 'parent': True},
                )
            except Exception as e:
                print(f"Error trying numeric ID: {str(e)}")
                # Continue to the not found case
        
        if not student:
            return jsonify({'error': f'Student with ID {id} not found'}), 404
        
        return jsonify(serialize(student))
    except Exception as e:
        print(f"Error in get_student: {str(e)}")
        return jsonify({'error': str(e)}), 500

@students_bp.route('/students', methods=['POST'])
@async_route
async def create_student():
    from app import prisma  # Import here to avoid circular imports
    
    data = request.json
    print("🔍 Received Data:", data)

    try:
        # Ensure Prisma is connected
        if not prisma.is_connected():
            await prisma.connect()

        # Validate that 'id' is provided as a string
        if 'id' not in data or not isinstance(data['id'], str) or not data['id'].strip():
            return jsonify({'error': 'Student ID is required and must be a string'}), 400

        # Check if the student ID already exists
        existing_student = await prisma.student.find_unique(where={'id': data['id']})
        if existing_student:
            return jsonify({'error': f'Student with ID {data["id"]} already exists'}), 400

        create_data = {'id': data['id'].strip()}  # Use the provided string ID

        # Check and process fields
        for key, value in data.items():
            if value is not None and value != "":
                if key == 'id':  # Already assigned manually
                    continue  

                # Handle foreign key relationships
                if key == 'gradeId':
                    grade_exists = await prisma.grade.find_unique(where={'id': int(value)})
                    if not grade_exists:
                        return jsonify({'error': f'Grade with ID {value} not found'}), 400
                    create_data['grade'] = {'connect': {'id': int(value)}}

                elif key == 'classId':
                    class_exists = await prisma.class_.find_unique(where={'id': int(value)})
                    if not class_exists:
                        return jsonify({'error': f'Class with ID {value} not found'}), 400
                    create_data['class_'] = {'connect': {'id': int(value)}}

                elif key == 'parentId':
                    if value and isinstance(value, str):  # Ensure it's a valid string
                        parent_exists = await prisma.parent.find_unique(where={'id': value})
                        if not parent_exists:
                            return jsonify({'error': f'Parent with ID {value} not found'}), 400
                        create_data['parent'] = {'connect': {'id': value}}
                    else:
                        print(f"🔸 Skipping parentId, value is None or empty")

                # Rename profileImage to img if necessary
                elif key == 'profileImage':  
                    create_data['img'] = str(value)  # Change to 'img' if needed

                else:
                    create_data[key] = value

        print("🛠️ Processed Data for Creation:", create_data)

        # Create student with the user-provided ID
        student = await prisma.student.create(data=create_data)
        
        return jsonify(serialize(student)), 201
    except Exception as e:
        print(f"❌ Full Error: {repr(e)}")  # Log full error
        return jsonify({'error': str(e)}), 500



@students_bp.route('/students/<id>', methods=['PUT'])
@async_route
async def update_student(id):
    from app import prisma  # Avoid circular imports
    
    data = request.json
    print("Received update data:", data)

    try:
        update_data = {}

        # Ensure ID is correctly formatted
        where_condition = {'id': id}  # Use the provided ID directly

        for key, value in data.items():
            if value is not None and value != "":
                if key == 'password':
                    continue  # Skip empty passwords
                
                if key == 'gradeId':
                    update_data['grade'] = {'connect': {'id': int(value)}}
                elif key == 'classId':
                    update_data['class_'] = {'connect': {'id': int(value)}}
                elif key == 'parentId':
                    update_data['parent'] = {'connect': {'id': value}}  # Keep parentId as a string
                elif key == 'profileImage':  # Convert profileImage to img
                    update_data['img'] = str(value)  # Use 'img' instead of 'profileImage'
                else:
                    update_data[key] = value

        print("Processed data for update:", update_data)
        
        student = await prisma.student.update(
            where=where_condition,  # Use the correct where condition
            data=update_data
        )
        
        return jsonify(serialize(student))
    except Exception as e:
        print(f"Error in update_student: {str(e)}")
        return jsonify({'error': str(e)}), 500

@students_bp.route("/students/<id>", methods=["DELETE"])
@async_route
async def delete_student(id):
    from app import prisma
    if not prisma.is_connected():
        await prisma.connect()
    try:
        # With cascading set up in Prisma, we don't need to manually delete related records
        # Try to delete the student directly
        
        # Try with string ID first
        try:
            await prisma.student.delete(where={"id": id})
        except Exception as first_error:
            # If it fails and id is a digit, try as integer
            if id.isdigit():
                await prisma.student.delete(where={"id": int(id)})
            else:
                # Re-raise the original error if it's not an integer
                raise first_error

        return jsonify({"message": "Student deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Keep other routes unchanged