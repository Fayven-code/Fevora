const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new Database("fevora.db");

// Create contacts table
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Fevora backend is running!"
  });
});

// Contact form route
app.post("/api/contact", (req, res) => {
  try {
    let { full_name, email, message } = req.body;

    // Make sure all fields exist
    if (!full_name || !email || !message) {
      return res.status(400).json({
        error: "All fields are required."
      });
    }

    // Remove unnecessary spaces
    full_name = full_name.trim();
    email = email.trim().toLowerCase();
    message = message.trim();

    // Check again after trimming
    if (!full_name || !email || !message) {
      return res.status(400).json({
        error: "All fields are required."
      });
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address."
      });
    }

    // Validate full name length
    if (full_name.length > 100) {
      return res.status(400).json({
        error: "Full name is too long."
      });
    }

    // Validate message length
    if (message.length > 1000) {
      return res.status(400).json({
        error: "Message is too long."
      });
    }

    // Save contact to database
    const insert = db.prepare(`
      INSERT INTO contacts (full_name, email, message)
      VALUES (?, ?, ?)
    `);

    insert.run(full_name, email, message);

    // Successful response
    res.status(201).json({
      message: "Your message has been sent!"
    });

  } catch (error) {
    console.error("Error saving contact:", error);

    res.status(500).json({
      error: "Something went wrong. Please try again later."
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Fevora backend running on http://localhost:${PORT}`);
});