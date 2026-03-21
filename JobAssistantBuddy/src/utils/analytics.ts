// src/utils/analytics.ts
import type { Job } from '../types/job';

export interface PipelineAnalytics {
  total: number;
  byStatus: Record<string, number>;
  activePipeline: number;   // Applied + Follow-up + Interview
  responseRate: number;     // (Applied + Interview + Offer + Rejected) / (total - Wishlist)
  interviewRate: number;    // Secured interviews / (total - Wishlist)
  securedInterview: number; // Jobs that reached the interview stage at some point
  offerCount: number;
  rejectedCount: number;
  appliedLast7Days: number;
  healthScore: number;      // 0–100
  healthLabel: 'Critical' | 'Weak' | 'Building' | 'Good' | 'Strong';
  healthColor: string;
}

export function computeAnalytics(jobs: Job[]): PipelineAnalytics {
  const total = jobs.length;
  const byStatus: Record<string, number> = {
    Wishlist: 0, Applied: 0, 'Follow-up': 0, Interview: 0, Offer: 0, Rejected: 0,
  };
  jobs.forEach(j => { byStatus[j.status] = (byStatus[j.status] || 0) + 1; });

  const applied = byStatus['Applied'] || 0;
  const followUp = byStatus['Follow-up'] || 0;
  const interview = byStatus['Interview'] || 0;
  const offer = byStatus['Offer'] || 0;
  const rejected = byStatus['Rejected'] || 0;
  const wishlist = byStatus['Wishlist'] || 0;

  const activePipeline = applied + followUp + interview;

  // Response rate: anyone who progressed beyond wishlist / total non-wishlist applied
  const progressed = followUp + interview + offer + rejected;
  const trackedJobs = total - wishlist;
  const responseRate = trackedJobs > 0
    ? Math.round((progressed / trackedJobs) * 100)
    : 0;

  // Interview conversion: jobs that secured an interview / tracked jobs
  const securedInterview = jobs.filter(j => 
    j.status === 'Interview' || 
    j.status === 'Offer' || 
    !!j.interviewDate ||
    j.rejectionStage === 'Interview' || 
    j.rejectionStage === 'Offer'
  ).length;
  
  const interviewRate = trackedJobs > 0
    ? Math.min(100, Math.round((securedInterview / trackedJobs) * 100))
    : 0;

  // Applied in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const appliedLast7Days = jobs.filter(
    j => j.status !== 'Wishlist' && new Date(j.appliedDate) >= sevenDaysAgo
  ).length;

  // Health Score (0–100)
  let score = 0;

  // 1. Has active applications (0–25 pts)
  if (activePipeline >= 5) score += 25;
  else if (activePipeline >= 3) score += 18;
  else if (activePipeline >= 1) score += 10;

  // 2. Interview conversion (0–25 pts)
  if (interviewRate >= 30) score += 25;
  else if (interviewRate >= 15) score += 15;
  else if (interviewRate >= 5) score += 8;

  // 3. Recent momentum (0–20 pts)
  if (appliedLast7Days >= 5) score += 20;
  else if (appliedLast7Days >= 3) score += 14;
  else if (appliedLast7Days >= 1) score += 7;

  // 4. Offer presence (0–15 pts)
  if (offer >= 2) score += 15;
  else if (offer === 1) score += 10;

  // 5. Wishlist not clogging pipeline — penalize if > 70% are wishlist (–15 pts)
  if (total > 0 && wishlist / total > 0.7) score -= 15;

  // 6. Follow-up discipline (0–15 pts)
  if (followUp >= 2) score += 15;
  else if (followUp === 1) score += 8;

  score = Math.max(0, Math.min(100, score));

  const healthLabel =
    score >= 80 ? 'Strong'
    : score >= 60 ? 'Good'
    : score >= 40 ? 'Building'
    : score >= 20 ? 'Weak'
    : 'Critical';

  const healthColor =
    score >= 80 ? 'text-emerald-600 dark:text-emerald-400'
    : score >= 60 ? 'text-blue-600 dark:text-blue-400'
    : score >= 40 ? 'text-yellow-600 dark:text-yellow-400'
    : score >= 20 ? 'text-orange-600 dark:text-orange-400'
    : 'text-red-600 dark:text-red-400';

  return {
    total, byStatus, activePipeline, responseRate, interviewRate, securedInterview,
    offerCount: offer, rejectedCount: rejected, appliedLast7Days,
    healthScore: score, healthLabel, healthColor,
  };
}
