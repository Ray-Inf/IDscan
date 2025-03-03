# IDScan Project

This project provides an ID scanning system with face recognition capabilities using Flask as the backend.

---

## 🚀 **Setup Guide**

first of all you have to install mysql in your system along with mysql work bench and create a database and that database name is used in the env file ,no need to create tables as it is automatically created
when executing the cursor

### **1️⃣ Clone the Repository**
First, clone the repository:
```bash
git clone https://github.com/Ray-Inf/IDscan.git
cd IDscan/final-lap
then goes to backend by 
cd backend

2️⃣ Create a Virtual Environment
Ensure Python is installed (recommended: Python 3.8+).

Run the following command to create a virtual environment named myenv:

python -m venv myenv
3️⃣ Activate the Virtual Environment
Windows (Command Prompt)

myenv\Scripts\activate

macOS/Linux
source myenv/bin/activate

4️⃣ Install Dependencies
Once the virtual environment is activated, install the required dependencies:

pip install -r requirements.txt
5️⃣ Setup the .env File
This project uses MySQL as the database. You need to create a .env file to store your database credentials.

📌 Create a .env file

touch .env  # Linux/macOS

echo. > .env  # Windows

Then, open the .env file and add:

DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
Replace your_database_host, your_database_user, etc., with actual credentials.

6️⃣ Generate Required Directories
The project needs specific directories for storing images and logs, as defined in config.py.
final-lap/
│
├── .env                  # Environment variables for database credentials
├── config.py             # Configuration for directories and facilities
├── create_directories.py # Script to generate required directories
├── images/               # Directory for storing images
│   ├── templates/        # Template images
│   └── users/            # User-related images
├── logs/                 # Directory for facility-specific logs
│   ├── gym/              # Gym logs
│   ├── cafeteria/        # Cafeteria logs
│   └── class/            # Class logs
└── temp/                 # Temporary directory

7️⃣ Run the Application
To start the Flask application, run:

python app.py

8️⃣ Deactivate the Virtual Environment
When you're done, deactivate the virtual environment:

deactivate
🛠 Troubleshooting
pip not found?
Ensure Python and pip are installed:

python --version
pip --version
Error installing dlib or opencv-python?

Install required system dependencies:

Windows: Install CMake
Linux (Debian/Ubuntu):
sudo apt-get install cmake libopenblas-dev liblapack-dev libx11-dev

Ensure myenv is activated before running pip install.
## for frontend
first go to root of the project that is final-lap
as you are now in backend use cd ..
cd frontend2

install node modules
npm i

then run the code
npm run dev

now you are all set
