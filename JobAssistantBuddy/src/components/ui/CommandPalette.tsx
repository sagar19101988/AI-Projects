// src/components/ui/CommandPalette.tsx
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useJobs } from '../../context/JobContext';
import { useCommandPalette } from '../../context/CommandPaletteContext';
import type { Job } from '../../types/job';
import {
  Search, Plus, Moon, Sun, Download, Briefcase,
  ArrowRight, Zap, ChevronRight, X
} from 'lucide-react';

type CommandGroup = 'Actions' | 'Jobs' | 'Move Job';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string[];
  group: CommandGroup;
  action: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  Wishlist: 'bg-gray-400',
  Applied: 'bg-blue-500',
  'Follow-up': 'bg-yellow-500',
  Interview: 'bg-purple-500',
  Offer: 'bg-emerald-500',
  Rejected: 'bg-red-500',
};
const STATUSES = ['Wishlist', 'Applied', 'Follow-up', 'Interview', 'Offer', 'Rejected'];

interface CommandPaletteProps {
  onAddJob: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
  onExport: () => void;
}

export default function CommandPalette({ onAddJob, onToggleTheme, isDark, onExport }: CommandPaletteProps) {
  const { isOpen, close } = useCommandPalette();
  const { jobs, updateJob, setSearchQuery } = useJobs();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [movingJob, setMovingJob] = useState<Job | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setMovingJob(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (movingJob) setMovingJob(null);
        else close();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [close, movingJob]);

  const baseCommands: Command[] = useMemo(() => [
    {
      id: 'add-job',
      label: 'Add New Job',
      description: 'Open the add job form',
      icon: <Plus size={16} />,
      shortcut: ['N'],
      group: 'Actions',
      action: () => { close(); onAddJob(); },
    },
    {
      id: 'focus-search',
      label: 'Focus Search Bar',
      description: 'Jump to search',
      icon: <Search size={16} />,
      shortcut: ['/'],
      group: 'Actions',
      action: () => { close(); setTimeout(() => document.getElementById('search-input')?.focus(), 100); },
    },
    {
      id: 'toggle-theme',
      label: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      description: 'Toggle appearance',
      icon: isDark ? <Sun size={16} /> : <Moon size={16} />,
      group: 'Actions',
      action: () => { close(); onToggleTheme(); },
    },
    {
      id: 'export-json',
      label: 'Export All Jobs as JSON',
      description: 'Download a backup file',
      icon: <Download size={16} />,
      group: 'Actions',
      action: () => { close(); onExport(); },
    },
    {
      id: 'clear-search',
      label: 'Clear Search Filter',
      description: 'Reset the search/filter bar',
      icon: <X size={16} />,
      group: 'Actions',
      action: () => { close(); setSearchQuery(''); },
    },
  ], [isDark, close, onAddJob, onToggleTheme, onExport, setSearchQuery]);

  // Move-job sub-commands
  const moveCommands: Command[] = useMemo(() => {
    if (!movingJob) return [];
    return STATUSES
      .filter(s => s !== movingJob.status)
      .map(status => ({
        id: `move-${status}`,
        label: `Move to ${status}`,
        description: `${movingJob.company} — ${movingJob.role}`,
        icon: <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[status]}`} />,
        group: 'Move Job' as CommandGroup,
        action: async () => {
          await updateJob({ ...movingJob, status: status as Job['status'], updatedAt: new Date() });
          close();
        },
      }));
  }, [movingJob, updateJob, close]);

  // Job commands
  const jobCommands: Command[] = useMemo(() => jobs.map(job => ({
    id: `job-${job.id}`,
    label: job.role,
    description: `${job.company} · ${job.status}`,
    icon: (
      <span className="flex items-center gap-1.5">
        <span className={`w-2 h-2 shrink-0 rounded-full ${STATUS_COLORS[job.status]}`} />
        <Briefcase size={14} />
      </span>
    ),
    group: 'Jobs' as CommandGroup,
    action: () => setMovingJob(job),
  })), [jobs]);

  const allCommands = movingJob ? moveCommands : [...baseCommands, ...jobCommands];

  const filtered = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase();
    return allCommands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  }, [query, allCommands]);

  // Group the filtered commands
  const grouped = useMemo(() => {
    const map = new Map<string, Command[]>();
    filtered.forEach(cmd => {
      if (!map.has(cmd.group)) map.set(cmd.group, []);
      map.get(cmd.group)!.push(cmd);
    });
    return map;
  }, [filtered]);

  const flatFiltered = filtered; // for keyboard navigation index

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, flatFiltered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      flatFiltered[activeIndex]?.action();
    }
  }, [flatFiltered, activeIndex]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // Reset active index on query change
  useEffect(() => { setActiveIndex(0); }, [query]);

  if (!isOpen) return null;

  let globalIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[70vh]">

        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 dark:border-gray-700">
          {movingJob ? (
            <button
              onMouseDown={() => setMovingJob(null)}
              className="flex items-center gap-1.5 text-xs text-indigo-500 font-medium shrink-0 hover:text-indigo-700"
            >
              <ChevronRight size={14} className="rotate-180" />
              Back
            </button>
          ) : (
            <Search size={18} className="text-gray-400 shrink-0" />
          )}

          <input
            ref={inputRef}
            type="text"
            placeholder={movingJob ? `Move "${movingJob.role}" to...` : 'Type a command or search jobs...'}
            className="flex-1 bg-transparent text-gray-900 dark:text-white text-sm outline-none placeholder-gray-400 dark:placeholder-gray-500"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500 gap-2">
              <Zap size={24} />
              <p className="text-sm">No commands found for "{query}"</p>
            </div>
          ) : (
            Array.from(grouped.entries()).map(([group, cmds]) => (
              <div key={group}>
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {group}
                </p>
                {cmds.map(cmd => {
                  globalIndex++;
                  const idx = globalIndex;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={cmd.id}
                      data-index={idx}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={cmd.action}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-sm ${
                        isActive ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}>
                        {cmd.icon}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium truncate">{cmd.label}</span>
                        {cmd.description && (
                          <span className="block text-xs text-gray-400 dark:text-gray-500 truncate">{cmd.description}</span>
                        )}
                      </span>
                      {cmd.shortcut && (
                        <span className="flex items-center gap-0.5 shrink-0">
                          {cmd.shortcut.map(k => (
                            <kbd key={k} className="px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                              {k}
                            </kbd>
                          ))}
                        </span>
                      )}
                      {cmd.group === 'Jobs' && (
                        <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-[10px] text-gray-400 dark:text-gray-600">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded font-mono">↑</kbd>
            <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded font-mono">↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded font-mono">↵</kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded font-mono">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
