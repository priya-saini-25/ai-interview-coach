import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { DsaTopicProgressItem } from '../../types';
import { Card } from '../common/Card';
import { BookOpen, AlertCircle } from 'lucide-react';

interface DsaTopicProgressChartProps {
  topics?: DsaTopicProgressItem[];
  isLoading?: boolean;
}

export const DsaTopicProgressChart: React.FC<DsaTopicProgressChartProps> = ({ topics = [], isLoading }) => {
  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="h-5 w-40 bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-800/60 rounded animate-pulse"></div>
          ))}
        </div>
      </Card>
    );
  }

  // Sort topics by completion percentage ascending (weakest topics first)
  const sortedTopics = [...topics].sort((a, b) => a.completionPercentage - b.completionPercentage).slice(0, 10);

  if (sortedTopics.length === 0) {
    return (
      <Card className="p-6 text-center space-y-3">
        <BookOpen className="w-8 h-8 text-gray-600 mx-auto" />
        <p className="text-sm text-gray-400">No topic progress recorded yet.</p>
      </Card>
    );
  }

  const chartData = sortedTopics.map((t) => ({
    topic: t.topic.length > 18 ? `${t.topic.substring(0, 16)}...` : t.topic,
    fullTopic: t.topic,
    solved: t.solved,
    remaining: t.remaining,
    total: t.total,
    completionPercentage: t.completionPercentage,
  }));

  const getBarColor = (percentage: number) => {
    if (percentage < 30) return '#f43f5e'; // Rose/Red for low completion
    if (percentage < 60) return '#f59e0b'; // Amber/Yellow for medium completion
    return '#10b981'; // Emerald/Green for high completion
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-xl text-xs space-y-1 z-50">
          <p className="font-bold text-white">{data.fullTopic}</p>
          <p className="text-emerald-400">Solved: {data.solved} / {data.total}</p>
          <p className="text-amber-400">Remaining: {data.remaining}</p>
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
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Topic-wise Progress</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Sorted weakest first to prioritize practice</p>
        </div>
      </div>

      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 100]} stroke="#6b7280" fontSize={11} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="topic" stroke="#9ca3af" fontSize={11} width={120} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="completionPercentage" radius={[0, 4, 4, 0]} barSize={16}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.completionPercentage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
