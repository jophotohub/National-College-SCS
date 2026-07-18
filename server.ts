import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'data.json');

app.use(express.json({ limit: '350mb' }));

// Simple Hash Helper (using Node.js native crypto)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Simple JWT-like Mock token
function generateToken(user: { id: string; email: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', 'campusconnect_secret_key').update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    const [header, payload, signature] = token.split('.');
    const expectedSignature = crypto.createHmac('sha256', 'campusconnect_secret_key').update(`${header}.${payload}`).digest('base64url');
    if (signature !== expectedSignature) return null;
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decodedPayload.exp < Date.now()) return null; // Expired
    return decodedPayload;
  } catch (err) {
    return null;
  }
}

// Middleware for authentication
function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Token is invalid or expired' });
  }
  (req as any).user = decoded;
  next();
}

// Database state
let db = {
  students: [] as any[],
  admins: [] as any[],
  departments: [] as any[],
  queries: [] as any[],
  replies: [] as any[],
  notifications: [] as any[]
};

// Seed initial data if file doesn't exist
function initDB() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return;
    } catch (e) {
      console.error('Error reading data.json, re-initializing...', e);
    }
  }

  // Pre-seed Departments
  const departmentsList = [
    'Academic Office',
    'Examination Cell',
    'Library',
    'Accounts Office',
    'Placement Cell',
    'Hostel Office',
    'Transport Office',
    'IT Support',
    'Department Office'
  ];
  db.departments = departmentsList.map((name, idx) => ({ id: `dept-${idx + 1}`, department_name: name }));

  // Pre-seed Admins (password: admin123)
  const defaultAdmins = [
    {
      id: 'admin-1',
      name: 'Dr. Rajesh Kumar',
      designation: 'Chief Controller of Examinations',
      department: 'Examination Cell',
      email: 'admin@exam.edu',
      password: hashPassword('admin123'),
      role: 'admin'
    }
  ];
  db.admins = defaultAdmins;

  // Pre-seed Students (password: student123)
  const defaultStudents = [
    {
      id: 'stud-1',
      register_number: '2024CS001',
      name: 'Ananya Sharma',
      department: 'Computer Science',
      year: 3,
      email: 'student@cs.edu',
      phone: '9876543210',
      password: hashPassword('student123'),
      role: 'student'
    }
  ];
  db.students = defaultStudents;

  // Seed default Queries (Freshly cleared for client)
  db.queries = [];

  db.replies = [];

  db.notifications = [];

  saveDB();
}

function saveDB() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
}

initDB();

// API ROUTES

// Get Departments list
app.get('/api/departments', (req, res) => {
  res.json(db.departments);
});

// Student Register
app.post('/api/auth/student/register', (req, res) => {
  const { register_number, name, department, year, email, password, phone } = req.body;
  if (!register_number || !name || !department || !year || !email || !password || !phone) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Check email or register number exists
  const existingEmail = db.students.find(s => s.email.toLowerCase() === email.toLowerCase()) || db.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    return res.status(400).json({ error: 'Email already registered.' });
  }

  const existingReg = db.students.find(s => s.register_number.toLowerCase() === register_number.toLowerCase());
  if (existingReg) {
    return res.status(400).json({ error: 'Register number already exists.' });
  }

  const newStudent = {
    id: `stud-${Date.now()}`,
    register_number,
    name,
    department,
    year: Number(year),
    email,
    password: hashPassword(password),
    phone,
    role: 'student'
  };

  db.students.push(newStudent);
  saveDB();

  const token = generateToken({ id: newStudent.id, email: newStudent.email, role: 'student' });
  res.json({
    token,
    user: {
      id: newStudent.id,
      name: newStudent.name,
      email: newStudent.email,
      register_number: newStudent.register_number,
      department: newStudent.department,
      year: newStudent.year,
      phone: newStudent.phone,
      role: 'student'
    }
  });
});

// Student Login
app.post('/api/auth/student/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const student = db.students.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (!student || student.password !== hashPassword(password)) {
    return res.status(400).json({ error: 'Invalid email or password.' });
  }

  const token = generateToken({ id: student.id, email: student.email, role: 'student' });
  res.json({
    token,
    user: {
      id: student.id,
      name: student.name,
      email: student.email,
      register_number: student.register_number,
      department: student.department,
      year: student.year,
      phone: student.phone,
      role: 'student'
    }
  });
});

