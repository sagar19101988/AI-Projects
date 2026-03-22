// src/components/job/JobCard.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Job } from '../../types/job';
import {
  Building, ExternalLink, MoreVertical, Trash2, Edit,
  Clock, Calendar, RefreshCw, Star, Trophy, Bookmark, XCircle
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInDays, differenceInHours, isPast, isToday } from 'date-fns';
import { useJobs } from '../../context/JobContext';

export default function JobCard({ job, onEdit }: { job: Job; onEdit: (job: Job) => void }) {
  const { deleteJob } = useJobs();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (showMenu && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [showMenu]);

  // Track pointer movement to distinguish click vs drag
  const dragMoved = useRef(false);
  const pointerStart = useRef({ x: 0, y: 0 });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id,
    data: { type: 'Job', job }
  });

  // Extract dnd-kit's onPointerDown so we can merge it with our click tracker
  const { onPointerDown: dndPointerDown, ...restListeners } = listeners ?? {};

  const transformStr = CSS.Transform.toString(transform);
  const style = {
    // Safely append a slight 3-degree tilt when dragging for tangible physics
    transform: transformStr ? `${transformStr}${isDragging ? ' rotate(3deg)' : ''}` : undefined,
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : 1,
    // Add a deep shadow when lifted
    boxShadow: isDragging ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)' : undefined,
  };

  const statusColors: Record<string, string> = {
    Wishlist:    'border-l-gray-400 dark:border-l-gray-400',
    Applied:     'border-l-blue-500 dark:border-l-blue-500',
    'Follow-up': 'border-l-yellow-500 dark:border-l-yellow-500',
    Interview:   'border-l-purple-500 dark:border-l-purple-500',
    Offer:       'border-l-green-500 dark:border-l-green-500',
    Rejected:    'border-l-red-500 dark:border-l-red-500',
  };

  // ── Overdue detection (always uses appliedDate as stable reference) ─────
  const isOverdue = useMemo(() => {
    if (job.status !== 'Applied' && job.status !== 'Follow-up') return false;
    const days = (Date.now() - new Date(job.appliedDate).getTime()) / 86400000;
    return job.status === 'Applied' ? days >= 7 : days >= 14;
  }, [job]);

  const isUrgent = useMemo(() => {
    if (!isOverdue) return false;
    const days = (Date.now() - new Date(job.appliedDate).getTime()) / 86400000;
    return job.status === 'Applied' ? days >= 14 : days >= 21;
  }, [job, isOverdue]);

  // ── Status-contextual date chip ─────────────────────────────────────────
  const dateChip = useMemo(() => {
    let appliedDate = new Date(job.appliedDate || Date.now());
    if (isNaN(appliedDate.getTime())) {
      appliedDate = new Date();
    }

    switch (job.status) {
      case 'Wishlist':
        return {
          icon: <Bookmark size={11} />,
          label: `Saved ${formatDistanceToNow(appliedDate, { addSuffix: true })}`,
          color: 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50',
        };

      case 'Applied':
        return {
          icon: <Calendar size={11} />,
          label: `Applied ${format(appliedDate, 'MMM d')}`,
          color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
        };

      case 'Follow-up': {
        const refRaw = job.followUpDate ? new Date(job.followUpDate) : null;
        const ref = refRaw && !isNaN(refRaw.getTime()) ? refRaw : null;
        return {
          icon: <RefreshCw size={11} />,
          label: ref
            ? `Followed up ${format(ref, 'MMM d')}`
            : `Applied ${format(appliedDate, 'MMM d')}`,
          color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30',
        };
      }

      case 'Interview': {
        if (!job.interviewDate) {
          return {
            icon: <Star size={11} />,
            label: 'Set interview date →',
            color: 'text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 italic cursor-pointer',
            action: true,
          };
        }
        const ivDate = new Date(job.interviewDate);
        if (isNaN(ivDate.getTime())) {
          return {
            icon: <Star size={11} />,
            label: 'Invalid Date',
            color: 'text-red-500 bg-red-50',
          };
        }
        const hoursLeft = differenceInHours(ivDate, new Date());
        const daysLeft = differenceInDays(ivDate, new Date());

        let label: string;
        let extraBadge: string | null = null;

        if (isToday(ivDate)) {
          label = `Today at ${format(ivDate, 'h:mm a')}`;
          extraBadge = 'TODAY 🔥';
        } else if (isPast(ivDate)) {
          label = `Was ${format(ivDate, 'MMM d')}`;
        } else if (hoursLeft < 24) {
          label = `Tomorrow at ${format(ivDate, 'h:mm a')}`;
          extraBadge = 'Tomorrow';
        } else {
          label = `${format(ivDate, 'MMM d')} at ${format(ivDate, 'h:mm a')}`;
          extraBadge = `In ${daysLeft}d`;
        }

        return {
          icon: <Star size={11} />,
          label,
          extraBadge,
          color: isToday(ivDate)
            ? 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 font-bold animate-pulse'
            : 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30',
          badgeColor: isToday(ivDate)
            ? 'bg-purple-600 text-white'
            : isPast(ivDate)
            ? 'bg-gray-500 text-white'
            : 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200',
        };
      }

      case 'Offer': {
        if (!job.offerDeadline) {
          return {
            icon: <Trophy size={11} />,
            label: `Received ${format(appliedDate, 'MMM d')}`,
            color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
          };
        }
        const deadline = new Date(job.offerDeadline);
        if (isNaN(deadline.getTime())) {
          return {
            icon: <Trophy size={11} />,
            label: 'Invalid Date',
            color: 'text-red-500 bg-red-50',
          };
        }
        const daysLeft = differenceInDays(deadline, new Date());
        const overdue = isPast(deadline);
        return {
          icon: <Trophy size={11} />,
          label: overdue
            ? `Deadline passed ${format(deadline, 'MMM d')}`
            : `Decide by ${format(deadline, 'MMM d')}`,
          extraBadge: overdue ? '⚠ Overdue' : daysLeft <= 2 ? `${daysLeft}d left` : null,
          color: overdue
            ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
            : daysLeft <= 2
            ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 font-bold animate-pulse'
            : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
          badgeColor: overdue ? 'bg-red-500 text-white' : 'bg-orange-400 text-white',
        };
      }

      case 'Rejected': {
        const refRaw = job.rejectedDate ? new Date(job.rejectedDate) : appliedDate;
        const ref = isNaN(refRaw.getTime()) ? appliedDate : refRaw;
        const stageText = job.rejectionStage ? ` • ${job.rejectionStage}` : '';
        return {
          icon: <XCircle size={11} />,
          label: job.rejectedDate
            ? `Rejected ${format(ref, 'MMM d')}${stageText}`
            : `Applied ${format(ref, 'MMM d')} · rejected${stageText}`,
          color: 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
        };
      }

      default:
        return {
          icon: <Calendar size={11} />,
          label: formatDistanceToNow(appliedDate, { addSuffix: true }),
          color: 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50',
        };
    }
  }, [job]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this application?')) deleteJob(job.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...restListeners}
      onPointerDown={(e) => {
        // Call dnd-kit's handler first so dragging still works
        dndPointerDown?.(e);
        // Then track movement for click detection
        dragMoved.current = false;
        pointerStart.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        const dx = e.clientX - pointerStart.current.x;
        const dy = e.clientY - pointerStart.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > 5) dragMoved.current = true;
      }}
      onClick={() => {
        if (!dragMoved.current && !showMenu) {
          onEdit(job);
        }
      }}
      onContextMenu={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
      className={`group relative flex flex-col gap-3 p-4 mb-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 dark:border-white/5 border-l-4 ${statusColors[job.status] ?? 'border-l-gray-400'} hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-300 dark:hover:border-white/10 transition-all duration-300 cursor-pointer active:cursor-grabbing active:scale-[0.98] outline-none`}
    >
      {/* Top: Role + Company + Menu */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-bold text-gray-900 dark:text-white leading-snug break-words" title={job.role}>
            {job.role}
          </h4>
          <div className="flex items-start gap-1.5 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Building size={12} className="shrink-0 mt-0.5" />
            <span className="break-words leading-tight">{job.company}</span>
          </div>
        </div>

        {/* 3-dot menu */}
        <div className="relative shrink-0">
          <button
            onPointerDown={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className={`p-1.5 rounded-md transition-colors text-gray-400 ${showMenu ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' : 'opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <MoreVertical size={15} />
          </button>

          {showMenu && (
            <div ref={menuRef} className="absolute right-0 top-8 mt-1 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
              <button onPointerDown={(e) => { e.stopPropagation(); onEdit(job); setShowMenu(false); }} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-lg mx-auto">
                <Edit size={13} /> Edit
              </button>
              {job.linkedinUrl && (
                <a href={job.linkedinUrl} target="_blank" onPointerDown={e => e.stopPropagation()} className="w-full text-left px-3 py-1.5 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                  <ExternalLink size={13} /> View Link
                </a>
              )}
              <button onPointerDown={handleDelete} className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notes preview */}
      {job.notes && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-snug line-clamp-2 -mt-1">
          {job.notes}
        </p>
      )}

      {/* Bottom: Date chip + badges */}
      <div className="flex flex-col gap-2.5 mt-2 pt-3 border-t border-gray-100 dark:border-gray-700/50">
        
        {/* Status-contextual date chip */}
        <button
          onPointerDown={dateChip.action ? (e) => { e.stopPropagation(); onEdit(job); } : undefined}
          className={`self-start flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg ${dateChip.color}`}
        >
          {dateChip.icon}
          <span>{dateChip.label}</span>
          {'extraBadge' in dateChip && dateChip.extraBadge && (
            <span className={`ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${'badgeColor' in dateChip ? dateChip.badgeColor : 'bg-gray-400 text-white'}`}>
              {dateChip.extraBadge}
            </span>
          )}
        </button>

        {/* Bottom badges: Overdue + Priority */}
        <div className="flex items-center gap-1.5 shrink-0 self-start">
          {isOverdue && (
            <span className={`relative flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
              isUrgent
                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
                : 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30'
            }`}>
              <Clock size={9} />
              Overdue
              {isUrgent && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
            </span>
          )}
          {job.priority && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20">
              P{job.priority}
            </span>
          )}
        </div>
      </div>

      {showMenu && <div className="fixed inset-0 z-40" onPointerDown={(e) => { e.stopPropagation(); setShowMenu(false); }} />}
    </div>
  );
}
