# from flask import Flask, current_app
# from flask_cors import CORS
# import asyncio
# from prisma import Prisma
# from contextvars import ContextVar
# import functools

# # Importing all blueprints
# from routes.tables import table_bp
# from routes.users import users_bp
# from routes.admin import admin_bp
# from routes.announcements import announcements_bp
# from routes.assignments import assignments_bp
# from routes.classes import classes_bp
# from routes.events import events_bp
# from routes.exams import exams_bp
# from routes.lessons import lessons_bp
# from routes.parents import parents_bp
# from routes.results import results_bp
# from routes.students import students_bp
# from routes.subject import subjects_bp
# from routes.teacher import teachers_bp
# from routes.search import search_bp
# from routes.attendance import attendance_bp
# from routes.finance import finance_bp
# from routes.menu import menu_bp
# from routes.pagination import pagination_bp
# from routes.grades import grades_bp
# from routes.upload import uploads_bp
# from routes.admin_routes import admin_routes
# from routes.auth_routes import auth_routes
# from routes.class_schedule_routes import class_schedule_routes  
# from routes.id_card_routes import id_card_routes        
# from routes.library_routes import library_routes
# from routes.user_routes import user_routes
# from routes.attendance_routes import attendance_routes

# app = Flask(__name__)
# CORS(app)  # Enable CORS for all routes

# # Create a global Prisma instance
# prisma = Prisma()

# # Create a context variable to track connection status
# prisma_connected = ContextVar('prisma_connected', default=False)

# # Helper function to run async code in Flask
# def async_action(f):
#     @functools.wraps(f)
#     def wrapped(*args, **kwargs):
#         loop = asyncio.new_event_loop()
#         try:
#             result = loop.run_until_complete(f(*args, **kwargs))
#         finally:
#             loop.close()
#         return result
#     return wrapped

# # Connection management
# @async_action
# async def connect_db():
#     if not prisma_connected.get():
#         try:
#             await prisma.connect()
#             prisma_connected.set(True)
#             print("✅ Prisma connected successfully.")
#             return True
#         except Exception as e:
#             print(f"❌ Error connecting to Prisma: {str(e)}")
#             return False

# @async_action
# async def disconnect_db():
#     if prisma_connected.get():
#         try:
#             await prisma.disconnect()
#             prisma_connected.set(False)
#             print("✅ Prisma disconnected successfully.")
#         except Exception as e:
#             print(f"❌ Error disconnecting Prisma: {str(e)}")

# # For Flask 2.0+, use a startup function with app context
# with app.app_context():
#     # Connect to Prisma when the app starts
#     connect_result = connect_db()
#     if not connect_result:
#         print("Warning: Failed to connect to Prisma during startup")

# # Ensure connection before each request
# @app.before_request
# def ensure_connection():
#     if not prisma_connected.get():
#         connect_db()

# # Disconnect at shutdown
# @app.teardown_appcontext
# def teardown_db(exception=None):
#     disconnect_db()

# # Register all blueprints under `/api`
# blueprints = [
#     admin_bp, announcements_bp, assignments_bp, classes_bp, events_bp,
#     exams_bp, lessons_bp, parents_bp, results_bp, students_bp, subjects_bp,
#     teachers_bp,search_bp, attendance_bp, finance_bp, 
#     menu_bp, pagination_bp,users_bp,table_bp,grades_bp,uploads_bp,
#     admin_routes,auth_routes,class_schedule_routes,id_card_routes,library_routes,user_routes,
#     attendance_routes
# ]

# for bp in blueprints:
#     app.register_blueprint(bp, url_prefix='/api')

# if __name__ == '__main__':
#     app.run(debug=True)
from flask import Flask
from flask_cors import CORS
import asyncio
import functools
import logging
import os
from prisma import Prisma
from contextvars import ContextVar
from config import IMAGE_DIRS

# Import all blueprints
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
from routes.api_routes import api_bp
# Additional blueprints
# from routes.auth_routes import auth_bp
# from routes.id_card_routes import id_card_bp
# from routes.user_routes import user_bp
# from routes.attendance_routes import attendance_bp  # Fixed name
# from routes.library_routes import library_bp
# from routes.class_schedule_routes import class_schedule_bp

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Ensure required directories exist
for dir_path in IMAGE_DIRS.values():
    os.makedirs(dir_path, exist_ok=True)
    logger.info(f"Directory ensured: {dir_path}")

# Create a global Prisma instance
prisma = Prisma()

# Context variable to track Prisma connection status
prisma_connected = ContextVar('prisma_connected', default=False)

# Helper function to run async code in Flask
def async_action(f):
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(f(*args, **kwargs))
        finally:
            loop.close()
        return result
    return wrapped

# Database connection functions
@async_action
async def connect_db():
    if not prisma_connected.get():
        try:
            await prisma.connect()
            prisma_connected.set(True)
            logger.info("✅ Prisma connected successfully.")
            return True
        except Exception as e:
            logger.error(f"❌ Error connecting to Prisma: {str(e)}")
            return False

@async_action
async def disconnect_db():
    if prisma_connected.get():
        try:
            await prisma.disconnect()
            prisma_connected.set(False)
            logger.info("✅ Prisma disconnected successfully.")
        except Exception as e:
            logger.error(f"❌ Error disconnecting Prisma: {str(e)}")

# Connect to Prisma at startup
with app.app_context():
    if not connect_db():
        logger.warning("⚠️ Warning: Failed to connect to Prisma during startup")

# Ensure Prisma connection before each request
@app.before_request
def ensure_connection():
    if not prisma_connected.get():
        connect_db()

# Disconnect Prisma at shutdown
@app.teardown_appcontext
def teardown_db(exception=None):
    disconnect_db()

# Register blueprints
blueprints = [
    admin_bp, announcements_bp, assignments_bp, classes_bp, events_bp,
    exams_bp, lessons_bp, parents_bp, results_bp, students_bp, subjects_bp,
    teachers_bp, search_bp, attendance_bp, finance_bp, menu_bp, pagination_bp,
    users_bp, table_bp, grades_bp, uploads_bp,

    # Additional blueprints
    api_bp
]

for bp in blueprints:
    app.register_blueprint(bp, url_prefix='/api')

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
