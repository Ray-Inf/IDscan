import mysql.connector
from mysql.connector import Error
from config import DB_CONFIG

def init_db():
    try:
        conn = mysql.connector.connect(
            host=DB_CONFIG['host'],
            database=DB_CONFIG['database'],  # New field for database name
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        cursor = conn.cursor()

        # Create id_templates table
        cursor.execute(''' 
        CREATE TABLE IF NOT EXISTS id_templates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Create templates table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS templates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            organization VARCHAR(255) NOT NULL,
            template_class VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')

        # Create users table - Add admission_year for students
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            card_id VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255),
            role VARCHAR(50),
            department VARCHAR(255),
            admission_year VARCHAR(10),
            year_of_study VARCHAR(10),
            division VARCHAR(10),
            template_id INT,
            image_path VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (template_id) REFERENCES templates (id)
        )
        ''')

        # Create attendance log table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS attendance_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            card_id VARCHAR(255) NOT NULL,
            class_id INT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) NOT NULL,
            FOREIGN KEY (card_id) REFERENCES users (card_id)
        )
        ''')

        # Create facility attendance logs table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS facility_attendance_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            card_id VARCHAR(255) NOT NULL,
            facility_id VARCHAR(50) NOT NULL,
            login_time TIMESTAMP NOT NULL,
            logout_time TIMESTAMP NULL,
            FOREIGN KEY (card_id) REFERENCES users (card_id)
        )
        ''')

        # Create library logs table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS library_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            card_id VARCHAR(255) NOT NULL,
            book_id INT NULL,
            login_time TIMESTAMP NOT NULL,
            logout_time TIMESTAMP NULL,
            time_spent INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (card_id) REFERENCES users(card_id)
        )
        ''')

        # Create books table
        cursor.execute(''' 
        CREATE TABLE IF NOT EXISTS books (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            isbn VARCHAR(20) UNIQUE NOT NULL,
            status VARCHAR(50) DEFAULT 'available',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Create gym logs table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS gym_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            card_id VARCHAR(255) NOT NULL,
            login_time TIMESTAMP NOT NULL,
            logout_time TIMESTAMP NULL,
            activity_type VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (card_id) REFERENCES users(card_id)
        )
        ''')

        # Updated classes table with teacher_id field
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS classes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            class_name VARCHAR(255) NOT NULL,
            instructor VARCHAR(255) NOT NULL,
            teacher_id VARCHAR(255),
            department VARCHAR(255) NOT NULL,
            room VARCHAR(100),
            start_time VARCHAR(50) NOT NULL,
            end_time VARCHAR(50) NOT NULL,
            days TEXT NOT NULL,
            year VARCHAR(10) NOT NULL,
            division VARCHAR(10) NOT NULL,
            admission_year VARCHAR(10) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (teacher_id) REFERENCES users(card_id)
        )
        ''')

        # Add class attendance table for tracking student attendance
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS class_attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            class_id INT NOT NULL,
            card_id VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            check_in_time TIMESTAMP NOT NULL,
            status VARCHAR(20) DEFAULT 'present',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (class_id) REFERENCES classes(id),
            FOREIGN KEY (card_id) REFERENCES users(card_id),
            UNIQUE KEY unique_attendance (class_id, card_id, date)
        )
        ''')

        conn.commit()
        print("Database tables initialized successfully.")

    except Error as e:
        print(f"Error initializing database: {e}")

    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=DB_CONFIG['host'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            database=DB_CONFIG['database']
        )
        return conn
    except Error as e:
        print(f"Error connecting to the database: {e}")
        return None
