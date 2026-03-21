// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { JobProvider } from './context/JobContext.tsx';
import { CommandPaletteProvider } from './context/CommandPaletteContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <JobProvider>
      <CommandPaletteProvider>
        <App />
      </CommandPaletteProvider>
    </JobProvider>
  </React.StrictMode>,
);
