
# '''admin_bp, announcements_bp, assignments_bp, classes_bp, events_bp,
#     exams_bp, lessons_bp, parents_bp, results_bp, students_bp, subjects_bp,
#     teachers_bp, search_bp, attendance_bp, finance_bp, menu_bp, pagination_bp,
#     users_bp, table_bp, grades_bp, uploads_bp,'''

from flask import Flask
from flask_cors import CORS
from flask_executor import Executor  # Import flask-executor
import logging
import os
import atexit
from config import IMAGE_DIRS
from dotenv import load_dotenv
from routes.id_card_routes import id_card_bp
from routes.auth_routes import auth_bp

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize flask-executor
executor = Executor(app)  # ✅ Create the executor object

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log", encoding='utf-8'),  # Log to a file with UTF-8 encoding
        logging.StreamHandler(),  # Log to console
    ],
)
logger = logging.getLogger(__name__)

# Ensure required directories exist
for dir_path in IMAGE_DIRS.values():
    os.makedirs(dir_path, exist_ok=True)
    logger.info(f"Directory ensured: {dir_path}")

# ✅ Pass executor to the app context
app.executor = executor

# ✅ Import blueprints *AFTER* initializing executor to avoid circular import
from routes.api_routes import api_bp

# Register blueprints
app.register_blueprint(api_bp, url_prefix='/api')
app.register_blueprint(id_card_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api')
# Cleanup function for Prisma
def cleanup():
    from prisma import Prisma
    prisma = Prisma()
    prisma.disconnect()
    logger.info("Prisma disconnected successfully.")

# Register cleanup function to run on app shutdown
atexit.register(cleanup)

# Run the app
if __name__ == '__main__':
    try:
        app.run(debug=True)
    finally:
        cleanup()  # Ensure database disconnects on shutdown