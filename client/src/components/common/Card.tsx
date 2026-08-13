import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div
      className={`glass-panel rounded-xl p-6 transition-all duration-200 border border-gray-800/60 shadow-xl ${
        hoverEffect ? 'hover:border-indigo-500/40 hover:shadow-indigo-500/5 hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
