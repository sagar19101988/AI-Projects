// src/components/job/JobModal.tsx
import React, { useState, useEffect } from 'react';
import { useJobs } from '../../context/JobContext';
import type { Job } from '../../types/job';
import { X, Save, Calendar, RefreshCw, Star, Trophy, XCircle } from 'lucide-react';

interface JobModalProps {
  onClose: () => void;
  jobToEdit?: Job;
  initialStatus?: Job['status'];
}

const inputCls = "w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-900 dark:text-white outline-none transition-all";
const labelCls = "flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

function toInputDate(d?: Date | string): string {
  if (!d) return '';
  try { return new Date(d).toISOString().split('T')[0]; } catch { return ''; }
}

// datetime-local inputs require LOCAL time (not UTC) — toISOString() is always UTC
function toInputDateTime(d?: Date | string): string {
  if (!d) return '';
  try {
    const dt = new Date(d);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  } catch { return ''; }
}


export default function JobModal({ onClose, jobToEdit, initialStatus }: JobModalProps) {
  const { addJob, updateJob } = useJobs();
  const [formData, setFormData] = useState<Partial<Job>>({
    company: '',
    role: '',
    status: initialStatus ?? 'Wishlist',
    linkedinUrl: '',
    salaryRange: '',
    notes: '',
    priority: 3,
    appliedDate: new Date(),
  });

  useEffect(() => {
    if (jobToEdit) {
      setFormData({ ...jobToEdit, appliedDate: new Date(jobToEdit.appliedDate) });
    }
  }, [jobToEdit]);

  const set = (patch: Partial<Job>) => setFormData(p => ({ ...p, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    if (jobToEdit) {
      await updateJob({ ...jobToEdit, ...formData, updatedAt: now } as Job);
    } else {
      await addJob({
        ...formData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        appliedDate: formData.appliedDate || now,
      } as Job);
    }
    onClose();
  };

  const status = formData.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh] border border-gray-200 dark:border-gray-700">

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {jobToEdit ? 'Edit Application' : 'Add Application'}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {status === 'Wishlist' && 'Save a job you want to apply to'}
              {status === 'Applied' && 'Track your submitted application'}
              {status === 'Follow-up' && 'Log your follow-up'}
              {status === 'Interview' && 'Schedule your interview'}
              {status === 'Offer' && 'Manage your offer'}
              {status === 'Rejected' && 'Record the outcome'}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <X size={18} />
          </button>
        </div>

        <form id="jobForm" onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">

          {/* Company + Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Company *</label>
              <input required type="text" value={formData.company} onChange={e => set({ company: e.target.value })} className={inputCls} placeholder="Acme Corp" />
            </div>
            <div>
              <label className={labelCls}>Role/Title *</label>
              <input required type="text" value={formData.role} onChange={e => set({ role: e.target.value })} className={inputCls} placeholder="Frontend Engineer" />
            </div>
          </div>

          {/* Status Pills */}
          <div>
            <label className={labelCls}>Status</label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {(['Wishlist', 'Applied', 'Follow-up', 'Interview', 'Offer', 'Rejected'] as Job['status'][]).map(s => {
                const isActive = formData.status === s;
                let activeClasses = ''; let inactiveClasses = '';
                switch (s) {
                  case 'Wishlist': activeClasses = 'bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-900 shadow-lg transform scale-105'; inactiveClasses = 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'; break;
                  case 'Applied': activeClasses = 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 transform scale-105'; inactiveClasses = 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40'; break;
                  case 'Follow-up': activeClasses = 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30 transform scale-105'; inactiveClasses = 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/40'; break;
                  case 'Interview': activeClasses = 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 transform scale-105'; inactiveClasses = 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40'; break;
                  case 'Offer': activeClasses = 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transform scale-105'; inactiveClasses = 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40'; break;
                  case 'Rejected': activeClasses = 'bg-red-500 text-white shadow-lg shadow-red-500/30 transform scale-105'; inactiveClasses = 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'; break;
                }
                return (
                  <button key={s} type="button" onClick={() => set({ status: s })} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 border border-transparent ${isActive ? activeClasses : inactiveClasses}`}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div className="mt-4">
            <label className={labelCls}>Priority (1–5)</label>
            <select value={formData.priority} onChange={e => set({ priority: parseInt(e.target.value) as Job['priority'] })} className={inputCls}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>P{n}{n === 5 ? ' — 🔥 Dream' : n === 1 ? ' — Low' : ''}</option>)}
            </select>
          </div>

          {/* Status-contextual date section */}
          <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-900/10 p-3.5 space-y-3">

            {/* Applied Date — always shown */}
            <div>
              <label className={`${labelCls} text-indigo-700 dark:text-indigo-300`}>
                <Calendar size={13} />
                {status === 'Wishlist' ? 'Saved On' : 'Applied Date'}
              </label>
              <input
                type="date"
                value={toInputDate(formData.appliedDate)}
                onChange={e => set({ appliedDate: new Date(e.target.value) })}
                className={inputCls}
              />
            </div>

            {/* Follow-up Date — shown for Follow-up status */}
            {(status === 'Follow-up') && (
              <div>
                <label className={`${labelCls} text-yellow-700 dark:text-yellow-300`}>
                  <RefreshCw size={13} />
                  Follow-up Date <span className="text-gray-400 font-normal text-xs">(when did you follow up?)</span>
                </label>
                <input
                  type="date"
                  value={toInputDate(formData.followUpDate)}
                  onChange={e => set({ followUpDate: new Date(e.target.value) })}
                  className={inputCls}
                />
              </div>
            )}

            {/* Interview Date — shown for Interview status */}
            {(status === 'Interview') && (
              <div>
                <label className={`${labelCls} text-purple-700 dark:text-purple-300`}>
                  <Star size={13} />
                  Interview Date &amp; Time <span className="text-gray-400 font-normal text-xs">(scheduled date)</span>
                </label>
                <input
                  type="datetime-local"
                  value={toInputDateTime(formData.interviewDate)}
                  onChange={e => set({ interviewDate: new Date(e.target.value) })}
                  className={inputCls}
                />
              </div>
            )}

            {/* Offer Deadline — shown for Offer status */}
            {(status === 'Offer') && (
              <div>
                <label className={`${labelCls} text-emerald-700 dark:text-emerald-300`}>
                  <Trophy size={13} />
                  Decision Deadline <span className="text-gray-400 font-normal text-xs">(when do you need to decide by?)</span>
                </label>
                <input
                  type="date"
                  value={toInputDate(formData.offerDeadline)}
                  onChange={e => set({ offerDeadline: new Date(e.target.value) })}
                  className={inputCls}
                />
              </div>
            )}

            {/* Rejected Date — shown for Rejected status */}
            {(status === 'Rejected') && (
              <>
                <div>
                  <label className={`${labelCls} text-red-600 dark:text-red-400`}>
                    <XCircle size={13} />
                    Rejection Received <span className="text-gray-400 font-normal text-xs">(when did you get the rejection?)</span>
                  </label>
                  <input
                    type="date"
                    value={toInputDate(formData.rejectedDate)}
                    onChange={e => set({ rejectedDate: new Date(e.target.value) })}
                    className={inputCls}
                  />
                </div>
                
                <div className="mt-4">
                  <label className={`${labelCls} text-red-600 dark:text-red-400`}>
                    <XCircle size={13} />
                    Stage of Rejection <span className="text-gray-400 font-normal text-xs">(when did they reject you?)</span>
                  </label>
                  <select
                    className={inputCls}
                    value={formData.rejectionStage || ''}
                    onChange={(e) => set({ rejectionStage: (e.target.value as any) || undefined })}
                  >
                    <option value="">Unknown / Not recorded</option>
                    <option value="Resume">Resume Review (Never Interviewed)</option>
                    <option value="Interview">Post-Interview (Passed Initial Screen)</option>
                    <option value="Offer">Offer Stage (Offer rescinded/declined)</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* LinkedIn + Salary */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>LinkedIn / Job URL</label>
              <input type="url" value={formData.linkedinUrl ?? ''} onChange={e => set({ linkedinUrl: e.target.value })} className={inputCls} placeholder="https://..." />
            </div>
            <div>
              <label className={labelCls}>Salary Range</label>
              <input type="text" value={formData.salaryRange ?? ''} onChange={e => set({ salaryRange: e.target.value })} className={inputCls} placeholder="$120k – $150k" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              value={formData.notes ?? ''}
              onChange={e => set({ notes: e.target.value })}
              className={`${inputCls} min-h-[72px] resize-none`}
              placeholder="Referral info, interview format, recruiter name..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/80 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" form="jobForm" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
            <Save size={15} /> Save Application
          </button>
        </div>
      </div>
    </div>
  );
}
