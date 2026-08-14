import React, { useState, useEffect } from 'react';
import {  
  LayoutDashboard, Bot, CheckSquare, Target, Activity, BookOpen, Calendar,  
  Clock, FileText, PieChart, Heart, User, Settings, LogOut, Search,  
  Plus, Moon, Sun, Flame, Droplets, Smile, Zap, Book, CheckCircle2, Sparkles  
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';

export default function DashboardPage() {
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

  // LIVE DATABASE STATES
  const [allTasks, setAllTasks] = useState([]);
  const [habitsData, setHabitsData] = useState([]);
  const [goalsData, setGoalsData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [focusMinutes, setFocusMinutes] = useState(0);
  const [waterCount, setWaterCount] = useState(6);
  const [healthData, setHealthData] = useState({
    sleep: 7.2,
    mood: 'Great',
    calories: 1850
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 🔴 LIVE WEATHER STATE 🔴
  const [weather, setWeather] = useState({
    temp: '28°C',
    condition: 'Sunny',
    icon: '☀️',
    bgGradient: 'from-violet-500 to-indigo-500'
  });

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=23.0225&longitude=72.5714&current=temperature_2m,weather_code&timezone=auto')
      .then(res => res.json())
      .then(data => {
        if (data && data.current) {
          const temp = Math.round(data.current.temperature_2m);
          const code = data.current.weather_code;
          
          let condition = 'Sunny';
          let icon = '☀️';
          let bgGradient = 'from-violet-500 to-indigo-500';

          if (code === 0) {
            condition = 'Clear Sky';
            icon = '☀️';
            bgGradient = 'from-amber-500 via-orange-500 to-yellow-500';
          } else if (code >= 1 && code <= 3) {
            condition = 'Partly Cloudy';
            icon = '⛅';
            bgGradient = 'from-blue-600 via-indigo-500 to-slate-600';
          } else if (code >= 51 && code <= 67) {
            condition = 'Raining';
            icon = '🌧️';
            bgGradient = 'from-blue-800 via-slate-700 to-indigo-900';
          } else if (code >= 95) {
            condition = 'Thunderstorm';
            icon = '⚡';
            bgGradient = 'from-slate-900 via-purple-950 to-indigo-950';
          }

          setWeather({
            temp: `${temp}°C`,
            condition,
            icon,
            bgGradient
          });
        }
      })
      .catch(err => console.log("Weather fetch error:", err));
  }, []);

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

          setAllTasks(data.tasks || []);
          setHabitsData(data.habits || []);
          setGoalsData(data.goals || []);
          setEventsData(data.calendarEvents || []);
          
          if (data.focusStats) {
            setFocusMinutes(data.focusStats.totalFocusTime || 0);
          }
          if (data.health && Object.keys(data.health).length > 0) {
            setHealthData(data.health);
            if (data.health.water !== undefined) {
              setWaterCount(data.health.water);
            }
          }
          if (data.profile && data.profile.avatar) {
            setProfileImage(data.profile.avatar);
            localStorage.setItem(`lifeCoach_profileImage_${userId}`, data.profile.avatar);
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching dashboard data:", err);
        setIsLoading(false);
      });
  }, [userId, navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalTasksCount = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'done').length;
  const taskProgress = totalTasksCount > 0 ? Math.round((completedTasks / totalTasksCount) * 100) : 0;
  
  const totalHabitsCount = habitsData.length;
  const completedHabitsCount = habitsData.filter(h => h.done).length;

  const focusHours = Math.floor(focusMinutes / 60);
  const focusMins = focusMinutes % 60;
  const displayFocus = `${focusHours}h ${focusMins}m`;
  const displayWater = `${waterCount}/8`;
  const displayStreak = completedHabitsCount > 0 ? `${completedHabitsCount} days` : '0 days';

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };
  const displayDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const displayTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
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

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, active: true, path: '/dashboard' },
    { name: 'AI Coach', icon: <Bot size={18} />, path: '/chat' },
    { name: 'Tasks', icon: <CheckSquare size={18} />, path: '/tasks' },
    { name: 'Goals', icon: <Target size={18} />, path: '/goals' },
    { name: 'Habits', icon: <Activity size={18} />, path: '/habits' },
    { name: 'Journal', icon: <BookOpen size={18} />, path: '/journal' },
    { name: 'Calendar', icon: <Calendar size={18} />, path: '/calendar' },
    { name: 'Focus', icon: <Clock size={18} />, path: '/focus' },
    { name: 'Notes', icon: <FileText size={18} />, path: '/notes' },
    { name: 'Finance', icon: <PieChart size={18} />, path: '/finance' },
    { name: 'Health', icon: <Heart size={18} />, path: '/health' },
  ];

  const filteredTasks = allTasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-[#0F111A] text-slate-300' : 'bg-[#F8F9FB] text-slate-600'} font-sans text-sm transition-colors duration-300`}>
      
      <div className={`w-64 flex flex-col justify-between border-r ${isDarkMode ? 'border-slate-800 bg-[#161B26]' : 'border-slate-200 bg-white'} z-20 shrink-0 hidden lg:flex`}>
        <div className="overflow-y-auto custom-scrollbar">
          <div className="p-6 flex items-center gap-3 text-violet-600 dark:text-violet-400 font-bold text-lg tracking-wide sticky top-0 bg-inherit z-10">
            <Bot size={24} /> LifeCoach AI
          </div>
          
          <div className="px-4 pb-4 space-y-1">
            {sidebarItems.map((item, i) => (
              <Link 
                key={i} 
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all relative z-50 ${item.active ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {item.icon} {item.name}
              </Link>
            ))}
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
              placeholder="Search tasks..." 
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

        {/* Added pb-24 here so content is not hidden behind the mobile bottom navbar */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-24">
          <div className="max-w-[1400px] w-full mx-auto space-y-6">
            
            {isLoading ? (
              <div className="text-center py-20 text-slate-400">Loading your secure database dashboard...</div>
            ) : (
              <>
                <div className={`w-full bg-gradient-to-r ${weather.bgGradient} rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden shadow-md transition-all duration-700`}>
                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                            <Bot size={14}/> AI COACH ONLINE
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold mb-1">{greeting}, {userName} 👋</h1>
                      <p className="text-violet-100 italic text-sm">"The secret of getting ahead is getting started." — Mark Twain</p>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <span className="px-3 py-1.5 bg-white/10 rounded-lg text-xs backdrop-blur-sm flex items-center gap-2 border border-white/20 font-medium">
                        <span>{weather.icon}</span> {weather.temp} · {weather.condition} (Ahmedabad)
                      </span>
                      <span className="px-3 py-1.5 bg-white/10 rounded-lg text-xs backdrop-blur-sm flex items-center gap-2 border border-white/20"><Clock size={14}/> {displayTime}</span>
                      <span className="px-3 py-1.5 bg-white/10 rounded-lg text-xs backdrop-blur-sm flex items-center gap-2 border border-white/20"><Target size={14}/> Next focus block ready</span>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6 md:mt-0 relative z-10">
                    <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 w-32">
                      <div className="relative w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36"><path strokeDasharray={`${taskProgress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="white" strokeWidth="3" /></svg>
                        <span className="absolute text-lg font-bold">{taskProgress}%</span>
                      </div>
                      <div className="text-[10px] text-violet-100 uppercase font-semibold">Productivity</div>
                    </div>
                    <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 w-32 flex flex-col justify-center">
                      <div className="text-3xl font-bold mb-2">Live</div>
                      <div className="text-[10px] text-violet-100 uppercase font-semibold">Database Synced</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: 'Tasks Done', value: `${completedTasks}/${totalTasksCount}`, icon: <CheckSquare size={18} className="text-blue-500" />, tag: 'Live', tagColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
                    { title: 'Habit Streak', value: displayStreak, icon: <Flame size={18} className="text-orange-500" />, tag: 'Active', tagColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
                    { title: 'Focus Time', value: displayFocus, icon: <Clock size={18} className="text-purple-500" />, tag: 'Total', tagColor: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
                    { title: 'Water Intake', value: displayWater, icon: <Droplets size={18} className="text-cyan-500" />, tag: 'Glasses', tagColor: 'text-slate-500 bg-slate-100 dark:bg-slate-800' }
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
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Today's Tasks</h2>
                        <p className="text-xs text-slate-400">{taskProgress}% completed</p>
                      </div>
                      <span className="text-xs font-bold text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-3 py-1 rounded-full">{taskProgress}%</span>
                    </div>
                    
                    <div className="space-y-5">
                      {filteredTasks.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">No tasks found matching your search!</p>
                      ) : (
                        filteredTasks.slice(0, 5).map((task, i) => {
                          const isDone = task.status === 'done';
                          return (
                          <div key={task.id || i} className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                  {isDone && <CheckCircle2 size={12} />}
                                </div>
                                <div>
                                  <h4 className={`text-sm font-semibold ${isDone ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{task.title}</h4>
                                  <div className="flex items-center gap-2 text-[10px] mt-1">
                                    <span className={`${(task.priority || '').toLowerCase() === 'high' ? 'text-red-500 bg-red-50 dark:bg-red-500/10' : (task.priority || '').toLowerCase() === 'medium' ? 'text-orange-500 bg-orange-50 dark:bg-orange-500/10' : 'text-blue-500 bg-blue-50 dark:bg-blue-500/10'} px-1.5 py-0.5 rounded uppercase font-semibold`}>{task.priority || 'Medium'}</span>
                                    <span className="text-slate-400 capitalize">{task.status || 'todo'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-slate-400"><Clock size={10} className="inline mr-1"/>{task.date || 'Today'}</div>
                            </div>
                            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full ml-8 mt-1 max-w-[90%]">
                              <div className={`h-full rounded-full ${isDone ? 'bg-emerald-500' : 'bg-violet-500'}`} style={{ width: isDone ? '100%' : '20%' }}></div>
                            </div>
                          </div>
                        )})
                      )}
                    </div>
                  </div>

                  <div className={`rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} p-6 shadow-sm flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center gap-2 mb-4 font-bold text-slate-800 dark:text-white">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"><Bot size={16} className="text-violet-600 dark:text-violet-400" /></div>
                        AI Coach
                      </div>
                      <div className="text-xs text-slate-400 mb-4 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded inline-block">Personalized for you</div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                        {userName}, you have {totalTasksCount - completedTasks} pending tasks remaining. Keep your momentum strong today! 🔥
                      </p>
                      <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 mb-6 ml-4 list-disc marker:text-violet-500">
                        <li>Focus on completing your highest priority tasks first.</li>
                        <li>Maintain your daily hydration and habit streaks.</li>
                      </ul>
                    </div>
                    <button onClick={() => navigate('/chat')} className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md shadow-violet-500/20">
                      <Sparkles size={16} /> Ask AI Coach
                    </button>
                  </div>

                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: 'Sleep', value: `${healthData.sleep || 0}h`, icon: <Moon size={18} className="text-indigo-500" />, sub: '85% quality' },
                    { title: 'Mood', value: healthData.mood || 'Great', icon: <Smile size={18} className="text-emerald-500" />, sub: 'Database Synced' },
                    { title: 'Calories', value: `${healthData.calories || 0}`, icon: <Flame size={18} className="text-red-500" />, sub: 'of 2200' },
                    { title: 'Focus Minutes', value: `${focusMinutes}m`, icon: <Book size={18} className="text-amber-500" />, sub: 'Total Logged' }
                  ].map((stat, i) => (
                    <div key={i} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <div className={`w-8 h-8 rounded-lg mb-4 flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>{stat.icon}</div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-0.5">{stat.value}</h3>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{stat.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{stat.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  <div className={`lg:col-span-2 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} p-6 shadow-sm`}>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2"><Activity size={16} className="text-violet-500"/> Weekly Productivity</h2>
                        <p className="text-xs text-slate-400">Your performance over the week</p>
                      </div>
                    </div>
                    <div className="h-40 w-full relative flex items-end justify-between px-2 pb-6 border-b border-slate-100 dark:border-slate-800">
                       <svg className="absolute bottom-6 left-0 w-full h-full preserve-3d" preserveAspectRatio="none" viewBox="0 0 100 100">
                          <path d="M0,80 Q15,40 30,60 T60,50 T100,20 L100,100 L0,100 Z" fill="rgba(139, 92, 246, 0.1)" stroke="none" />
                          <path d="M0,80 Q15,40 30,60 T60,50 T100,20" fill="none" stroke="#8B5CF6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                       </svg>
                       {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d} className="absolute bottom-0 text-[10px] text-slate-400 transform -translate-x-1/2" style={{left: `${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].indexOf(d) * 16.6}%`}}>{d}</span>)}
                    </div>
                  </div>

                  <div className={`rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} p-6 shadow-sm`}>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2"><Droplets size={16} className="text-blue-500"/> Habits Today</h2>
                    <p className="text-xs text-slate-400 mb-6">{completedHabitsCount} of {totalHabitsCount} done</p>
                    
                    <div className="space-y-4 overflow-y-auto max-h-48 custom-scrollbar">
                      {habitsData.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">No habits found. Add some from the Habits page!</p>
                      ) : (
                        habitsData.map((habit, i) => {
                          const habitColor = habit.color || 'bg-emerald-500';
                          const isDone = habit.done;
                          const progressWidth = isDone ? '100%' : (habit.progress || '30%');

                          return (
                            <div key={habit.id || i} className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${isDone ? 'bg-emerald-500' : habitColor.includes('bg-') ? habitColor : 'bg-violet-500'}`}></div>
                              <div className="flex-1">
                                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  <span>{habit.name || habit.title}</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${isDone ? 'bg-emerald-500' : habitColor.includes('bg-') ? habitColor : 'bg-violet-500'}`} 
                                    style={{ width: progressWidth }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className={`rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} p-6 shadow-sm`}>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Target size={16} className="text-blue-500"/> Goals Progress</h2>
                    <div className="space-y-5">
                      {goalsData.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No active goals found.</p>
                      ) : (
                        goalsData.slice(0, 3).map((g, i) => (
                          <div key={g.id || i}>
                            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                              <span>{g.title}</span> <span className={g.color ? g.color.replace('bg-', 'text-') : 'text-indigo-500'}>{g.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                              <div className={`h-full rounded-full ${g.color || 'bg-indigo-500'}`} style={{ width: `${g.progress}%` }}></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className={`rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} p-6 shadow-sm`}>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Calendar size={16} className="text-purple-500"/> Upcoming Events</h2>
                    <div className="space-y-4">
                      {eventsData.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No upcoming events found.</p>
                      ) : (
                        eventsData.slice(0, 4).map((ev, i) => (
                          <div key={ev.id || i} className={`pl-3 border-l-4 ${ev.color || 'border-blue-500'}`}>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{ev.title}</h4>
                            <p className="text-[10px] text-slate-400">{ev.time} · {ev.duration}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className={`rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} p-6 shadow-sm`}>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Zap size={16} className="text-orange-500"/> Quick Stats</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { name: "Reading Hours", val: "6.5h", icon: <BookOpen size={16} className="text-blue-500" /> },
                        { name: "Journal Streak", val: "15 days", icon: <FileText size={16} className="text-pink-500" /> },
                        { name: "Finance Health", val: "Good", icon: <PieChart size={16} className="text-emerald-500" /> },
                        { name: "Learning", val: "2.5h", icon: <Book size={16} className="text-amber-500" /> }
                      ].map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>{s.icon}</div>
                          <div>
                            <h4 className="text-[10px] text-slate-400">{s.name}</h4>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{s.val}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div className={`rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} p-6 shadow-sm mb-10`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2"><Clock size={16} className="text-violet-500"/> Focus Time This Week</h2>
                      <p className="text-xs text-slate-400">Hours of deep work</p>
                    </div>
                  </div>
                  <div className="h-40 flex items-end justify-between gap-2 px-2 mt-4 border-b border-slate-100 dark:border-slate-800 pb-6 relative">
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-400 pb-6">
                      <span>6</span><span>4</span><span>2</span><span>0</span>
                    </div>
                    
                    <div className="w-full flex items-end justify-around pl-6 h-full">
                      {[
                        { day: 'Mon', h: '60%' }, { day: 'Tue', h: '40%' }, { day: 'Wed', h: '80%' }, 
                        { day: 'Thu', h: '50%' }, { day: 'Fri', h: '45%' }, { day: 'Sat', h: '20%' }, { day: 'Sun', h: '35%' }
                      ].map((bar, i) => (
                        <div key={i} className="flex flex-col items-center w-full group relative">
                          <div className="w-12 md:w-16 bg-violet-500 hover:bg-violet-600 transition-colors rounded-t-md" style={{ height: bar.h }}></div>
                          <span className="absolute -bottom-5 text-[10px] text-slate-400">{bar.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
      <MobileNavbar />
    </div>
  );
}