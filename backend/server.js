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

function requireCustomer(req, res, next) {
  if (req.user.role !== "user") {
    return res.status(403).json({
      error: "Customer access required.",
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
    user_id INTEGER,
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

// Create customer requests table
db.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Create services table
db.prepare(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

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

const contactColumns = db.prepare("PRAGMA table_info(contacts)").all();

const hasUserId = contactColumns.some(
  (column) => column.name === "user_id"
);

if (!hasUserId) {
  db.exec(`
    ALTER TABLE contacts
    ADD COLUMN user_id INTEGER
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
    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    const insert = db.prepare(`
      INSERT INTO contacts (
        full_name,
        email,
        subject,
        message,
        user_id
      )
      VALUES (?, ?, ?, ?, ?)
    `);

    insert.run(
      full_name,
      email,
      subject,
      message,
      existingUser ? existingUser.id : null
    );

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

app.get(
  "/api/customer/profile",
  authenticateToken,
  requireCustomer,
  (req, res) => {
    try {
      const user = db
        .prepare(`
          SELECT id, full_name, email, role, created_at
          FROM users
          WHERE id = ?
        `)
        .get(req.user.userId);

      if (!user) {
        return res.status(404).json({
          error: "User not found.",
        });
      }

      res.json(user);
    } catch (error) {
      console.error("Profile fetch error:", error);

      res.status(500).json({
        error: "Unable to retrieve profile.",
      });
    }
  }
);

app.put(
  "/api/customer/profile",
  authenticateToken,
  requireCustomer,
  (req, res) => {
    try {
      let { full_name, email } = req.body;

      full_name = full_name?.trim();
      email = email?.trim().toLowerCase();

      if (!full_name || !email) {
        return res.status(400).json({
          error: "Full name and email are required.",
        });
      }

      if (full_name.length > 100) {
        return res.status(400).json({
          error: "Full name must be 100 characters or less.",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: "Please enter a valid email address.",
        });
      }

      const existingUser = db
        .prepare(`
          SELECT id
          FROM users
          WHERE email = ? AND id != ?
        `)
        .get(email, req.user.userId);

      if (existingUser) {
        return res.status(409).json({
          error: "An account with this email already exists.",
        });
      }

      const result = db
        .prepare(`
          UPDATE users
          SET full_name = ?, email = ?
          WHERE id = ?
        `)
        .run(full_name, email, req.user.userId);

      if (result.changes === 0) {
        return res.status(404).json({
          error: "User not found.",
        });
      }

      const updatedUser = db
        .prepare(`
          SELECT id, full_name, email, role, created_at
          FROM users
          WHERE id = ?
        `)
        .get(req.user.userId);

      res.json({
        message: "Profile updated successfully.",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Profile update error:", error);

      res.status(500).json({
        error: "Unable to update profile.",
      });
    }
  }
);

app.get(
  "/api/customer/project",
  authenticateToken,
  requireCustomer,
  (req, res) => {
    try {
      console.log("LOGGED IN USER ID:", req.user.userId);

      const allContacts = db
        .prepare("SELECT id, email, subject, user_id FROM contacts")
        .all();

      console.log("CONTACTS:", allContacts);
      const users = db
        .prepare("SELECT id, full_name, email, role FROM users")
        .all();

      console.log("USERS:", users);
      const project = db
        .prepare(`
          SELECT id, subject, message, created_at
          FROM contacts
          WHERE email = ?
          ORDER BY id DESC
          LIMIT 1
        `)
        .get(req.user.email);

      if (!project) {
        return res.status(404).json({
          error: "No project request found.",
        });
      }

      res.json(project);
    } catch (error) {
      console.error("Project fetch error:", error);

      res.status(500).json({
        error: "Unable to retrieve project.",
      });
    }
  }
);

// ===============================
// CUSTOMER REQUEST MANAGEMENT
// ===============================

// Submit a new customer request
app.post(
  "/api/customer/requests",
  authenticateToken,
  requireCustomer,
  (req, res) => {
    try {
      let { title, description, category } = req.body;

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

      // Validate after trimming
      if (!title || !description || !category) {
        return res.status(400).json({
          error: "All fields are required.",
        });
      }

      // Validate lengths
      if (title.length > 200) {
        return res.status(400).json({
          error: "Title must be 200 characters or less.",
        });
      }

      if (description.length > 2000) {
        return res.status(400).json({
          error: "Description must be 2000 characters or less.",
        });
      }

      if (category.length > 100) {
        return res.status(400).json({
          error: "Category must be 100 characters or less.",
        });
      }

      // Save request to database
      const insert = db.prepare(`
        INSERT INTO requests (
          user_id,
          title,
          description,
          category
        )
        VALUES (?, ?, ?, ?)
      `);

      const result = insert.run(
        req.user.userId,
        title,
        description,
        category
      );

      // Successful response
      res.status(201).json({
        message: "Request submitted successfully.",
        requestId: result.lastInsertRowid,
      });
    } catch (error) {
      console.error("Error submitting customer request:", error);

      res.status(500).json({
        error: "Unable to submit request.",
      });
    }
  }
);

// Get customer's requests
app.get(
  "/api/customer/requests",
  authenticateToken,
  requireCustomer,
  (req, res) => {
    try {
      const requests = db
        .prepare(`
          SELECT
            id,
            title,
            description,
            category,
            status,
            created_at,
            updated_at
          FROM requests
          WHERE user_id = ?
          ORDER BY created_at DESC
        `)
        .all(req.user.userId);

      res.json(requests);
    } catch (error) {
      console.error("Error fetching customer requests:", error);

      res.status(500).json({
        error: "Unable to retrieve your requests.",
      });
    }
  }
);

// Get customer requests with search and filtering - Admin only
app.get(
  "/api/admin/requests",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    try {
      const { search, status, date } = req.query;

      let query = `
        SELECT
          requests.id,
          requests.title,
          requests.description,
          requests.category,
          requests.status,
          requests.created_at,
          requests.updated_at,
          users.full_name,
          users.email
        FROM requests
        JOIN users ON requests.user_id = users.id
        WHERE 1 = 1
      `;

      const params = [];

      // Search by customer name, email, title, description, or category
      if (search && search.trim()) {
        query += `
          AND (
            users.full_name LIKE ?
            OR users.email LIKE ?
            OR requests.title LIKE ?
            OR requests.description LIKE ?
            OR requests.category LIKE ?
          )
        `;

        const searchValue = `%${search.trim()}%`;

        params.push(
          searchValue,
          searchValue,
          searchValue,
          searchValue,
          searchValue
        );
      }

      // Filter by status
      if (status && status !== "All") {
        query += ` AND requests.status = ?`;
        params.push(status);
      }

      if (date) {
        query += ` AND DATE(requests.created_at) = ?`;
        params.push(date);
      }

      // Newest requests first
      query += ` ORDER BY requests.created_at DESC`;

      const requests = db.prepare(query).all(...params);

      res.json(requests);
    } catch (error) {
      console.error("Error searching/filtering customer requests:", error);

      res.status(500).json({
        error: "Unable to retrieve customer requests.",
      });
    }
  }
);

// Update customer request status - Admin only
app.put(
  "/api/admin/requests/:id/status",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    try {
      const { status } = req.body;
      const requestId = req.params.id;

      const allowedStatuses = [
        "Pending",
        "In Review",
        "In Progress",
        "Completed",
        "Rejected",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid request status.",
        });
      }

      const existingRequest = db
        .prepare("SELECT id FROM requests WHERE id = ?")
        .get(requestId);

      if (!existingRequest) {
        return res.status(404).json({
          error: "Request not found.",
        });
      }

      db.prepare(`
        UPDATE requests
        SET status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(status, requestId);

      res.json({
        message: "Request status updated successfully.",
      });
    } catch (error) {
      console.error("Error updating request status:", error);

      res.status(500).json({
        error: "Unable to update request status.",
      });
    }
  }
);

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

// ===============================
// SERVICE MANAGEMENT
// ===============================

// Get all services
app.get("/api/services", (req, res) => {
  try {
    const services = db
      .prepare("SELECT * FROM services ORDER BY id ASC")
      .all();

    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);

    res.status(500).json({
      error: "Something went wrong while fetching services.",
    });
  }
});

// Add a new service
app.post("/api/services", authenticateToken, requireAdmin, (req, res) => {
  try {
    let { name, description, category } = req.body;

    // Make sure required fields exist
    if (!name || !description) {
      return res.status(400).json({
        error: "Service name and description are required.",
      });
    }

    // Remove unnecessary spaces
    name = name.trim();
    description = description.trim();
    category = category ? category.trim() : "";

    // Save service to database
    const insert = db.prepare(`
      INSERT INTO services (name, description, category)
      VALUES (?, ?, ?)
    `);

    const result = insert.run(
      name,
      description,
      category
    );

    res.status(201).json({
      message: "Service created successfully.",
      id: result.lastInsertRowid,
    });
  } catch (error) {
    console.error("Error creating service:", error);

    res.status(500).json({
      error: "Something went wrong while creating the service.",
    });
  }
});

// Update an existing service
app.put("/api/services/:id", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    let { name, description, category } = req.body;

    // Make sure required fields exist
    if (!name || !description) {
      return res.status(400).json({
        error: "Service name and description are required.",
      });
    }

    // Remove unnecessary spaces
    name = name.trim();
    description = description.trim();
    category = category ? category.trim() : "";

    // Update service
    const update = db.prepare(`
      UPDATE services
      SET
        name = ?,
        description = ?,
        category = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = update.run(
      name,
      description,
      category,
      id
    );

    // Check if service exists
    if (result.changes === 0) {
      return res.status(404).json({
        error: "Service not found.",
      });
    }

    res.json({
      message: "Service updated successfully.",
    });
  } catch (error) {
    console.error("Error updating service:", error);

    res.status(500).json({
      error: "Something went wrong while updating the service.",
    });
  }
});

// Delete a service
app.delete("/api/services/:id", authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;

    const deleteService = db.prepare(`
      DELETE FROM services
      WHERE id = ?
    `);

    const result = deleteService.run(id);

    // Check if service exists
    if (result.changes === 0) {
      return res.status(404).json({
        error: "Service not found.",
      });
    }

    res.json({
      message: "Service deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting service:", error);

    res.status(500).json({
      error: "Something went wrong while deleting the service.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Fevora backend running on http://localhost:${PORT}`);
});