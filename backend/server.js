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
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create content table

db.exec(`
  CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add subject column if the existing database doesn't have it
const columns = db.prepare("PRAGMA table_info(contacts)").all();
const hasSubject = columns.some((column) => column.name === "subject");

if (!hasSubject) {
  db.exec(`
    ALTER TABLE contacts
    ADD COLUMN subject TEXT NOT NULL DEFAULT ''
  `);
}

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Fevora backend is running!",
  });
});

// Contact form route
app.post("/api/contact", (req, res) => {
  try {
    console.log("DATA RECEIVED BY BACKEND:", req.body);
    let { full_name, email, subject, message } = req.body;

    // Make sure all fields exist
    if (!full_name || !email || !subject || !message) {
      return res.status(400).json({
        error: "All fields are required.",
      });
    }

    // Remove unnecessary spaces
    full_name = full_name.trim();
    email = email.trim().toLowerCase();
    subject = subject.trim();
    message = message.trim();

    // Check again after trimming
    if (!full_name || !email || !subject || !message) {
      return res.status(400).json({
        error: "All fields are required.",
      });
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address.",
      });
    }

    // Validate full name length
    if (full_name.length > 100) {
      return res.status(400).json({
        error: "Full name is too long.",
      });
    }

    // Validate subject length
    if (subject.length > 200) {
      return res.status(400).json({
        error: "Subject is too long.",
      });
    }

    // Validate message length
    if (message.length > 1000) {
      return res.status(400).json({
        error: "Message is too long.",
      });
    }

    // Save contact to database
    const insert = db.prepare(`
      INSERT INTO contacts (full_name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `);

    insert.run(full_name, email, subject, message);

    // Successful response
    res.status(201).json({
      message: "Your message has been sent!",
    });

  } catch (error) {
    console.error("Error saving contact:", error);

    res.status(500).json({
      error: "Something went wrong. Please try again later.",
    });
  }
});

// Get all content items

app.get("/api/content", (req, res) => {
  try {
    const content = db
      .prepare("SELECT * FROM content ORDER BY created_at DESC")
      .all();

    res.json(content);
  } catch (error) {
    console.error("Error fetching content:", error);

    res.status(500).json({
      error: "Something went wrong while fetching content.",
    });
  }
});

// Add a new content item

app.post("/api/content", (req, res) => {
  try {
    let { title, description, category, status } = req.body;

    // Make sure required fields exist
    if (!title || !description || !category) {
      return res.status(400).json({
        error: "Title, description, and category are required.",
      });
    }

    // Remove unnecessary spaces
    title = title.trim();
    description = description.trim();
    category = category.trim();
    status = status ? status.trim() : "Draft";

    // Save content to database
    const insert = db.prepare(`
      INSERT INTO content (title, description, category, status)
      VALUES (?, ?, ?, ?)
    `);

    const result = insert.run(title, description, category, status);

    // Send successful response
    res.status(201).json({
      message: "Content created successfully.",
      id: result.lastInsertRowid,
    });
  } catch (error) {
    console.error("Error creating content:", error);

    res.status(500).json({
      error: "Something went wrong while creating content.",
    });
  }
});

// Update an existing content item

app.put("/api/content/:id", (req, res) => {
  try {
    const { id } = req.params;
    let { title, description, category, status } = req.body;

    // Make sure required fields exist
    if (!title || !description || !category) {
      return res.status(400).json({
        error: "Title, description, and category are required.",
      });
    }

    // Remove unnecessary spaces
    title = title.trim();
    description = description.trim();
    category = category.trim();
    status = status ? status.trim() : "Draft";

    // Update the content item
    const update = db.prepare(`
      UPDATE content
      SET title = ?, description = ?, category = ?, status = ?
      WHERE id = ?
    `);

    const result = update.run(
      title,
      description,
      category,
      status,
      id
    );

    // Check if the item exists
    if (result.changes === 0) {
      return res.status(404).json({
        error: "Content item not found.",
      });
    }

    res.json({
      message: "Content updated successfully.",
    });
  } catch (error) {
    console.error("Error updating content:", error);

    res.status(500).json({
      error: "Something went wrong while updating content.",
    });
  }
});

// Delete a content item

app.delete("/api/content/:id", (req, res) => {
  try {
    const { id } = req.params;

    const deleteContent = db.prepare(`
      DELETE FROM content
      WHERE id = ?
    `);

    const result = deleteContent.run(id);

    // Check if the item exists
    if (result.changes === 0) {
      return res.status(404).json({
        error: "Content item not found.",
      });
    }

    res.json({
      message: "Content deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting content:", error);

    res.status(500).json({
      error: "Something went wrong while deleting content.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Fevora backend running on http://localhost:${PORT}`);
});