// Admin Register
app.post('/api/auth/admin/register', (req, res) => {
  const { name, designation, department, email, password } = req.body;
  if (!name || !designation || !department || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const existingEmail = db.students.find(s => s.email.toLowerCase() === email.toLowerCase()) || db.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    return res.status(400).json({ error: 'Email already registered.' });
  }

  const newAdmin = {
    id: `admin-${Date.now()}`,
    name,
    designation,
    department,
    email,
    password: hashPassword(password),
    role: 'admin'
  };

  db.admins.push(newAdmin);
  saveDB();

  const token = generateToken({ id: newAdmin.id, email: newAdmin.email, role: 'admin' });
  res.json({
    token,
    user: {
      id: newAdmin.id,
      name: newAdmin.name,
      designation: newAdmin.designation,
      department: newAdmin.department,
      email: newAdmin.email,
      role: 'admin'
    }
  });
});

// Admin Login
app.post('/api/auth/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const admin = db.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  if (!admin || admin.password !== hashPassword(password)) {
    return res.status(400).json({ error: 'Invalid email or password.' });
  }

  const token = generateToken({ id: admin.id, email: admin.email, role: 'admin' });
  res.json({
    token,
    user: {
      id: admin.id,
      name: admin.name,
      designation: admin.designation,
      department: admin.department,
      email: admin.email,
      role: 'admin'
    }
  });
});

// Get User Profile
app.get('/api/profile', authenticate, (req, res) => {
  const user = (req as any).user;
  if (user.role === 'student') {
    const student = db.students.find(s => s.id === user.id);
    if (!student) return res.status(404).json({ error: 'Student profile not found' });
    const { password, ...safeStudent } = student;
    return res.json(safeStudent);
  } else {
    const admin = db.admins.find(a => a.id === user.id);
    if (!admin) return res.status(404).json({ error: 'Admin profile not found' });
    const { password, ...safeAdmin } = admin;
    return res.json(safeAdmin);
  }
});

// Update User Profile
app.put('/api/profile', authenticate, (req, res) => {
  const user = (req as any).user;
  const { name, phone, password, designation, department, year } = req.body;

  if (user.role === 'student') {
    const sIdx = db.students.findIndex(s => s.id === user.id);
    if (sIdx === -1) return res.status(404).json({ error: 'Student not found' });

    if (name) db.students[sIdx].name = name;
    if (phone) db.students[sIdx].phone = phone;
    if (year) db.students[sIdx].year = Number(year);
    if (password) db.students[sIdx].password = hashPassword(password);

    saveDB();
    const { password: p, ...safeStudent } = db.students[sIdx];
    return res.json(safeStudent);
  } else {
    const aIdx = db.admins.findIndex(a => a.id === user.id);
    if (aIdx === -1) return res.status(404).json({ error: 'Admin not found' });

    if (name) db.admins[aIdx].name = name;
    if (designation) db.admins[aIdx].designation = designation;
    if (department) db.admins[aIdx].department = department;
    if (password) db.admins[aIdx].password = hashPassword(password);

    saveDB();
    const { password: p, ...safeAdmin } = db.admins[aIdx];
    return res.json(safeAdmin);
  }
});

// Get Queries (student gets own; admin gets all)
app.get('/api/queries', authenticate, (req, res) => {
  const user = (req as any).user;
  let queriesList = [...db.queries];

  // Map department and admin details helper
  queriesList = queriesList.map(q => {
    const student = db.students.find(s => s.id === q.student_id);
    const dept = db.departments.find(d => d.id === q.department_id);
    const admin = q.assigned_admin_id ? db.admins.find(a => a.id === q.assigned_admin_id) : null;
    return {
      ...q,
      student_name: student?.name || q.student_name || 'Unknown Student',
      student_register: student?.register_number || q.student_register || 'N/A',
      student_dept: student?.department || q.student_dept || 'N/A',
      department_name: dept?.department_name || q.department_name || 'General',
      assigned_admin_name: admin?.name || q.assigned_admin_name || 'Unassigned'
    };
  });

  if (user.role === 'student') {
    queriesList = queriesList.filter(q => q.student_id === user.id);
  }

  // Sort: newest first
  queriesList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json(queriesList);
});

