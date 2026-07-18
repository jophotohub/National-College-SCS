import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Shield, User, Clock, FileText, Download, CheckCircle, ChevronRight, UserCheck } from 'lucide-react';
import { Query, Reply, Admin } from '../types';

interface QueryDetailProps {
  queryId: string;
  userRole: 'student' | 'admin';
  adminList: any[]; // List of available admins for assignment
  onBack: () => void;
  onAddReply: (message: string) => Promise<void>;
  onUpdateStatus: (status: string, assignedAdminId?: string) => Promise<void>;
}

export default function QueryDetail({
  queryId,
  userRole,
  adminList,
  onBack,
  onAddReply,
  onUpdateStatus
}: QueryDetailProps) {
  const [query, setQuery] = useState<Query | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [assignedAdmin, setAssignedAdmin] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/queries/${queryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setQuery(data.query);
        setReplies(data.replies);
        setNewStatus(data.query.status);
        setAssignedAdmin(data.query.assigned_admin_id || '');
      } else {
        setError(data.error || 'Failed to fetch details');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [queryId]);

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setIsReplying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/queries/${queryId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyMessage })
      });
      const data = await response.json();
      if (response.ok) {
        setReplyMessage('');
        // Refresh details to show new reply and state
        await fetchDetails();
      } else {
        setError(data.error || 'Failed to post reply');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsReplying(false);
    }
  };

  const handleUpdateStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/queries/${queryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          assigned_admin_id: assignedAdmin
        })
      });
      const data = await response.json();
      if (response.ok) {
        await fetchDetails();
      } else {
        setError(data.error || 'Failed to update status');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-700 bg-red-50 border-red-200';
      case 'Medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Low': return 'text-slate-700 bg-slate-50 border-slate-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-semibold">Loading Query Information...</p>
      </div>
    );
  }

  if (!query) {
    return (
      <div className="bg-white border border-slate-200/60 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto">
        <p className="text-sm font-semibold text-slate-600">Query or grievance not found</p>
        <button onClick={onBack} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Detail top nav bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[10px] font-bold text-slate-400">Ref Ticket: #{query.id}</span>
          <h2 className="text-sm font-bold text-slate-800 truncate max-w-md">{query.subject}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main query details column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Query Description Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-start flex-wrap gap-2 pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                  {query.department_name}
                </span>
                <span className="text-[10px] text-slate-400">
                  Submitted: {new Date(query.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(query.status)}`}>
                  {query.status}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(query.priority)}`}>
                  {query.priority} Priority
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description</h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {query.description}
              </p>
            </div>

            {/* Display base64 Attachment if exists */}
            {query.attachment && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2.5">Uploaded Attachment</h4>
                {query.attachment.startsWith('data:image/') ? (
                  <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 max-w-md">
                    <img src={query.attachment} alt="Attachment" className="w-full h-auto rounded-lg object-contain max-h-60" />
                    <div className="flex justify-between items-center mt-2 px-1">
                      <span className="text-[10px] text-slate-500 font-medium">Image Attachment</span>
                      <a
                        href={query.attachment}
                        download={`attachment_${query.id}.png`}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download Image
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl max-w-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 border border-red-100 text-red-600 flex items-center justify-center rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Uploaded_Document.pdf</p>
                        <p className="text-[10px] text-slate-400">PDF Document</p>
                      </div>
                    </div>
                    <a
                      href={query.attachment}
                      download={`document_${query.id}.pdf`}
                      className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Discussion / Replies Thread */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Resolution Conversation Thread ({replies.length})
            </h3>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {replies.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No replies or desk comments yet. Use form below to update students.
                </div>
              ) : (
                replies.map(r => {
                  const isAdminReply = r.admin_id;
                  return (
                    <div
                      key={r.id}
                      className={`flex gap-3 max-w-[85%] ${isAdminReply ? 'ml-0' : 'ml-auto flex-row-reverse'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isAdminReply ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {isAdminReply ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>

                      <div className={`p-4 rounded-2xl text-xs space-y-1 ${
                        isAdminReply
                          ? 'bg-slate-50 border border-slate-100 rounded-tl-none text-slate-700'
                          : 'bg-blue-600 text-white rounded-tr-none'
                      }`}>
                        <div className="flex items-center justify-between gap-4 font-bold text-[10px]">
                          <span className={isAdminReply ? 'text-slate-800' : 'text-blue-100'}>
                            {r.admin_name} {r.admin_designation ? `(${r.admin_designation})` : ''}
                          </span>
                          <span className={isAdminReply ? 'text-slate-400' : 'text-blue-200'}>
                            {new Date(r.replied_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{r.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Post Reply Form */}
            <form onSubmit={handlePostReply} className="pt-4 border-t border-slate-100 flex gap-3">
              <input
                type="text"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder={userRole === 'admin' ? "Reply to student or post internal desk comments..." : "Provide follow-up details..."}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none text-xs text-slate-700 transition-all font-medium"
                required
              />
              <button
                type="submit"
                disabled={isReplying || !replyMessage.trim()}
                className="px-5 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isReplying ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Controls for Administrators / Student Info */}
        <div className="space-y-6">
          {/* Student metadata info card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Student Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-extrabold border">
                  {query.student_name ? query.student_name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{query.student_name}</h4>
                  <p className="text-[10px] text-slate-400">Reg: {query.student_register}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Department</span>
                  <span className="text-slate-700 font-bold">{query.student_dept}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Course Year</span>
                  <span className="text-slate-700 font-bold">Year {query.student_id ? '3' : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin workflow status editor box */}
          {userRole === 'admin' && (
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
                Administrative Control Panel
              </h3>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Change Query Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 font-semibold focus:border-blue-500 outline-none"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Assign Desk Officer / Admin Select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Assign Officer</label>
                <select
                  value={assignedAdmin}
                  onChange={(e) => setAssignedAdmin(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 font-semibold focus:border-blue-500 outline-none"
                >
                  <option value="">Unassigned</option>
                  {adminList.map((adm: any) => (
                    <option key={adm.id} value={adm.id}>
                      {adm.name} ({adm.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Current assigned admin show box */}
              {query.assigned_admin_name && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5 text-xs">
                  <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Assigned Officer</p>
                    <p className="font-bold text-slate-700">{query.assigned_admin_name}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUpdatingStatus ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Apply Updates'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
