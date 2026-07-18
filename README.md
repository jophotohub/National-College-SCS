# Campus Connect – Smart Student Query & Grievance Management System

Campus Connect is a fully open-source, secure, and privacy-first student grievance ERP designed to act as an instant bridge between college students and management. Students can submit academic and administrative queries, attach documents, and track status transitions in real-time. Administrative staff can filter queries by department, assign task officers, publish response replies, and monitor dashboard KPIs.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** HTML5, CSS3 (Tailwind-compatible styling), Vanilla JavaScript, and dynamic, interactive **Recharts / Chart.js** dashboards. Optimized for both desktop and mobile layouts.
- **Backend Options:**
  - **Node.js (Express + TypeScript):** Standard pre-configured, production-ready server running out-of-the-box in development.
  - **Python (FastAPI):** Standalone REST API service folder located inside `/backend` for ready-to-run deployment (FastAPI, JWT Auth, Bcrypt, Uvicorn).
- **Database:** Supabase PostgreSQL with Row Level Security (RLS) policies.
- **Storage:** Supabase Storage bucket for student document/image uploads.

---

## 📁 Project Directory Structure

```text
CampusConnect/
├── backend/                   # Python FastAPI Backend
│   ├── main.py                # FastAPI server entry point
│   ├── routes/                # Auth, Query, and Report Routers
│   │   └── auth.py            # JWT Login & Registration logic
│   ├── utils/                 # Password crypt & JWT helpers
│   │   └── helpers.py         
│   └── database/              # Supabase connections
│
├── src/                       # Node.js Fullstack React (Live ERP Preview)
│   ├── components/            
│   │   ├── Navbar.tsx         # ERP top bar with notification drawer
│   │   ├── Sidebar.tsx        # Responsive administrative sidebar
│   │   ├── StudentDashboard.tsx # Student metrics, recent files & workflow tracker
│   │   ├── ManagementDashboard.tsx # Recharts monthly analytics & urgent pool
│   │   ├── SubmitQuery.tsx    # Drag-and-drop drag file uploads (PDF & Image previews)
│   │   ├── QueryDetail.tsx    # Resolution thread, status transitions & assignments
│   │   ├── ReportsPage.tsx    # Audit reports & department metrics
│   │   ├── StudentManagement.tsx # Student directory & database cleaner
│   │   └── QueryList.tsx      # Comprehensive ticket grid filters
│   ├── types.ts               # Shared database interfaces
│   └── App.tsx                # Client shell routing & auth toggles
│
├── server.ts                  # Production-grade Node.js server
├── supabase_schema.sql        # Database schema scripts & RLS policies
└── README.md                  # Deployment & setup manual
```

---

## 🚀 Setup & Installation Instructions

### Option A: Running the Node.js Full-Stack Preview (Recommended for AI Studio Preview)
The preview environment is fully self-contained and pre-seeded.
1. Run local development server:
   ```bash
   npm run dev
   ```
2. Build and bundle production static assets:
   ```bash
   npm run build
   ```
3. Boot production bundled Express ERP server:
   ```bash
   npm run start
   ```

### Option B: Deploying Python FastAPI + Supabase Backend
1. **Initialize Supabase PostgreSQL Database:**
   - Sign up/Login to the [Supabase Dashboard](https://supabase.com).
   - Create a new project.
   - Go to **SQL Editor** on the left menu, paste the contents of `/supabase_schema.sql`, and click **Run**. This will create the `departments`, `students`, `admins`, `queries`, `replies`, and `notifications` tables and pre-populate active campus offices with standard Row Level Security (RLS).

2. **Configure Python Environment:**
   - Navigate to `/backend` directory.
   - Install required dependencies:
     ```bash
     pip install fastapi uvicorn pyjwt passlib[bcrypt] pydantic email-validator supabase
     ```
   - Set up your Environment Variables:
     ```bash
     export JWT_SECRET="your_secret_key"
     export SUPABASE_URL="https://your-supabase-url.supabase.co"
     export SUPABASE_KEY="your-supabase-service-role-key"
     ```
   - Run the development server:
     ```bash
     python main.py
     ```
   - Go to `http://localhost:8000/docs` to test all authentication, registration, queries, and reports endpoints.

---

## 🔒 Security Implementations

1. **Password Cryptography:** Secure bcrypt password hashing. No plain text password enters database records.
2. **JWT Authorization:** Stateless Bearer Token Authorization ensures only verified Student or Administrator accounts access protected endpoints.
3. **Database RLS Policies:** Restricts students to only query, create, or read their own submitted grievances, while administrative staff can view and modify all active query files.
4. **SQL Parameterization:** Safeguards database operations against SQL Injection attacks.