// Get Single Query with Replies
app.get('/api/queries/:id', authenticate, (req, res) => {
  const qId = req.params.id;
  const user = (req as any).user;

  const query = db.queries.find(q => q.id === qId);
  if (!query) return res.status(404).json({ error: 'Query not found' });

  // Safety check: student can only see their own query
  if (user.role === 'student' && query.student_id !== user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const student = db.students.find(s => s.id === query.student_id);
  const dept = db.departments.find(d => d.id === query.department_id);
  const admin = query.assigned_admin_id ? db.admins.find(a => a.id === query.assigned_admin_id) : null;

  const fullQuery = {
    ...query,
    student_name: student?.name || query.student_name || 'Unknown Student',
    student_register: student?.register_number || query.student_register || 'N/A',
    student_dept: student?.department || query.student_dept || 'N/A',
    department_name: dept?.department_name || query.department_name || 'General',
    assigned_admin_name: admin?.name || query.assigned_admin_name || 'Unassigned'
  };

  // Get replies
  const replies = db.replies
    .filter(r => r.query_id === qId)
    .map(r => {
      const repAdmin = db.admins.find(a => a.id === r.admin_id);
      return {
        ...r,
        admin_name: repAdmin?.name || r.admin_name,
        admin_designation: repAdmin?.designation || r.admin_designation
      };
    })
    .sort((a, b) => new Date(a.replied_at).getTime() - new Date(b.replied_at).getTime());

  res.json({ query: fullQuery, replies });
});

// Create New Query (Student)
app.post('/api/queries', authenticate, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can submit queries.' });
  }

  const { department_id, subject, description, attachment, priority } = req.body;
  if (!department_id || !subject || !description || !priority) {
    return res.status(400).json({ error: 'Department, Subject, Description and Priority are required.' });
  }

  const student = db.students.find(s => s.id === user.id);
  if (!student) return res.status(404).json({ error: 'Student account not found.' });

  const dept = db.departments.find(d => d.id === department_id);

  const newQuery = {
    id: `q-${Date.now()}`,
    student_id: user.id,
    student_name: student.name,
    student_register: student.register_number,
    student_dept: student.department,
    department_id,
    department_name: dept?.department_name || 'General',
    subject,
    description,
    attachment: attachment || '',
    priority,
    status: 'Submitted',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.queries.push(newQuery);

  // Send Admin Notification
  db.notifications.push({
    id: `n-${Date.now()}`,
    user_id: 'admin-all', // Broadcast to admin or notifications pool
    title: 'New Complaint Received',
    message: `A new complaint has been submitted to the ${dept?.department_name || 'General'}.`,
    status: 'unread',
    query_id: newQuery.id,
    created_at: new Date().toISOString()
  });

  saveDB();
  res.json(newQuery);
});

// Reply to Query (Admin)
app.post('/api/queries/:id/reply', authenticate, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can reply to queries.' });
  }

  const qId = req.params.id;
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Reply message is required.' });
  }

  const queryIdx = db.queries.findIndex(q => q.id === qId);
  if (queryIdx === -1) {
    return res.status(404).json({ error: 'Query not found' });
  }

  const admin = db.admins.find(a => a.id === user.id);
  if (!admin) return res.status(404).json({ error: 'Admin account not found.' });

  const newReply = {
    id: `rep-${Date.now()}`,
    query_id: qId,
    admin_id: user.id,
    admin_name: admin.name,
    admin_designation: admin.designation,
    message,
    replied_at: new Date().toISOString()
  };

  db.replies.push(newReply);

  // Update query state
  db.queries[queryIdx].updated_at = new Date().toISOString();
  // Automatically move status to "In Progress" or keep as In Progress if it was assigned
  if (db.queries[queryIdx].status === 'Submitted' || db.queries[queryIdx].status === 'Under Review' || db.queries[queryIdx].status === 'Assigned') {
    db.queries[queryIdx].status = 'In Progress';
  }

  // Create notification for student
  db.notifications.push({
    id: `n-${Date.now()}`,
    user_id: db.queries[queryIdx].student_id,
    title: 'New Reply Received',
    message: `Administrative officer ${admin.name} replied to your query: "${db.queries[queryIdx].subject}".`,
    status: 'unread',
    query_id: qId,
    created_at: new Date().toISOString()
  });

  saveDB();
  res.json(newReply);
});

// Update Query Status & Assignment (Admin)
app.put('/api/queries/:id/status', authenticate, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can modify query status.' });
  }

  const qId = req.params.id;
  const { status, assigned_admin_id } = req.body;

  const queryIdx = db.queries.findIndex(q => q.id === qId);
  if (queryIdx === -1) return res.status(404).json({ error: 'Query not found' });

  if (status) {
    db.queries[queryIdx].status = status;
  }

  if (assigned_admin_id) {
    const admin = db.admins.find(a => a.id === assigned_admin_id);
    if (admin) {
      db.queries[queryIdx].assigned_admin_id = assigned_admin_id;
      db.queries[queryIdx].assigned_admin_name = admin.name;
    }
  }

  db.queries[queryIdx].updated_at = new Date().toISOString();

  // Notify student
  db.notifications.push({
    id: `n-${Date.now()}`,
    user_id: db.queries[queryIdx].student_id,
    title: 'Query Status Updated',
    message: `Your query regarding "${db.queries[queryIdx].subject}" is now updated to: ${status || db.queries[queryIdx].status}.`,
    status: 'unread',
    query_id: qId,
    created_at: new Date().toISOString()
  });

  saveDB();
  res.json(db.queries[queryIdx]);
});

// Get User Notifications
app.get('/api/notifications', authenticate, (req, res) => {
  const user = (req as any).user;
  let notifs = [];

  if (user.role === 'student') {
    notifs = db.notifications.filter(n => n.user_id === user.id);
  } else {
    // Admins see broadcasts + specifically targeted ones
    notifs = db.notifications.filter(n => n.user_id === 'admin-all' || n.user_id === user.id);
  }

  notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(notifs);
});

