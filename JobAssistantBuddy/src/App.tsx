// src/App.tsx
import { useState, useEffect, useCallback } from 'react';
import KanbanBoard from './components/kanban/KanbanBoard';
import Header from './components/common/Header';
import AnalyticsBar from './components/ui/AnalyticsBar';
import CommandPalette from './components/ui/CommandPalette';
import { AlertsDropdown } from './components/ui/AlertsPanel';
import MorningBriefing from './components/ui/MorningBriefing';
import { useCommandPalette } from './context/CommandPaletteContext';
import { useJobs } from './context/JobContext';
import { useFollowUpAlerts } from './hooks/useFollowUpAlerts';
import { hasBriefingBeenSeenToday, resetBriefingForToday } from './utils/briefing';
import JobModal from './components/job/JobModal';

function AppInner() {
  const { toggle } = useCommandPalette();
  const { jobs } = useJobs();
  const alerts = useFollowUpAlerts(jobs);

  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  );
  const [isJobModalOpen, setJobModalOpen] = useState(false);
  const [isAlertsOpen, setAlertsOpen] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Morning briefing: show on first daily load
  const [showBriefing, setShowBriefing] = useState(false);
  useEffect(() => {
    // Small delay so the kanban board renders behind it first
    const t = setTimeout(() => {
      if (!hasBriefingBeenSeenToday() && jobs.length > 0) {
        setShowBriefing(true);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [jobs.length]);

  // Apply dark class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey &&
          !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        setJobModalOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  const handleExport = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jobs, null, 2));
    const dt = new Date().toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `job-tracker-backup-${dt}.json`;
    a.click();
  }, [jobs]);

  const handleDismissAlert = useCallback((id: string) => {
    setDismissedAlerts(prev => new Set([...prev, id]));
  }, []);

  const handleDismissAll = useCallback(() => {
    setDismissedAlerts(new Set(alerts.map(a => a.job.id)));
  }, [alerts]);

  const handleReplayBriefing = () => {
    resetBriefingForToday();
    setShowBriefing(true);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onAddJob={() => setJobModalOpen(true)}
        isAlertsOpen={isAlertsOpen}
        onToggleAlerts={() => setAlertsOpen(p => !p)}
        onReplayBriefing={handleReplayBriefing}
      />
      <AnalyticsBar />
      <main className="flex-1 overflow-hidden h-full">
        <KanbanBoard />
      </main>

      {isJobModalOpen && <JobModal onClose={() => setJobModalOpen(false)} />}

      {/* Root-level overlays — no stacking context issues */}
      <AlertsDropdown
        isOpen={isAlertsOpen}
        onClose={() => setAlertsOpen(false)}
        dismissed={dismissedAlerts}
        onDismiss={handleDismissAlert}
        onDismissAll={handleDismissAll}
      />

      {showBriefing && (
        <MorningBriefing onClose={() => setShowBriefing(false)} />
      )}

      <CommandPalette
        onAddJob={() => setJobModalOpen(true)}
        onToggleTheme={() => setDarkMode(d => !d)}
        isDark={darkMode}
        onExport={handleExport}
      />
    </div>
  );
}

export default function App() {
  return <AppInner />;
}
