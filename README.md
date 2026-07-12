# 🚗 AutoElite — Car Dealership Inventory System

A full-stack Car Dealership Inventory System built with **Node.js/Express** (backend), **React/Vite** (frontend), and **MySQL** (database). Features JWT authentication, role-based access control, vehicle inventory management, and a premium dark-themed UI.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Running Tests](#running-tests)
- [Default Accounts](#default-accounts)
- [My AI Usage](#my-ai-usage)

---

## ✨ Features

### Backend
- **RESTful API** with Express.js and TypeScript
- **JWT Authentication** with role-based access control (User/Admin)
- **Vehicle CRUD** — Create, Read, Update, Delete vehicles
- **Search & Filter** — Search by make, model, category, and price range
- **Inventory Management** — Purchase and restock operations
- **Input Validation** — Zod schema validation on all endpoints
- **Security** — Helmet, CORS, bcrypt password hashing

### Frontend
- **Modern SPA** built with React 18+ and TypeScript
- **Premium Dark Theme** with glassmorphism effects
- **Responsive Design** — Works on mobile, tablet, and desktop
- **User Authentication** — Login and registration forms
- **Vehicle Dashboard** — Browse, search, and filter vehicles
- **Purchase System** — Buy vehicles with stock tracking
- **Admin Panel** — Full vehicle management (add, edit, delete, restock)

### Testing
- **45 automated tests** across 4 test suites
- **Unit tests** for Auth, Vehicle, and Inventory services
- **Integration tests** for all API endpoints
- **TDD approach** — tests written alongside implementation

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js, TypeScript |
| Frontend | React 18, Vite, TypeScript |
| Database | MySQL + Sequelize ORM |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod |
| Testing | Jest, Supertest |
| Styling | Vanilla CSS (custom design system) |

---

## 📁 Project Structure

```
├── server/                  # Backend API
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth & admin guards
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── tests/           # Jest test suites
│   │   ├── app.ts           # Express app setup
│   │   ├── index.ts         # Server entry point
│   │   └── seed.ts          # Database seeder
│   ├── package.json
│   └── tsconfig.json
│
├── client/                  # React Frontend
│   ├── src/
│   │   ├── api/             # Axios HTTP client
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth state management
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript interfaces
│   │   ├── App.tsx          # Root component + routing
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── .env                     # Environment variables
├── .env.example             # Environment template
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** v18+ installed
- **MySQL** v8+ installed and running
- **npm** v9+ installed

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Car Dealership Inventory System"
```

### 2. Configure Environment

Copy the example environment file and update it with your MySQL credentials:

```bash
cp .env.example .env
```

### 3. Create MySQL Databases

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS car_dealership; CREATE DATABASE IF NOT EXISTS car_dealership_test;"
```

### 4. Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 5. Seed the Database (Optional)

This creates an admin user and 10 sample vehicles:

```bash
cd server
npm run seed
```

### 6. Start the Application

Open **two terminal windows**:

**Terminal 1 — Backend (port 3001):**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ✗ | Register a new user |
| POST | `/api/auth/login` | ✗ | Login and receive JWT |

### Vehicles
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/vehicles` | ✓ | Any | List all vehicles |
| GET | `/api/vehicles/search` | ✓ | Any | Search/filter vehicles |
| POST | `/api/vehicles` | ✓ | Admin | Add a new vehicle |
| PUT | `/api/vehicles/:id` | ✓ | Admin | Update a vehicle |
| DELETE | `/api/vehicles/:id` | ✓ | Admin | Delete a vehicle |

### Inventory
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/vehicles/:id/purchase` | ✓ | Any | Purchase a vehicle |
| POST | `/api/vehicles/:id/restock` | ✓ | Admin | Restock a vehicle |

---

## 🧪 Running Tests

```bash
cd server

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Test Results

```
Test Suites: 4 passed, 4 total
Tests:       45 passed, 45 total

✓ AuthService       — 7 tests (register, login, duplicates, hashing)
✓ VehicleService    — 14 tests (CRUD, search, filters)
✓ InventoryService  — 9 tests (purchase, restock, stock validation)
✓ Integration       — 16 tests (full API endpoint coverage)
```

---

## 🔑 Default Accounts

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dealership.com | admin123 |

Regular users can be created via the registration page.

---

## 🤖 My AI Usage

### Tools Used
- **Gemini (Antigravity)** — Primary AI coding assistant

### How I Used AI

1. **Project Architecture**: Used Gemini to brainstorm the project structure, including the separation of concerns (controllers → services → models) and file organization.

2. **Boilerplate Generation**: Gemini generated initial boilerplate for Express app setup, Sequelize model definitions, and middleware structures, which I then reviewed and customized.

3. **Test Suite Development**: Used Gemini to help generate comprehensive test cases for unit and integration tests, ensuring coverage of edge cases like insufficient stock, duplicate users, and role-based access control.

4. **Bug Fixing**: When encountering the Sequelize public class fields shadowing issue (`declare` vs `!`), Gemini helped diagnose and fix the problem.

5. **Frontend Design System**: Gemini helped create the CSS design system with modern aesthetics including glassmorphism, gradient accents, and responsive layouts.

6. **Database Seeding**: Used Gemini to generate realistic sample vehicle data for development testing.

### Reflection on AI Impact

AI significantly accelerated the development process, especially for:
- **Boilerplate reduction**: Setting up Express, Sequelize, and React configurations that would typically take hours was done in minutes.
- **Test coverage**: AI helped think of edge cases I might have missed (like testing zero-quantity purchases or negative restock values).
- **Debugging**: The Sequelize `declare` vs `!` issue was quickly identified and resolved with AI assistance.

However, I found that AI-generated code still required careful review — particularly around TypeScript type safety and Sequelize-specific patterns. The key value was in using AI as an accelerator, not a replacement for understanding.
