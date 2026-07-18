import React, { useState } from 'react';
import { Bell, LogOut, User, Menu, Shield, GraduationCap, X } from 'lucide-react';
import { Notification } from '../types';
import CollegeLogo from './CollegeLogo';

interface NavbarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
    register_number?: string;
    designation?: string;
    department?: string;
  } | null;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onToggleSidebar: () => void;
  currentPage: string;
  onSelectQuery?: (id: string) => void;
}

export default function Navbar({
  user,
  notifications,
  onMarkRead,
  onLogout,
  onNavigate,
  onToggleSidebar,
  currentPage,
  onSelectQuery
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        {user && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <CollegeLogo size={42} className="flex-shrink-0" />
          <div>
            <h1 className="text-sm font-extrabold text-red-600 tracking-tight uppercase leading-none">
              NATIONAL COLLEGE
            </h1>
            <span className="text-[9px] font-semibold text-blue-900 tracking-wide uppercase block mt-1">
              (Autonomous) • Student Complaint System (SCS)
            </span>
          </div>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-2 md:gap-4">
          {/* Badge indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200">
            {user.role === 'admin' ? (
              <>
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Admin Portal</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student Portal</span>
              </>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-all duration-200 focus:outline-none"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} New
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-slate-400 text-xs">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onMarkRead(n.id);
                          if (n.query_id && onSelectQuery) {
                            onSelectQuery(n.query_id);
                          } else {
                            onNavigate(user?.role === 'admin' ? 'queries' : 'dashboard');
                          }
                          setShowNotifications(false);
                        }}
                        className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                          n.status === 'unread' ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-all duration-200 text-left focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{user.email}</p>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="px-4 py-2 border-b border-slate-100 md:hidden">
                  <p className="text-xs font-bold text-slate-800">{user.name}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    onNavigate('profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
