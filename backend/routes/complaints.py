import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field

# Import authentication helper to secure endpoints
from utils.helpers import get_current_user

# Setup APIRouter
router = APIRouter(prefix="/api", tags=["Complaints"])

# Configurable Department Email Addresses from Environment Variables
DEPT_EMAILS = {
    "Academic": os.environ.get("EMAIL_ACADEMIC", "academic@college.edu"),
    "Examination": os.environ.get("EMAIL_EXAMINATION", "exam@college.edu"),
    "Library": os.environ.get("EMAIL_LIBRARY", "library@college.edu"),
    "Hostel": os.environ.get("EMAIL_HOSTEL", "hostel@college.edu"),
    "Placement": os.environ.get("EMAIL_PLACEMENT", "placement@college.edu"),
    "Accounts": os.environ.get("EMAIL_ACCOUNTS", "accounts@college.edu"),
    "IT Support": os.environ.get("EMAIL_ITSUPPORT", "itsupport@college.edu"),
}

# SMTP Configuration
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
SMTP_SENDER = os.environ.get("SMTP_SENDER", "scs-alerts@college.edu")

# Front-end host link configuration for notification emails
APP_URL = os.environ.get("APP_URL", "http://localhost:3000")

# Setup Supabase client or direct psycopg2 fallback
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

# In-memory mock database as fallback if Supabase is not configured yet (ensures local dev server starts)
MOCK_QUERIES = []
MOCK_REPLIES = []
MOCK_NOTIFICATIONS = []

try:
    if SUPABASE_URL and SUPABASE_KEY:
        from supabase import create_client, Client
        supabase: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_KEY)
    else:
        supabase = None
except Exception as e:
    print(f"Supabase Client Error (Using Mock State fallback): {e}")
    supabase = None


# --- PYDANTIC SCHEMAS ---
class QueryCreateSchema(BaseModel):
    department_id: str
    department_name: str
    subject: str
    description: str
    priority: str
    attachment: Optional[str] = ""

class ReplyCreateSchema(BaseModel):
    message: str

class StatusUpdateSchema(BaseModel):
    status: str
    assigned_admin_id: Optional[str] = None


# --- HELPER FUNCTIONS ---

def send_smtp_email_background(to_email: str, subject: str, html_content: str):
    """
    Sends an email using standard smtplib and MIMEText.
    Runs asynchronously inside FastAPI BackgroundTasks so requests remain blazing fast.
    """
    # Guard against missing credentials in unconfigured testing setups
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"[SMTP SIMULATION] Sent to: {to_email} | Subject: {subject}")
        print(f"[HTML Content Preview]:\n{html_content[:300]}...")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_SENDER
        msg["To"] = to_email

        msg.attach(MIMEText(html_content, "html"))

        # Create connection and send
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_SENDER, [to_email], msg.as_string())
        print(f"[SMTP SUCCESS] Email delivered successfully to {to_email}")
    except Exception as e:
        print(f"[SMTP ERROR] Failed to send email to {to_email}: {e}")


def determine_dept_email(department_name: str) -> str:
    """
    Maps a department name (e.g. 'Examination Cell') to its respective officer email.
    """
    for key, email in DEPT_EMAILS.items():
        if key.lower() in department_name.lower():
            return email
    # Fallback to general academic admin email
    return DEPT_EMAILS.get("Academic", "admin@college.edu")


# --- API ENDPOINTS ---

