import React from 'react';
import { LayoutDashboard, CheckSquare, Bot, Clock, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MobileNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare size={20} /> },
    { name: 'AI Coach', path: '/chat', icon: <Bot size={20} /> },
    { name: 'Focus', path: '/focus', icon: <Clock size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#161B26]/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex lg:hidden justify-around items-center h-16 px-2 shadow-lg">
      {navItems.map((item, index) => {
        const isActive = location.pathname === item.path;

        return (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
              isActive 
                ? 'text-violet-600 dark:text-violet-400 font-bold scale-105' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1">{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}