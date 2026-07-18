import React, { useState } from 'react';
import { Search, Filter, ArrowRight, MessageSquare, PlusCircle, Calendar, RefreshCw } from 'lucide-react';
import { Query, Department } from '../types';

interface QueryListProps {
  queries: Query[];
  departments: Department[];
  userRole: 'student' | 'admin';
  onSelectQuery: (id: string) => void;
  onNavigate: (page: string) => void;
  onRefresh: () => void;
}

export default function QueryList({
  queries,
  departments,
  userRole,
  onSelectQuery,
  onNavigate,
  onRefresh
}: QueryListProps) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  const filtered = queries.filter(q => {
    const matchesSearch = q.subject.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase()) ||
      (q.student_name && q.student_name.toLowerCase().includes(search.toLowerCase())) ||
      (q.student_register && q.student_register.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = !selectedDept || q.department_id === selectedDept;
    const matchesStatus = !selectedStatus || q.status === selectedStatus;
    const matchesPriority = !selectedPriority || q.priority === selectedPriority;

    return matchesSearch && matchesDept && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted': return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'Under Review': return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'Assigned': return 'bg-purple-50 text-purple-700 border-purple-200/60';
      case 'In Progress': return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200/60';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-700 bg-red-50 border-red-200';
      case 'Medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Low': return 'text-slate-700 bg-slate-50 border-slate-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {userRole === 'admin' ? 'All Grievance Tickets Pool' : 'My Filed Queries'}
          </h2>
          <p className="text-[11px] text-slate-400">
            {userRole === 'admin' ? 'Review, assign, and respond to student inquiries' : 'Track the real-time resolution status of your submissions'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {userRole === 'student' && (
            <button
              onClick={() => onNavigate('submit-query')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Query</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subject, keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none text-xs text-slate-700 transition-all font-medium"
            />
          </div>

          {/* Department */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-semibold outline-none focus:border-blue-500 transition-all"
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.department_name}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-semibold outline-none focus:border-blue-500 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Priority */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-semibold outline-none focus:border-blue-500 transition-all"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Display List of items */}
        <div className="space-y-3 pt-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16 border border-dashed rounded-xl space-y-3 text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">No query tickets found matching current criteria.</p>
            </div>
          ) : (
            filtered.map(q => (
              <div
                key={q.id}
                onClick={() => onSelectQuery(q.id)}
                className="p-4 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-slate-50/30 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-bold">Ref: #{q.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(q.status)}`}>
                      {q.status}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(q.priority)}`}>
                      {q.priority}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                      {q.department_name}
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-800 truncate leading-snug">{q.subject}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 max-w-3xl">
                    {q.description}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 flex-shrink-0">
                  <div className="text-right space-y-0.5">
                    {userRole === 'admin' ? (
                      <>
                        <p className="font-bold text-slate-700">{q.student_name}</p>
                        <p className="text-[10px] text-slate-400">Reg: {q.student_register} • {q.student_dept}</p>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-slate-700">{q.assigned_admin_name || 'Unassigned'}</p>
                        <p className="text-[10px] text-slate-400">Assigned Officer</p>
                      </>
                    )}
                    <span className="text-[9px] text-slate-400 block mt-1 flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      {new Date(q.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 hidden md:block" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
