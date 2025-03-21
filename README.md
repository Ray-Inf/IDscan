1️⃣ Install Prisma for Python
Since Prisma is not installed on your system yet, run:

pip install prisma


2️⃣ Create the .env File (If Missing)
If the .env file doesn't exist, create it in the backend directory of the project and add the database connection string:


DATABASE_URL="mysql://root:password@localhost:3306/database_name"

Replace:

root → with your MySQL username
password → with your MySQL password
database_name → with your actual database name


3️⃣ Generate the Prisma Client
Now, run:

prisma generate

This generates the Prisma Client that allows Python to interact with the database.

⚠️ If you get an error (e.g., schema.prisma not found or prisma generate not working), make sure:

You're inside the project folder before running the command.
The schema.prisma file is in the prisma/ folder.


4️⃣ Apply Pending Migrations
If the project already has migrations, apply them with:


prisma migrate dev
If you get migration errors, try:

prisma migrate reset

⚠️ Warning: prisma migrate reset will delete all data in the database. Use it only if necessary.

5 go to prisma folder and run 

python seed.py

6 in the backend folder install 
uvicorn and asgiref

pip install uvicorn asgiref

7 to run the backend
python run.py
