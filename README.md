# Fevora — Full-Stack Digital Solutions Platform

Fevora is a full-stack web application designed for a digital solutions company. It provides a platform for managing services, customer inquiries, projects, team members, and documents through a centralized system.

The project combines a React frontend with a Node.js and Express backend, using SQLite for database management and JWT-based authentication.

## Features

### 1. Public Website
- Company landing page and service presentation
- Contact and inquiry form
- Login and registration navigation
- Responsive, modern interface

### 2. Authentication and Authorization
- User registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control for Admins, Employees, and Customers

### 3. Content Management
- Create, view, update, and delete content
- Manage content categories and publication status
- Database-backed content management

### 4. Service Management
- Store and display services from the database
- Manage service information through the backend

### 5. Customer Dashboard
- View customer profile information
- Update profile details
- Submit and track project requests

### 6. Project and Request Management
- Create and manage customer requests
- Track request statuses
- Search and filter requests
- Assign projects to clients and team members

### 7. Document Management
- Upload customer documents
- Store document metadata in SQLite
- Associate documents with customers and requests
- Access uploaded files through the backend

### 8. Role-Based Dashboard Access
- **Admin:** Manage platform content and administrative operations
- **Employee:** Access permitted management features and update request statuses
- **Customer:** Access personal information, requests, and relevant documents

## Technology Stack

**Frontend**
- React
- Vite
- JavaScript
- HTML5
- CSS3
- React Router
- React Icons

**Backend**
- Node.js
- Express.js
- REST API
- JSON Web Tokens (JWT)
- bcrypt
- Multer
- CORS

**Database**
- SQLite
- better-sqlite3

## Project Structure

```text
Fevora/
├── backend/
│   ├── server.js
│   ├── fevora.db
│   └── uploads/
├── public/
├── src/
│   ├── assets/
│   ├── App.jsx
│   ├── Content.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── ...
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

*Note: Update the structure above if your actual backend folder or filenames differ.*

## Installation and Setup

### Prerequisites
- Node.js and npm
- A code editor such as Visual Studio Code

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Fevora
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your repository URL.

### 2. Install Frontend Dependencies

From the project root, run:

```bash
npm install
```

### 3. Install Backend Dependencies

Open a terminal in the backend folder:

```bash
cd backend
npm install
```

If the backend does not have its own `package.json`, install the backend dependencies according to your existing project setup instead.

### 4. Start the Backend

From the backend folder, run:

```bash
node server.js
```

The backend runs on:

```text
http://localhost:5000
```

### 5. Start the Frontend

Open a second terminal in the project root:

```bash
npm run dev
```

Open the local URL printed by Vite in your terminal, commonly:

```text
http://localhost:5173
```

## API Overview

| Endpoint | Purpose |
|---|---|
| `POST /api/contact` | Submit a public inquiry |
| `POST /api/register` | Register a user |
| `POST /api/login` | Authenticate a user |
| `/api/content` | Manage website content |
| `/api/services` | Retrieve and manage services |
| `/api/customer/profile` | Access customer profile |
| `/api/customer/requests` | Submit and view customer requests |
| `/api/customer/documents` | Upload and retrieve customer documents |
| `/api/admin/requests` | Manage customer requests |

*The endpoints listed are an overview. Check the backend implementation for the exact HTTP methods, permissions, and available routes.*

## Database

Fevora uses SQLite to store application data, including user accounts, content, services, customer inquiries, requests, projects, and document metadata.

The database is managed using `better-sqlite3`. Required tables are initialized by the backend, and uploaded files are stored in the configured uploads directory.

## Security

- Passwords are hashed before storage.
- JWT tokens are used to authenticate protected requests.
- Role-based middleware restricts access to authorized operations.
- Backend routes validate submitted data.
- CORS is configured for frontend-backend communication.

**Important:** Do not commit passwords, JWT secrets, private environment files, or sensitive customer information to a public repository.

## Future Improvements

- Automated testing for frontend and backend
- Improved form validation and error handling
- Enhanced dashboard analytics
- Pagination for large datasets
- Production deployment and environment configuration

## Author

**Feven Solomon**

Software Engineering Student

## Project Purpose

Fevora was developed as a full-stack software engineering project to integrate frontend development, backend APIs, database management, authentication, authorization, and document handling into one application.
