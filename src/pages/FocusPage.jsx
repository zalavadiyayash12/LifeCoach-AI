import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Bot, CheckSquare, Target, Activity, BookOpen, Calendar, 
  Clock, FileText, PieChart, Heart, User, Settings, LogOut, Search, 
  Moon, Sun, Play, Pause, RotateCcw, Eye, Coffee, Music, Sparkles
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';

const MODES = {
  'Pomodoro': 25 * 60,
  'Short Break': 5 * 60,
  'Long Break': 15 * 60,
  'Deep Work': 60 * 60,
};

export default function FocusPage() {
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

  const [activeMode, setActiveMode] = useState('Pomodoro');
  const [timeLeft, setTimeLeft] = useState(MODES['Pomodoro']);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);

  const [sessionsToday, setSessionsToday] = useState(0);
  const [distractions, setDistractions] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
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

    fetch(`https://lifecoach-backend-ktdn.onrender.com/api/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.message) {
          if (data.name) {
            setUserName(data.name.split(' ')[0]);
            localStorage.setItem('lifeCoach_userName', data.name.split(' ')[0]);
          }

          if (data.focusStats) {
            setTotalMinutes(data.focusStats.totalFocusTime || 0);
            setSessionsToday(data.focusStats.sessionsToday || 0);
          }
          if (data.profile && data.profile.avatar) {
            setProfileImage(data.profile.avatar);
            localStorage.setItem(`lifeCoach_profileImage_${userId}`, data.profile.avatar);
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching focus stats:", err);
        setIsLoading(false);
      });
  }, [userId, navigate]);

  const updateFocusInDatabase = async (newTotalMinutes, newSessions) => {
    try {
      await fetch('https://lifecoach-backend-ktdn.onrender.com/api/user/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          dataType: 'focusStats',
          dataValue: {
            totalFocusTime: newTotalMinutes,
            sessionsToday: newSessions
          }
        })
      });
    } catch (err) {
      console.error("Error saving focus stats to database:", err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

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

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[activeMode]);
  };

  const changeMode = (mode) => {
    setIsActive(false);
    setActiveMode(mode);
    setTimeLeft(MODES[mode]);
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    if (activeMode === 'Pomodoro' || activeMode === 'Deep Work') {
      const minutesAdded = activeMode === 'Pomodoro' ? 25 : 60;
      const updatedSessions = sessionsToday + 1;
      const updatedTotalMinutes = totalMinutes + minutesAdded;

      setSessionsToday(updatedSessions);
      setTotalMinutes(updatedTotalMinutes);
      updateFocusInDatabase(updatedTotalMinutes, updatedSessions);
      alert(`Awesome job, ${userName}! You completed a ${activeMode} session.`);
    }
    setTimeLeft(MODES[activeMode]); 
  };

  const logDistraction = () => setDistractions(prev => prev + 1);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalTimeForMode = MODES[activeMode];
  const progressPercent = ((totalTimeForMode - timeLeft) / totalTimeForMode) * 100;

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'AI Coach', icon: <Bot size={18} /> },
    { name: 'Tasks', icon: <CheckSquare size={18} /> },
    { name: 'Goals', icon: <Target size={18} /> },
    { name: 'Habits', icon: <Activity size={18} /> },
    { name: 'Journal', icon: <BookOpen size={18} /> },
    { name: 'Calendar', icon: <Calendar size={18} /> },
    { name: 'Focus', icon: <Clock size={18} />, active: true },
    { name: 'Notes', icon: <FileText size={18} /> },
    { name: 'Finance', icon: <PieChart size={18} /> },
    { name: 'Health', icon: <Heart size={18} /> },
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-[#0F111A] text-slate-300' : 'bg-[#FAFAFA] text-slate-600'} font-sans text-sm transition-colors duration-300 relative`}>
      
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
              else if (item.name === 'Calendar') path = '/calendar';
              else if (item.name === 'Focus') path = '/focus';
              else if (item.name === 'AI Coach') path = '/chat';
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
        
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} space-y-1 shrink-0`}>
          <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
             <User size={18} /> Profile
          </Link>
          <Link to="/settings" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
             <Settings size={18} /> Settings
          </Link>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        <header className={`h-16 border-b ${isDarkMode ? 'border-slate-800 bg-[#161B26]' : 'border-slate-100 bg-white'} shrink-0 z-50 flex items-center justify-between px-8 shadow-sm`}>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{getGreeting()}, {userName}</span>
            <span className="text-xs text-slate-400">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search focus modes..." 
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm`} 
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full text-xs font-semibold border border-emerald-100 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> AI Online
            </div>
            
             <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
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

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1200px] mx-auto">
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Focus Mode</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Deep work synced securely to your database</p>
            </div>

            {isLoading ? (
              <div className="text-center py-20 text-slate-400">Loading your focus data...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className={`lg:col-span-2 p-10 rounded-3xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col items-center justify-center min-h-[550px]`}>
                  
                  <div className="flex items-center gap-2 mb-10 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-full overflow-x-auto max-w-full relative z-20">
                    {Object.keys(MODES).filter(mode => mode.toLowerCase().includes(searchQuery.toLowerCase())).map((mode) => (
                      <button 
                        key={mode}
                        onClick={() => changeMode(mode)}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                          activeMode === mode 
                          ? 'bg-indigo-500 text-white shadow-md' 
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex items-center justify-center w-72 h-72 mx-auto mb-12">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 288 288">
                      <circle cx="144" cy="144" r="136" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                      <circle 
                        cx="144" cy="144" r="136" 
                        stroke="currentColor" 
                        strokeWidth="6" 
                        fill="transparent" 
                        strokeLinecap="round"
                        className="text-indigo-500 transition-all duration-1000 ease-linear"
                        strokeDasharray={2 * Math.PI * 136}
                        strokeDashoffset={(2 * Math.PI * 136) * ((100 - progressPercent) / 100)}
                      />
                    </svg>
                    
                    <div className="text-center relative z-10">
                      <h2 className="text-7xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">
                        {formatTime(timeLeft)}
                      </h2>
                      <p className="text-slate-400 font-medium">{activeMode}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 relative z-20">
                    <button onClick={resetTimer} title="Reset Timer" className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <RotateCcw size={20} />
                    </button>

                    <button onClick={toggleTimer} className="px-10 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-bold text-lg flex items-center gap-3 shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 active:scale-95">
                      {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                      {isActive ? 'Pause' : 'Start'}
                    </button>

                    <button onClick={logDistraction} title="Log a distraction" className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors">
                      <Eye size={20} />
                    </button>
                  </div>

                </div>

                <div className="space-y-6">
                  
                  {(!searchQuery || 'sessions today'.includes(searchQuery.toLowerCase())) && (
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 mb-4">
                        <Coffee size={20} />
                      </div>
                      <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{sessionsToday}</h3>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sessions Today</p>
                      <p className="text-xs text-slate-400 mt-1">{totalMinutes} minutes focused</p>
                    </div>
                  )}

                  {(!searchQuery || 'distractions'.includes(searchQuery.toLowerCase())) && (
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500 mb-4 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" onClick={logDistraction} title="Click to log distraction">
                        <Eye size={20} />
                      </div>
                      <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{distractions}</h3>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Distractions</p>
                      <p className="text-xs text-slate-400 mt-1">Tap eye icon to log</p>
                    </div>
                  )}

                  {(!searchQuery || 'playlist music'.includes(searchQuery.toLowerCase())) && (
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm flex items-center gap-2">
                        <Music size={16} className="text-indigo-500" /> Deep Focus Playlist
                      </h3>
                      
                      <iframe 
                        style={{ borderRadius: '12px' }} 
                        src={`https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4Zsnsnj?utm_source=generator&theme=${isDarkMode ? '0' : '1'}`} 
                        width="100%" 
                        height="152" 
                        frameBorder="0" 
                        allowFullScreen="" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy"
                      ></iframe>
                    </div>
                  )}

                  {(!searchQuery || 'focus stats time'.includes(searchQuery.toLowerCase())) && (
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm flex items-center gap-2">
                        <Sparkles size={16} className="text-emerald-500" /> Focus Stats
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Total Time</span>
                          <span className="font-bold text-slate-800 dark:text-white">{Math.round(totalMinutes / 60 * 10) / 10}h</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Total Minutes</span>
                          <span className="font-bold text-slate-800 dark:text-white">{totalMinutes}m</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Total Sessions</span>
                          <span className="font-bold text-slate-800 dark:text-white">{sessionsToday} sessions</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        </main>
      </div>
      <MobileNavbar />
    </div>
  );
}