import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Bot, CheckSquare, Target, Activity, BookOpen, Calendar, 
  Clock, FileText, PieChart, Heart, User, Settings, LogOut, Search, 
  Plus, Moon, Sun, Smile, Coffee, Meh, CloudRain, Frown, Sparkles, Book, Trash2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';

export default function JournalPage() {
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

  const [selectedMood, setSelectedMood] = useState('Happy');
  const [entryText, setEntryText] = useState('');
  const [editingId, setEditingId] = useState(null); 
  const [entries, setEntries] = useState([]);
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

          setEntries(data.journal || []);
          if (data.profile && data.profile.avatar) {
            setProfileImage(data.profile.avatar);
            localStorage.setItem(`lifeCoach_profileImage_${userId}`, data.profile.avatar);
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching journal entries:", err);
        setIsLoading(false);
      });
  }, [userId, navigate]);

  const updateJournalInDatabase = async (updatedEntries) => {
    setEntries(updatedEntries);
    try {
      await fetch('https://lifecoach-ai-169y.onrender.com/api/user/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          dataType: 'journal',
          dataValue: updatedEntries
        })
      });
    } catch (err) {
      console.error("Error saving journal to database:", err);
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

  const moods = [
    { name: 'Happy', icon: <Smile size={24} />, activeColor: 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30' },
    { name: 'Calm', icon: <Coffee size={24} />, activeColor: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30' },
    { name: 'Neutral', icon: <Meh size={24} />, activeColor: 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-500/10 dark:border-slate-500/30' },
    { name: 'Sad', icon: <CloudRain size={24} />, activeColor: 'text-indigo-500 bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30' },
    { name: 'Frustrated', icon: <Frown size={24} />, activeColor: 'text-red-500 bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30' },
    { name: 'Excited', icon: <Heart size={24} />, activeColor: 'text-pink-500 bg-pink-50 border-pink-200 dark:bg-pink-500/10 dark:border-pink-500/30' }
  ];

  const getEmoji = (moodName) => {
    switch(moodName) {
      case 'Happy': return '😊';
      case 'Calm': return '😌';
      case 'Neutral': return '😐';
      case 'Sad': return '😔';
      case 'Frustrated': return '😤';
      case 'Excited': return '🤩';
      default: return '📝';
    }
  };

  const handleNewEntry = () => {
    setEditingId(null);
    setEntryText('');
    setSelectedMood('Happy');
  };

  const handleSaveEntry = () => {
    if (!entryText.trim()) return;
    
    const words = entryText.trim().split(' ');
    const title = words.length > 3 ? words.slice(0, 4).join(' ') + '...' : 'Journal Entry';

    let updated;
    if (editingId) {
      updated = entries.map(e => 
        e.id === editingId ? { ...e, text: entryText, title, mood: selectedMood, emoji: getEmoji(selectedMood) } : e
      );
      setEditingId(null);
    } else {
      const newEntry = {
        id: Date.now(),
        mood: selectedMood,
        emoji: getEmoji(selectedMood),
        title: title,
        text: entryText,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      updated = [newEntry, ...entries];
    }
    
    updateJournalInDatabase(updated);
    setEntryText('');
  };

  const handleEditEntry = (entry) => {
    setEditingId(entry.id);
    setEntryText(entry.text);
    setSelectedMood(entry.mood);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleDeleteEntry = (e, id) => {
    e.stopPropagation(); 
    const updated = entries.filter(entry => entry.id !== id);
    updateJournalInDatabase(updated);
    if (editingId === id) handleNewEntry(); 
  };

  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    entry.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'AI Coach', icon: <Bot size={18} /> },
    { name: 'Tasks', icon: <CheckSquare size={18} /> },
    { name: 'Goals', icon: <Target size={18} /> },
    { name: 'Habits', icon: <Activity size={18} /> },
    { name: 'Journal', icon: <BookOpen size={18} />, active: true },
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
              placeholder="Search journal entries..." 
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
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Journal</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Reflect, write, and grow with database-synced entries</p>
              </div>
              <button 
                onClick={handleNewEntry} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-md"
              >
                <Plus size={16} /> New Entry
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-6">
                
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col`}>
                  
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">How are you feeling?</h3>
                    {editingId && <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded">EDITING MODE</span>}
                  </div>
                  
                  <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {moods.map((m) => (
                      <button 
                        key={m.name}
                        onClick={() => setSelectedMood(m.name)}
                        className={`flex flex-col items-center justify-center gap-2 min-w-[80px] h-20 rounded-xl border transition-all ${
                          selectedMood === m.name 
                          ? m.activeColor
                          : isDarkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {m.icon}
                        <span className="text-xs font-medium">{m.name}</span>
                      </button>
                    ))}
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-4 mb-3">Today's Reflection</h3>
                  
                  <textarea 
                    value={entryText}
                    onChange={(e) => setEntryText(e.target.value)}
                    placeholder="What's on your mind? Write freely..."
                    className={`w-full h-40 resize-none outline-none p-4 rounded-xl text-sm ${isDarkMode ? 'bg-[#0F111A] text-slate-300 placeholder-slate-600' : 'bg-slate-50 text-slate-700 placeholder-slate-400'}`}
                  ></textarea>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-slate-400">{entryText.length} characters</span>
                    <div className="flex gap-3">
                      {editingId && (
                        <button 
                          onClick={handleNewEntry}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={handleSaveEntry}
                        className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm rounded-xl transition-all shadow-md"
                      >
                        {editingId ? 'Update Entry' : 'Save Entry'}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Recent Entries</h3>
                  {isLoading ? (
                    <div className="text-center py-10 text-slate-400">Loading entries...</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEntries.length === 0 ? (
                        <p className="text-center text-slate-400 py-4 text-sm">No matching entries found.</p>
                      ) : (
                        filteredEntries.map((entry) => (
                          <div 
                            key={entry.id} 
                            onClick={() => handleEditEntry(entry)}
                            className={`group p-4 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex items-start gap-4 hover:shadow-md transition-all cursor-pointer relative`}
                          >
                            <button 
                              onClick={(e) => handleDeleteEntry(e, entry.id)}
                              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete Entry"
                            >
                              <Trash2 size={16} />
                            </button>

                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              {entry.emoji}
                            </div>
                            <div className="flex-1 min-w-0 pr-8">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{entry.title}</h4>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">{entry.date}</span>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                {entry.text}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

              </div>

              <div className="space-y-6">
                
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                  <div className="flex items-center gap-2 mb-4 text-indigo-500 font-bold text-sm">
                    <Sparkles size={18} /> AI Insights
                  </div>
                  <div className={`p-4 rounded-xl text-sm leading-relaxed ${isDarkMode ? 'bg-indigo-900/20 text-indigo-200' : 'bg-indigo-50 text-indigo-800'}`}>
                    Your mood has been trending upward. Writing about daily goals and reflections helps maintain steady focus and emotional clarity.
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                  <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-white font-bold text-sm">
                    <Book size={18} className="text-indigo-500" /> Emotion Graph
                  </div>
                  
                  <div className="h-40 w-full relative flex items-end justify-between px-2 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-400 pb-6">
                      <span>10</span><span>6</span><span>3</span><span>0</span>
                    </div>
                    
                    <svg className="absolute bottom-6 left-6 right-2 h-full w-[calc(100%-2rem)] preserve-3d" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,60 L15,70 L33,40 L50,80 L66,30 L83,45 L100,55" fill="none" stroke="#6366f1" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      <circle cx="0" cy="60" r="3" fill="#6366f1" />
                      <circle cx="15" cy="70" r="3" fill="#6366f1" />
                      <circle cx="33" cy="40" r="3" fill="#6366f1" />
                      <circle cx="50" cy="80" r="3" fill="#6366f1" />
                      <circle cx="66" cy="30" r="3" fill="#6366f1" />
                      <circle cx="83" cy="45" r="3" fill="#6366f1" />
                      <circle cx="100" cy="55" r="3" fill="#6366f1" />
                    </svg>
                    
                    <div className="absolute bottom-0 left-6 right-2 flex justify-between w-[calc(100%-2rem)]">
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => (
                        <span key={i} className="text-[10px] text-slate-400">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>

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