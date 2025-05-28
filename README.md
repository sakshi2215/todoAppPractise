# To-Do List API

## Description

A secure and user-based To-Do List REST API built with Node.js, Express, and MongoDB. It supports user registration, login with JWT authentication, and full CRUD operations on tasks scoped to each authenticated user.

---

## Tech Stack

- **Node.js** with **Express.js** – Backend framework  
- **MongoDB** with **Mongoose** – NoSQL database and ORM  
- **JWT** – For authentication and route protection  
- **bcrypt.js** – For secure password hashing  
- **dotenv** – Environment configuration  
- **nodemon** – Dev tool for live server reloads

---

## Main Features

- **User Authentication:**
  - Register, login, logout
  - JWT token generation, refresh, and verification
  - Change password securely

- **Task Operations:**
  - Create a task (title, description, status)
  - Read all tasks or a specific task (owned by the user)
  - Update task details (if owned)
  - Delete task (if owned)

- **Security & Middleware:**
  - Authentication middleware to protect routes
  - Error handling middleware for cleaner responses

---

## Status Options for Tasks

- `pending` (default)  
- `in-progress`  
- `done`

---

This API is ideal for building a personal task manager with secure multi-user support. Want to add features like due dates or priority levels next? I got you.
