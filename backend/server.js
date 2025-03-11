// This file is made to handle the MySQL connection with the application
require('dotenv').config();  // Handle .env file for database credentials
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL Database');
});

// API Endpoint to get student details
app.get('/api/student/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  db.query('SELECT * FROM students WHERE student_id = ?', [studentId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ error: "Student not found" });
    res.json(result[0]);
  });
});

// API Endpoint to log authentication time
app.post('/api/log-auth', (req, res) => {
  const { student_id } = req.body;
  const authTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format to MySQL DATETIME

  const query = 'UPDATE students SET last_auth_time = ? WHERE student_id = ?';
  db.query(query, [authTime, student_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Student not found" });

    res.json({ message: "Authentication time logged successfully", auth_time: authTime });
  });
});

// Start the server
app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
