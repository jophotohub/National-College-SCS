import React from 'react';
import {
  MessageSquare,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Clock,
  PlusCircle,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Query } from '../types';

interface StudentDashboardProps {
  stats: {
    total_queries: number;
    pending_queries: number;
    resolved_queries: number;
    recent_activity: any[];
  } | null;
  queries: Query[];
  onNavigate: (page: string) => void;
  onSelectQuery: (queryId: string) => void;
}

export default function StudentDashboard({
  stats,
  queries,
  onNavigate,
  onSelectQuery
}: StudentDashboardProps) {
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
      case 'High': return 'text-red-600 bg-red-50 border-red-200/60';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200/60';
      case 'Low': return 'text-slate-600 bg-slate-50 border-slate-200/60';
      default: return 'text-slate-600 bg-slate-50 border-slate-200/60';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Grid Greeting */}
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-600/10 overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
        <div className="absolute left-1/3 bottom-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Student Support Dashboard</h2>
            <p className="text-blue-100 mt-1.5 text-sm max-w-xl leading-relaxed">
              Submit your administrative, library, or academic grievances and query directly to departments. We track and resolve them securely.
            </p>
          </div>
          <button
            onClick={() => onNavigate('submit-query')}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs tracking-wider uppercase transition-all duration-150 self-start md:self-auto shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            File New Query
          </button>
        </div>
      </div>

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800 leading-tight">{stats?.total_queries || 0}</p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Total Filed Queries</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800 leading-tight">{stats?.pending_queries || 0}</p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Pending Resolution</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800 leading-tight">{stats?.resolved_queries || 0}</p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Resolved & Closed</span>
          </div>
        </div>
      </div>

      {/* Two Columns Grid: Recent Queries & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Queries Track List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">My Submitted Queries</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Track real-time status and reviews</p>
            </div>
            <button
              onClick={() => onNavigate('my-queries')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
            >
              See All
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {queries.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl space-y-3">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">You haven't submitted any queries yet.</p>
                <button
                  onClick={() => onNavigate('submit-query')}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  Create Query Now
                </button>
              </div>
            ) : (
              queries.slice(0, 5).map(q => (
                <div
                  key={q.id}
                  onClick={() => onSelectQuery(q.id)}
                  className="p-4 border border-slate-100 rounded-xl hover:border-slate-200 hover:bg-slate-50/40 transition-all duration-150 cursor-pointer flex flex-col md:flex-row justify-between md:items-center gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(q.status)}`}>
                        {q.status}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityColor(q.priority)}`}>
                        {q.priority} Priority
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {new Date(q.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 truncate">{q.subject}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">{q.description}</p>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {q.department_name}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Activity & Status Workflow */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">Grievance Workflow</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Every query moves through designated phases to ensure prompt administrative resolution.
            </p>

            {/* Visual Workflow Steps */}
            <div className="mt-5 space-y-4 relative pl-5 border-l-2 border-blue-100/80">
              <div className="relative">
                <div className="absolute -left-[27px] w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                <h4 className="text-xs font-bold text-slate-800">1. Submitted</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Your query is safely stored in our central registry.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] w-3 h-3 rounded-full bg-amber-500 border-2 border-white ring-2 ring-amber-100" />
                <h4 className="text-xs font-bold text-slate-800">2. Under Review</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Assigned desk officers verify details and query files.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] w-3 h-3 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-100" />
                <h4 className="text-xs font-bold text-slate-800">3. In Progress</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Action officers are processing responses or waiver requests.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] w-3 h-3 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-100" />
                <h4 className="text-xs font-bold text-slate-800">4. Resolved</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Official action is completed and replies are published.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-2xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p className="text-[10px] text-slate-500 leading-normal">
              For immediate physical assistance, visit the **IT Support Cell** or the **Dean's Academic Desk** during campus working hours (9 AM - 4 PM).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
