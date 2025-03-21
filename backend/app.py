from flask import Flask, current_app
from flask_cors import CORS
import asyncio
from prisma import Prisma
from contextvars import ContextVar
import functools

# Importing all blueprints
from routes.tables import table_bp
from routes.users import users_bp
from routes.admin import admin_bp
from routes.announcements import announcements_bp
from routes.assignments import assignments_bp
from routes.classes import classes_bp
from routes.events import events_bp
from routes.exams import exams_bp
from routes.lessons import lessons_bp
from routes.parents import parents_bp
from routes.results import results_bp
from routes.students import students_bp
from routes.subject import subjects_bp
from routes.teacher import teachers_bp
from routes.search import search_bp
from routes.attendance import attendance_bp
from routes.finance import finance_bp
from routes.menu import menu_bp
from routes.pagination import pagination_bp
from routes.grades import grades_bp
from routes.upload import uploads_bp

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create a global Prisma instance
prisma = Prisma()

# Create a context variable to track connection status
prisma_connected = ContextVar('prisma_connected', default=False)

# Helper function to run async code in Flask
def async_action(f):
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        loop = asyncio.new_event_loop()
        try:
            result = loop.run_until_complete(f(*args, **kwargs))
        finally:
            loop.close()
        return result
    return wrapped

# Connection management
@async_action
async def connect_db():
    if not prisma_connected.get():
        try:
            await prisma.connect()
            prisma_connected.set(True)
            print("✅ Prisma connected successfully.")
            return True
        except Exception as e:
            print(f"❌ Error connecting to Prisma: {str(e)}")
            return False

@async_action
async def disconnect_db():
    if prisma_connected.get():
        try:
            await prisma.disconnect()
            prisma_connected.set(False)
            print("✅ Prisma disconnected successfully.")
        except Exception as e:
            print(f"❌ Error disconnecting Prisma: {str(e)}")

# For Flask 2.0+, use a startup function with app context
with app.app_context():
    # Connect to Prisma when the app starts
    connect_result = connect_db()
    if not connect_result:
        print("Warning: Failed to connect to Prisma during startup")

# Ensure connection before each request
@app.before_request
def ensure_connection():
    if not prisma_connected.get():
        connect_db()

# Disconnect at shutdown
@app.teardown_appcontext
def teardown_db(exception=None):
    disconnect_db()

# Register all blueprints under `/api`
blueprints = [
    admin_bp, announcements_bp, assignments_bp, classes_bp, events_bp,
    exams_bp, lessons_bp, parents_bp, results_bp, students_bp, subjects_bp,
    teachers_bp,search_bp, attendance_bp, finance_bp, 
    menu_bp, pagination_bp,users_bp,table_bp,grades_bp,uploads_bp
]

for bp in blueprints:
    app.register_blueprint(bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True)