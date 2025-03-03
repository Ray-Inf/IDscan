# from flask import Flask
# from flask_cors import CORS
# from database_setup import init_db
# from routes.auth_routes import auth_bp
# from routes.id_card_routes import id_card_bp
# from routes.user_routes import user_bp
# from routes.attendance_routes import attendance_bp
# import logging
# import os
# from config import IMAGE_DIRS

# # Initialize Flask app
# app = Flask(__name__)
# CORS(app)

# # Configure logging
# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)

# # Create necessary directories
# try:
#     for dir_path in IMAGE_DIRS.values():
#         os.makedirs(dir_path, exist_ok=True)
#         logger.info(f"Created directory: {dir_path}")
# except Exception as e:
#     logger.error(f"Failed to create directories: {str(e)}")

# # Initialize database
# try:
#     init_db()
#     logger.info("Database initialized successfully.")
# except Exception as e:
#     logger.error(f"Failed to initialize database: {str(e)}")

# # Register blueprints
# app.register_blueprint(auth_bp, url_prefix='/auth')
# app.register_blueprint(id_card_bp, url_prefix='/id-card')
# app.register_blueprint(user_bp, url_prefix='/user')
# app.register_blueprint(attendance_bp, url_prefix='/attendance')

# # Run the app
# if __name__ == '__main__':
#     app.run(debug=True)  # Added debug=True for better error messages
from flask import Flask
from flask_cors import CORS
from database_setup import init_db
from routes.auth_routes import auth_bp
from routes.id_card_routes import id_card_bp
from routes.user_routes import user_bp
from routes.attendance_routes import attendance_bp
from routes.library_routes import library_bp
from routes.admin_routes import admin_bp
from routes.class_schedule_routes import class_schedule_bp
import logging
import os
from config import IMAGE_DIRS

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create necessary directories
try:
    for dir_path in IMAGE_DIRS.values():
        os.makedirs(dir_path, exist_ok=True)
        logger.info(f"Created directory: {dir_path}")
except Exception as e:
    logger.error(f"Failed to create directories: {str(e)}")

# Initialize database
try:
    init_db()
    logger.info("Database initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize database: {str(e)}")

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(id_card_bp, url_prefix='/id-card')
app.register_blueprint(user_bp, url_prefix='/user')
app.register_blueprint(attendance_bp, url_prefix='/attendance')
app.register_blueprint(library_bp, url_prefix='/library')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(class_schedule_bp, url_prefix='/class_schedule') 
# app.register_blueprint(library_routes)
# app.register_blueprint(user_bp, url_prefix='/api/users')  # Add this new line

# # We need to create a version of the attendance routes at /api/attendance too
# # This is to match what your frontend expects
# app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
# Run the app
if __name__ == '__main__':
    app.run(debug=True)  # Added debug=True for better error messages