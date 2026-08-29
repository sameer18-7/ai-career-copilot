import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Briefcase, BookOpen,
  Mic, BarChart3, Settings, ChevronLeft, ChevronRight, Rocket
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: FileText, label: 'Resume', to: '/resume' },
  { icon: Briefcase, label: 'Job Matches', to: '/jobs' },
  { icon: BookOpen, label: 'Learning Path', to: '/skills' },
  { icon: Mic, label: 'Interview Coach', to: '/interview' },
  { icon: BarChart3, label: 'Analytics', to: '/dashboard' },
  { icon: Settings, label: 'Settings', to: '#' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-40 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-[72px] px-4 border-b border-gray-100 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-9 h-9 rounded-lg gradient-blue flex items-center justify-center flex-shrink-0">
          <Rocket size={20} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-extrabold text-base text-navy whitespace-nowrap">AI Career Copilot</span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all no-underline ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-royal-blue text-white shadow-md'
                  : 'text-gray-500 hover:bg-bg-light hover:text-navy'
              }`}
              style={isActive ? { boxShadow: '0 4px 12px rgba(61, 90, 254, 0.3)' } : {}}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-gray-400 hover:bg-bg-light hover:text-navy transition-all"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> <span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
