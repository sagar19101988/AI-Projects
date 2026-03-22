// src/components/common/Header.tsx
import { useEffect } from 'react';
import { useJobs } from '../../context/JobContext';
import { useCommandPalette } from '../../context/CommandPaletteContext';
import { Moon, Sun, Briefcase, Plus, Search, Command, Newspaper } from 'lucide-react';
import { AlertsBell } from '../ui/AlertsPanel';
import { LaunchpadButton } from '../ui/Launchpad';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  onAddJob: () => void;
  isAlertsOpen: boolean;
  onToggleAlerts: () => void;
  onReplayBriefing: () => void;
  isLaunchpadOpen: boolean;
  onToggleLaunchpad: () => void;
}

export default function Header({ darkMode, setDarkMode, onAddJob, isAlertsOpen, onToggleAlerts, onReplayBriefing, isLaunchpadOpen, onToggleLaunchpad }: HeaderProps) {
  const { searchQuery, setSearchQuery } = useJobs();
  const { open: openPalette } = useCommandPalette();

  // / -> focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 h-16 shrink-0 z-10 sticky top-0 transition-colors duration-300">
      <div className="h-full px-4 flex items-center justify-between mx-auto max-w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Briefcase size={18} />
          </div>
          <h1 className="text-lg font-bold tracking-tight hidden sm:block text-gray-900 dark:text-white">JobTracker</h1>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          <input
            id="search-input"
            type="text"
            placeholder="Search companies, roles... (press /)"
            className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent focus:border-indigo-400 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Command Palette trigger */}
          <button
            onClick={openPalette}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Open Command Palette"
          >
            <Command size={13} />
            <span>K</span>
          </button>

          {/* Alerts bell — dropdown rendered at root in App.tsx */}
          <AlertsBell isOpen={isAlertsOpen} onToggle={onToggleAlerts} />

          {/* Launchpad Quick Searches */}
          <LaunchpadButton isOpen={isLaunchpadOpen} onToggle={onToggleLaunchpad} />

          {/* Morning briefing replay */}
          <button
            onClick={onReplayBriefing}
            className="p-2 text-indigo-400/70 hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-colors"
            title="View Morning Briefing"
          >
            <Newspaper size={18} />
          </button>

          <button
            onClick={() => setDarkMode(d => !d)}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 dark:text-gray-400 rounded-full transition-colors"
            title="Toggle Theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={onAddJob}
            className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Job</span>
          </button>
        </div>
      </div>
    </header>
  );
}
