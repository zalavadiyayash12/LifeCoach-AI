import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Bot, CheckSquare, Target, Activity, BookOpen, Calendar, 
  Clock, FileText, PieChart, Heart, User, Settings, LogOut, Search, 
  Plus, Moon, Sun, Pin, Trash2, X, Edit3
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';

export default function NotesPage() {
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

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'Ideas', color: 'yellow' });

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    const savedPhoto = localStorage.getItem(`lifeCoach_profileImage_${userId}`);
    if (savedPhoto) {
      setProfileImage(savedPhoto);
    }

    fetch(`https://lifecoach-ai-169y.onrender.com/api/user/get-data?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.message) {
          if (data.name) {
            setUserName(data.name.split(' ')[0]);
            localStorage.setItem('lifeCoach_userName', data.name.split(' ')[0]);
          }

          setNotes(Array.isArray(data.notes) ? data.notes : []);
          if (data.profile && data.profile.avatar) {
            setProfileImage(data.profile.avatar);
            localStorage.setItem(`lifeCoach_profileImage_${userId}`, data.profile.avatar);
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching notes:", err);
        setIsLoading(false);
      });
  }, [userId, navigate]);

  const updateNotesInDatabase = async (updatedNotes) => {
    setNotes(updatedNotes); // Instant UI update
    try {
      const response = await fetch('https://lifecoach-ai-169y.onrender.com/api/user/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          dataType: 'notes',
          dataValue: updatedNotes
        })
      });
      const result = await response.json();
      if (!response.ok) {
        console.error("Failed to save notes to database:", result.message);
      }
    } catch (err) {
      console.error("Error saving notes to database:", err);
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

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!newNote.title.trim() && !newNote.content.trim()) return;

    let updated;
    if (editingId) {
      updated = notes.map(n => n.id === editingId ? { ...n, ...newNote } : n);
    } else {
      const addedNote = {
        id: Date.now(),
        ...newNote,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isPinned: false
      };
      updated = [addedNote, ...notes];
    }
    
    updateNotesInDatabase(updated);
    closeModal();
  };

  const openModal = (note = null) => {
    if (note) {
      setEditingId(note.id);
      setNewNote({ title: note.title, content: note.content, category: note.category, color: note.color });
    } else {
      setEditingId(null);
      setNewNote({ title: '', content: '', category: 'Ideas', color: 'yellow' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const togglePin = (e, id) => {
    e.stopPropagation();
    const updated = notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n);
    updateNotesInDatabase(updated);
  };

  const deleteNote = (e, id) => {
    e.stopPropagation();
    const updated = notes.filter(n => n.id !== id);
    updateNotesInDatabase(updated);
  };

    const colorStyles = {
    yellow: 'bg-[#FFF9C4] dark:bg-amber-900/30 text-amber-900 dark:text-amber-100',
    blue: 'bg-[#E3F2FD] dark:bg-blue-900/30 text-blue-900 dark:text-blue-100',
    orange: 'bg-[#FFE0B2] dark:bg-orange-900/30 text-orange-900 dark:text-orange-100',
    purple: 'bg-[#EDE7F6] dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100',
    green: 'bg-[#E8F5E9] dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100',
    pink: 'bg-[#FCE4EC] dark:bg-pink-900/30 text-pink-900 dark:text-pink-100'
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = ((n.title || '') + (n.content || '')).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || n.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);
  const displayNotes = [...pinnedNotes, ...unpinnedNotes];

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'AI Coach', icon: <Bot size={18} /> },
    { name: 'Tasks', icon: <CheckSquare size={18} /> },
    { name: 'Goals', icon: <Target size={18} /> },
    { name: 'Habits', icon: <Activity size={18} /> },
    { name: 'Journal', icon: <BookOpen size={18} /> },
    { name: 'Calendar', icon: <Calendar size={18} /> },
    { name: 'Focus', icon: <Clock size={18} /> },
    { name: 'Notes', icon: <FileText size={18} />, active: true },
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
              else if (item.name === 'AI Coach') path = '/chat';
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
        <header className={`h-16 border-b ${isDarkMode ? 'border-slate-800 bg-[#161B26]' : 'border-slate-100 bg-white'} shrink-0 flex items-center justify-between px-8 shadow-sm`}>
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
              placeholder="Search notes in app..." 
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
              className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold cursor-pointer overflow-hidden border border-violet-200 shadow-sm"
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
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Notes</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Capture ideas securely synced to your database</p>
              </div>
              <button 
                onClick={() => openModal()} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-md"
              >
                <Plus size={16} /> New Note
              </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-4 mb-8 items-center justify-between">
              <div className="relative w-full xl:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..." 
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${isDarkMode ? 'border-slate-700 bg-[#161B26] text-white' : 'border-slate-200 bg-white text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm shadow-sm`} 
                />
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 custom-scrollbar">
                {['All', 'Ideas', 'Work', 'Personal', 'Travel', 'Learning'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                      activeFilter === filter 
                      ? 'bg-indigo-500 text-white shadow-md' 
                      : `border ${isDarkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50 bg-white'}`
                    }`}
                  >
                    {filter !== 'All' && <FileText size={14} />} {filter}
                  </button>
                ))}
              </div>
            </div>

            {pinnedNotes.length > 0 && activeFilter === 'All' && !searchQuery && (
              <div className="flex items-center gap-2 text-slate-400 mb-4 text-xs font-semibold uppercase tracking-wider">
                <Pin size={14} /> Pinned
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-20 text-slate-400">Loading your notes...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {displayNotes.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400">
                    No notes found. Create one to get started!
                  </div>
                ) : (
                  displayNotes.map((note) => (
                    <div 
                      key={note.id} 
                      onClick={() => openModal(note)}
                      className={`relative p-6 rounded-2xl cursor-pointer group hover:shadow-lg transition-all flex flex-col min-h-[180px] ${colorStyles[note.color]}`}
                    >
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => deleteNote(e, note.id)} className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                          <Trash2 size={16} />
                         </button>
                      </div>
                      
                      <button 
                        onClick={(e) => togglePin(e, note.id)} 
                        className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors group-hover:right-12 ${note.isPinned ? 'text-black dark:text-white' : 'opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10'}`}
                      >
                        <Pin size={16} fill={note.isPinned ? "currentColor" : "none"} />
                      </button>

                      <h3 className="text-base font-bold mb-3 pr-16 leading-tight">{note.title || 'Untitled Note'}</h3>
                      <p className="text-sm opacity-80 line-clamp-3 mb-6 leading-relaxed flex-1">
                        {note.content}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] font-bold uppercase tracking-wide bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-lg">
                          {note.category}
                        </span>
                        <span className="text-xs opacity-60 font-medium">{note.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-[#161B26] border border-slate-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 size={20} className="text-indigo-500" /> 
                {editingId ? 'Edit Note' : 'New Note'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveNote} className="flex flex-col flex-1 overflow-hidden">
              <input 
                type="text" 
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Note Title"
                className={`w-full px-4 py-3 rounded-xl border mb-4 font-bold text-lg ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                autoFocus
              />

              <textarea 
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Start typing your ideas here..."
                className={`w-full flex-1 min-h-[200px] px-4 py-3 rounded-xl border mb-6 resize-none ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-700'} focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              ></textarea>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 w-16">Category:</span>
                    <select 
                      value={newNote.category}
                      onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-white text-slate-800'}`}
                    >
                      <option value="Ideas">Ideas</option>
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Travel">Travel</option>
                      <option value="Learning">Learning</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 w-16">Color:</span>
                    <div className="flex gap-2">
                      {Object.keys(colorStyles).map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewNote({ ...newNote, color })}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${newNote.color === color ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'} ${colorStyles[color].split(' ')[0]} dark:${colorStyles[color].split(' ')[1]}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-md">
                  {editingId ? 'Save Changes' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📱 Mobile Bottom Navigation Bar */}
      <MobileNavbar />
    </div>
  );
}