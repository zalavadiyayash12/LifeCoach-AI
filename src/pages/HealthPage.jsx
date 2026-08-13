import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Bot, CheckSquare, Target, Activity, BookOpen, Calendar, 
  Clock, FileText, PieChart, Heart, User, Settings, LogOut, Search, 
  Plus, Moon, Sun, Footprints, Smile, Scale, Droplets, Dumbbell, Flame, X, Edit3
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';

export default function HealthPage() {
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

  const [healthData, setHealthData] = useState({
    steps: 8420,
    heartRate: 62,
    mood: 'Great',
    moodScore: 8,
    weight: 72,
    water: 6,
    sleep: 7.2,
    exercise: 45,
    calories: 1850
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState(null);
  const [editValue, setEditValue] = useState('');

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

          if (data.health && Object.keys(data.health).length > 0) {
            setHealthData(data.health);
          }
          if (data.profile && data.profile.avatar) {
            setProfileImage(data.profile.avatar);
            localStorage.setItem(`lifeCoach_profileImage_${userId}`, data.profile.avatar);
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching health data:", err);
        setIsLoading(false);
      });
  }, [userId, navigate]);

  const updateHealthInDatabase = async (updatedHealth) => {
    setHealthData(updatedHealth);
    try {
      await fetch('https://lifecoach-backend-ktdn.onrender.com/api/user/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          dataType: 'health',
          dataValue: updatedHealth
        })
      });
    } catch (err) {
      console.error("Error saving health to database:", err);
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

  const openEditModal = (metric, currentValue) => {
    setActiveMetric(metric);
    setEditValue(currentValue);
    setIsModalOpen(true);
  };

  const handleUpdateMetric = (e) => {
    e.preventDefault();
    let val = editValue;
    
    if (activeMetric !== 'mood') {
      val = parseFloat(val) || 0;
    }
    
    const updated = { ...healthData, [activeMetric]: val };
    updateHealthInDatabase(updated);
    setIsModalOpen(false);
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'AI Coach', icon: <Bot size={18} /> },
    { name: 'Tasks', icon: <CheckSquare size={18} /> },
    { name: 'Goals', icon: <Target size={18} /> },
    { name: 'Habits', icon: <Activity size={18} /> },
    { name: 'Journal', icon: <BookOpen size={18} /> },
    { name: 'Calendar', icon: <Calendar size={18} /> },
    { name: 'Focus', icon: <Clock size={18} /> },
    { name: 'Notes', icon: <FileText size={18} /> },
    { name: 'Finance', icon: <PieChart size={18} /> },
    { name: 'Health', icon: <Heart size={18} />, active: true },
  ];

  const CircularProgress = ({ percent, colorClass }) => (
    <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={isDarkMode ? '#334155' : '#f1f5f9'} strokeWidth="4" />
        <path 
          strokeDasharray={`${percent}, 100`} 
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
          fill="none" 
          className={`stroke-current ${colorClass}`} 
          strokeWidth="4" 
          strokeLinecap="round" 
        />
      </svg>
      <span className="absolute text-[11px] font-bold text-slate-800 dark:text-white">{Math.round(percent)}%</span>
    </div>
  );

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
              else if (item.name === 'Calendar') path = '/calendar';
              else if (item.name === 'Focus') path = '/focus';
              else if (item.name === 'Notes') path = '/notes';
              else if (item.name === 'Finance') path = '/finance';
              else if (item.name === 'Health') path = '/health';
              else if (item.name === 'AI Coach') path = '/chat';

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
              placeholder="Search health metrics..." 
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

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1200px] mx-auto">
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Health</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Your secure database-synced wellness metrics</p>
            </div>

            {isLoading ? (
              <div className="text-center py-20 text-slate-400">Loading your health data...</div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  
                  {(!searchQuery || 'steps'.includes(searchQuery.toLowerCase())) && (
                    <div onClick={() => openEditModal('steps', healthData.steps)} className={`p-6 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col justify-between`}>
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 mb-4">
                        <Footprints size={18} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{Number(healthData.steps || 0).toLocaleString()}</h3>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Steps</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-1">of 10,000</p>
                      </div>
                    </div>
                  )}

                  {(!searchQuery || 'heart rate'.includes(searchQuery.toLowerCase())) && (
                    <div onClick={() => openEditModal('heartRate', healthData.heartRate)} className={`p-6 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col justify-between`}>
                      <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500 mb-4">
                        <Heart size={18} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{healthData.heartRate} bpm</h3>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Heart Rate</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-1">Avg 78</p>
                      </div>
                    </div>
                  )}

                  {(!searchQuery || 'mood'.includes(searchQuery.toLowerCase())) && (
                    <div onClick={() => openEditModal('mood', healthData.mood)} className={`p-6 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col justify-between`}>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 mb-4">
                        <Smile size={18} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{healthData.mood}</h3>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Mood</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-1">{healthData.moodScore}/10</p>
                      </div>
                    </div>
                  )}

                  {(!searchQuery || 'weight'.includes(searchQuery.toLowerCase())) && (
                    <div onClick={() => openEditModal('weight', healthData.weight)} className={`p-6 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col justify-between relative`}>
                      <span className="absolute top-6 right-6 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md">-0.5%</span>
                      <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-500 mb-4">
                        <Scale size={18} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{healthData.weight} kg</h3>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Weight</p>
                      </div>
                    </div>
                  )}

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  
                  {(!searchQuery || 'water'.includes(searchQuery.toLowerCase())) && (
                    <div onClick={() => openEditModal('water', healthData.water)} className={`p-5 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex items-center gap-4`}>
                      <CircularProgress percent={Math.min((healthData.water / 8) * 100, 100)} colorClass="text-blue-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1 text-sm font-bold text-slate-800 dark:text-white">
                          <Droplets size={16} className="text-blue-500" /> Water Intake
                        </div>
                        <div className="text-lg font-bold text-slate-800 dark:text-white mb-3">
                          {healthData.water}<span className="text-xs text-slate-400 font-medium">/8 glasses</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                          <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.min((healthData.water / 8) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {(!searchQuery || 'sleep'.includes(searchQuery.toLowerCase())) && (
                    <div onClick={() => openEditModal('sleep', healthData.sleep)} className={`p-5 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex items-center gap-4`}>
                      <CircularProgress percent={Math.min((healthData.sleep / 8) * 100, 100)} colorClass="text-purple-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1 text-sm font-bold text-slate-800 dark:text-white">
                          <Moon size={16} className="text-purple-500" /> Sleep
                        </div>
                        <div className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                          {healthData.sleep}<span className="text-xs text-slate-400 font-medium">/8 hours</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-2">85% quality</p>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                          <div className="h-full rounded-full bg-purple-500 transition-all duration-500" style={{ width: `${Math.min((healthData.sleep / 8) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {(!searchQuery || 'exercise'.includes(searchQuery.toLowerCase())) && (
                    <div onClick={() => openEditModal('exercise', healthData.exercise)} className={`p-5 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex items-center gap-4`}>
                      <CircularProgress percent={Math.min((healthData.exercise / 60) * 100, 100)} colorClass="text-red-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1 text-sm font-bold text-slate-800 dark:text-white">
                          <Dumbbell size={16} className="text-red-500" /> Exercise
                        </div>
                        <div className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                          {healthData.exercise}<span className="text-xs text-slate-400 font-medium">/60 min</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-2">320 cal burned</p>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                          <div className="h-full rounded-full bg-red-500 transition-all duration-500" style={{ width: `${Math.min((healthData.exercise / 60) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {(!searchQuery || 'calories'.includes(searchQuery.toLowerCase())) && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div onClick={() => openEditModal('calories', healthData.calories)} className={`p-5 rounded-2xl border cursor-pointer hover:shadow-md transition-all ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex items-center gap-4`}>
                      <CircularProgress percent={Math.min((healthData.calories / 2200) * 100, 100)} colorClass="text-orange-500" />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1 text-sm font-bold text-slate-800 dark:text-white">
                          <Flame size={16} className="text-orange-500" /> Calories
                        </div>
                        <div className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                          {healthData.calories}<span className="text-xs text-slate-400 font-medium">/2200 kcal</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-2">450 burned</p>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                          <div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{ width: `${Math.min((healthData.calories / 2200) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl relative flex flex-col ${isDarkMode ? 'bg-[#161B26] border border-slate-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 capitalize">
                <Edit3 size={20} className="text-indigo-500" /> 
                Update {activeMetric}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateMetric} className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-2 capitalize">New {activeMetric} Value</label>
              
              {activeMetric === 'mood' ? (
                <select 
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border mb-6 font-semibold ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                >
                  <option value="Amazing">Amazing</option>
                  <option value="Great">Great</option>
                  <option value="Good">Good</option>
                  <option value="Okay">Okay</option>
                  <option value="Bad">Bad</option>
                </select>
              ) : (
                <input 
                  type="number" 
                  step="any"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={`Enter current ${activeMetric}`}
                  className={`w-full px-4 py-3 rounded-xl border mb-6 font-semibold text-lg ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                  autoFocus
                />
              )}

              <button type="submit" className="w-full px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-md">
                Save Progress
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