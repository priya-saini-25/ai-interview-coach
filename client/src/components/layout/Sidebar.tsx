import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Compass,
  Code2,
  Video,
  Bell,
  User,
  LogOut,
  Sparkles,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Mentor', path: '/mentor', icon: Bot },
  { name: 'Resume Analyzer', path: '/resume', icon: FileText },
  { name: 'AI Roadmap', path: '/roadmap', icon: Compass },
  { name: 'DSA Tracker', path: '/dsa', icon: Code2 },
  { name: 'Mock Interview', path: '/interview', icon: Video },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'My Profile', path: '/profile', icon: User },
];

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#0f172a]/95 border-r border-gray-800 min-h-screen flex flex-col justify-between p-4 sticky top-0 h-screen z-30">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 px-3 py-4 mb-6">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">AI Placement</h1>
            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-widest">Coach Backend Ready</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="pt-4 border-t border-gray-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
