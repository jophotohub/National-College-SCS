from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os

# Import router modules
from routes.auth import router as auth_router
from routes.complaints import router as complaints_router

app = FastAPI(
    title="National College Student Complaint System (SCS) API",
    description="Backend service with SMTP notifications & Supabase PostgreSQL storage",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router)
app.include_router(complaints_router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "National College Student Complaint System API Core",
        "documentation": "/docs"
    }

# Seed Departments list for Python
@app.get("/api/departments")
def get_departments():
    return [
        {"id": "dept-1", "department_name": "Academic Office"},
        {"id": "dept-2", "department_name": "Examination Cell"},
        {"id": "dept-3", "department_name": "Library"},
        {"id": "dept-4", "department_name": "Accounts Office"},
        {"id": "dept-5", "department_name": "Placement Cell"},
        {"id": "dept-6", "department_name": "Hostel Office"},
        {"id": "dept-7", "department_name": "Transport Office"},
        {"id": "dept-8", "department_name": "IT Support"},
        {"id": "dept-9", "department_name": "Department Office"}
    ]

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
