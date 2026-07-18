import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  MessageSquare,
  Users,
  Building,
  BarChart3,
  User,
  Settings,
  X,
  LogOut,
  GraduationCap
} from 'lucide-react';
import CollegeLogo from './CollegeLogo';

interface SidebarProps {
  role: 'student' | 'admin';
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  role,
  currentPage,
  onNavigate,
  onLogout,
  isOpen,
  onClose
}: SidebarProps) {
  const studentMenu = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'submit-query', name: 'Submit Query', icon: PlusCircle },
    { id: 'my-queries', name: 'My Queries', icon: MessageSquare },
    { id: 'profile', name: 'My Profile', icon: User }
  ];

  const adminMenu = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'queries', name: 'All Queries', icon: MessageSquare },
    { id: 'students', name: 'Student Directory', icon: Users },
    { id: 'departments', name: 'Departments', icon: Building },
    { id: 'reports', name: 'Reports & Analytics', icon: BarChart3 },
    { id: 'profile', name: 'Settings', icon: Settings }
  ];

  const activeMenu = role === 'admin' ? adminMenu : studentMenu;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed inset-y-0 left-0 bg-slate-900 text-slate-300 w-64 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-65px)] flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 py-6">
          {/* Mobile Header Inside Sidebar */}
          <div className="flex justify-between items-center px-6 pb-6 lg:hidden border-b border-slate-800">
            <div className="flex items-center gap-3">
              <CollegeLogo size={36} className="bg-white rounded-full p-0.5 flex-shrink-0" />
              <div>
                <span className="font-extrabold text-red-500 text-xs uppercase block tracking-tight leading-none">National College</span>
                <span className="text-[9px] text-blue-400 font-bold block mt-0.5">(Autonomous)</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 py-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3">
              Navigation Menu
            </span>
            <nav className="mt-4 space-y-1.5">
              {activeMenu.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-blue-600/10 text-blue-400'
                        : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer with Status Box & Logout */}
        <div className="p-4 space-y-4 border-t border-slate-800/80">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/30">
            <div className="text-[9px] text-slate-500 uppercase font-black tracking-wider mb-2">System Core</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-300 font-bold">System Online</span>
            </div>
          </div>

          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-950/30 hover:text-red-400 transition-all duration-150 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
