import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Bot, CheckSquare, Target, Activity, BookOpen, Calendar, 
  Clock, FileText, PieChart, Heart, User, Settings, LogOut, Search, 
  Plus, Moon, Sun, Filter, Trash2, X
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';

export default function TasksPage() {
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
  
  const userName = localStorage.getItem('lifeCoach_userName') || 'User';
  const userId = localStorage.getItem('lifeCoach_userUid'); 
  const [profileImage, setProfileImage] = useState(null);

  const [activeFilter, setActiveFilter] = useState('All'); 
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskColumn, setNewTaskColumn] = useState('todo');
  const [newTaskCategory, setNewTaskCategory] = useState('Work');

  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (userId) {
      const savedPhoto = localStorage.getItem(`lifeCoach_profileImage_${userId}`);
      if (savedPhoto) {
        setProfileImage(savedPhoto);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    fetch(`https://lifecoach-ai-169y.onrender.com/api/user/get-data?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setTasks(Array.isArray(data.tasks) ? data.tasks : []);
        if (data.profile && data.profile.avatar) {
          setProfileImage(data.profile.avatar);
          localStorage.setItem(`lifeCoach_profileImage_${userId}`, data.profile.avatar);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tasks:", err);
        setIsLoading(false);
      });
  }, [userId, navigate]);

  const updateTasksInDatabase = async (updatedTasks) => {
    setTasks(updatedTasks); // Instant UI update
    try {
      // Primary sync attempt
      let response = await fetch('https://lifecoach-ai-169y.onrender.com/api/user/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          dataType: 'tasks',
          dataValue: updatedTasks
        })
      });

      // Fallback sync attempt if primary fails
      if (!response.ok) {
        response = await fetch('https://lifecoach-ai-169y.onrender.com/api/user/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            tasks: updatedTasks
          })
        });
      }

      const result = await response.json();
      if (!response.ok) {
        console.error("Failed to save tasks to database:", result.message);
      }
    } catch (err) {
      console.error("Error saving tasks to database:", err);
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

  const moveTask = (taskId, currentStatus) => {
    const current = currentStatus.toLowerCase().replace(/\s+/g, '');
    let nextStatus = 'todo';
    if (current === 'todo') nextStatus = 'inprogress';
    else if (current === 'inprogress') nextStatus = 'review';
    else if (current === 'review') nextStatus = 'done';
    else if (current === 'done') nextStatus = 'todo';

    const updated = tasks.map(t => t.id === taskId ? { ...t, status: nextStatus, progress: nextStatus === 'done' ? 100 : t.progress } : t);
    updateTasksInDatabase(updated);
  };

  const deleteTask = (e, taskId) => {
    e.stopPropagation();
    const updated = tasks.filter(t => t.id !== taskId);
    updateTasksInDatabase(updated);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      priority: newTaskPriority,
      status: newTaskColumn,
      tags: [newTaskCategory, 'New'], 
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      progress: newTaskColumn === 'done' ? 100 : (newTaskColumn === 'inprogress' ? 10 : 0)
    };

    const updated = [...tasks, newTask];
    updateTasksInDatabase(updated);

    setIsModalOpen(false);
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskCategory('Work');
  };

  const openModalForColumn = (columnId) => {
    setNewTaskColumn(columnId);
    setIsModalOpen(true);
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'AI Coach', icon: <Bot size={18} /> },
    { name: 'Tasks', icon: <CheckSquare size={18} />, active: true },
    { name: 'Goals', icon: <Target size={18} /> },
    { name: 'Habits', icon: <Activity size={18} /> },
    { name: 'Journal', icon: <BookOpen size={18} /> },
    { name: 'Calendar', icon: <Calendar size={18} /> },
    { name: 'Focus', icon: <Clock size={18} /> },
    { name: 'Notes', icon: <FileText size={18} /> },
    { name: 'Finance', icon: <PieChart size={18} /> },
    { name: 'Health', icon: <Heart size={18} /> },
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(t => {
      const matchesStatus = (t.status || 'todo').toLowerCase().replace(/\s+/g, '') === status;
      const matchesFilter = activeFilter === 'All' || (t.tags && t.tags.includes(activeFilter));
      const matchesSearch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesFilter && matchesSearch;
    });
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-[#0F111A] text-slate-300' : 'bg-white text-slate-600'} font-sans text-sm transition-colors duration-300 relative`}>
      
      <div className={`w-64 flex flex-col justify-between border-r ${isDarkMode ? 'border-slate-800 bg-[#161B26]' : 'border-slate-100 bg-white'} z-20 shrink-0 hidden lg:flex`}>
        <div className="overflow-y-auto custom-scrollbar">
          <div className="p-6 flex items-center gap-3 text-violet-600 dark:text-violet-400 font-bold text-lg tracking-wide sticky top-0 bg-inherit z-10">
            <Bot size={24} /> LifeCoach AI
          </div>
          <div className="px-4 pb-4 space-y-1">
            {sidebarItems.map((item, i) => (
              <button key={i} onClick={() => { 
                  if(item.name === 'Tasks') navigate('/tasks'); 
                  else if(item.name === 'AI Coach') navigate('/chat'); 
                  else if(item.name === 'Habits') navigate('/habits'); 
                  else if(item.name === 'Dashboard') navigate('/dashboard');
                  else if(item.name === 'Goals') navigate('/goals');
                  else if(item.name === 'Journal') navigate('/journal');
                  else if(item.name === 'Calendar') navigate('/calendar');
                  else if(item.name === 'Focus') navigate('/focus');
                  else if(item.name === 'Notes') navigate('/notes');
                  else if(item.name === 'Finance') navigate('/finance');
                  else if(item.name === 'Health') navigate('/health');
                }} 
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${item.active ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                {item.icon} {item.name}
              </button>
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
        
        <header className={`h-16 border-b ${isDarkMode ? 'border-slate-800 bg-[#161B26]' : 'border-slate-100 bg-white'} shrink-0 flex items-center justify-between px-8`}>
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
              placeholder="Search tasks..." 
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
              className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold cursor-pointer overflow-hidden border border-violet-200 hover:ring-2 ring-violet-500 transition-all shadow-sm"
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

        <main className={`flex-1 overflow-y-auto p-8 ${isDarkMode ? 'bg-[#0F111A]' : 'bg-[#FAFAFA]'}`}>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Tasks</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your work with a modern kanban board synced to your database</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => openModalForColumn('todo')} className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-md">
                <Plus size={16} /> Add Task
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {['All', 'Work', 'Personal', 'Health', 'Learning'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeFilter === tab 
                    ? 'bg-violet-600 text-white shadow-md' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-20 text-slate-400">Loading your secure data...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-12">
              {[
                { id: 'todo', title: 'To Do', color: 'bg-slate-500' },
                { id: 'inprogress', title: 'In Progress', color: 'bg-blue-500' },
                { id: 'review', title: 'Review', color: 'bg-amber-500' },
                { id: 'done', title: 'Done', color: 'bg-emerald-500' }
              ].map(col => {
                const colTasks = getTasksByStatus(col.id);
                
                return (
                  <div key={col.id} className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${col.color}`}></span>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">{col.title}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-800 text-slate-500">
                        {colTasks.length}
                      </span>
                    </div>

                    {colTasks.length === 0 && (
                      <div className="text-center py-6 text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        No tasks found
                      </div>
                    )}

                    {colTasks.map((task) => {
                      const priority = (task.priority || 'medium').toLowerCase();
                      
                      return (
                      <div 
                        key={task.id} 
                        onClick={() => moveTask(task.id, task.status || 'todo')}
                        className={`relative p-4 rounded-xl border cursor-pointer hover:shadow-md transition-shadow group ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-200/60 shadow-sm'}`}
                        title="Click to move to next stage"
                      >
                        <button 
                          onClick={(e) => deleteTask(e, task.id)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="mb-3">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                            priority === 'high' ? 'text-red-600 bg-red-50 dark:bg-red-500/10' :
                            priority === 'medium' ? 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' :
                            'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800'
                          }`}>
                            {priority}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-4 leading-snug pr-6">
                          {task.title}
                        </h4>

                        {task.status === 'inprogress' && task.progress && (
                          <div className="mb-4">
                            <div className="flex justify-between text-[10px] font-medium text-slate-500 mb-1">
                              <span>Progress</span>
                              <span>{task.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                              <div className="h-full rounded-full bg-violet-500" style={{ width: `${task.progress}%` }}></div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-auto pt-1">
                          <div className="flex gap-1.5 flex-wrap">
                            {(task.tags || []).map((tag, idx) => (
                              <span key={idx} className="text-[10px] px-2 py-1 rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                            {task.date || 'Today'}
                          </span>
                        </div>
                      </div>
                    )})}

                    <button 
                      onClick={() => openModalForColumn(col.id)} 
                      className={`w-full py-3 mt-2 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${isDarkMode ? 'border-slate-700 text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'border-slate-300 text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                    >
                      <Plus size={14} /> Add card
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl relative ${isDarkMode ? 'bg-[#161B26] border border-slate-800' : 'bg-white'}`}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create New Task</h2>
            
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Task Title</label>
                <input 
                  type="text" 
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Run 5km, Read a book..."
                  className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm`}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Priority</label>
                  <select 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm`}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Category (Filter)</label>
                  <select 
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm`}
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                    <option value="Learning">Learning</option>
                  </select>
                </div>
              </div>

              <div>
                 <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                  <select 
                    value={newTaskColumn}
                    onChange={(e) => setNewTaskColumn(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm`}
                  >
                    <option value="todo">To Do</option>
                    <option value="inprogress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all shadow-md">
                Save Task Page
              </button>
            </form>
          </div>
        </div>
      )}

      <MobileNavbar />
    </div>
  );
}