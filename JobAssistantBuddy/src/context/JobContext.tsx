// src/context/JobContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Job } from '../types/job';
import { jobsDB } from '../db/db';
import { SEEDED_JOBS } from '../utils/dummyData';
import confetti from 'canvas-confetti'; // Vite HMR trigger

interface JobContextType {
  jobs: Job[];
  addJob: (job: Job) => Promise<void>;
  updateJob: (job: Job) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredJobs: Job[];
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      let data = await jobsDB.getAll();
      if (data.length === 0) {
        await jobsDB.saveAll(SEEDED_JOBS);
        data = await jobsDB.getAll();
      }
      setJobs(data);
    } catch (e) {
      console.error("Failed to load DB", e);
    }
  };

  const addJob = async (job: Job) => {
    await jobsDB.save(job);
    setJobs(prev => [...prev, job]);
  };

  const updateJob = async (job: Job) => {
    // Confetti logic: Check if we are newly transitioning to Offer
    const prevJob = jobs.find(j => j.id === job.id);
    if (job.status === 'Offer' && prevJob?.status !== 'Offer') {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'],
        zIndex: 9999
      });
    }
    
    await jobsDB.save(job);
    setJobs(prev => prev.map(j => j.id === job.id ? job : j));
  };

  const deleteJob = async (id: string) => {
    await jobsDB.delete(id);
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const filteredJobs = jobs.filter(j => 
    j.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
    j.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <JobContext.Provider value={{ jobs, addJob, updateJob, deleteJob, searchQuery, setSearchQuery, filteredJobs }}>
      {children}
    </JobContext.Provider>
  );
}

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error('useJobs must be used within JobProvider');
  return context;
};
