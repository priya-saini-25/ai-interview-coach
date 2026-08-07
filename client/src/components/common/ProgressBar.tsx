import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'gradient';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  color = 'gradient',
  className = '',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const colorClasses = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    gradient: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-medium">
          {label && <span className="text-gray-300">{label}</span>}
          {showPercentage && <span className="text-indigo-400 font-semibold">{clampedProgress}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-700/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClasses[color]}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
