import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, User as UserIcon, Sun, Moon, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const titleMap: Record<string, string> = {
  '/dashboard': 'Placement Dashboard',
  '/mentor': 'AI Placement Mentor',
  '/resume': 'AI Resume Analyzer',
  '/roadmap': '6-Month Placement Roadmap',
  '/dsa': 'DSA Progress Tracker',
  '/interview': 'AI Mock Interview Coach',
  '/notifications': 'Notification Center',
  '/profile': 'User Profile & Settings',
};

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const title = titleMap[location.pathname] || 'AI Placement Coach';

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800/80 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 transition-colors">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60 transition"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{title}</h2>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60 transition flex items-center justify-center"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>

        {/* Notification Icon */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60 transition"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </Link>

        {/* User Pill */}
        <Link
          to="/profile"
          className="flex items-center space-x-2 sm:space-x-3 p-1 sm:p-1.5 sm:pr-3 rounded-full bg-gray-100 dark:bg-gray-800/40 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700/50 transition"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />
            )}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">{user?.name || 'User'}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight truncate max-w-[120px]">{user?.email || 'Candidate'}</p>
          </div>
        </Link>
      </div>
    </header>
  );
};
