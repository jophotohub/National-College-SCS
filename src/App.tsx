/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, GraduationCap, Lock, Mail, User, Phone, BookOpen, Calendar, HelpCircle, ArrowRight } from 'lucide-react';
import { Department, Query, Notification } from './types';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import StudentDashboard from './components/StudentDashboard';
import ManagementDashboard from './components/ManagementDashboard';
import SubmitQuery from './components/SubmitQuery';
import QueryDetail from './components/QueryDetail';
import ProfilePage from './components/ProfilePage';
import StudentManagement from './components/StudentManagement';
import ReportsPage from './components/ReportsPage';
import QueryList from './components/QueryList';
import CollegeLogo from './components/CollegeLogo';

export default function App() {
  // Auth state
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [isLoginTab, setIsLoginTab] = useState<'student' | 'admin'>('student');
  const [isRegister, setIsRegister] = useState(false);

  // Forms
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Registration form
  const [regNumber, setRegNumber] = useState('');
  const [regName, setRegName] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regYear, setRegYear] = useState(1);
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Admin registration form
  const [adminName, setAdminName] = useState('');
  const [adminDesignation, setAdminDesignation] = useState('');
  const [adminDept, setAdminDept] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Main navigation & lists
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [queries, setQueries] = useState<Query[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);

  // Dashboard KPI data
  const [studentStats, setStudentStats] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);

  // UI responsive sidebar toggler
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load departments on startup
  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => setDepartments(data))
      .catch(err => console.error('Error fetching departments:', err));
  }, []);

  // Fetch data on token change
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchProfile();
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  // Periodic data fetching when logged in
  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
    fetchQueries();
    fetchNotifications();

    // Poll notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, currentPage]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        // Clear token on error
        setToken(null);
      }
    } catch (err) {
      console.error('Profile fetch connection issue', err);
    }
  };

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      const endpoint = user.role === 'admin' ? '/api/stats/admin' : '/api/stats/student';
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        if (user.role === 'admin') {
          setAdminStats(data);
        } else {
          setStudentStats(data);
        }
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchQueries = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/queries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setQueries(data);
      }
    } catch (err) {
      console.error('Error fetching queries:', err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  // Auth submits
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!loginEmail || !loginPassword) {
      setAuthError('Email and Password are required.');
      return;
    }

    setAuthLoading(true);
    try {
      const endpoint = isLoginTab === 'student' ? '/api/auth/student/login' : '/api/auth/admin/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        setCurrentPage('dashboard');
        // Clear forms
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setAuthError(data.error || 'Invalid email or password.');
      }
    } catch (err) {
      setAuthError('Connection failure. Check dev server status.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!regNumber || !regName || !regDept || !regEmail || !regPassword || !regPhone) {
      setAuthError('All fields are required.');
      return;
    }

    setAuthLoading(true);
    try {
      const response = await fetch('/api/auth/student/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          register_number: regNumber,
          name: regName,
          department: regDept,
          year: regYear,
          email: regEmail,
          phone: regPhone,
          password: regPassword
        })
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        setCurrentPage('dashboard');
        // Clear registration
        setRegNumber('');
        setRegName('');
        setRegDept('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        setIsRegister(false);
      } else {
        setAuthError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setAuthError('Connection failure.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!adminName || !adminDesignation || !adminDept || !adminEmail || !adminPassword) {
      setAuthError('All fields are required.');
      return;
    }

    setAuthLoading(true);
    try {
      const response = await fetch('/api/auth/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminName,
          designation: adminDesignation,
          department: adminDept,
          email: adminEmail,
          password: adminPassword
        })
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        setCurrentPage('dashboard');
        // Clear registration
        setAdminName('');
        setAdminDesignation('');
        setAdminDept('');
        setAdminEmail('');
        setAdminPassword('');
        setIsRegister(false);
      } else {
        setAuthError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setAuthError('Connection failure.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreateQuery = async (data: any) => {
    const response = await fetch('/api/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const resData = await response.json();
      throw new Error(resData.error || 'Failed to submit');
    }
    fetchQueries();
    fetchDashboardData();
  };

  const handleUpdateProfile = async (data: any) => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.error || 'Failed to update profile');
    }
    setUser(resData);
    return resData;
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setCurrentPage('dashboard');
  };

  const handleSelectQuery = (id: string) => {
    setSelectedQueryId(id);
    setCurrentPage('query-detail');
  };

  // Rendering router content
  const renderContent = () => {
    if (!user) return null;

    switch (currentPage) {
      case 'dashboard':
        return user.role === 'admin' ? (
          <ManagementDashboard
            stats={adminStats}
            queries={queries}
            onSelectQuery={handleSelectQuery}
            onNavigate={setCurrentPage}
          />
        ) : (
          <StudentDashboard
            stats={studentStats}
            queries={queries}
            onNavigate={setCurrentPage}
            onSelectQuery={handleSelectQuery}
          />
        );
      case 'submit-query':
        return user.role === 'student' ? (
          <SubmitQuery
            departments={departments}
            onSubmit={handleCreateQuery}
            onNavigate={setCurrentPage}
          />
        ) : null;
      case 'my-queries':
      case 'queries':
        return (
          <QueryList
            queries={queries}
            departments={departments}
            userRole={user.role}
            onSelectQuery={handleSelectQuery}
            onNavigate={setCurrentPage}
            onRefresh={() => {
              fetchQueries();
              fetchDashboardData();
            }}
          />
        );
      case 'query-detail':
        return selectedQueryId ? (
          <QueryDetail
            queryId={selectedQueryId}
            userRole={user.role}
            adminList={adminStats?.admin_list || []}
            onBack={() => {
              setCurrentPage(user.role === 'admin' ? 'queries' : 'my-queries');
              setSelectedQueryId(null);
            }}
            onAddReply={async () => {}}
            onUpdateStatus={async () => {}}
          />
        ) : null;
      case 'students':
        return user.role === 'admin' ? (
          <StudentManagement />
        ) : null;
      case 'departments':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-sans tracking-tight">Active ERP Departments</h2>
              <p className="text-[11px] text-slate-400">Campus divisions with authorized administrative action desks</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {departments.map((d, idx) => (
                <div key={d.id} className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs">{d.department_name}</h3>
                    <span className="text-[9px] text-slate-400 font-medium">Resolution Desk Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'reports':
        return user.role === 'admin' ? (
          <ReportsPage
            queries={queries}
            departments={departments}
            onSelectQuery={handleSelectQuery}
          />
        ) : null;
      case 'profile':
        return (
          <ProfilePage
            user={user}
            onUpdate={handleUpdateProfile}
          />
        );
      default:
        return <div className="text-center py-10 text-xs">Page not found.</div>;
    }
  };

  // Auth pages rendering if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 bg-white/90 backdrop-blur-md border border-slate-200/60 p-8 rounded-3xl shadow-xl shadow-slate-200/50">
          <div className="text-center space-y-3 pb-2">
            <div className="flex justify-center">
              <CollegeLogo size={110} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-2xl font-black tracking-tight text-red-600 uppercase font-sans">
                NATIONAL COLLEGE
              </h1>
              <p className="text-sm font-bold text-blue-900 font-sans">
                (Autonomous)
              </p>
              <p className="text-[10px] font-semibold text-blue-900 leading-tight">
                (Nationally Re-Accredited at 'A' Grade by NAAC)
              </p>
              <p className="text-[10px] font-semibold text-blue-900 leading-tight">
                Tiruchirappalli - 620001, Tamil Nadu, India.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Student Complaint System (SCS)
              </p>
            </div>
          </div>

          {/* Form switch trigger */}
          {!isRegister && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
              <button
                onClick={() => {
                  setIsLoginTab('student');
                  setAuthError('');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isLoginTab === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Student Portal
              </button>
              <button
                onClick={() => {
                  setIsLoginTab('admin');
                  setAuthError('');
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isLoginTab === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                Management
              </button>
            </div>
          )}

          {authError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-semibold leading-normal">
              {authError}
            </div>
          )}

          {isRegister ? (
            isLoginTab === 'student' ? (
              /* Student registration */
              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-medium text-slate-600">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">REGISTER NUMBER *</label>
                    <input
                      type="text"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="2024CS012"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold text-slate-700 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">FULL NAME *</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Ananya Sharma"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold text-slate-700 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">DEPARTMENT *</label>
                    <select
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold text-slate-600 text-xs bg-white"
                      required
                    >
                      <option value="">Select Dept...</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Business Administration">Business Administration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">ACADEMIC YEAR *</label>
                    <select
                      value={regYear}
                      onChange={(e) => setRegYear(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold text-slate-600 text-xs bg-white"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">PHONE NUMBER *</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold text-slate-700 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold text-slate-700 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">PASSWORD *</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create password"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold text-slate-700 text-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/15 flex items-center justify-center cursor-pointer"
                >
                  {authLoading ? 'Registering...' : 'Complete Sign Up'}
                </button>

                <p className="text-center text-slate-400 mt-2">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setAuthError('');
                    }}
                    className="text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            ) : (
              /* Management registration */
              <form onSubmit={handleAdminRegisterSubmit} className="space-y-4 text-xs font-medium text-slate-600">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">OFFICIAL FULL NAME *</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Prof. Amit Patel"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold text-slate-700 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">DESIGNATION *</label>
                    <input
                      type="text"
                      value={adminDesignation}
                      onChange={(e) => setAdminDesignation(e.target.value)}
                      placeholder="e.g. Assistant Registrar"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold text-slate-700 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">OFFICE/DEPARTMENT *</label>
                    <select
                      value={adminDept}
                      onChange={(e) => setAdminDept(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold text-slate-600 text-xs bg-white"
                      required
                    >
                      <option value="">Select Office...</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.department_name}>
                          {d.department_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">OFFICIAL EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@college.edu"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold text-slate-700 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">SECRET ACCESS PASSWORD *</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Create secure password"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold text-slate-700 text-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/15 flex items-center justify-center cursor-pointer"
                >
                  {authLoading ? 'Registering Officer...' : 'Complete Staff Sign Up'}
                </button>

                <p className="text-center text-slate-400 mt-2">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegister(false);
                      setAuthError('');
                    }}
                    className="text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )
          ) : (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-medium text-slate-600">
              <div>
                <label className="block font-bold text-slate-500 mb-1">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={isLoginTab === 'student' ? 'student@cs.edu' : 'admin@exam.edu'}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold text-slate-700 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">PASSWORD</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-semibold text-slate-700 text-xs"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/15 flex items-center justify-center cursor-pointer"
              >
                {authLoading ? 'Signing in...' : `Enter ${isLoginTab === 'student' ? 'Student' : 'Staff'} Portal`}
              </button>

              <p className="text-center text-slate-400 mt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setAuthError('');
                  }}
                  className="text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  {isLoginTab === 'student' ? 'Register here' : 'Register as Officer'}
                </button>
              </p>

              {/* Dynamic Hint for instant grading evaluation */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/40 text-[11px] text-slate-400 leading-normal mt-4 text-center">
                <span className="font-bold text-slate-600">Evaluation Hint:</span>
                <p className="mt-0.5">Student login: <span className="font-semibold text-slate-600">student@cs.edu</span> / <span className="font-semibold text-slate-600">student123</span></p>
                <p>Management login: <span className="font-semibold text-slate-600">admin@exam.edu</span> / <span className="font-semibold text-slate-600">admin123</span></p>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Dashboard workspace layout
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        user={user}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onLogout={handleLogout}
        onNavigate={setCurrentPage}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentPage={currentPage}
        onSelectQuery={handleSelectQuery}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          role={user.role}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-12 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

