import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jiraRoutes from './routes/jira';
import aiRoutes from './routes/ai';

import { initDb } from './services/db';
import authRoutes from './routes/auth';
import configRoutes from './routes/config';

dotenv.config();

// Initialize Local SQLite DB
initDb();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5174', credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register secure routes
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/jira', jiraRoutes);
app.use('/api/ai', aiRoutes);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Test Orchestrator Backend running on http://localhost:${PORT}`);
  });
}

export default app;
