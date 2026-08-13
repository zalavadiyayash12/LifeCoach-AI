import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Bot, CheckSquare, Target, Activity, BookOpen, Calendar as CalendarIcon, 
  Clock, FileText, PieChart, Heart, User, Settings, LogOut, Search, 
  Plus, Moon, Sun, ChevronLeft, ChevronRight, Trash2, X
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';

export default function CalendarPage() {
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

  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [newEvent, setNewEvent] = useState({ title: '', time: '10:00', duration: '1 hour', category: 'Meeting', date: formatDateString(selectedDate) });

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    const savedPhoto = localStorage.getItem(`lifeCoach_profileImage_${userId}`);
    if (savedPhoto) {
      setProfileImage(savedPhoto);
    }

    fetch(`http://localhost:5000/api/user/data/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.message) {
          if (data.name) {
            setUserName(data.name.split(' ')[0]);
            localStorage.setItem('lifeCoach_userName', data.name.split(' ')[0]);
          }

          setEvents(data.calendarEvents || []);
          if (data.profile && data.profile.avatar) {
            setProfileImage(data.profile.avatar);
            localStorage.setItem(`lifeCoach_profileImage_${userId}`, data.profile.avatar);
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching calendar events:", err);
        setIsLoading(false);
      });
  }, [userId, navigate]);

  const updateEventsInDatabase = async (updatedEvents) => {
    setEvents(updatedEvents);
    try {
      await fetch('http://localhost:5000/api/user/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          dataType: 'calendarEvents',
          dataValue: updatedEvents
        })
      });
    } catch (err) {
      console.error("Error saving calendar events to database:", err);
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
  const greeting = getGreeting();
  const displayDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const handleDayClick = (day) => {
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    setNewEvent(prev => ({ ...prev, date: formatDateString(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)) }));
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    const categoryColors = {
      'Meeting': 'border-blue-500',
      'Personal': 'border-emerald-500',
      'Focus': 'border-orange-500',
      'Health': 'border-red-500',
      'Other': 'border-purple-500'
    };

    const addedEvent = {
      id: Date.now(),
      title: newEvent.title,
      time: newEvent.time,
      duration: newEvent.duration,
      category: newEvent.category,
      color: categoryColors[newEvent.category] || 'border-violet-500',
      date: newEvent.date
    };

    const updated = [...events, addedEvent].sort((a, b) => a.time.localeCompare(b.time));
    updateEventsInDatabase(updated);
    setIsModalOpen(false);
    setNewEvent({ ...newEvent, title: '' });
  };

  const deleteEvent = (id) => {
    const updated = events.filter(ev => ev.id !== id);
    updateEventsInDatabase(updated);
  };

  const selectedDateStr = formatDateString(selectedDate);
  const selectedDayEvents = events.filter(ev => {
    const matchesDate = ev.date === selectedDateStr;
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || ev.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const daysWithEvents = [...new Set(events.map(ev => ev.date))]; 

  const formatTimeAMPM = (timeStr) => {
    let [h, m] = timeStr.split(':');
    let ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'AI Coach', icon: <Bot size={18} /> },
    { name: 'Tasks', icon: <CheckSquare size={18} /> },
    { name: 'Goals', icon: <Target size={18} /> },
    { name: 'Habits', icon: <Activity size={18} /> },
    { name: 'Journal', icon: <BookOpen size={18} /> },
    { name: 'Calendar', icon: <CalendarIcon size={18} />, active: true },
    { name: 'Focus', icon: <Clock size={18} /> },
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
              else if (item.name === 'AI Coach') path = '/chat';
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
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} space-y-1 shrink-0`}>
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
              placeholder="Search calendar events..." 
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

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1200px] mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Calendar</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Secure database-synced schedule planning</p>
              </div>
              <button 
                onClick={() => {
                  setNewEvent(prev => ({ ...prev, date: formatDateString(selectedDate) })); 
                  setIsModalOpen(true);
                }} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-md"
              >
                <Plus size={16} /> Add Event
              </button>
            </div>

            <div className="flex items-center gap-1 mb-6 bg-slate-100 dark:bg-slate-800/50 w-max p-1 rounded-lg">
              <button className="px-4 py-1.5 rounded-md text-sm font-semibold bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm">Month</button>
              <button className="px-4 py-1.5 rounded-md text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Agenda</button>
            </div>

            {isLoading ? (
              <div className="text-center py-20 text-slate-400">Loading your calendar events...</div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                <div className={`xl:col-span-2 p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
                      <p className="text-xs text-slate-400 mt-1">{daysWithEvents.filter(d => d.startsWith(`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`)).length} days with events</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={prevMonth} className={`p-2 rounded-lg border ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                        <ChevronLeft size={16} />
                      </button>
                      <button onClick={goToToday} className={`px-4 py-1.5 text-sm font-semibold rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition-colors`}>
                        Today
                      </button>
                      <button onClick={nextMonth} className={`p-2 rounded-lg border ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 mb-4">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-[10px] font-bold text-slate-400 tracking-wider">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-16"></div>
                    ))}
                    
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = formatDateString(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
                      const isSelected = selectedDateStr === dateStr;
                      const hasEvents = daysWithEvents.includes(dateStr);
                      const eventCount = events.filter(e => e.date === dateStr).length;

                      return (
                        <div key={day} onClick={() => handleDayClick(day)} className="h-16 flex flex-col items-center justify-start cursor-pointer group">
                          <div className={`w-12 h-12 flex flex-col items-center justify-center rounded-2xl transition-all ${
                            isSelected 
                              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 font-bold transform scale-105' 
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                          }`}>
                            <span className="text-sm">{day}</span>
                            
                            {hasEvents && (
                              <div className="flex gap-0.5 mt-1">
                                {Array.from({ length: Math.min(eventCount, 3) }).map((_, dotIdx) => (
                                  <span key={dotIdx} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}></span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col h-full min-h-[500px]`}>
                  <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">Schedule</h3>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </h2>

                  <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                    {selectedDayEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 opacity-60">
                        <CalendarIcon size={48} strokeWidth={1} />
                        <p className="text-sm">No matching events scheduled</p>
                      </div>
                    ) : (
                      selectedDayEvents.map((ev) => (
                        <div key={ev.id} className={`relative p-4 rounded-xl border ${isDarkMode ? 'bg-[#0F111A] border-slate-800' : 'bg-slate-50 border-slate-100'} pl-5 group hover:shadow-sm transition-all`}>
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${ev.color.replace('border-', 'bg-')}`}></div>
                          
                          <button onClick={() => deleteEvent(ev.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={16} />
                          </button>

                          <div className="flex justify-between items-start pr-6">
                            <div>
                              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">{ev.title}</h4>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <Clock size={12} />
                                {formatTimeAMPM(ev.time)} · {ev.duration}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400">{ev.category}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Add New Event</h2>
            
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Event Title</label>
                <input 
                  type="text" 
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g., Doctor Appointment"
                  className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                <input 
                  type="date" 
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Time</label>
                  <input 
                    type="time" 
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Duration</label>
                  <select 
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                  >
                    <option value="15 min">15 min</option>
                    <option value="30 min">30 min</option>
                    <option value="1 hour">1 hour</option>
                    <option value="2 hours">2 hours</option>
                    <option value="All day">All day</option>
                  </select>
                </div>
              </div>

              <div>
                 <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                  <select 
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                  >
                    <option value="Meeting">Meeting (Blue)</option>
                    <option value="Personal">Personal (Green)</option>
                    <option value="Focus">Focus (Orange)</option>
                    <option value="Health">Health (Red)</option>
                    <option value="Other">Other (Purple)</option>
                  </select>
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all shadow-md">
                Add to Schedule
              </button>
            </form>
          </div>
        </div>
      )}
      <MobileNavbar />
    </div>
  );
}