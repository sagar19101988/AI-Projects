// src/hooks/useFollowUpAlerts.ts
import { useMemo } from 'react';
import type { Job } from '../types/job';

export type AlertSeverity = 'urgent' | 'warning';

export interface FollowUpAlert {
  job: Job;
  daysOverdue: number;
  severity: AlertSeverity;
  message: string;
}

const APPLIED_THRESHOLD_DAYS = 7;
const FOLLOWUP_THRESHOLD_DAYS = 14;

export function useFollowUpAlerts(jobs: Job[]): FollowUpAlert[] {
  return useMemo(() => {
    const now = new Date();
    const alerts: FollowUpAlert[] = [];

    jobs.forEach(job => {
      // Only alert on "Applied" or "Follow-up" statuses
      if (job.status !== 'Applied' && job.status !== 'Follow-up') return;

      if (job.status === 'Applied') {
        // For Applied: measure from appliedDate — how long since you sent the application
        const appliedOn = new Date(job.appliedDate);
        const daysSince = Math.floor((now.getTime() - appliedOn.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince >= APPLIED_THRESHOLD_DAYS) {
          alerts.push({
            job,
            daysOverdue: daysSince - APPLIED_THRESHOLD_DAYS,
            severity: daysSince >= 14 ? 'urgent' : 'warning',
            message: `Applied ${daysSince} days ago — no follow-up yet`,
          });
        }
      }

      if (job.status === 'Follow-up') {
        // For Follow-up: measure from appliedDate — how long since the original application
        // (updatedAt resets on every card move, so it's not a reliable reference)
        const appliedOn = new Date(job.appliedDate);
        const daysSince = Math.floor((now.getTime() - appliedOn.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince >= FOLLOWUP_THRESHOLD_DAYS) {
          alerts.push({
            job,
            daysOverdue: daysSince - FOLLOWUP_THRESHOLD_DAYS,
            severity: daysSince >= 21 ? 'urgent' : 'warning',
            message: `Applied ${daysSince} days ago — still awaiting a response`,
          });
        }
      }
    });

    // Sort: urgent first, then by most overdue
    return alerts.sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === 'urgent' ? -1 : 1;
      return b.daysOverdue - a.daysOverdue;
    });
  }, [jobs]);
}
