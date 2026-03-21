// src/components/ui/AlertsPanel.tsx
import { useRef, useEffect } from 'react';
import { Bell, X, ArrowRight, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useFollowUpAlerts, type FollowUpAlert } from '../../hooks/useFollowUpAlerts';
import { useJobs } from '../../context/JobContext';
import type { Job } from '../../types/job';

interface AlertsBellProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AlertsBell({ onToggle }: AlertsBellProps) {
  const { jobs } = useJobs();
  const alerts = useFollowUpAlerts(jobs);
  // Note: dismissed state lives in AlertsDropdown, so we show total here
  const total = alerts.length;
  const urgent = alerts.filter(a => a.severity === 'urgent').length;

  return (
    <button
      onClick={onToggle}
      className={`relative p-2 rounded-full transition-colors ${
        total > 0
          ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
          : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      title={total > 0 ? `${total} follow-up alert${total > 1 ? 's' : ''}` : 'No alerts'}
    >
      <Bell size={18} />
      {total > 0 && (
        <span className={`absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white ${urgent > 0 ? 'bg-red-500' : 'bg-orange-400'}`}>
          {total > 9 ? '9+' : total}
          {urgent > 0 && (
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-60" />
          )}
        </span>
      )}
    </button>
  );
}

interface AlertsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  dismissed: Set<string>;
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

export function AlertsDropdown({ isOpen, onClose, dismissed, onDismiss, onDismissAll }: AlertsDropdownProps) {
  const { jobs, updateJob } = useJobs();
  const alerts = useFollowUpAlerts(jobs);
  const panelRef = useRef<HTMLDivElement>(null);

  const visible = alerts.filter(a => !dismissed.has(a.job.id));

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  const moveToFollowUp = async (job: Job) => {
    await updateJob({ ...job, status: 'Follow-up', updatedAt: new Date() });
    onDismiss(job.id);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="fixed top-[68px] right-4 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden"
      style={{ zIndex: 9999, maxHeight: 'calc(100vh - 88px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shrink-0">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-orange-500" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Follow-up Alerts</h3>
          {visible.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full">
              {visible.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Alert list */}
      <div className="overflow-y-auto flex-1">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <CheckCircle size={28} className="text-emerald-400" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">You're all caught up!</p>
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 px-4">
              No jobs need a follow-up right now.
            </p>
          </div>
        ) : (
          visible.map(({ job, daysOverdue, severity, message }: FollowUpAlert) => (
            <div
              key={job.id}
              className={`p-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                severity === 'urgent' ? 'bg-red-50/40 dark:bg-red-900/10' : 'bg-orange-50/30 dark:bg-orange-900/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`shrink-0 mt-0.5 p-1.5 rounded-full ${
                  severity === 'urgent'
                    ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                    : 'bg-orange-100 dark:bg-orange-900/40 text-orange-500 dark:text-orange-400'
                }`}>
                  {severity === 'urgent' ? <AlertTriangle size={12} /> : <Clock size={12} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{job.role}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">@ {job.company}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{message}</p>
                  {daysOverdue > 0 && (
                    <span className={`inline-block mt-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      severity === 'urgent'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    }`}>
                      {daysOverdue}d overdue
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pl-8">
                {job.status === 'Applied' && (
                  <button
                    onClick={() => moveToFollowUp(job)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <ArrowRight size={11} />
                    Move to Follow-up
                  </button>
                )}
                <button
                  onClick={() => onDismiss(job.id)}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {visible.length > 1 && (
        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 shrink-0 flex justify-end">
          <button
            onClick={onDismissAll}
            className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Dismiss all
          </button>
        </div>
      )}
    </div>
  );
}
