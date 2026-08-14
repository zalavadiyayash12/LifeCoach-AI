import React from 'react';
import { 
  LayoutDashboard, CheckSquare, Bot, Clock, User, 
  Target, Activity, BookOpen, Calendar, FileText, PieChart, Heart 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MobileNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Ab yahan saare options add kar diye gaye hain
  const navItems = [
    { name: 'Home', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare size={20} /> },
    { name: 'Goals', path: '/goals', icon: <Target size={20} /> },
    { name: 'Habits', path: '/habits', icon: <Activity size={20} /> },
    { name: 'Journal', path: '/journal', icon: <BookOpen size={20} /> },
    { name: 'Notes', path: '/notes', icon: <FileText size={20} /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
    { name: 'Finance', path: '/finance', icon: <PieChart size={20} /> },
    { name: 'Health', path: '/health', icon: <Heart size={20} /> },
    { name: 'Focus', path: '/focus', icon: <Clock size={20} /> },
    { name: 'AI Coach', path: '/chat', icon: <Bot size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#161B26]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex lg:hidden items-center h-16 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] overflow-x-auto gap-6 pb-safe" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      
      {/* Scrollbar hide karne ke liye inline style use kiya hai taaki UI clean rahe */}
      <style dangerouslySetContent={{__html: `
        ::-webkit-scrollbar { display: none; }
      `}} />

      {navItems.map((item, index) => {
        const isActive = location.pathname === item.path;

        return (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center flex-shrink-0 transition-all duration-300 ${
              isActive 
                ? 'text-violet-600 dark:text-violet-400 font-bold scale-110 translate-y-[-2px]' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
            }`}
            style={{ minWidth: '3.5rem' }}
          >
            {item.icon}
            <span className={`text-[10px] mt-1.5 whitespace-nowrap ${isActive ? 'font-bold' : ''}`}>
              {item.name}
            </span>
            {/* Active Dot Indicator */}
            {isActive && <div className="w-1 h-1 rounded-full bg-violet-600 dark:bg-violet-400 absolute bottom-[-8px]"></div>}
          </button>
        );
      })}
    </div>
  );
}