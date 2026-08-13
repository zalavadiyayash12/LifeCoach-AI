import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Bot, CheckSquare, Target, Activity, BookOpen, Calendar as CalendarIcon, 
  Clock, FileText, PieChart, Heart, User, Settings as SettingsIcon, LogOut, Search, 
  Moon, Sun, Shield, Lock, CreditCard, Palette, X, AlertTriangle, Check, Bell, Globe
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';

export default function SettingsPage() {
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

  const [activeTab, setActiveTab] = useState('general');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [generalData, setGeneralData] = useState({
    name: '',
    email: '',
    timezone: 'Asia/Kolkata (IST)',
    language: 'English',
    emailAlerts: true
  });

  const [privacyData, setPrivacyData] = useState({
    profileVisibility: true,
    activitySharing: true,
    dataAnalytics: true
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

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

          setGeneralData({
            name: data.name || '',
            email: data.email || '',
            timezone: 'Asia/Kolkata (IST)',
            language: data.settings?.general?.language || 'English',
            emailAlerts: data.settings?.general?.emailAlerts ?? true,
            ...(data.settings?.general || {})
          });

          if (data.settings?.privacy) {
            setPrivacyData(data.settings.privacy);
          }
          
          if (data.settings?.notifications !== undefined) {
            setNotificationsEnabled(data.settings.notifications);
          }

          if (data.settings?.themeDark !== undefined) {
            setIsDarkMode(data.settings.themeDark);
            localStorage.setItem('lifeCoach_darkMode', data.settings.themeDark);
            if (data.settings.themeDark) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
          }

          if (data.profile && data.profile.avatar) {
            setProfileImage(data.profile.avatar);
            localStorage.setItem(`lifeCoach_profileImage_${userId}`, data.profile.avatar);
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching settings:", err);
        setIsLoading(false);
      });
  }, [userId, navigate]);

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

  const toggleTheme = async (forceTheme = null) => {
    let newTheme = forceTheme !== null ? forceTheme : !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('lifeCoach_darkMode', newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    await saveSettingsToDatabase({ themeDark: newTheme });
  };

  const saveSettingsToDatabase = async (updatedFields) => {
    try {
      const currentSettings = {
        general: generalData,
        privacy: privacyData,
        notifications: notificationsEnabled,
        themeDark: isDarkMode,
        ...updatedFields
      };

      await fetch('https://lifecoach-ai-169y.onrender.com/api/user/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          dataType: 'settings',
          dataValue: currentSettings
        })
      });
    } catch (err) {
      console.error("Error saving settings to database:", err);
    }
  };

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    const firstName = generalData.name.split(' ')[0];
    localStorage.setItem('lifeCoach_userName', firstName);
    setUserName(firstName);
    
    await saveSettingsToDatabase({ general: generalData });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handlePrivacyChange = async (key) => {
    const updatedPrivacy = { ...privacyData, [key]: !privacyData[key] };
    setPrivacyData(updatedPrivacy);
    await saveSettingsToDatabase({ privacy: updatedPrivacy });
  };

  const handleNotificationToggle = async (val) => {
    setNotificationsEnabled(val);
    await saveSettingsToDatabase({ notifications: val });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwords.new || passwords.new !== passwords.confirm) {
      alert("New passwords do not match or fields are empty!");
      return;
    }

    try {
      const response = await fetch('https://lifecoach-ai-169y.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: generalData.email,
          newPassword: passwords.new
        })
      });

      if (response.ok) {
        alert("Password updated successfully!");
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        alert("Failed to update password.");
      }
    } catch (err) {
      console.error("Password change error:", err);
      alert("Server error while updating password.");
    }
  };

  const handleFactoryReset = async () => {
    if (window.confirm("Are you sure? This will delete all your tasks, goals, habits, and profile data from the database!")) {
      try {
        await fetch('https://lifecoach-ai-169y.onrender.com/api/user/update-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId, dataType: 'tasks', dataValue: [] })
        });
        localStorage.clear();
        navigate('/');
        window.location.reload();
      } catch (err) {
        console.error("Reset error:", err);
      }
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

  const settingsTabs = [
    { id: 'general', label: 'General', icon: <User size={16} /> },
    { id: 'theme', label: 'Theme', icon: <Palette size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield size={16} /> },
    { id: 'security', label: 'Security', icon: <Lock size={16} /> },
    { id: 'account', label: 'Account', icon: <CreditCard size={16} /> },
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
              let path = '/' + item.name.toLowerCase().replace(' ', '');
              if (item.name === 'AI Coach') path = '/chat';

              return (
                <Link 
                  key={i} 
                  to={path}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all relative z-50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300`}
                >
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} space-y-1 shrink-0`}>
          <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
             <User size={18} /> Profile
          </Link>
          <Link to="/settings" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-semibold">
             <SettingsIcon size={18} /> Settings
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
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full text-xs font-semibold border border-emerald-100 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> AI Online
            </div>
            <button onClick={() => toggleTheme()} className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
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
                userName.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1200px] mx-auto">
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Settings</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Customize your database-synced experience</p>
            </div>

            {isLoading ? (
              <div className="text-center py-20 text-slate-400">Loading your settings...</div>
            ) : (
              <div className="flex flex-col md:flex-row gap-8">
                
                {/* SETTINGS SIDEBAR (INNER) */}
                <div className="w-full md:w-64 shrink-0 space-y-2">
                  {settingsTabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                        activeTab === tab.id 
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* SETTINGS CONTENT AREA */}
                <div className={`flex-1 p-8 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm min-h-[500px]`}>
                  
                  {/* 1. GENERAL TAB */}
                  {activeTab === 'general' && (
                    <div className="animate-in fade-in duration-300">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">General Settings</h2>
                      <form onSubmit={handleSaveGeneral} className="space-y-5 max-w-xl">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Display Name</label>
                          <input 
                            type="text" 
                            value={generalData.name}
                            onChange={(e) => setGeneralData({...generalData, name: e.target.value})}
                            className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Email</label>
                          <input 
                            type="email" 
                            value={generalData.email}
                            onChange={(e) => setGeneralData({...generalData, email: e.target.value})}
                            className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Language</label>
                          <select 
                            value={generalData.language || 'English'}
                            onChange={(e) => setGeneralData({...generalData, language: e.target.value})}
                            className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                          >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Gujarati">Gujarati</option>
                            <option value="Spanish">Spanish</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Weekly Email Summaries</h4>
                            <p className="text-xs text-slate-400">Receive productivity stats in your inbox</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={generalData.emailAlerts}
                            onChange={(e) => setGeneralData({...generalData, emailAlerts: e.target.checked})}
                            className="w-5 h-5 accent-indigo-500 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Timezone</label>
                          <input 
                            type="text" 
                            readOnly
                            value={generalData.timezone}
                            className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'} focus:outline-none text-sm cursor-not-allowed opacity-70`}
                          />
                        </div>
                        <button type="submit" className="mt-4 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all shadow-md flex items-center gap-2">
                          {isSaved ? <><Check size={16}/> Saved!</> : 'Save Changes'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* 2. THEME TAB */}
                  {activeTab === 'theme' && (
                    <div className="animate-in fade-in duration-300">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Theme</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                        
                        <div 
                          onClick={() => toggleTheme(false)}
                          className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${!isDarkMode ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-300 dark:border-slate-700'}`}
                        >
                          <div className="w-full h-24 rounded-lg bg-slate-50 border border-slate-200 mb-4 flex items-center justify-center">
                            <Sun className="text-slate-400" size={32} />
                          </div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-center">Light Mode</p>
                        </div>

                        <div 
                          onClick={() => toggleTheme(true)}
                          className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${isDarkMode ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-200 hover:border-indigo-300 dark:border-slate-700'}`}
                        >
                          <div className="w-full h-24 rounded-lg bg-[#0F111A] border border-slate-800 mb-4 flex items-center justify-center">
                            <Moon className="text-slate-500" size={32} />
                          </div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-center">Dark Mode</p>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* 3. NOTIFICATIONS TAB */}
                  {activeTab === 'notifications' && (
                    <div className="animate-in fade-in duration-300">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Notifications</h2>
                      <div className="space-y-6 max-w-xl">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Push Notifications</h4>
                            <p className="text-xs text-slate-500">Get reminders for habit building and task deadlines</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={notificationsEnabled} onChange={(e) => handleNotificationToggle(e.target.checked)} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-500"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. PRIVACY TAB */}
                  {activeTab === 'privacy' && (
                    <div className="animate-in fade-in duration-300">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Privacy</h2>
                      <div className="space-y-6 max-w-xl">
                        
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Profile Visibility</h4>
                            <p className="text-xs text-slate-500">Who can see your profile details</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={privacyData.profileVisibility} onChange={() => handlePrivacyChange('profileVisibility')} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-500"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Activity Sharing</h4>
                            <p className="text-xs text-slate-500">Share your streaks and progress with network</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={privacyData.activitySharing} onChange={() => handlePrivacyChange('activitySharing')} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-500"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Data Analytics</h4>
                            <p className="text-xs text-slate-500">Help improve LifeCoach AI recommendations</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={privacyData.dataAnalytics} onChange={() => handlePrivacyChange('dataAnalytics')} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-500"></div>
                          </label>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* 5. SECURITY TAB */}
                  {activeTab === 'security' && (
                    <div className="animate-in fade-in duration-300">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Security</h2>
                      <form onSubmit={handlePasswordChange} className="space-y-5 max-w-xl pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">New Password</label>
                          <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            value={passwords.new}
                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                            className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2">Confirm Password</label>
                          <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                            className={`w-full px-4 py-3 rounded-xl border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                          />
                        </div>
                        <button type="submit" className="mt-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all shadow-md">
                          Update Password
                        </button>
                      </form>

                      <div className="flex items-center justify-between pt-6 max-w-xl">
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Two-Factor Authentication</h4>
                          <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
                        </div>
                        <button type="button" onClick={() => alert("2FA Security is enabled!")} className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          Enable
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 6. ACCOUNT TAB */}
                  {activeTab === 'account' && (
                    <div className="animate-in fade-in duration-300">
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Account</h2>
                      
                      <div className="max-w-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between mb-8">
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">LifeCoach Pro Plan</h4>
                          <p className="text-xs text-slate-500">$12/month · Renews Sep 5, 2026</p>
                        </div>
                        <button className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B26] rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          Manage
                        </button>
                      </div>

                      <div className="max-w-xl p-6 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-500/5">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold mb-2">
                          <AlertTriangle size={18} /> Danger Zone
                        </div>
                        <p className="text-xs text-red-500/80 dark:text-red-400/80 mb-6 leading-relaxed">
                          Need a fresh start? This will factory reset your app data in the database. All your goals, tasks, habits, and profile data will be permanently cleared.
                        </p>
                        <button onClick={handleFactoryReset} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-md shadow-red-500/20">
                          Factory Reset / Delete Data
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* 📱 Mobile Bottom Navigation Bar */}
      <MobileNavbar />
    </div>
  );
}