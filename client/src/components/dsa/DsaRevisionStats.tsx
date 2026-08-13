import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dsaService } from '../../services/dsaService';
import { DsaRevisionStatsData } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatCard } from '../common/StatCard';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Trophy,
  Award,
  CircleCheck,
} from 'lucide-react';

export const DsaRevisionStats: React.FC = () => {
  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery<DsaRevisionStatsData>({
    queryKey: ['dsaRevisionStats'],
    queryFn: dsaService.getRevisionStats,
  });

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl border border-gray-800 animate-pulse space-y-3">
            <div className="h-4 w-24 bg-gray-800 rounded"></div>
            <div className="h-7 w-16 bg-gray-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="p-4 border-red-500/20 bg-red-500/5 text-center space-y-2">
        <p className="text-xs text-red-300">Unable to load revision statistics.</p>
        <Button size="sm" variant="outline" className="border-red-500/30 text-red-300 text-xs" onClick={() => refetch()}>
          Retry Stats
        </Button>
      </Card>
    );
  }

  const successRate = stats?.successRate || 0;
  const currentStreak = stats?.currentRevisionStreak || 0;
  const longestStreak = stats?.longestRevisionStreak || 0;
  const overdue = stats?.overdue || 0;
  const dueToday = stats?.dueToday || 0;
  const totalReviews = stats?.totalReviews || 0;
  const completedToday = stats?.completedToday || 0;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Revision Success Rate"
        value={`${successRate}%`}
        subtitle={`${totalReviews} Total Reviews Conducted`}
        icon={<Award className="w-6 h-6 text-emerald-400" />}
        iconBgColor="bg-emerald-500/10 text-emerald-400"
      />
      <StatCard
        title="Current Revision Streak"
        value={`${currentStreak} ${currentStreak === 1 ? 'Day' : 'Days'}`}
        subtitle={`Best All-Time: ${longestStreak} Days 🏆`}
        icon={<Flame className="w-6 h-6 text-amber-400" />}
        iconBgColor="bg-amber-500/10 text-amber-400"
      />
      <StatCard
        title="Revisions Pending Today"
        value={`${dueToday}`}
        subtitle={`${overdue} Overdue Items Pending`}
        icon={<RotateCcw className="w-6 h-6 text-purple-400" />}
        iconBgColor="bg-purple-500/10 text-purple-400"
      />
      <StatCard
        title="Completed Today"
        value={`${completedToday}`}
        subtitle="Reviewed & Passed Today"
        icon={<CircleCheck className="w-6 h-6 text-indigo-400" />}
        iconBgColor="bg-indigo-500/10 text-indigo-400"
      />
    </div>
  );
};
