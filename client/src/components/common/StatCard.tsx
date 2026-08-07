import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-indigo-500/10 text-indigo-400',
  trend,
}) => {
  return (
    <div className="glass-panel p-5 rounded-xl border border-gray-800/80 hover:border-gray-700/80 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold text-white mt-1">{value}</h4>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && <p className="text-xs text-emerald-400 mt-1 font-medium">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconBgColor}`}>{icon}</div>
      </div>
    </div>
  );
};
