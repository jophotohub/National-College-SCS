export interface Student {
  id: string;
  register_number: string;
  name: string;
  department: string;
  year: number;
  email: string;
  phone: string;
  role: 'student';
}

export interface Admin {
  id: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  role: 'admin';
}

export interface Department {
  id: string;
  department_name: string;
}

export interface Query {
  id: string;
  student_id: string;
  student_name?: string;
  student_register?: string;
  student_dept?: string;
  department_id: string;
  department_name?: string;
  subject: string;
  description: string;
  attachment?: string; // base64 or file path
  priority: 'Low' | 'Medium' | 'High';
  status: 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
  assigned_admin_id?: string;
  assigned_admin_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Reply {
  id: string;
  query_id: string;
  admin_id: string;
  admin_name: string;
  admin_designation?: string;
  message: string;
  replied_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  status: 'unread' | 'read';
  created_at: string;
  query_id?: string;
}
