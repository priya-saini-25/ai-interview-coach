import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const titleMap: Record<string, string> = {
  '/dashboard': 'Placement Dashboard',
  '/resume': 'AI Resume Analyzer',
  '/roadmap': '6-Month Placement Roadmap',
  '/dsa': 'DSA Progress Tracker',
  '/interview': 'AI Mock Interview Coach',
  '/notifications': 'Notification Center',
  '/profile': 'User Profile & Settings',
};

export const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const title = titleMap[location.pathname] || 'AI Placement Coach';

  return (
    <header className="h-16 border-b border-gray-800/80 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification Icon */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/60 transition"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </Link>

        {/* User Pill */}
        <Link
          to="/profile"
          className="flex items-center space-x-3 p-1.5 pr-3 rounded-full bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 transition"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />
            )}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-white leading-tight">{user?.name || 'User'}</p>
            <p className="text-[10px] text-gray-400 leading-tight">{user?.email || 'Candidate'}</p>
          </div>
        </Link>
      </div>
    </header>
  );
};
