import React, { useState, useEffect } from 'react';
import {
  FileText,
  BarChart3,
  Download,
  Filter,
  CheckCircle,
  AlertCircle,
  Search,
  Building,
  Printer,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Query, Department } from '../types';

interface ReportsPageProps {
  queries: Query[];
  departments: Department[];
  onSelectQuery: (id: string) => void;
}

export default function ReportsPage({ queries, departments, onSelectQuery }: ReportsPageProps) {
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Department Stats calculator
  const departmentStats = departments.map(dept => {
    const total = queries.filter(q => q.department_id === dept.id).length;
    const resolved = queries.filter(q => q.department_id === dept.id && (q.status === 'Resolved' || q.status === 'Closed')).length;
    const pending = total - resolved;
    return {
      id: dept.id,
      name: dept.department_name,
      total,
      resolved,
      pending
    };
  });

  // Filter logic
  const filteredQueries = queries.filter(q => {
    const matchesDept = !selectedDept || q.department_id === selectedDept;
    const matchesStatus = !selectedStatus || q.status === selectedStatus;
    const matchesPriority = !selectedPriority || q.priority === selectedPriority;
    const matchesSearch = !searchQuery ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.student_register?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesStatus && matchesPriority && matchesSearch;
  });

  // Print view handler
  const handlePrint = () => {
    window.print();
  };

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Reports & Analytics Console</h2>
          <p className="text-[11px] text-slate-400">Generate department summaries, track KPIs, and export system audits</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print/Save Audit Report</span>
        </button>
      </div>

      {/* Grid of department overview counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unresolved Backlog</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-800">
              {queries.filter(q => q.status !== 'Resolved' && q.status !== 'Closed').length}
            </span>
            <span className="text-xs text-slate-400 font-medium">active tickets</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Resolution Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">
              {queries.length > 0
                ? Math.round((queries.filter(q => q.status === 'Resolved' || q.status === 'Closed').length / queries.length) * 100)
                : 0}%
            </span>
            <span className="text-xs text-slate-400 font-medium">average performance</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critical Tickets</span>
            <Clock className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600">
              {queries.filter(q => q.priority === 'High' && q.status !== 'Resolved').length}
            </span>
            <span className="text-xs text-slate-400 font-medium">high-priority unresolved</span>
          </div>
        </div>
      </div>

      {/* Two columns layout: department tables and query filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Stats Table */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4 lg:col-span-1">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Department Summary</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Summary of grievance load by college office</p>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {departmentStats.map(dept => (
              <div
                key={dept.id}
                onClick={() => setSelectedDept(selectedDept === dept.id ? '' : dept.id)}
                className={`p-3.5 border rounded-xl hover:border-slate-300 transition-all cursor-pointer ${
                  selectedDept === dept.id ? 'bg-blue-50/40 border-blue-200' : 'border-slate-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{dept.name}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{dept.total} total</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-50 text-[10px]">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase">Pending</span>
                    <span className="text-amber-600 font-bold block">{dept.pending}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase">Resolved</span>
                    <span className="text-emerald-600 font-bold block">{dept.resolved}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit query search table list */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center flex-wrap gap-3 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Audit Query Records</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Search and filter live grievance tickets</p>
            </div>
            <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full font-bold">
              {filteredQueries.length} Match{filteredQueries.length !== 1 ? 'es' : ''}
            </span>
          </div>

          {/* Filtering Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 font-semibold outline-none focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 font-semibold outline-none focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg outline-none text-xs text-slate-700 transition-all font-medium"
              />
            </div>
          </div>

          {/* Records Table */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredQueries.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                No tickets matched current filter selection.
              </div>
            ) : (
              filteredQueries.map(q => (
                <div
                  key={q.id}
                  onClick={() => onSelectQuery(q.id)}
                  className="p-3.5 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-slate-50/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-bold">Ref: #{q.id}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getStatusColor(q.status)}`}>
                        {q.status}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 rounded">
                        {q.department_name}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 truncate">{q.subject}</h4>
                    <p className="text-[11px] text-slate-500 leading-normal line-clamp-1">{q.description}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-slate-700">{q.student_name}</p>
                      <p className="text-[10px] text-slate-400">{q.student_register}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
