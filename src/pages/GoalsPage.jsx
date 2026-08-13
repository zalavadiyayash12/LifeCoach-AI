import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Bot, CheckSquare, Target, Activity, BookOpen, Calendar, 
  Clock, FileText, PieChart, Heart, User, Settings, LogOut, Search, 
  Plus, Moon, Sun, Trash2, Trophy, TrendingUp, AlertCircle, Flag, CheckCircle2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';

export default function GoalsPage() {
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

  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newGoalTitle, setNewGoalTitle] = useState('');
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

    fetch(`https://lifecoach-ai-169y.onrender.com/api/user/data/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.message) {
          if (data.name) {
            setUserName(data.name.split(' ')[0]);
            localStorage.setItem('lifeCoach_userName', data.name.split(' ')[0]);
          }

          setGoals(data.goals || []);
          if (data.profile && data.profile.avatar) {
            setProfileImage(data.profile.avatar);
            localStorage.setItem(`lifeCoach_profileImage_${userId}`, data.profile.avatar);
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching goals:", err);
        setIsLoading(false);
      });
  }, [userId, navigate]);

  const updateGoalsInDatabase = async (updatedGoals) => {
    setGoals(updatedGoals);
    try {
      await fetch('https://lifecoach-ai-169y.onrender.com/api/user/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          dataType: 'goals',
          dataValue: updatedGoals
        })
      });
    } catch (err) {
      console.error("Error saving goals to database:", err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const displayDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const getGreeting = () => {
    const hour = currentTime.getHours();
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

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newGoal = { id: Date.now(), title: newGoalTitle, progress: 0, color: randomColor };
    const updated = [...goals, newGoal];
    updateGoalsInDatabase(updated);
    setNewGoalTitle('');
  };

  const updateProgress = (id, newProgress) => {
    const updated = goals.map(g => g.id === id ? { ...g, progress: parseInt(newProgress) } : g);
    updateGoalsInDatabase(updated);
  };

  const deleteGoal = (id) => {
    const updated = goals.filter(g => g.id !== id);
    updateGoalsInDatabase(updated);
  };

  const filteredGoals = goals.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.progress === 100).length;
  const activeGoals = totalGoals - completedGoals;
  const avgProgress = totalGoals > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / totalGoals) : 0;

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'AI Coach', icon: <Bot size={18} /> },
    { name: 'Tasks', icon: <CheckSquare size={18} /> },
    { name: 'Goals', icon: <Target size={18} />, active: true },
    { name: 'Habits', icon: <Activity size={18} /> },
    { name: 'Journal', icon: <BookOpen size={18} /> },
    { name: 'Calendar', icon: <Calendar size={18} /> },
    { name: 'Focus', icon: <Clock size={18} /> },
    { name: 'Notes', icon: <FileText size={18} /> },
    { name: 'Finance', icon: <PieChart size={18} /> },
    { name: 'Health', icon: <Heart size={18} /> },
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-[#0F111A] text-slate-300' : 'bg-[#F8F9FB] text-slate-600'} font-sans text-sm transition-colors duration-300 relative`}>
      
      {/* SIDEBAR */}
      <div className={`w-64 flex flex-col justify-between border-r ${isDarkMode ? 'border-slate-800 bg-[#161B26]' : 'border-slate-200 bg-white'} z-20 shrink-0 hidden lg:flex`}>
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
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all relative z-50 ${item.active ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
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
        <header className={`h-16 border-b ${isDarkMode ? 'border-slate-800 bg-[#161B26]' : 'border-slate-200 bg-white'} shrink-0 z-50 flex items-center justify-between px-8 shadow-sm`}>
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
              placeholder="Search goals..." 
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
          <div className="max-w-[1400px] w-full mx-auto space-y-6 pb-12">
            
            <div className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl p-8 text-white flex justify-between items-center relative overflow-hidden shadow-md">
              <div className="relative z-10 space-y-2">
                <h1 className="text-3xl font-bold mb-1">Your Goals Dashboard 🎯</h1>
                <p className="text-blue-100 text-sm">"A goal without a timeline is just a dream." Keep pushing, {userName}!</p>
              </div>
              <div className="hidden md:block relative z-10">
                 <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 w-32 flex flex-col justify-center">
                  <div className="text-3xl font-bold mb-2">{avgProgress}%</div>
                  <div className="text-[10px] text-blue-100 uppercase font-semibold">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Goals', value: totalGoals, icon: <Target size={18} className="text-blue-500" />, tag: 'All time', tagColor: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' },
                { title: 'In Progress', value: activeGoals, icon: <Activity size={18} className="text-orange-500" />, tag: 'Active', tagColor: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10' },
                { title: 'Completed', value: completedGoals, icon: <Trophy size={18} className="text-emerald-500" />, tag: 'Done', tagColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
                { title: 'Avg Progress', value: `${avgProgress}%`, icon: <TrendingUp size={18} className="text-purple-500" />, tag: 'Overall', tagColor: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10' }
              ].map((stat, i) => (
                <div key={i} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col justify-between h-32`}>
                  <div className="flex justify-between items-start">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>{stat.icon}</div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${stat.tagColor}`}>{stat.tag}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-0.5">{stat.value}</h3>
                    <p className="text-xs text-slate-400">{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className={`lg:col-span-2 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} p-6 shadow-sm`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Target size={16} className="text-blue-500"/> Current Goals Progress
                  </h2>
                  <span className="text-xs text-slate-400">{activeGoals} Active</span>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-10 text-slate-400">Loading your goals...</div>
                ) : (
                  <div className="space-y-6">
                    {filteredGoals.length === 0 ? (
                      <p className="text-slate-400 text-xs py-4">No matching goals found.</p>
                    ) : (
                      filteredGoals.map((g) => (
                        <div key={g.id} className="relative group">
                          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            <span className="flex items-center gap-2">
                              {g.progress >= 100 && <CheckCircle2 size={12} className="text-emerald-500"/>} 
                              {g.title}
                            </span> 
                            <div className="flex items-center gap-4">
                               <button onClick={() => deleteGoal(g.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 size={14}/>
                               </button>
                               <span className={g.color.replace('bg-', 'text-')}>{g.progress}%</span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full relative">
                            <div className={`h-full rounded-full ${g.color} transition-all duration-300`} style={{ width: `${g.progress}%` }}></div>
                            <input 
                              type="range" 
                              min="0" max="100" 
                              value={g.progress}
                              onChange={(e) => updateProgress(g.id, e.target.value)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className={`rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} p-6 shadow-sm flex flex-col`}>
                <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Flag size={16} className="text-purple-500"/> Add New Target
                </h2>
                
                <form onSubmit={handleAddGoal} className="flex flex-col gap-4 flex-1">
                  <div className="space-y-2 flex-1">
                    <label className="text-xs font-semibold text-slate-500">Goal Title</label>
                    <input 
                      type="text" 
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      placeholder="e.g. Master React JS" 
                      className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm`}
                    />
                    <div className="p-3 mt-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-900/30 flex items-start gap-2">
                      <AlertCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-blue-600 dark:text-blue-400">Setting clear, achievable goals increases your success rate by 42%. Be specific!</p>
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-violet-500/20 mt-auto">
                    <Plus size={16} /> Create Goal
                  </button>
                </form>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* 📱 Mobile Bottom Navigation Bar */}
      <MobileNavbar />
    </div>
  );
}