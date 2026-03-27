// src/components/ui/AnalyticsBar.tsx
import { useMemo, useState } from 'react';
import { useJobs } from '../../context/JobContext';
import { computeAnalytics } from '../../utils/analytics';
import {
  TrendingUp, Briefcase, Zap, Activity, Award, ChevronDown, ChevronUp, Target, Info
} from 'lucide-react';

function StatCard({
  icon, label, value, sub, color, tooltip
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  tooltip?: string;
}) {
  return (
    <div 
      className="group relative flex-1 flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm min-w-[150px] cursor-default hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-md transition-all"
    >
      {tooltip && (
        <Info size={12} className="absolute top-2 right-2 text-gray-300 dark:text-gray-600 group-hover:text-transparent transition-colors pointer-events-none z-0" />
      )}
      <div className={`shrink-0 p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-none mb-1">{label}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{value}</p>
        {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>

      {/* Embedded Custom Tooltip Overlay */}
      {tooltip && (
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 flex items-center justify-center px-4 rounded-xl bg-gray-900/95 dark:bg-black/90 backdrop-blur-sm shadow-xl scale-95 group-hover:scale-100">
          <p className="text-white text-[11px] font-medium leading-relaxed text-center drop-shadow-md">
            {tooltip}
          </p>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsBar() {
  const { jobs } = useJobs();
  const analytics = useMemo(() => computeAnalytics(jobs), [jobs]);
  const [expanded, setExpanded] = useState(true);

  const scoreBarColor =
    analytics.healthScore >= 80 ? 'bg-emerald-500'
    : analytics.healthScore >= 60 ? 'bg-blue-500'
    : analytics.healthScore >= 40 ? 'bg-yellow-500'
    : analytics.healthScore >= 20 ? 'bg-orange-500'
    : 'bg-red-500';

  const scoreBg =
    analytics.healthScore >= 80 ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
    : analytics.healthScore >= 60 ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800'
    : analytics.healthScore >= 40 ? 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800'
    : analytics.healthScore >= 20 ? 'bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800'
    : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800';

  if (jobs.length === 0) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* Toggle bar */}
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center justify-between px-6 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity size={13} />
          <span>Pipeline Analytics</span>
        </div>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-wrap gap-3 items-stretch overflow-x-auto">

          {/* Health Score — Featured Card */}
          <div 
            className={`group relative flex-1 flex flex-col justify-between p-4 rounded-xl border shadow-sm min-w-[176px] xl:max-w-[300px] cursor-default hover:shadow-md transition-all ${scoreBg}`}
          >
            <Info size={13} className={`absolute top-3 right-3 opacity-40 group-hover:opacity-0 transition-opacity pointer-events-none z-0 ${analytics.healthColor}`} />

            {/* Custom Tooltip Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 flex items-center justify-center px-5 rounded-xl bg-gray-900/95 dark:bg-black/90 backdrop-blur-sm shadow-xl scale-95 group-hover:scale-100">
              <p className="text-white text-[12px] font-medium leading-relaxed text-center drop-shadow-md">
                A holistic score out of 100 representing the momentum and health of your entire pipeline
              </p>
            </div>

            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Health Score</p>
              <Target size={14} className={analytics.healthColor} />
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-black leading-none ${analytics.healthColor}`}>
                {analytics.healthScore}
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-500 mb-1">/100</span>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${scoreBarColor}`}
                style={{ width: `${analytics.healthScore}%` }}
              />
            </div>
            <p className={`text-xs font-bold mt-2 ${analytics.healthColor}`}>{analytics.healthLabel}</p>
          </div>

          {/* Stat Cards */}
          <StatCard
            icon={<Briefcase size={16} className="text-indigo-600 dark:text-indigo-400" />}
            label="Total Jobs"
            value={analytics.total}
            sub={`${analytics.byStatus['Wishlist'] || 0} in wishlist`}
            color="bg-indigo-50 dark:bg-indigo-900/30"
            tooltip="The absolute total number of jobs you are tracking across ALL columns, including the Wishlist."
          />
          <StatCard
            icon={<Zap size={16} className="text-blue-600 dark:text-blue-400" />}
            label="Active Pipeline"
            value={analytics.activePipeline}
            sub="Applied + Follow-up + Interview"
            color="bg-blue-50 dark:bg-blue-900/30"
            tooltip="Jobs currently in active motion where you are waiting on the employer (Applied, Follow-up, or Interview status)"
          />
          <StatCard
            icon={<TrendingUp size={16} className="text-purple-600 dark:text-purple-400" />}
            label="Interview Rate"
            value={`${analytics.interviewRate}%`}
            sub={`${analytics.securedInterview} secured`}
            color="bg-purple-50 dark:bg-purple-900/30"
            tooltip="Percentage of all tracked applications that successfully advanced to an interview (includes jobs later offered or rejected)"
          />
          <StatCard
            icon={<Activity size={16} className="text-yellow-600 dark:text-yellow-400" />}
            label="Response Rate"
            value={`${analytics.responseRate}%`}
            sub="of applications"
            color="bg-yellow-50 dark:bg-yellow-900/30"
            tooltip="Percentage of applications that received any response (Interview, Offer, or Rejection)"
          />
          <StatCard
            icon={<Award size={16} className="text-emerald-600 dark:text-emerald-400" />}
            label="Offers"
            value={analytics.offerCount}
            sub={`${analytics.rejectedCount} rejected`}
            color="bg-emerald-50 dark:bg-emerald-900/30"
            tooltip="Total offers received (vs total rejections)"
          />
          <StatCard
            icon={<TrendingUp size={16} className="text-orange-600 dark:text-orange-400" />}
            label="Last 7 Days"
            value={analytics.appliedLast7Days}
            sub="new applications"
            color="bg-orange-50 dark:bg-orange-900/30"
            tooltip="Number of jobs you have applied to within the last 7 days"
          />
        </div>
      )}
    </div>
  );
}
