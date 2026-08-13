import React from 'react';
import { StatCard } from '../common/StatCard';
import { Code2, CheckCircle2, Flame, RotateCcw } from 'lucide-react';
import { DsaAnalyticsData } from '../../types';

interface DsaSummaryCardsProps {
  analytics: DsaAnalyticsData | undefined;
  isLoading: boolean;
}

export const DsaSummaryCards: React.FC<DsaSummaryCardsProps> = ({ analytics, isLoading }) => {
  if (isLoading || !analytics) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="glass-panel p-5 rounded-2xl border border-gray-800 animate-pulse space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-gray-800 rounded"></div>
              <div className="h-8 w-8 bg-gray-800 rounded-lg"></div>
            </div>
            <div className="h-7 w-20 bg-gray-800 rounded"></div>
            <div className="h-3 w-28 bg-gray-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const { summary, revisionSummary } = analytics;
  const solved = summary?.solved ?? 0;
  const total = summary?.totalTracked ?? 40;
  const completionPercentage = summary?.completionPercentage ?? 0;
  const currentStreak = summary?.currentStreak ?? 0;
  const dueToday = revisionSummary?.dueToday ?? 0;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Problems Solved"
        value={`${solved} / ${total}`}
        subtitle="Across all topic categories"
        icon={<Code2 className="w-6 h-6 text-indigo-400" />}
        iconBgColor="bg-indigo-500/10 text-indigo-400"
      />
      <StatCard
        title="Completion Rate"
        value={`${completionPercentage}%`}
        subtitle="Overall curriculum progress"
        icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />}
        iconBgColor="bg-emerald-500/10 text-emerald-400"
      />
      <StatCard
        title="Current Streak"
        value={`${currentStreak} ${currentStreak === 1 ? 'Day' : 'Days'}`}
        subtitle="Active practice continuity"
        icon={<Flame className="w-6 h-6 text-amber-400" />}
        iconBgColor="bg-amber-500/10 text-amber-400"
      />
      <StatCard
        title="Revision Due Today"
        value={`${dueToday} ${dueToday === 1 ? 'Problem' : 'Problems'}`}
        subtitle="Spaced repetition targets"
        icon={<RotateCcw className="w-6 h-6 text-purple-400" />}
        iconBgColor="bg-purple-500/10 text-purple-400"
      />
    </div>
  );
};
