import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DsaWeeklyProgressItem } from '../../types';
import { Card } from '../common/Card';
import { Calendar } from 'lucide-react';

interface DsaWeeklyProgressChartProps {
  weeklyProgress?: DsaWeeklyProgressItem[];
  isLoading?: boolean;
}

export const DsaWeeklyProgressChart: React.FC<DsaWeeklyProgressChartProps> = ({ weeklyProgress = [], isLoading }) => {
  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="h-5 w-40 bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="h-[220px] bg-gray-800/40 rounded animate-pulse"></div>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-xl text-xs space-y-1 z-50">
          <p className="font-bold text-white">{data.day} ({data.date})</p>
          <p className="text-emerald-400 font-semibold">{data.solved} problem(s) solved</p>
        </div>
      );
    }
    return null;
  };

  const totalWeeklySolved = weeklyProgress.reduce((acc, curr) => acc + (curr.solved || 0), 0);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Weekly Solve Activity</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Problems solved over the past 7 days</p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          {totalWeeklySolved} Solved This Week
        </div>
      </div>

      <div className="h-[220px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
            <YAxis stroke="#6b7280" fontSize={11} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="solved"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#weeklyGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
