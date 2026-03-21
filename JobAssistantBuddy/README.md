# Job Tracker Pro

A hyper-premium, 100% local-first Job Tracking application built strictly with React 18, Vite, TypeScript, Tailwind CSS, and IndexedDB. 

## 📖 Feature Documentation
We have completely overhauled the UX/UI of this application to include dynamic drag physics, automated pipeline analytics, confetti celebrations, proactive morning briefings, and a 100% offline backend. 

**For a full detailed breakdown of the features and capabilities of this application, please read [features.md](./features.md).**

## 🏗️ Project Architecture
The codebase is strictly modularized by structural domains:

```text
src/
├── components/
│   ├── common/        # Global Reusables (Header.tsx)
│   ├── job/           # Job Item Data (JobCard.tsx, JobModal.tsx)
│   ├── kanban/        # dnd-kit Drag Architecture (KanbanBoard.tsx, Column.tsx)
│   └── ui/            # High-level layouts (AnalyticsBar.tsx, MorningBriefing.tsx, AlertsPanel.tsx)
├── context/           # React Context Providers (JobContext.tsx, CommandPaletteContext.tsx)
├── db/                # IDBP Database initialization & handlers (db.ts)
├── hooks/             # Externalized custom logic (useFollowUpAlerts.ts)
├── types/             # Global generic interfaces (job.ts, analytics.ts)
└── utils/             # Calculation engines (analytics.ts, briefing.ts)
```

## ⚙️ Tech Stack & Philosophy
- **Frontend Core**: React 18, TypeScript, Vite
- **Premium Styling**: Tailwind CSS, Google Fonts (Outfit), CSS Micro-interactions
- **Drag & Drop Engine**: `@dnd-kit/core` (with custom physics layers)
- **Local Backend**: `idb` powering massive offline IndexedDB stores
- **Icons & Animation**: `lucide-react`, `canvas-confetti`

## 📦 Getting Started

1. Navigate into the application root:
   ```bash
   cd JobAssistantBuddy
   ```
2. Install all dependencies (we utilize legacy peer dependencies for strict compatibility):
   ```bash
   npm install --legacy-peer-deps
   ```
3. Boot up the Vite auto-reloading development server:
   ```bash
   npm run dev
   ```

To build a heavily optimized, compressed PWA for production distribution:
```bash
npm run build
npm run preview
```
