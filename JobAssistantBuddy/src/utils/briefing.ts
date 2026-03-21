// src/utils/briefing.ts
import type { Job } from '../types/job';
import { computeAnalytics } from './analytics';

export interface BriefingData {
  greeting: string;
  overdueFollowUps: Job[];
  upcomingInterviews: Job[];
  streakDays: number;
  totalJobs: number;       // matches analytics bar "Total Jobs"
  offerCount: number;
  healthScore: number;
  healthLabel: string;     // matches analytics bar label
  todayTargets: string[];
  motivationalLine: string;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  return 'Good evening';
}

function computeStreak(jobs: Job[]): number {
  const appliedDays = new Set<string>();
  jobs.forEach(j => {
    if (j.status !== 'Wishlist') {
      const d = new Date(j.appliedDate);
      appliedDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    }
  });
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (appliedDays.has(key)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

const MOTIVATIONAL_LINES = [
  "Every application is one step closer. Keep going! 💪",
  "Your next offer is closer than you think. Stay persistent! 🎯",
  "The best opportunities come to those who stay consistent. 🔥",
  "Each rejection is redirection toward something better. 🌟",
  "Your dream job is searching for you too! Keep applying. 🚀",
  "One great application beats ten mediocre ones. Make it count! ✨",
  "Consistency is the hidden superpower in every job search. 💡",
];

export function computeBriefing(jobs: Job[]): BriefingData {
  const now = new Date();

  // ✅ Single source of truth — same engine as the analytics bar
  const analytics = computeAnalytics(jobs);

  const byStatus: Record<string, Job[]> = {};
  jobs.forEach(j => {
    if (!byStatus[j.status]) byStatus[j.status] = [];
    byStatus[j.status].push(j);
  });

  const applied = byStatus['Applied'] ?? [];
  const followUp = byStatus['Follow-up'] ?? [];
  const interview = byStatus['Interview'] ?? [];
  const wishlist = byStatus['Wishlist'] ?? [];

  // Overdue follow-ups
  const overdueFollowUps = [
    ...applied.filter(j => (now.getTime() - new Date(j.appliedDate).getTime()) / 86400000 >= 7),
    ...followUp.filter(j => (now.getTime() - new Date(j.appliedDate).getTime()) / 86400000 >= 14),
  ];

  // Today's targets
  const targets: string[] = [];
  if (overdueFollowUps.length > 0)
    targets.push(`Send follow-ups to ${overdueFollowUps.length} waiting application${overdueFollowUps.length > 1 ? 's' : ''}`);
  if (wishlist.length > 0)
    targets.push(`Apply to ${Math.min(3, wishlist.length)} job${Math.min(3, wishlist.length) > 1 ? 's' : ''} from your wishlist`);
  if (interview.length > 0)
    targets.push(`Prep STAR answers for your ${interview.length} active interview${interview.length > 1 ? 's' : ''}`);
  if (targets.length === 0) {
    targets.push('Add new job opportunities to your Wishlist');
    targets.push('Review your pipeline and update any statuses');
  }

  return {
    greeting: getGreeting(),
    overdueFollowUps: overdueFollowUps.slice(0, 3),
    upcomingInterviews: interview.slice(0, 3),
    streakDays: computeStreak(jobs),
    totalJobs: analytics.total,          // ✅ same as "Total Jobs" in analytics bar
    offerCount: analytics.offerCount,
    healthScore: analytics.healthScore,  // ✅ same score as analytics bar
    healthLabel: analytics.healthLabel,  // ✅ same label as analytics bar
    todayTargets: targets.slice(0, 3),
    motivationalLine: MOTIVATIONAL_LINES[new Date().getDate() % MOTIVATIONAL_LINES.length],
  };
}

// ── Daily seen tracking ──────────────────────────────────────────────────────

const BRIEFING_KEY = 'jt_briefing_seen';

export function hasBriefingBeenSeenToday(): boolean {
  return localStorage.getItem(BRIEFING_KEY) === new Date().toDateString();
}

export function markBriefingSeenToday(): void {
  localStorage.setItem(BRIEFING_KEY, new Date().toDateString());
}

export function resetBriefingForToday(): void {
  localStorage.removeItem(BRIEFING_KEY);
}
