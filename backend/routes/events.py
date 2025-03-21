from flask import Blueprint, jsonify, request
from prisma import Prisma
from datetime import datetime, timedelta

events_bp = Blueprint('events', __name__)
prisma = Prisma()

def serialize_events(events):
    """Convert Prisma ORM objects to JSON-serializable dictionaries."""
    result = []
    for event in events:
        # Create a copy of the event dict
        event_dict = event.dict()
        
        # Ensure the class_ object exists
        if not event_dict.get('class_'):
            event_dict['class_'] = {'name': ''}
                
        result.append(event_dict)
    return result

@events_bp.route("/events", methods=["GET"])
async def get_events():
    try:
        page = request.args.get('page', default=1, type=int)
        search = request.args.get('search', default='', type=str)
        date_param = request.args.get("date")
        page_size = 10
        
        # Handle date parsing with error handling
        if date_param:
            try:
                date = datetime.strptime(date_param, "%Y-%m-%d")
            except ValueError:
                date = datetime.now()
        else:
            date = None

        await prisma.connect()
        
        # Query conditions
        where_condition = {}
        if search:
            where_condition["title"] = {
        "contains": search
    }

        
        # Add date filter if provided
        if date:
            where_condition["startTime"] = {
                "gte": date.replace(hour=0, minute=0, second=0, microsecond=0),
                "lte": date.replace(hour=23, minute=59, second=59, microsecond=999),
            }
        
        try:
            events = await prisma.event.find_many(
                where=where_condition,
                include={"class_": True},
                skip=(page - 1) * page_size,
                take=page_size
            )
            
            count = await prisma.event.count(where=where_condition)
            
            # Debug
            print(f"Found {count} events")
            for event in events:
                print(f"Event: {event.title}, Class ID: {event.classId}")
                
        except Exception as e:
            print(f"Prisma query error: {str(e)}")
            await prisma.disconnect()
            return jsonify({"data": [], "count": 0, "error": str(e)})
            
        await prisma.disconnect()

        serialized_data = serialize_events(events)
        return jsonify({
            "data": serialized_data,
            "count": count
        })
    except Exception as e:
        print(f"Error in get_events: {str(e)}")
        return jsonify({"data": [], "count": 0, "error": str(e)}), 500

@events_bp.route('/events/calendar', methods=['GET'])
async def get_calendar_events():
    try:
        await prisma.connect()
        events = await prisma.event.find_many(
            select={
                'id': True,
                'title': True,
                'startTime': True,
                'endTime': True
            }
        )
        await prisma.disconnect()
        
        # Format the calendar data
        calendar_data = []
        for event in events:
            try:
                calendar_data.append({
                    'id': event.id,
                    'title': event.title, 
                    'start': event.startTime.isoformat() if event.startTime else None, 
                    'end': event.endTime.isoformat() if event.endTime else None
                })
            except AttributeError:
                # Skip events with missing attributes
                continue
                
        return jsonify(calendar_data)
    except Exception as e:
        print(f"Error in get_calendar_events: {str(e)}")
        return jsonify({"error": str(e)}), 500

@events_bp.route('/events/<id>', methods=['GET'])
async def get_event(id):
    try:
        await prisma.connect()
        event = await prisma.event.find_unique(
            where={'id': int(id)},
            include={"class_": True}
        )
        await prisma.disconnect()
        
        if not event:
            return jsonify({"error": "Event not found"}), 404
        
        return jsonify(event.dict())
    except Exception as e:
        print(f"Error in get_event: {str(e)}")
        return jsonify({"error": str(e)}), 500

@events_bp.route('/events', methods=['POST'])
async def create_event():
    try:
        data = request.json
        
        # Ensure required fields are present
        required_fields = ['title', 'description', 'startTime', 'endTime']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Convert classId to int if provided
        if data.get('classId'):
            data['classId'] = int(data['classId'])
        
        await prisma.connect()
        event = await prisma.event.create(data=data)
        await prisma.disconnect()
        return jsonify(event.dict()), 201
    except Exception as e:
        print(f"Error in create_event: {str(e)}")
        return jsonify({"error": str(e)}), 500

@events_bp.route('/events/<id>', methods=['PUT'])
async def update_event(id):
    try:
        data = request.json
        
        # Convert classId to int if provided
        if data.get('classId'):
            data['classId'] = int(data['classId'])
            
        await prisma.connect()
        event = await prisma.event.update(where={'id': int(id)}, data=data)
        await prisma.disconnect()
        
        if not event:
            return jsonify({"error": "Event not found"}), 404
        
        return jsonify(event.dict())
    except Exception as e:
        print(f"Error in update_event: {str(e)}")
        return jsonify({"error": str(e)}), 500

@events_bp.route('/events/<id>', methods=['DELETE'])
async def delete_event(id):
    try:
        await prisma.connect()
        event = await prisma.event.find_unique(where={"id": int(id)})
        
        if not event:
            await prisma.disconnect()
            return jsonify({"error": "Event not found"}), 404
        
        await prisma.event.delete(where={'id': int(id)})
        await prisma.disconnect()
        return jsonify({'message': 'Event deleted'})
    except Exception as e:
        print(f"Error in delete_event: {str(e)}")
        return jsonify({"error": str(e)}), 500