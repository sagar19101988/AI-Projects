// src/db/db.ts
import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Job } from '../types/job';

interface JobTrackerDB extends DBSchema {
  jobs: {
    key: string;
    value: Job;
    indexes: { 'by-status': string; 'by-date': Date };
  };
}

const DB_NAME = 'JobTrackerDB';
const DB_VERSION = 1;

export const initDB = async (): Promise<IDBPDatabase<JobTrackerDB>> => {
  return openDB<JobTrackerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('jobs')) {
        const store = db.createObjectStore('jobs', { keyPath: 'id' });
        store.createIndex('by-status', 'status');
        store.createIndex('by-date', 'appliedDate');
      }
    },
  });
};

export const jobsDB = {
  async getAll(): Promise<Job[]> {
    const db = await initDB();
    return db.getAll('jobs');
  },
  async save(job: Job): Promise<void> {
    const db = await initDB();
    await db.put('jobs', job);
  },
  async delete(id: string): Promise<void> {
    const db = await initDB();
    await db.delete('jobs', id);
  },
  async saveAll(jobs: Job[]): Promise<void> {
    const db = await initDB();
    const tx = db.transaction('jobs', 'readwrite');
    await Promise.all([
      ...jobs.map(job => tx.store.put(job)),
      tx.done
    ]);
  }
};
