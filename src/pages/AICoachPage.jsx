import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Bot, CheckSquare, Target, Activity, BookOpen, Calendar, 
  Clock, FileText, PieChart, Heart, User, Settings, LogOut, Search, 
  Moon, Sun, Send, Plus, ArrowLeft, Sparkles, BrainCircuit
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AICoachPage() {
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
  
  // LIVE NAME & PHOTO & USER ID FETCH (User Specific)
  const userId = localStorage.getItem('lifeCoach_userUid');
  const [userName, setUserName] = useState(() => localStorage.getItem('lifeCoach_userName') || 'User');
  const [profileImage, setProfileImage] = useState(null);

  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // --- CHAT STATE & MEMORY ---
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(`lifeCoach_chat_${userName}`);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        sender: 'ai',
        text: `Hello ${userName.toUpperCase()}! I am your AI Life Coach. What goals are we crushing today?`
      }
    ];
  });

  // FETCH PROFILE DATA FROM DATABASE TO SYNC USER-SPECIFIC PHOTO
  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    // User-specific photo load
    const savedPhoto = localStorage.getItem(`lifeCoach_profileImage_${userId}`);
    if (savedPhoto) {
      setProfileImage(savedPhoto);
    }

    fetch(`http://localhost:5000/api/user/data/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.message) {
          if (data.name) {
            const firstN = data.name.split(' ')[0];
            setUserName(firstN);
            localStorage.setItem('lifeCoach_userName', firstN);
          }
          if (data.profile && data.profile.avatar) {
            setProfileImage(data.profile.avatar);
            localStorage.setItem(`lifeCoach_profileImage_${userId}`, data.profile.avatar);
          }
        }
      })
      .catch(err => console.error("Error fetching AI coach user data:", err));
  }, [userId, navigate]);

  // Save Chats to Local Storage
  useEffect(() => {
    localStorage.setItem(`lifeCoach_chat_${userName}`, JSON.stringify(messages));
    scrollToBottom();
  }, [messages, userName]);

  // Sync Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };
  const displayDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // 🔴 FIXED BACKEND API SEND MESSAGE FUNCTION 🔴
  const handleSendMessage = async (eOrText) => {
    let textToSend = inputText;
    
    if (typeof eOrText === 'string') {
      textToSend = eOrText; // Came from quick prompt button
    } else if (eOrText && eOrText.preventDefault) {
      eOrText.preventDefault(); // Came from Enter key / Send button
    }

    if (!textToSend.trim()) return;

    // 1. Add User Message to UI
    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (typeof eOrText !== 'string') setInputText('');
    setIsTyping(true);

    try {
      // Send request to Node.js Backend API
      const response = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, prompt: userMsg.text })
      });

      const data = await response.json();

      let aiResponseText = "I couldn't generate a response right now.";
      if (response.ok) {
        aiResponseText = data.reply;
      } else {
        aiResponseText = data.message || "Server error occurred.";
      }

      // 3. Add AI Response to UI
      const aiMsg = { id: Date.now() + 1, sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMsg = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: "Oops, I'm having trouble connecting to my servers right now. Please check if your backend server is running on port 5000!" 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    "What should I focus on today?",
    "Give me motivation to finish my tasks",
    "How are my goals progressing?"
  ];

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'AI Coach', icon: <Bot size={18} />, active: true },
    { name: 'Tasks', icon: <CheckSquare size={18} /> },
    { name: 'Goals', icon: <Target size={18} /> },
    { name: 'Habits', icon: <Activity size={18} /> },
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
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all relative z-50 ${item.active ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* BOTTOM SIDEBAR LINKS */}
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
        
        {/* MAIN GLOBAL HEADER */}
        <header className={`h-16 border-b ${isDarkMode ? 'border-slate-800 bg-[#161B26]' : 'border-slate-100 bg-white'} shrink-0 z-50 flex items-center justify-between px-8 shadow-sm`}>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{getGreeting()}, {userName}</span>
            <span className="text-xs text-slate-400">{displayDate}</span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="relative">
              <button 
                onClick={() => setShowQuickAdd(!showQuickAdd)} 
                onBlur={() => setTimeout(() => setShowQuickAdd(false), 200)}
                className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Plus size={18} />
              </button>
              {showQuickAdd && (
                <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-200'} z-50 overflow-hidden`}>
                  <div className="p-2 space-y-1">
                    <button onClick={() => navigate('/tasks')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-slate-700 dark:text-slate-300`}>
                      <CheckSquare size={14} className="text-blue-500" /> New Task
                    </button>
                    <button onClick={() => navigate('/notes')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-slate-700 dark:text-slate-300`}>
                      <FileText size={14} className="text-amber-500" /> New Note
                    </button>
                    <button onClick={() => navigate('/goals')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-slate-700 dark:text-slate-300`}>
                      <Target size={14} className="text-emerald-500" /> New Goal
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div 
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold shadow-sm border border-violet-200 cursor-pointer hover:ring-2 ring-violet-500 transition-all overflow-hidden"
            >
              {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* CHAT AREA WITH CUSTOM DESIGN */}
        <main className={`flex-1 flex flex-col h-full overflow-hidden ${isDarkMode ? 'bg-[#0F111A]' : 'bg-[#F9FAFB]'}`}>
          
          {/* Chat Specific Top Bar */}
          <div className={`flex items-center px-6 py-4 border-b ${isDarkMode ? 'border-slate-800 bg-[#161B26]' : 'border-slate-200 bg-white'} shrink-0`}>
            <button onClick={() => navigate('/dashboard')} className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <ArrowLeft size={20} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-4">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">AI Coach</h2>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Online (Powered by Gemini AI)
              </div>
            </div>
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar space-y-6">
            <div className="max-w-[800px] mx-auto space-y-6">
              
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                      msg.sender === 'user' 
                      ? 'bg-purple-100 text-purple-600 border border-purple-200' 
                      : 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
                    }`}>
                      {msg.sender === 'user' ? (
                        profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : userName.charAt(0).toUpperCase()
                      ) : (
                        <Bot size={20} />
                      )}
                    </div>

                    {/* Bubble */}
                    <div className={`p-4 text-[15px] leading-relaxed shadow-sm ${
                      msg.sender === 'user' 
                      ? 'bg-[#8B5CF6] text-white rounded-2xl rounded-tr-sm' 
                      : isDarkMode ? 'bg-[#161B26] border border-slate-700 text-slate-200 rounded-2xl rounded-tl-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'
                    }`}>
                      {/* Bold Text Parser for AI */}
                      {msg.sender === 'ai' ? (
                        <span dangerouslySetInnerHTML={{__html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>')}} />
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Animation */}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex gap-4 max-w-[85%] flex-row">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                      <Sparkles size={20} className="animate-spin" />
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm rounded-tl-sm flex items-center gap-1.5 ${isDarkMode ? 'bg-[#161B26] border border-slate-700' : 'bg-white border border-slate-200'}`}>
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '0.2s'}}></span>
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '0.4s'}}></span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area & Quick Prompts */}
          <div className={`p-4 md:px-8 md:py-6 shrink-0 border-t ${isDarkMode ? 'border-slate-800 bg-[#161B26]' : 'border-slate-200 bg-white'}`}>
            <div className="max-w-[1000px] mx-auto">
              
              <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-3 mb-2">
                {quickPrompts.map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isTyping}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-colors border flex items-center gap-2 ${
                      isDarkMode 
                      ? 'border-slate-700 text-[#8B5CF6] hover:bg-slate-800 bg-[#0F111A]' 
                      : 'border-purple-200 text-[#8B5CF6] hover:bg-purple-50 bg-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Sparkles size={12} /> {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask for advice, schedule optimization, or motivation..."
                  className={`flex-1 px-6 py-4 rounded-full border transition-colors outline-none text-[15px] ${
                    isDarkMode 
                    ? 'bg-[#0F111A] border-slate-700 focus:border-[#8B5CF6] text-white' 
                    : 'bg-slate-50 border-slate-300 focus:border-[#8B5CF6] text-slate-800'
                  }`}
                  disabled={isTyping}
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="w-14 h-14 rounded-full bg-[#8B5CF6] hover:bg-purple-600 disabled:bg-slate-300 disabled:text-slate-500 text-white flex items-center justify-center transition-all shrink-0 shadow-md"
                >
                  <Send size={22} className={inputText.trim() ? "translate-x-0.5" : ""} />
                </button>
              </form>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}