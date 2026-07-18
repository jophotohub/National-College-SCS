import React, { useState } from 'react';
import { User, Shield, Phone, Key, Mail, Check, AlertCircle } from 'lucide-react';

interface ProfilePageProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
    register_number?: string;
    designation?: string;
    department?: string;
    phone?: string;
    year?: number;
  } | null;
  onUpdate: (data: any) => Promise<any>;
}

export default function ProfilePage({ user, onUpdate }: ProfilePageProps) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [year, setYear] = useState(user?.year || 1);
  const [designation, setDesignation] = useState(user?.designation || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: any = { name };
      if (user.role === 'student') {
        data.phone = phone;
        data.year = Number(year);
      } else {
        data.designation = designation;
        data.department = department;
      }

      if (password) {
        data.password = password;
      }

      await onUpdate(data);
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Account Settings</h2>
        <p className="text-[11px] text-slate-400">Manage your profile information and secure password credentials</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Profile settings updated successfully.</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">{user.name}</h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {user.role === 'admin' ? 'Administrative staff' : `Student • ${user.register_number}`}
              </span>
            </div>
          </div>

          {/* Email read only */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Registered Email Address</label>
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 font-medium">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user.email}</span>
            </div>
          </div>

          {/* Profile Name & Specific Role attributes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium outline-none focus:border-blue-500"
                required
              />
            </div>

            {user.role === 'student' ? (
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium outline-none focus:border-blue-500"
                  required
                />
              </div>
            )}
          </div>

          {user.role === 'student' ? (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Course Academic Year</label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium outline-none focus:border-blue-500"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Department Assignment</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium outline-none focus:border-blue-500"
                required
              />
            </div>
          )}

          {/* Change Password Credentials */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-4 h-4 text-slate-400" />
              Change Login Password
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating Profile...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
