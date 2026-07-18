from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from utils.helpers import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class StudentRegisterSchema(BaseModel):
    register_number: str
    name: str
    department: str
    year: int
    email: EmailStr
    password: str
    phone: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

# Mock local store as fallback for standalone execution
MOCK_STUDENTS = []
MOCK_ADMINS = []

@router.post("/student/register")
def register_student(student: StudentRegisterSchema):
    # In real Supabase project:
    # response = supabase.table("students").insert(student.dict()).execute()
    # Let's mock the register flow
    for s in MOCK_STUDENTS:
        if s["email"] == student.email or s["register_number"] == student.register_number:
            raise HTTPException(status_code=400, detail="Student already registered")
            
    student_dict = student.dict()
    student_dict["password"] = hash_password(student.password)
    student_dict["id"] = "stud-uuid"
    student_dict["role"] = "student"
    MOCK_STUDENTS.append(student_dict)
    
    token = create_access_token({"id": student_dict["id"], "email": student_dict["email"], "role": "student"})
    return {
        "token": token,
        "user": {
            "id": student_dict["id"],
            "name": student_dict["name"],
            "email": student_dict["email"],
            "register_number": student_dict["register_number"],
            "department": student_dict["department"],
            "year": student_dict["year"],
            "phone": student_dict["phone"],
            "role": "student"
        }
    }

@router.post("/student/login")
def login_student(credentials: LoginSchema):
    # In real Supabase project:
    # response = supabase.table("students").select("*").eq("email", credentials.email).execute()
    # Check credentials
    student = None
    for s in MOCK_STUDENTS:
        if s["email"] == credentials.email:
            student = s
            break
            
    if not student or not verify_password(credentials.password, student["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    token = create_access_token({"id": student["id"], "email": student["email"], "role": "student"})
    return {
        "token": token,
        "user": {
            "id": student["id"],
            "name": student["name"],
            "email": student["email"],
            "register_number": student["register_number"],
            "department": student["department"],
            "year": student["year"],
            "phone": student["phone"],
            "role": "student"
        }
    }