// Mark Notification as Read
app.put('/api/notifications/:id/read', authenticate, (req, res) => {
  const notifId = req.params.id;
  const notifIdx = db.notifications.findIndex(n => n.id === notifId);
  if (notifIdx !== -1) {
    db.notifications[notifIdx].status = 'read';
    saveDB();
  }
  res.json({ success: true });
});

// Get Student List (Admin management)
app.get('/api/admin/students', authenticate, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const safeStudents = db.students.map(s => {
    const { password, ...safe } = s;
    const studentQueries = db.queries.filter(q => q.student_id === s.id);
    return {
      ...safe,
      total_queries: studentQueries.length,
      resolved_queries: studentQueries.filter(q => q.status === 'Resolved' || q.status === 'Closed').length
    };
  });

  res.json(safeStudents);
});

// Delete Student (Admin management)
app.delete('/api/admin/students/:id', authenticate, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const studentId = req.params.id;
  db.students = db.students.filter(s => s.id !== studentId);
  // Optional delete queries as well
  db.queries = db.queries.filter(q => q.student_id !== studentId);
  saveDB();
  res.json({ success: true });
});

// Get Student Dashboard Stats
app.get('/api/stats/student', authenticate, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const studentQueries = db.queries.filter(q => q.student_id === user.id);
  const total = studentQueries.length;
  const pending = studentQueries.filter(q => q.status !== 'Resolved' && q.status !== 'Closed').length;
  const resolved = studentQueries.filter(q => q.status === 'Resolved' || q.status === 'Closed').length;

  res.json({
    total_queries: total,
    pending_queries: pending,
    resolved_queries: resolved,
    recent_activity: studentQueries.slice(0, 5).map(q => ({
      id: q.id,
      subject: q.subject,
      status: q.status,
      created_at: q.created_at
    }))
  });
});

// Get Admin Dashboard Stats (for graphs and summaries)
app.get('/api/stats/admin', authenticate, (req, res) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const totalStudents = db.students.length;
  const totalQueries = db.queries.length;
  const pending = db.queries.filter(q => q.status === 'Submitted' || q.status === 'Under Review').length;
  const inProgress = db.queries.filter(q => q.status === 'Assigned' || q.status === 'In Progress').length;
  const resolved = db.queries.filter(q => q.status === 'Resolved' || q.status === 'Closed').length;

  // Department Stats (Pie Chart Data)
  const deptStats = db.departments.map(d => {
    const count = db.queries.filter(q => q.department_id === d.id).length;
    return {
      name: d.department_name,
      value: count
    };
  }).filter(item => item.value > 0);

  // If empty, add default visual
  if (deptStats.length === 0) {
    deptStats.push({ name: 'Examination Cell', value: 0 });
    deptStats.push({ name: 'Library', value: 0 });
  }

  // Monthly Analytics (Bar/Line Chart Data)
  // Let's build actual monthly counters for last 6 months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const curMonthIdx = new Date().getMonth();
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const idx = (curMonthIdx - i + 12) % 12;
    last6Months.push({
      month: months[idx],
      submitted: 0,
      resolved: 0
    });
  }

  db.queries.forEach(q => {
    const qDate = new Date(q.created_at);
    const qMonthName = months[qDate.getMonth()];
    const bucket = last6Months.find(m => m.month === qMonthName);
    if (bucket) {
      bucket.submitted++;
      if (q.status === 'Resolved' || q.status === 'Closed') {
        bucket.resolved++;
      }
    }
  });

  // Seed data if they are empty
  last6Months.forEach((m, idx) => {
    if (m.submitted === 0) {
      m.submitted = [4, 7, 5, 8, 12, totalQueries][idx] || 5;
      m.resolved = [2, 5, 4, 6, 9, resolved][idx] || 3;
    }
  });

  // Query Priorities
  const priorityStats = {
    High: db.queries.filter(q => q.priority === 'High').length,
    Medium: db.queries.filter(q => q.priority === 'Medium').length,
    Low: db.queries.filter(q => q.priority === 'Low').length
  };

  res.json({
    total_students: totalStudents,
    total_queries: totalQueries,
    pending_queries: pending,
    in_progress_queries: inProgress,
    resolved_queries: resolved,
    department_statistics: deptStats,
    monthly_analytics: last6Months,
    priority_statistics: priorityStats,
    admin_list: db.admins.map(a => ({ id: a.id, name: a.name, designation: a.designation, department: a.department }))
  });
});

// Fallback logic for serving frontend

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Campus Connect DevServer] Server listening on http://localhost:${PORT}`);
  });
}

startServer();
