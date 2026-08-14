import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Bot, CheckSquare, Target, Activity, BookOpen, Calendar as CalendarIcon, 
  Clock, FileText, PieChart, Heart, User, Settings, LogOut, Search, 
  Moon, Sun, Edit3, MapPin, CalendarDays, Mail, Camera, X, Trophy, HeartPulse
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';

export default function ProfilePage() {
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
  const [isLoading, setIsLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    name: '',
    role: 'Member',
    location: 'Ahmedabad, Gujarat',
    joined: 'August 2026',
    email: '',
    bio: 'Building productivity and achieving personal goals.',
    skills: ['React', 'Productivity', 'Goal Setting']
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  const [goals, setGoals] = useState([]);
  const [taskProgress, setTaskProgress] = useState(0);
  const [streak, setStreak] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(profileData);

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    const savedUserPhoto = localStorage.getItem(`lifeCoach_profileImage_${userId}`);
    if (savedUserPhoto) {
      setProfileImage(savedUserPhoto);
    }

    // Fixed Endpoint matching Goals and Dashboard
    fetch(`https://lifecoach-ai-169y.onrender.com/api/user/data/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.message) {
          if (data.name) {
            setUserName(data.name.split(' ')[0]);
            localStorage.setItem('lifeCoach_userName', data.name.split(' ')[0]);
          }

          if (data.profile && Object.keys(data.profile).length > 0) {
            const mergedProfile = {
              name: data.name || data.profile.name || '',
              role: data.profile.role || 'Member',
              location: data.profile.location || 'Ahmedabad, Gujarat',
              joined: data.profile.joined || 'August 2026',
              email: data.email || data.profile.email || '',
              bio: data.profile.bio || 'Building productivity and achieving personal goals.',
              skills: data.profile.skills || ['React', 'Productivity']
            };
            setProfileData(mergedProfile);
            setEditForm(mergedProfile);

            if (data.profile.avatar) {
              setProfileImage(data.profile.avatar);
              localStorage.setItem(`lifeCoach_profileImage_${userId}`, data.profile.avatar);
            }
          } else {
            const defaultProfile = {
              name: data.name || '',
              role: 'Member',
              location: 'Ahmedabad, Gujarat',
              joined: 'August 2026',
              email: data.email || '',
              bio: 'Building productivity and achieving personal goals.',
              skills: ['React', 'Productivity']
            };
            setProfileData(defaultProfile);
            setEditForm(defaultProfile);
          }

          if (data.goals) setGoals(data.goals);

          if (data.tasks && data.tasks.length > 0) {
            const doneTasks = data.tasks.filter(t => t.status === 'done').length;
            const totalTasks = data.tasks.length;
            setTaskProgress(Math.round((doneTasks / totalTasks) * 100));
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching profile data:", err);
        setIsLoading(false);
      });
  }, [userId, navigate]);

  const saveProfileToDatabase = async (updatedProfile) => {
    try {
      await fetch('https://lifecoach-ai-169y.onrender.com/api/user/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          dataType: 'profile',
          dataValue: updatedProfile
        })
      });
    } catch (err) {
      console.error("Error saving profile:", err);
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileData(editForm);
    localStorage.setItem('lifeCoach_userName', editForm.name.split(' ')[0]);
    setUserName(editForm.name.split(' ')[0]);
    
    if (profileImage) {
      localStorage.setItem(`lifeCoach_profileImage_${userId}`, profileImage);
    }
    
    const updated = {
      ...editForm,
      avatar: profileImage
    };
    
    await saveProfileToDatabase(updated);
    setIsModalOpen(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setProfileImage(base64String);
        localStorage.setItem(`lifeCoach_profileImage_${userId}`, base64String);
        
        const updated = { ...profileData, avatar: base64String };
        setProfileData(updated);
        await saveProfileToDatabase(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'AI Coach', icon: <Bot size={18} /> },
    { name: 'Tasks', icon: <CheckSquare size={18} /> },
    { name: 'Goals', icon: <Target size={18} /> },
    { name: 'Habits', icon: <Activity size={18} /> },
    { name: 'Journal', icon: <BookOpen size={18} /> },
    { name: 'Calendar', icon: <CalendarIcon size={18} /> },
    { name: 'Focus', icon: <Clock size={18} /> },
    { name: 'Notes', icon: <FileText size={18} /> },
    { name: 'Finance', icon: <PieChart size={18} /> },
    { name: 'Health', icon: <Heart size={18} /> },
  ];

  const firstName = userName || 'User';

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
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all relative z-50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300`}
                >
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} space-y-1 shrink-0`}>
          <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-semibold">
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
            <span className="font-semibold text-slate-800 dark:text-slate-200">{getGreeting()}, {firstName}</span>
            <span className="text-xs text-slate-400">{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search profile details..." 
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
              className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold cursor-pointer hover:ring-2 ring-violet-500 transition-all overflow-hidden shadow-sm"
              title="View Profile"
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                firstName.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT with pb-24 for mobile navbar */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-24">
          <div className="max-w-[1200px] mx-auto">
            
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Profile</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Your secure database-synced space</p>
            </div>

            {isLoading ? (
              <div className="text-center py-20 text-slate-400">Loading your profile...</div>
            ) : (
              <>
                <div className={`rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm overflow-hidden mb-6`}>
                  <div className="h-40 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-400 relative"></div>
                  
                  <div className="px-8 pb-8 relative flex flex-col md:flex-row gap-6 md:justify-between items-start md:items-end -mt-12 md:-mt-16">
                    
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                      
                      <div 
                        className="relative group cursor-pointer" 
                        onClick={() => fileInputRef.current.click()} 
                      >
                        <div className={`w-32 h-32 rounded-full border-4 ${isDarkMode ? 'border-[#161B26] bg-slate-800' : 'border-white bg-slate-100'} flex items-center justify-center overflow-hidden`}>
                          {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-5xl font-bold text-violet-500">{firstName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <button className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center transition-colors shadow-md group-hover:bg-indigo-600 group-hover:scale-110">
                          <Camera size={14} />
                        </button>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          ref={fileInputRef} 
                          onChange={handleImageUpload} 
                        />
                      </div>

                      <div className="mb-2">
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{profileData.name || firstName}</h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 uppercase tracking-wider border border-indigo-100 dark:border-indigo-500/30">Pro</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3">{profileData.role}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5"><MapPin size={14} /> {profileData.location}</span>
                          <span className="flex items-center gap-1.5"><CalendarDays size={14} /> Joined {profileData.joined}</span>
                          <span className="flex items-center gap-1.5"><Mail size={14} /> {profileData.email}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border transition-colors ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'} mb-2`}
                    >
                      <Edit3 size={16} /> Edit Profile
                    </button>

                  </div>
                  
                  <div className={`px-8 pb-8 pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} mt-2`}>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                      {profileData.bio}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col items-center justify-center`}>
                    <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{taskProgress}%</h3>
                    <p className="text-xs font-semibold text-slate-500">Productivity</p>
                  </div>
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col items-center justify-center`}>
                    <h3 className="text-3xl font-bold text-orange-500 mb-1">{streak}</h3>
                    <p className="text-xs font-semibold text-slate-500">Day Streak</p>
                  </div>
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col items-center justify-center`}>
                    <h3 className="text-3xl font-bold text-emerald-500 mb-1">{goals.filter(g => g.progress < 100).length}</h3>
                    <p className="text-xs font-semibold text-slate-500">Goals Active</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  <div className={`lg:col-span-2 p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Achievements</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { title: 'Early Bird', desc: 'Wake up before 6 AM for 7 days', icon: <Sun size={20} className="text-indigo-500"/>, bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
                        { title: 'Focus Master', desc: 'Complete 50 focus sessions', icon: <Target size={20} className="text-blue-500"/>, bg: 'bg-blue-50 dark:bg-blue-500/10' },
                        { title: 'Habit Builder', desc: 'Maintain a 30-day streak', icon: <Activity size={20} className="text-orange-500"/>, bg: 'bg-orange-50 dark:bg-orange-500/10' },
                        { title: 'Goal Crusher', desc: 'Complete 5 major goals', icon: <Trophy size={20} className="text-emerald-500"/>, bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                        { title: 'Journal Keeper', desc: 'Write 100 journal entries', icon: <BookOpen size={20} className="text-slate-500"/>, bg: 'bg-slate-100 dark:bg-slate-800', inactive: true },
                        { title: 'Wellness Warrior', desc: 'Hit all health targets for a week', icon: <HeartPulse size={20} className="text-purple-500"/>, bg: 'bg-purple-50 dark:bg-purple-500/10' }
                      ].filter(badge => badge.title.toLowerCase().includes(searchQuery.toLowerCase()) || badge.desc.toLowerCase().includes(searchQuery.toLowerCase())).map((badge, i) => (
                        <div key={i} className={`p-4 rounded-xl border ${isDarkMode ? 'border-slate-800/50' : 'border-slate-100'} flex items-start gap-4 ${badge.inactive ? 'opacity-50 grayscale' : 'hover:shadow-sm transition-all'}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${badge.bg}`}>
                            {badge.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">{badge.title}</h4>
                            <p className="text-xs text-slate-400 leading-snug">{badge.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {(profileData.skills || []).filter(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())).map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Active Goals</h3>
                      <div className="space-y-5">
                        {goals.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4">No active goals found.</p>
                        ) : (
                          goals.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4).map((g, i) => {
                            const barColor = g.color || ['bg-indigo-500', 'bg-orange-500', 'bg-emerald-500', 'bg-purple-500'][i%4];
                            return (
                              <div key={i}>
                                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                  <span>{g.title}</span> <span className="text-slate-500">{g.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${g.progress}%` }}></div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl relative flex flex-col ${isDarkMode ? 'bg-[#161B26] border border-slate-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Role / Tagline</label>
                  <input 
                    type="text" 
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Location</label>
                  <input 
                    type="text" 
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Bio</label>
                <textarea 
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows="3"
                  className={`w-full px-4 py-2.5 rounded-lg border resize-none ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                ></textarea>
              </div>

              <button type="submit" className="w-full mt-4 px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-md">
                Save Changes
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