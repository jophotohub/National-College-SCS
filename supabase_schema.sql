-- ====================================================================
-- CAMPUS CONNECT – SMART STUDENT QUERY & GRIEVANCE MANAGEMENT SYSTEM
-- SUPABASE POSTGRESQL DATABASE SCHEMA SCRIPT
-- ====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. DEPARTMENTS TABLE
create table departments (
    id uuid default uuid_generate_v4() primary key,
    department_name varchar(100) not null unique
);

-- Seed Initial Departments
insert into departments (department_name) values
('Academic Office'),
('Examination Cell'),
('Library'),
('Accounts Office'),
('Placement Cell'),
('Hostel Office'),
('Transport Office'),
('IT Support'),
('Department Office');

-- 2. STUDENTS TABLE
create table students (
    id uuid default uuid_generate_v4() primary key,
    register_number varchar(30) not null unique,
    name varchar(100) not null,
    department varchar(100) not null,
    year integer not null check (year between 1 and 4),
    email varchar(150) not null unique,
    password varchar(255) not null, -- Hashed password (Bcrypt)
    phone varchar(20) not null,
    role varchar(20) default 'student' not null
);

-- 3. ADMINS TABLE
create table admins (
    id uuid default uuid_generate_v4() primary key,
    name varchar(100) not null,
    designation varchar(100) not null,
    department varchar(100) not null,
    email varchar(150) not null unique,
    password varchar(255) not null, -- Hashed password (Bcrypt)
    role varchar(20) default 'admin' not null
);

-- 4. QUERIES TABLE
create table queries (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references students(id) on delete cascade not null,
    department_id uuid references departments(id) on delete restrict not null,
    subject varchar(255) not null,
    description text not null,
    attachment text, -- Base64 encoded file data or Supabase Storage URL
    priority varchar(20) check (priority in ('Low', 'Medium', 'High')) not null,
    status varchar(30) check (status in ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed')) default 'Submitted' not null,
    assigned_admin_id uuid references admins(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. REPLIES TABLE
create table replies (
    id uuid default uuid_generate_v4() primary key,
    query_id uuid references queries(id) on delete cascade not null,
    admin_id uuid references admins(id) on delete set null,
    message text not null,
    replied_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. NOTIFICATIONS TABLE
create table notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid not null, -- References either students(id) or admins(id) or 'admin-all' uuid
    title varchar(150) not null,
    message text not null,
    status varchar(20) check (status in ('unread', 'read')) default 'unread' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all tables for Supabase Security
alter table students enable row level security;
alter table admins enable row level security;
alter table departments enable row level security;
alter table queries enable row level security;
alter table replies enable row level security;
alter table notifications enable row level security;

-- Setup Access Policies
-- Departments Policy: Anyone can read
create policy "Allow read access to all users" on departments for select using (true);

-- Students Policies
create policy "Allow insert for signup" on students for insert with check (true);
create policy "Allow students to view own profile" on students for select using (auth.uid() = id);
create policy "Allow admins to view students" on students for select using (exists (select 1 from admins where id = auth.uid()));

-- Queries Policies
create policy "Students can view own queries" on queries for select using (student_id = auth.uid());
create policy "Students can create queries" on queries for insert with check (student_id = auth.uid());
create policy "Admins can view and update all queries" on queries for all using (exists (select 1 from admins where id = auth.uid()));

-- Replies Policies
create policy "Everyone related can view replies" on replies for select using (
    exists (select 1 from queries where queries.id = query_id and queries.student_id = auth.uid()) or
    exists (select 1 from admins where id = auth.uid())
);
create policy "Admins can create replies" on replies for insert with check (exists (select 1 from admins where id = auth.uid()));

-- Notifications Policies
create policy "Users can view own notifications" on notifications for select using (user_id = auth.uid() or user_id = '00000000-0000-0000-0000-000000000000'); -- broadcast UUID
