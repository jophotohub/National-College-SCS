import React, { useState, useEffect } from 'react';
import { Search, Trash2, Shield, Mail, Phone, GraduationCap, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react';

interface StudentManagementProps {
  onSelectStudent?: (studentId: string) => void;
}

export default function StudentManagement({ onSelectStudent }: StudentManagementProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setStudents(data);
      } else {
        setError(data.error || 'Failed to fetch students.');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student account? This will delete all queries submitted by this student.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setStudents(students.filter(s => s.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete student');
      }
    } catch (err) {
      alert('Connection error');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.register_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Student Directory</h2>
          <p className="text-[11px] text-slate-400">Manage registered student profiles and query track statistics</p>
        </div>
        <button
          onClick={fetchStudents}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold border transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reload List
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by register number, name, or email..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none text-xs text-slate-700 transition-all font-medium"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading student registry...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs text-center">
            {error}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No registered students matched your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3.5">Student Information</th>
                  <th className="px-4 py-3.5">Contact & Department</th>
                  <th className="px-4 py-3.5 text-center">Query Count</th>
                  <th className="px-4 py-3.5 text-center">Resolved Count</th>
                  <th className="px-4 py-3.5 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{s.name}</p>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded">
                            {s.register_number}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{s.department} • Year {s.year}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{s.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-700">
                      {s.total_queries}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full font-bold">
                        {s.resolved_queries}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
