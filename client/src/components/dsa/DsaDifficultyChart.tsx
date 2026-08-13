import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DsaDifficultyProgress } from '../../types';
import { Card } from '../common/Card';
import { Award } from 'lucide-react';

interface DsaDifficultyChartProps {
  difficultyProgress?: DsaDifficultyProgress;
  isLoading?: boolean;
}

export const DsaDifficultyChart: React.FC<DsaDifficultyChartProps> = ({ difficultyProgress, isLoading }) => {
  if (isLoading || !difficultyProgress) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="h-5 w-40 bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="h-[280px] bg-gray-800/40 rounded animate-pulse"></div>
      </Card>
    );
  }

  const { easy, medium, hard } = difficultyProgress;

  const chartData = [
    {
      difficulty: 'Easy',
      solved: easy?.solved || 0,
      remaining: Math.max(0, (easy?.total || 0) - (easy?.solved || 0)),
      total: easy?.total || 0,
      completionPercentage: easy?.completionPercentage || 0,
    },
    {
      difficulty: 'Medium',
      solved: medium?.solved || 0,
      remaining: Math.max(0, (medium?.total || 0) - (medium?.solved || 0)),
      total: medium?.total || 0,
      completionPercentage: medium?.completionPercentage || 0,
    },
    {
      difficulty: 'Hard',
      solved: hard?.solved || 0,
      remaining: Math.max(0, (hard?.total || 0) - (hard?.solved || 0)),
      total: hard?.total || 0,
      completionPercentage: hard?.completionPercentage || 0,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-xl text-xs space-y-1 z-50">
          <p className="font-bold text-white">{label} Tier</p>
          <p className="text-emerald-400">Solved: {data.solved} / {data.total}</p>
          <p className="text-gray-400">Remaining: {data.remaining}</p>
          <p className="text-indigo-400">Completion: {data.completionPercentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span>Difficulty Breakdown</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Easy / Medium / Hard problem mastery</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-1 text-center">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Easy</span>
          <p className="text-sm font-bold text-white mt-0.5">{easy?.solved || 0}/{easy?.total || 0}</p>
          <span className="text-[10px] text-emerald-300">{easy?.completionPercentage || 0}%</span>
        </div>
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Medium</span>
          <p className="text-sm font-bold text-white mt-0.5">{medium?.solved || 0}/{medium?.total || 0}</p>
          <span className="text-[10px] text-amber-300">{medium?.completionPercentage || 0}%</span>
        </div>
        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">Hard</span>
          <p className="text-sm font-bold text-white mt-0.5">{hard?.solved || 0}/{hard?.total || 0}</p>
          <span className="text-[10px] text-rose-300">{hard?.completionPercentage || 0}%</span>
        </div>
      </div>

      <div className="h-[210px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="difficulty" stroke="#9ca3af" fontSize={11} />
            <YAxis stroke="#6b7280" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="solved" name="Solved" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
            <Bar dataKey="remaining" name="Remaining" fill="#374151" radius={[4, 4, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
