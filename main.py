from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path

from app.database import engine, Base
from app.routes import auth, projects, tasks, notifications

app = FastAPI(title="Task Management API", version="1.0.0")

@app.on_event("startup")
async def startup_event():
    print("Connecting to database...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully ✅")
    except Exception as e:
        print(f"Error creating database tables: {e}")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])

# Health check
@app.get("/health")
async def health_check():
    return {"status": "OK"}

# Serve static files from React build (if exists)
client_dist = Path(__file__).parent / "client" / "dist"
if client_dist.exists():
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # 1. Check if it's an API call - let it fall through to routers
        if full_path.startswith("api"):
            raise HTTPException(status_code=404)
        
        # 2. Check if the file exists in the static directory (for assets, favicon, etc)
        file_path = client_dist / full_path
        if full_path and file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
            
        # 3. Otherwise serve index.html (SPA routing)
        index_file = client_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
            
        return {"message": "Frontend build found but index.html missing"}
else:
    @app.get("/")
    async def root():
        return {"message": "Task Management API (Frontend not built)"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port)