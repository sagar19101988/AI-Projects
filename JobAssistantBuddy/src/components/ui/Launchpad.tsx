import { Compass, ExternalLink, Linkedin, Search } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function LaunchpadButton({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-full transition-colors flex items-center justify-center ${
        isOpen
          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
          : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 dark:text-gray-400'
      }`}
      title="Quick Launch Searches"
    >
      <Compass size={18} className={`transition-transform duration-500 ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
    </button>
  );
}

export function LaunchpadDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (isOpen && ref.current && !ref.current.contains(e.target as Node)) {
        // Ignore clicks on the toggle button
        if (!(e.target as Element).closest('button[title="Quick Launch Searches"]')) {
           onClose();
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute right-4 top-16 mt-2 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          Quick Launch
        </span>
        <Compass size={14} className="text-gray-400 dark:text-gray-500" />
      </div>

      <div className="p-2 space-y-1">
        {/* LinkedIn Launcher */}
        <a 
          href="https://www.linkedin.com/jobs/search/?f_AL=true&sortBy=DD" 
          target="_blank" 
          rel="noreferrer"
          onClick={onClose}
          className="group flex items-center justify-between px-3 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/60 p-2 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shadow-sm">
              <Linkedin size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-none mb-1">LinkedIn</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">Easy Apply • Recent</p>
            </div>
          </div>
          <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
        </a>

        {/* Naukri Launcher */}
        <a 
          href="https://www.naukri.com/jobs-in-india" 
          target="_blank" 
          rel="noreferrer"
          onClick={onClose}
          className="group flex items-center justify-between px-3 py-3 hover:bg-sky-50 dark:hover:bg-sky-900/40 rounded-xl transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="bg-sky-100 dark:bg-sky-900/60 p-2 rounded-lg text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform shadow-sm">
              <Search size={16} strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-none mb-1">Naukri</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">Main Search Portal</p>
            </div>
          </div>
          <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 text-sky-500 transition-opacity" />
        </a>

        {/* Custom ATS Launcher */}
        <a 
          href="https://google.com/search?q=site:greenhouse.io+OR+site:lever.co+%22software+engineer%22+%22remote%22" 
          target="_blank" 
          rel="noreferrer"
          onClick={onClose}
          className="group flex items-center justify-between px-3 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/60 p-2 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-sm">
              <Search size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-none mb-1">Direct ATS</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">Greenhouse • Lever</p>
            </div>
          </div>
          <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 text-emerald-500 transition-opacity" />
        </a>
      </div>
    </div>
  );
}