@router.post("/queries", status_code=201)
def create_complaint(
    query_data: QueryCreateSchema,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Submits a new complaint, stores it in Supabase, determines target officer,
    dispatches email asynchronously, and triggers the admin's in-app notification.
    """
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Only students can submit complaints.")

    student_id = current_user.get("id")
    student_name = current_user.get("name", "Student")
    student_email = current_user.get("email", "")
    register_number = current_user.get("register_number", "N/A")
    student_dept = current_user.get("department", "N/A")

    complaint_id = f"comp-{int(datetime.utcnow().timestamp())}"
    submitted_at = datetime.utcnow().isoformat()

    # Determine target email address based on department
    dept_email = determine_dept_email(query_data.department_name)

    # Prepare database record
    new_query = {
        "id": complaint_id,
        "student_id": student_id,
        "student_name": student_name,
        "student_register": register_number,
        "student_dept": student_dept,
        "department_id": query_data.department_id,
        "department_name": query_data.department_name,
        "subject": query_data.subject,
        "description": query_data.description,
        "attachment": query_data.attachment,
        "priority": query_data.priority,
        "status": "Submitted",
        "created_at": submitted_at,
        "updated_at": submitted_at
    }

    # Store in Database (Supabase PostgreSQL)
    if supabase:
        try:
            supabase.table("queries").insert(new_query).execute()
        except Exception as e:
            print(f"Supabase Insert Error: {e}")
            raise HTTPException(status_code=500, detail="Database write operation failed")
    else:
        # Fallback to in-memory mocks
        MOCK_QUERIES.append(new_query)

    # Construct and dispatch Email to Department Officer in background thread
    officer_subject = f"[SCS NEW COMPLAINT] - {query_data.subject}"
    direct_link = f"{APP_URL}/queries"
    officer_html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 8px;">New Student Complaint Submitted</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr><td style="padding: 6px 0; font-weight: bold; width: 35%;">Complaint ID:</td><td>{complaint_id}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Student Name:</td><td>{student_name}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Register Number:</td><td>{register_number}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Student Department:</td><td>{student_dept}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Target Department:</td><td>{query_data.department_name}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Priority:</td><td style="color: #dc2626; font-weight: bold;">{query_data.priority}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Subject:</td><td style="font-weight: bold;">{query_data.subject}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: bold;">Submitted Date:</td><td>{submitted_at}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9;">
          <strong>Description:</strong><br/>
          <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.5; color: #334155;">{query_data.description}</p>
        </div>
        <div style="margin-top: 25px; text-align: center;">
          <a href="{direct_link}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View in Management Portal
          </a>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;"/>
        <p style="font-size: 11px; color: #64748b; text-align: center;">
          National College student Complaint System (SCS) Auto-Generated Alert. Do not reply directly to this email.
        </p>
      </body>
    </html>
    """
    
    # Run the email sender in the FastAPI background thread
    background_tasks.add_task(send_smtp_email_background, dept_email, officer_subject, officer_html)

    # Create in-app Notification for the Management Portal
    new_notification = {
        "id": f"notif-{int(datetime.utcnow().timestamp())}",
        "user_id": "admin-all", # Broadly targets management officers
        "title": "New Complaint Received",
        "message": f"A new complaint regarding \"{query_data.subject}\" has been submitted to the {query_data.department_name}.",
        "status": "unread",
        "query_id": complaint_id,
        "created_at": submitted_at
    }

    if supabase:
        try:
            supabase.table("notifications").insert(new_notification).execute()
        except Exception as e:
            print(f"Failed to insert notification: {e}")
    else:
        MOCK_NOTIFICATIONS.append(new_notification)

    return {"message": "Complaint submitted successfully", "id": complaint_id}


@router.get("/queries")
def get_complaints(current_user: dict = Depends(get_current_user)):
    """
    Gets list of complaints. Students see their own; Admins see all.
    """
    if current_user.get("role") == "admin":
        if supabase:
            res = supabase.table("queries").select("*").order("created_at", desc=True).execute()
            return res.data
        else:
            return sorted(MOCK_QUERIES, key=lambda x: x["created_at"], reverse=True)
    else:
        student_id = current_user.get("id")
        if supabase:
            res = supabase.table("queries").select("*").eq("student_id", student_id).order("created_at", desc=True).execute()
            return res.data
        else:
            filtered = [q for q in MOCK_QUERIES if q["student_id"] == student_id]
            return sorted(filtered, key=lambda x: x["created_at"], reverse=True)


@router.get("/queries/{query_id}")
def get_complaint_detail(query_id: str, current_user: dict = Depends(get_current_user)):
    """
    Fetches detailed complaint structure including replies.
    """
    # Find basic query
    query = None
    if supabase:
        res = supabase.table("queries").select("*").eq("id", query_id).execute()
        if res.data:
            query = res.data[0]
    else:
        for q in MOCK_QUERIES:
            if q["id"] == query_id:
                query = q
                break

    if not query:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Safety checks
    if current_user.get("role") == "student" and query["student_id"] != current_user.get("id"):
        raise HTTPException(status_code=403, detail="Access denied")

    # Fetch replies
    replies = []
    if supabase:
        res_replies = supabase.table("replies").select("*").eq("query_id", query_id).order("replied_at").execute()
        replies = res_replies.data
    else:
        replies = [r for r in MOCK_REPLIES if r["query_id"] == query_id]
        replies = sorted(replies, key=lambda x: x["replied_at"])

    return {"query": query, "replies": replies}


@router.put("/queries/{query_id}/status")
def update_complaint_status(
    query_id: str,
    status_data: StatusUpdateSchema,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """
    Updates the status of a complaint, registers progress/resolution,
    and dispatches automated email/in-app notifications to the student.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update complaint status.")

    updated_at = datetime.utcnow().isoformat()

    # Find and update record
    query = None
    if supabase:
        res = supabase.table("queries").select("*").eq("id", query_id).execute()
        if res.data:
            query = res.data[0]
    else:
        for q in MOCK_QUERIES:
            if q["id"] == query_id:
                query = q
                break

    if not query:
        raise HTTPException(status_code=404, detail="Complaint not found")

    # Perform database updates
    update_fields = {
        "status": status_data.status,
        "updated_at": updated_at
    }
    if status_data.assigned_admin_id:
        update_fields["assigned_admin_id"] = status_data.assigned_admin_id

    if supabase:
        supabase.table("queries").update(update_fields).eq("id", query_id).execute()
    else:
        query.update(update_fields)

    # 1. Fetch student contact info to send notification
    student_email = ""
    student_name = ""
    if supabase:
        res_student = supabase.table("students").select("email", "name").eq("id", query["student_id"]).execute()
        if res_student.data:
            student_email = res_student.data[0]["email"]
            student_name = res_student.data[0]["name"]
    else:
        student_email = "student@cs.edu" # mock fallback
        student_name = query.get("student_name", "Student")

    # 2. Add an in-app notification for the Student Portal
    student_notification = {
        "id": f"notif-{int(datetime.utcnow().timestamp())}",
        "user_id": query["student_id"],
        "title": "Complaint Status Updated",
        "message": f"Your complaint regarding \"{query['subject']}\" is now marked as [{status_data.status}].",
        "status": "unread",
        "query_id": query_id,
        "created_at": updated_at
    }

    if supabase:
        supabase.table("notifications").insert(student_notification).execute()
    else:
        MOCK_NOTIFICATIONS.append(student_notification)

    # 3. Dispatches automated status email to student in background task
    if student_email:
        student_subject = f"[SCS UPDATE] Status Changed to {status_data.status} for: {query['subject']}"
        student_html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">SCS Complaint Status Update</h2>
            <p>Dear {student_name},</p>
            <p>The status of your complaint has been updated by the department administrator:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr><td style="padding: 6px 0; font-weight: bold; width: 35%;">Complaint ID:</td><td>{query_id}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Subject:</td><td>{query['subject']}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">New Status:</td><td style="font-weight: bold; color: #2563eb;">{status_data.status}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Last Updated:</td><td>{updated_at}</td></tr>
            </table>
            <p style="margin-top: 20px;">You can view additional details and exchange messages directly on the Student Complaint Portal.</p>
            <div style="margin-top: 25px; text-align: center;">
              <a href="{APP_URL}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Access Student Portal
              </a>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;"/>
            <p style="font-size: 11px; color: #64748b; text-align: center;">
              National College Student Complaint System (SCS) Auto-Generated Alert. Do not reply directly to this email.
            </p>
          </body>
        </html>
        """
        background_tasks.add_task(send_smtp_email_background, student_email, student_subject, student_html)

    return {"message": f"Status successfully updated to {status_data.status}"}


@router.get("/notifications")
def get_notifications(current_user: dict = Depends(get_current_user)):
    """
    Returns lists of unread/read notifications for logged in users.
    """
    user_id = current_user.get("id")
    role = current_user.get("role")

    if supabase:
        if role == "admin":
            # Admins view general broadcast + admin notifications
            res = supabase.table("notifications").select("*").or_(f"user_id.eq.admin-all,user_id.eq.{user_id}").order("created_at", desc=True).execute()
        else:
            res = supabase.table("notifications").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return res.data
    else:
        if role == "admin":
            filtered = [n for n in MOCK_NOTIFICATIONS if n["user_id"] in ("admin-all", user_id)]
        else:
            filtered = [n for n in MOCK_NOTIFICATIONS if n["user_id"] == user_id]
        return sorted(filtered, key=lambda x: x["created_at"], reverse=True)


@router.put("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: str, current_user: dict = Depends(get_current_user)):
    """
    Marks the given notification status as Read.
    """
    if supabase:
        supabase.table("notifications").update({"status": "read"}).eq("id", notif_id).execute()
    else:
        for n in MOCK_NOTIFICATIONS:
            if n["id"] == notif_id:
                n["status"] = "read"
                break
    return {"message": "Notification marked as read"}
