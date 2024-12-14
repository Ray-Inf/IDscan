import face_recognition
import cv2
import numpy as np
import os
from flask import Flask, render_template, request
from flask_cors import CORS
import mysql.connector as conn
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get database connection details from environment variables
DB_HOST = os.getenv("DB_HOST")
DB_DATABASE = os.getenv("DB_DATABASE")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_CHARSET = os.getenv("DB_CHARSET")
DB_PORT = int(os.getenv("DB_PORT"))  # Convert port to integer

# Flask setup
app = Flask(__name__)
CORS(app)

# Globals
db = []
known_path = os.path.join(os.getcwd(), "Images/Known_faces/")
unknown_path = os.path.join(os.getcwd(), "Images/Unknown_faces/")

# Function to fetch data from the database
def get_data():
    global db
    try:
        con = conn.connect(
            host=DB_HOST,
            database=DB_DATABASE,
            user=DB_USER,
            password=DB_PASSWORD,
            charset=DB_CHARSET,
            port=DB_PORT
        )
        cursor = con.cursor()
        sql = 'SELECT * FROM register'
        cursor.execute(sql)
        result = cursor.fetchall()
        for i in result:
            l = []
            l.append(i[0])
            string = i[1][1:-2]
            nums = []
            for x in string.split():
                nums.append(float(x.strip()))
            l.append(nums)
            db.append(l)
        cursor.close()
        con.close()
    except conn.Error as err:
        print(f"Error fetching data: {err}")

# Flask routes
@app.route('/')
def index():
    return render_template("index.html")

@app.route('/register', methods=['GET'])
def register():
    try:
        con = conn.connect(
            host=DB_HOST,
            database=DB_DATABASE,
            user=DB_USER,
            password=DB_PASSWORD,
            charset=DB_CHARSET,
            port=DB_PORT
        )
        cursor = con.cursor()
        sql = 'INSERT INTO register VALUES (%s, %s)'
        name = request.args.get("name")
        
        # Capture face encoding
        video_capture = cv2.VideoCapture(0)
        ret, frame = video_capture.read()
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = small_frame[:, :, ::-1]
        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
        
        # Save captured image
        dir = os.path.join(known_path, name)
        if not os.path.isdir(dir):
            os.mkdir(dir)
        os.chdir(dir)
        rand_no = np.random.random_sample()
        cv2.imwrite(str(rand_no) + ".jpg", frame)
        
        video_capture.release()
        cv2.destroyAllWindows()
        
        # Save encoding to database
        encoding = ""
        for i in face_encodings:
            encoding += str(i) + ","
        li = [name, encoding]
        value = tuple(li)
        cursor.execute(sql, value)
        con.commit()
        cursor.close()
        con.close()
        return "Done"
    except conn.Error as err:
        print(f"Error connecting to MySQL: {err}")
        return f"Error connecting to MySQL: {err}"

@app.route("/login")
def login():
    get_data()
    global db
    if not db:
        return "You are unknown. First register yourself."
    
    # Process known face encodings and names
    known_face_encodings = [i[1] for i in db]
    known_face_names = [i[0] for i in db]
    
    face_locations = []
    face_encodings = []
    face_names = []
    
    # Capture video frame for login
    video_capture = cv2.VideoCapture(0)
    ret, frame = video_capture.read()
    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small_frame = small_frame[:, :, ::-1]
    face_locations = face_recognition.face_locations(rgb_small_frame)
    face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
    
    if not face_encodings:
        return "You are unknown. First register yourself."
    
    for face_encoding in face_encodings:
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
        name = "Unknown"
        face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
        best_match_index = np.argmin(face_distances)
        if matches[best_match_index]:
            name = known_face_names[best_match_index]
        
        if name == "Unknown":
            return "You are unknown. First register yourself."
        else:
            msg = name
        
        face_names.append(name)
    
    # Annotate video frame with recognized names
    for (top, right, bottom, left), name in zip(face_locations, face_names):
        top *= 4
        right *= 4
        bottom *= 4
        left *= 4
        cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
        cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
        font = cv2.FONT_HERSHEY_DUPLEX
        cv2.putText(frame, name, (left + 6, bottom - 6), font, 1.0, (255, 255, 255), 1)
    
    os.chdir(unknown_path)
    rand_no = np.random.random_sample()
    cv2.imwrite(str(rand_no) + ".jpg", frame)
    
    video_capture.release()
    return msg

if __name__ == '__main__':
    app.run(debug=True)
