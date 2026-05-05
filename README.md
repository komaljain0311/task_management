# TeamTask - Project Documentation

TeamTask is a professional, full-stack task management system designed for collaborative teams. It features a modern Kanban board, real-time notifications, and robust user authentication.

## 🏗️ Architecture Overview

The project is structured as a client-server application:
- **Client**: A high-performance React application built with Vite.
- **Server**: A scalable Python/FastAPI API.
- **Database**: SQLite managed via SQLAlchemy ORM for efficient local development.

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
- **Python & FastAPI**: Modern, fast API framework.
- **SQLAlchemy**: Powerful ORM for database management.
- **JWT**: Secure JSON Web Token authentication.
- **PassLib**: Password hashing with bcrypt.
- **Pydantic**: Data validation and serialization.
- **Uvicorn**: ASGI server for high-performance deployment.

## 🚀 Getting Started

### Prerequisites
- Python (v3.8 or higher)
- pip
- Node.js (v18 or higher) for the React client
- npm or yarn

### Installation
1. Clone the repository.
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Install React client dependencies:
   ```bash
   cd client && npm install
   ```

### Database Setup
The SQLite database is automatically created when you run the application. The SQLAlchemy models will create the necessary tables on startup.

### Running the Application
Start the server and client in separate terminals:

```bash
# Terminal 1 (Server)
python main.py

# Terminal 2 (Client)
cd client && npm run dev
```

The app will be available at `http://localhost:5173`.

## 📦 Deployment

### Python Backend
The FastAPI application can be deployed to any platform that supports Python:

- **Vercel**: Uses the `vercel.json` configuration
- **Heroku**: Add a `Procfile` with `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Docker**: Create a `Dockerfile` and `docker-compose.yml`

### React Frontend
The React client can be built and deployed as usual:

```bash
cd client
npm run build
```

The built files in `client/dist/` will be served by the Python backend.

## 🔧 Development

### Backend API Documentation
When running the server, visit `http://localhost:5000/docs` for interactive API documentation powered by Swagger UI.

### Database
- SQLite database file: `taskmanager.db`
- Automatic table creation on startup
- No migrations needed for basic usage

## 🔄 Migration from Node.js

This project has been converted from Node.js/Express/Prisma to Python/FastAPI/SQLAlchemy:

- **Authentication**: JWT tokens with SHA256 password hashing
- **Database**: SQLAlchemy ORM with SQLite
- **API**: RESTful endpoints with automatic OpenAPI documentation
- **CORS**: Configured for React development server
- **Static Files**: Serves built React app in production

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
