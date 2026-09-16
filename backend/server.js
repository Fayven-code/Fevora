const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // No token was provided
  if (!token) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  // Verify the token
  jwt.verify(token, "fevora-secret-key", (err, user) => {
    if (err) {
      return res.status(403).json({
        error: "Invalid or expired token.",
      });
    }

    // Save the user's information for the route
    req.user = user;

    next();
  });
}

// Admin-only middleware
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Admin access required.",
    });
  }

  next();
}

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

// Create users table

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add role column if the existing database doesn't have it
const userColumns = db.prepare("PRAGMA table_info(users)").all();
const hasRole = userColumns.some((column) => column.name === "role");

if (!hasRole) {
  db.exec(`
    ALTER TABLE users
    ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
  `);
}

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

// User registration route
app.post("/api/register", async (req, res) => {
  try {
    let { full_name, email, password } = req.body;

    // Make sure all fields exist
    if (!full_name || !email || !password) {
      return res.status(400).json({
        error: "Full name, email, and password are required.",
      });
    }

    // Remove unnecessary spaces
    full_name = full_name.trim();
    email = email.trim().toLowerCase();

    // Check again after trimming
    if (!full_name || !email || !password) {
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

    // Validate name length
    if (full_name.length > 100) {
      return res.status(400).json({
        error: "Full name is too long.",
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long.",
      });
    }

    // Check if email already exists
    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Save the new user
    const insert = db.prepare(`
      INSERT INTO users (full_name, email, password_hash)
      VALUES (?, ?, ?)
    `);

    const result = insert.run(
      full_name,
      email,
      passwordHash
    );

    // Successful response
    res.status(201).json({
      message: "Account created successfully.",
      userId: result.lastInsertRowid,
    });

  } catch (error) {
    console.error("Error registering user:", error);

    res.status(500).json({
      error: "Something went wrong. Please try again later.",
    });
  }
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

// User login route
app.post("/api/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    // Make sure all fields exist
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    // Remove unnecessary spaces
    email = email.trim().toLowerCase();

    // Find the user
    const user = db
      .prepare(`
        SELECT id, full_name, email, password_hash, role
        FROM users
        WHERE email = ?
      `)
      .get(email);

    // Don't reveal whether the email exists
    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    // Compare the entered password with the stored hash
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    // Create authentication token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      "fevora-secret-key",
      {
        expiresIn: "1h",
      }
    );

    // Successful login
    res.json({
      message: "Login successful.",
      token: token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Error logging in:", error);

    res.status(500).json({
      error: "Something went wrong. Please try again later.",
    });
  }
});

// Get all content items

app.get("/api/content", authenticateToken, requireAdmin, (req, res) => {
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

app.post("/api/content", authenticateToken, requireAdmin, (req, res) => {
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

app.put("/api/content/:id", authenticateToken, requireAdmin, (req, res) => {
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

app.delete("/api/content/:id", authenticateToken, requireAdmin, (req, res) => {
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