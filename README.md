# TeamTask - Project Documentation

TeamTask is a professional, full-stack task management system designed for collaborative teams. It features a modern Kanban board, real-time notifications, and robust user authentication.

## 🏗️ Architecture Overview

The project is structured as a client-server application:
- **Client**: A high-performance React application built with Vite.
- **Server**: A scalable Node.js/Express API.
- **Database**: SQLite managed via Prisma ORM for efficient local development.

## 🛠️ Technology Stack

### Frontend
- **React 19**: Core UI library.
- **Vite**: Ultra-fast build tool and dev server.
- **Tailwind CSS**: Modern utility-first styling.
- **Lucide React**: Premium icon set.
- **Shadcn UI**: High-end accessible UI components.
- **Framer Motion**: Smooth micro-animations.
- **Axios**: HTTP client for API communication.

### Backend
- **Node.js & Express**: API framework.
- **Prisma**: Next-generation ORM for database management.
- **JWT**: Secure JSON Web Token authentication.
- **Bcrypt**: Password hashing.
- **Morgan & Helmet**: Security and logging middleware.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
1. Clone the repository.
2. Install dependencies for both server and client:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

### Database Setup
Initialize the SQLite database and generate the Prisma client:
```bash
cd server
npx prisma db push
```

### Running the Application
Start the server and client in separate terminals:
```bash
# Terminal 1 (Server)
cd server
npm run dev

# Terminal 2 (Client)
cd client
npm run dev
```
The app will be available at `http://localhost:5173`.

## ✨ Key Features

### 🔐 User Authentication
- **Secure Login/Signup**: JWT-based authentication with password hashing.
- **Password Reset**: Full forgot/reset flow implemented with secure tokens.
- **Role-based Access**: ADMIN vs MEMBER permissions.

### 📋 Task Management
- **CRUD Operations**: Create, view, edit, and delete tasks.
- **Kanban Board**: Drag-and-drop tasks between "To Do", "In Progress", and "Done" statuses.
- **Task Attributes**: Manage title, description, priority (Low, Medium, High), and due dates.

### 📁 Project Management
- **Team Projects**: Organize tasks into specific projects.
- **Member Assignment**: Assign tasks to specific team members.
- **Project Deadlines**: Track project completion goals.

### 🔔 Notifications
- **Assignment Alerts**: Instant notifications when assigned to a new task.
- **Read Management**: View and clear personal notifications.

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/signup` | Register a new user |
| POST | `/login` | Authenticate and get token |
| POST | `/forgot-password` | Request a reset link |
| POST | `/reset-password/:token` | Reset password with token |
| GET | `/me` | Get current user profile |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | Get all tasks (can filter by `projectId`) |
| POST | `/` | Create a new task |
| PUT | `/:id` | Update a task (including status) |
| DELETE | `/:id` | Remove a task |

### Projects (`/api/projects`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/` | List all projects |
| POST | `/` | Create a new project (Admin only) |
| GET | `/:id` | Get project details and tasks |
| PUT | `/:id` | Update project (Admin only) |
| DELETE | `/:id` | Delete project (Admin only) |

## 📂 Directory Structure

```text
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page views (Dashboard, Login, etc.)
│   │   ├── services/    # API communication logic
│   │   └── contexts/    # Global state management
├── server/              # Express backend
│   ├── prisma/          # Database schema
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/      # API endpoint definitions
│   │   ├── middleware/  # Auth and validation
│   │   └── config/      # Database and global config
```
