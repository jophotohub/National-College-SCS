import React from 'react';
import {
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Building,
  ChevronRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { Query } from '../types';

interface ManagementDashboardProps {
  stats: {
    total_students: number;
    total_queries: number;
    pending_queries: number;
    in_progress_queries: number;
    resolved_queries: number;
    department_statistics: { name: string; value: number }[];
    monthly_analytics: { month: string; submitted: number; resolved: number }[];
    priority_statistics: { High: number; Medium: number; Low: number };
  } | null;
  queries: Query[];
  onSelectQuery: (id: string) => void;
  onNavigate: (page: string) => void;
}

const COLORS = ['#2563eb', '#4f46e5', '#7c3aed', '#0d9488', '#0891b2', '#ea580c', '#e11d48', '#db2777', '#16a34a'];

export default function ManagementDashboard({
  stats,
  queries,
  onSelectQuery,
  onNavigate
}: ManagementDashboardProps) {

  // Unassigned or newly submitted queries
  const urgentQueries = queries
    .filter(q => q.status === 'Submitted' || q.priority === 'High')
    .slice(0, 4);

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
      {/* KPI summaries layout */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Students */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-800 leading-tight">{stats?.total_students || 0}</p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Total Students</span>
          </div>
        </div>

        {/* Total Queries */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-800 leading-tight">{stats?.total_queries || 0}</p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Total Queries</span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-800 leading-tight">{stats?.pending_queries || 0}</p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Pending</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-800 leading-tight">{stats?.in_progress_queries || 0}</p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">In Progress</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white col-span-2 lg:col-span-1 p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-800 leading-tight">{stats?.resolved_queries || 0}</p>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Resolved</span>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Analytics Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Monthly Analytics</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Submitted vs. Resolved queries trend</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthly_analytics || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="submitted" name="Submitted" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-wise Distribution Pie Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Department Distribution</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Share of incoming queries by office</p>
          </div>
          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.department_statistics || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(stats?.department_statistics || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-slate-700">Departments</span>
              <span className="text-[10px] text-slate-400">Query Load</span>
            </div>
          </div>
          {/* Pie Chart Legends with counts */}
          <div className="max-h-24 overflow-y-auto space-y-1.5 text-xs">
            {(stats?.department_statistics || []).slice(0, 5).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-600 font-medium truncate max-w-[130px]">{item.name}</span>
                </div>
                <span className="text-slate-800 font-bold">{item.value} queries</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High priority or Urgent attention section */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Urgent Grievances Pool</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">High priority or newly submitted student queries</p>
          </div>
          <button
            onClick={() => onNavigate('queries')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
          >
            Review All Pool
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {urgentQueries.length === 0 ? (
            <div className="col-span-2 text-center py-10 space-y-2 text-slate-400">
              <Inbox className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">No newly submitted or high priority queries found in the queue.</p>
            </div>
          ) : (
            urgentQueries.map(q => (
              <div
                key={q.id}
                onClick={() => onSelectQuery(q.id)}
                className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-slate-50/40 transition-all cursor-pointer flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] text-slate-400 font-medium">Ref: #{q.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(q.priority)}`}>
                      {q.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 mt-1.5 truncate">{q.subject}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1">{q.description}</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-50 mt-1">
                  <div className="text-[10px]">
                    <span className="font-bold text-slate-700">{q.student_name}</span>
                    <span className="text-slate-400 ml-1.5">({q.student_register})</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusColor(q.status)}`}>
                    {q.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
