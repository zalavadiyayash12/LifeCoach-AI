import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Bot, CheckSquare, Target, Activity, BookOpen, Calendar, 
  Clock, FileText, PieChart, Heart, User, Settings, LogOut, Search, 
  Plus, Moon, Sun, Flame, Check, X
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';

export default function HabitsPage() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedDark = localStorage.getItem('lifeCoach_darkMode') === 'true';
    if (savedDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return savedDark;
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  
  const userId = localStorage.getItem('lifeCoach_userUid');
  const [userName, setUserName] = useState(() => localStorage.getItem('lifeCoach_userName') || 'User');
  const [profileImage, setProfileImage] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', target: 1, unit: 'times', color: 'blue' });

  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    const savedPhoto = localStorage.getItem(`lifeCoach_profileImage_${userId}`);
    if (savedPhoto) {
      setProfileImage(savedPhoto);
    }

    fetch(`https://lifecoach-ai-169y.onrender.com/api/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.message) {
          if (data.name) {
            setUserName(data.name.split(' ')[0]);
            localStorage.setItem('lifeCoach_userName', data.name.split(' ')[0]);
          }

          if (data.habits && data.habits.length > 0) {
            const processed = data.habits.map(h => {
              const daysArray = h.days || [false, false, false, false, false, false, false];
              const isFullyCompleted = daysArray.every(day => day === true);
              return { ...h, days: daysArray, done: isFullyCompleted };
            });
            setHabits(processed);
          } else {
            setHabits([]);
          }

          if (data.profile && data.profile.avatar) {
            setProfileImage(data.profile.avatar);
            localStorage.setItem(`lifeCoach_profileImage_${userId}`, data.profile.avatar);
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching habits:", err);
        setIsLoading(false);
      });
  }, [userId, navigate]);

  const updateHabitsInDatabase = async (updatedHabits) => {
    setHabits(updatedHabits);
    try {
      await fetch('https://lifecoach-ai-169y.onrender.com/api/user/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          dataType: 'habits',
          dataValue: updatedHabits
        })
      });
    } catch (err) {
      console.error("Error saving habits to database:", err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const displayDate = currentTime ? currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const getGreeting = () => {
    const hour = currentTime ? currentTime.getHours() : 12;
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };
  const greeting = getGreeting();

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('lifeCoach_darkMode', newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDay = (habitId, dayIndex) => {
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const newDays = [...(h.days || [false, false, false, false, false, false, false])];
        newDays[dayIndex] = !newDays[dayIndex];
        const isFullyCompleted = newDays.every(d => d === true);

        return {
          ...h,
          days: newDays,
          done: isFullyCompleted,
          streak: isFullyCompleted && !h.done ? (h.streak || 0) + 1 : (h.streak || 0)
        };
      }
      return h;
    });
    updateHabitsInDatabase(updated);
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabit.name.trim()) return;

    const habitToAdd = {
      id: Date.now(),
      name: newHabit.name,
      streak: 0,
      unit: newHabit.unit,
      color: newHabit.color,
      days: [false, false, false, false, false, false, false],
      done: false
    };

    const updated = [...habits, habitToAdd];
    updateHabitsInDatabase(updated);
    setIsModalOpen(false);
    setNewHabit({ name: '', target: 1, unit: 'times', color: 'blue' });
  };

  const colorMap = {
    blue: { text: 'text-blue-500', bg: 'bg-blue-500' },
    red: { text: 'text-red-500', bg: 'bg-red-500' },
    purple: { text: 'text-purple-500', bg: 'bg-purple-500' },
    orange: { text: 'text-orange-500', bg: 'bg-orange-500' },
    emerald: { text: 'text-emerald-500', bg: 'bg-emerald-500' },
    pink: { text: 'text-pink-500', bg: 'bg-pink-500' },
  };

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const filteredHabits = habits.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'AI Coach', icon: <Bot size={18} /> },
    { name: 'Tasks', icon: <CheckSquare size={18} /> },
    { name: 'Goals', icon: <Target size={18} /> },
    { name: 'Habits', icon: <Activity size={18} />, active: true },
    { name: 'Journal', icon: <BookOpen size={18} /> },
    { name: 'Calendar', icon: <Calendar size={18} /> },
    { name: 'Focus', icon: <Clock size={18} /> },
    { name: 'Notes', icon: <FileText size={18} /> },
    { name: 'Finance', icon: <PieChart size={18} /> },
    { name: 'Health', icon: <Heart size={18} /> },
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-[#0F111A] text-slate-300' : 'bg-[#FAFAFA] text-slate-600'} font-sans text-sm transition-colors duration-300 relative`}>

      {/* SIDEBAR */}
      <div className={`w-64 flex flex-col justify-between border-r ${isDarkMode ? 'border-slate-800 bg-[#161B26]' : 'border-slate-100 bg-white'} z-20 shrink-0 hidden lg:flex`}>
        <div className="overflow-y-auto custom-scrollbar">
          <div className="p-6 flex items-center gap-3 text-violet-600 dark:text-violet-400 font-bold text-lg tracking-wide sticky top-0 bg-inherit z-10">
            <Bot size={24} /> LifeCoach AI
          </div>

          <div className="px-4 pb-4 space-y-1">
            {sidebarItems.map((item, i) => {
              let path = '/dashboard';
              if (item.name === 'Tasks') path = '/tasks';
              else if (item.name === 'Goals') path = '/goals';
              else if (item.name === 'Habits') path = '/habits';
              else if (item.name === 'Journal') path = '/journal';
              else if (item.name === 'AI Coach') path = '/chat';
              else if (item.name === 'Calendar') path = '/calendar';
              else if (item.name === 'Focus') path = '/focus';
              else if (item.name === 'Notes') path = '/notes';
              else if (item.name === 'Finance') path = '/finance';
              else if (item.name === 'Health') path = '/health';

              return (
                <Link
                  key={i}
                  to={path}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all relative z-50 ${item.active ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </div>

        </div>
        
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} space-y-1 shrink-0`}>
          <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
            <User size={18} /> Profile
          </Link>
          <Link to="/settings" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Settings size={18} /> Settings
          </Link>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* HEADER */}
        <header className={`h-16 border-b ${isDarkMode ? 'border-slate-800 bg-[#161B26]' : 'border-slate-100 bg-white'} shrink-0 z-50 flex items-center justify-between px-8 shadow-sm`}>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{greeting}, {userName}</span>
            <span className="text-xs text-slate-400">{displayDate}</span>
          </div>

          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..." 
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm`} 
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full text-xs font-semibold border border-emerald-100 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> AI Online
            </div>

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold shadow-sm border border-violet-200 cursor-pointer hover:ring-2 ring-violet-500 transition-all overflow-hidden"
              title="View Profile"
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1200px] mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Habits</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Build consistency, one day at a time</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-md shadow-indigo-500/20">
                <Plus size={16} /> Add Habit
              </button>
            </div>

            <div className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-400 rounded-2xl p-6 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Flame size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">24 Day Streak</h2>
                  <p className="text-sm text-indigo-100">You're on fire! Keep going.</p>
                </div>
              </div>
              <div className="hidden md:flex gap-2">
                {weekDays.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${i < 5 ? 'bg-white/30 text-white' : 'bg-white/10 text-white/50'}`}>
                      {i < 5 ? <Check size={12} /> : d}
                    </div>
                    <span className="text-[10px] text-white/70">{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-20 text-slate-400">Loading your habits...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {filteredHabits.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400">
                    No habits found. Click "Add Habit" to start building consistency!
                  </div>
                ) : (
                  filteredHabits.map((habit) => {
                    const colors = colorMap[habit.color] || colorMap.blue;
                    const safeName = habit.name || 'Unnamed Habit';
                    const safeStreak = habit.streak || 0;
                    const safeUnit = habit.unit || 'times';
                    const daysArray = habit.days || [false, false, false, false, false, false, false];

                    const checkedDaysCount = daysArray.filter(d => d === true).length;
                    const progressPercent = Math.round((checkedDaysCount / 7) * 100);
                    const isFullyCompleted = checkedDaysCount === 7;

                    return (
                      <div key={habit.id} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col`}>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">{safeName}</h3>
                            <div className="flex items-center gap-1 mt-1">
                              <Flame size={12} className={colors.text} />
                              <span className="text-xs text-slate-400">{safeStreak} day streak</span>
                            </div>
                          </div>
                          <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={isDarkMode ? '#334155' : '#f1f5f9'} strokeWidth="3" />
                              <path strokeDasharray={`${progressPercent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className={`stroke-current ${colors.text}`} strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            <span className="absolute text-[10px] font-bold text-slate-700 dark:text-slate-300">{progressPercent}%</span>
                          </div>
                        </div>

                        <div className="mb-6">
                          <div className="text-xs font-semibold text-slate-500 mb-2">
                            {checkedDaysCount} / 7 {safeUnit}
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${colors.bg} transition-all duration-500`} style={{ width: `${progressPercent}%` }}></div>
                          </div>
                        </div>

                        <div className="flex justify-between mb-6">
                          {weekDays.map((day, idx) => (
                            <button
                              key={idx}
                              onClick={() => toggleDay(habit.id, idx)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-colors ${daysArray[idx] ? `${colors.bg} text-white` : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>

                        <div className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-auto ${isFullyCompleted
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
                          }`}
                        >
                          {isFullyCompleted ? <><Check size={16} /> Completed</> : 'Tick all days to complete'}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl relative ${isDarkMode ? 'bg-[#161B26] border border-slate-800' : 'bg-white'}`}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create New Habit</h2>

            <form onSubmit={handleAddHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Habit Name</label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  placeholder="e.g., Read a book, Drink water..."
                  className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm`}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Theme Color</label>
                <div className="flex gap-3">
                  {Object.keys(colorMap).map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewHabit({ ...newHabit, color })}
                      className={`w-8 h-8 rounded-full ${colorMap[color].bg} ${newHabit.color === color ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-white' : ''}`}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full mt-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all shadow-md">
                Save Habit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 📱 Mobile Bottom Navigation Bar */}
      <MobileNavbar />
    </div>
  );
}