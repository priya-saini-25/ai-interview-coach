import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DsaMonthlyProgressItem } from '../../types';
import { Card } from '../common/Card';
import { CalendarRange } from 'lucide-react';

interface DsaMonthlyProgressChartProps {
  monthlyProgress?: DsaMonthlyProgressItem[];
  isLoading?: boolean;
}

export const DsaMonthlyProgressChart: React.FC<DsaMonthlyProgressChartProps> = ({ monthlyProgress = [], isLoading }) => {
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
          <p className="font-bold text-white">{data.label}</p>
          <p className="text-indigo-400 font-semibold">{data.solved} problem(s) solved</p>
        </div>
      );
    }
    return null;
  };

  const totalMonthlySolved = monthlyProgress.reduce((acc, curr) => acc + (curr.solved || 0), 0);

  const formattedData = monthlyProgress.map((item) => ({
    ...item,
    shortLabel: `Week ${item.week}`,
  }));

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <CalendarRange className="w-4 h-4 text-indigo-400" />
            <span>Monthly Progress Breakdown</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Problems solved per week in the current month</p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          {totalMonthlySolved} Solved This Month
        </div>
      </div>

      <div className="h-[220px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="shortLabel" stroke="#9ca3af" fontSize={11} />
            <YAxis stroke="#6b7280" fontSize={11} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="solved" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
