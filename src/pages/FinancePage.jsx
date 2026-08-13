import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Bot, CheckSquare, Target, Activity, BookOpen, Calendar, 
  Clock, FileText, PieChart, Heart, User, Settings, LogOut, Search, 
  Plus, Moon, Sun, Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, X, Trash2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';

export default function FinancePage() {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [newTx, setNewTx] = useState({ title: '', amount: '', type: 'expense', category: 'Food' });

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

          setTransactions(data.finance || []);
          if (data.profile && data.profile.avatar) {
            setProfileImage(data.profile.avatar);
            localStorage.setItem(`lifeCoach_profileImage_${userId}`, data.profile.avatar);
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching finance data:", err);
        setIsLoading(false);
      });
  }, [userId, navigate]);

  const updateFinanceInDatabase = async (updatedTransactions) => {
    setTransactions(updatedTransactions);
    try {
      await fetch('http://localhost:5000/api/user/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          dataType: 'finance',
          dataValue: updatedTransactions
        })
      });
    } catch (err) {
      console.error("Error saving finance data to database:", err);
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

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense + 3450; 
  const savings = Math.round(totalIncome * 0.2); 

  const expenseCategories = ['Housing', 'Food', 'Transport', 'Entertainment', 'Subscriptions', 'Other'];
  const categoryColors = {
    'Housing': '#6366f1', 
    'Food': '#10b981',    
    'Transport': '#f59e0b',
    'Entertainment': '#ec4899', 
    'Subscriptions': '#8b5cf6', 
    'Other': '#64748b'    
  };

  const categoryTotals = expenseCategories.map(cat => ({
    name: cat,
    amount: transactions.filter(t => t.type === 'expense' && t.category === cat).reduce((a, c) => a + c.amount, 0),
    color: categoryColors[cat]
  })).filter(c => c.amount > 0);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!newTx.title || !newTx.amount) return;

    const addedTx = {
      id: Date.now(),
      title: newTx.title,
      amount: parseFloat(newTx.amount),
      type: newTx.type,
      category: newTx.type === 'income' ? 'Income' : newTx.category,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };

    const updated = [addedTx, ...transactions];
    updateFinanceInDatabase(updated);
    setIsModalOpen(false);
    setNewTx({ title: '', amount: '', type: 'expense', category: 'Food' });
  };

  const deleteTransaction = (id) => {
    const updated = transactions.filter(t => t.id !== id);
    updateFinanceInDatabase(updated);
  };

  const filteredTransactions = transactions.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    { name: 'Finance', icon: <PieChart size={18} />, active: true },
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
              else if (item.name === 'Notes') path = '/notes';
              else if (item.name === 'Finance') path = '/finance';
              else if (item.name === 'AI Coach') path = '/chat';
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
              placeholder="Search transactions..." 
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
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Finance</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Secure database-synced expense and income tracking</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-md"
              >
                <Plus size={16} /> Add Transaction
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-20 text-slate-400">Loading your financial data...</div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col justify-between`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                        <Wallet size={20} />
                      </div>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">+5.2%</span>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">${balance.toLocaleString()}</h3>
                      <p className="text-xs font-semibold text-slate-500">Balance</p>
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col justify-between`}>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 mb-4">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">${totalIncome.toLocaleString()}</h3>
                      <p className="text-xs font-semibold text-slate-500">Income</p>
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col justify-between`}>
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500 mb-4">
                      <TrendingDown size={20} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">${totalExpense.toLocaleString()}</h3>
                      <p className="text-xs font-semibold text-slate-500">Expenses</p>
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm flex flex-col justify-between`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-500">
                        <Wallet size={20} />
                      </div>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">+12%</span>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">${savings.toLocaleString()}</h3>
                      <p className="text-xs font-semibold text-slate-500">Savings</p>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Spending by Category</h3>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                      
                      <div className="relative w-48 h-48">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                          {totalExpense === 0 ? (
                            <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke={isDarkMode ? '#334155' : '#f1f5f9'} strokeWidth="5"></circle>
                          ) : (
                            categoryTotals.map((cat, index) => {
                              const percentage = (cat.amount / totalExpense) * 100;
                              const dashArray = `${percentage} ${100 - percentage}`;
                              
                              let dashOffset = 100; 
                              for(let i=0; i<index; i++){
                                dashOffset -= (categoryTotals[i].amount / totalExpense) * 100;
                              }

                              return (
                                <circle 
                                  key={cat.name}
                                  cx="18" cy="18" r="15.9155" 
                                  fill="transparent" 
                                  stroke={cat.color} 
                                  strokeWidth="5" 
                                  strokeDasharray={dashArray} 
                                  strokeDashoffset={dashOffset}
                                  className="transition-all duration-1000 ease-out"
                                ></circle>
                              );
                            })
                          )}
                        </svg>
                        <div className={`absolute inset-0 m-auto w-32 h-32 rounded-full ${isDarkMode ? 'bg-[#161B26]' : 'bg-white'}`}></div>
                      </div>

                      <div className="w-full sm:w-1/2 space-y-3">
                        {categoryTotals.map(cat => (
                          <div key={cat.name} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                              <span className="text-slate-600 dark:text-slate-400">{cat.name}</span>
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">${cat.amount}</span>
                          </div>
                        ))}
                        {totalExpense === 0 && <div className="text-slate-400 text-sm">No expenses yet.</div>}
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border flex flex-col ${isDarkMode ? 'bg-[#161B26] border-slate-800' : 'bg-white border-slate-100'} shadow-sm`}>
                    <h3 className="text-base font-bold text-slate-800 dark:text-white mb-6">Recent Transactions</h3>
                    
                    <div className="space-y-4 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                      {filteredTransactions.length === 0 ? (
                        <div className="text-center text-slate-400 py-10">No matching transactions recorded.</div>
                      ) : (
                        filteredTransactions.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                tx.type === 'income' 
                                ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400' 
                                : 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400'
                              }`}>
                                {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-0.5">{tx.title}</h4>
                                <p className="text-[10px] font-medium text-slate-400">{tx.date} · {tx.category}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                                {tx.type === 'income' ? '+' : '-'}${tx.amount}
                              </span>
                              
                              <button onClick={() => deleteTransaction(tx.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </>
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Add Transaction</h2>
            
            <form onSubmit={handleAddTransaction} className="space-y-4">
              
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl mb-4">
                <button 
                  type="button"
                  onClick={() => setNewTx({ ...newTx, type: 'expense' })}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${newTx.type === 'expense' ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm' : 'text-slate-500'}`}
                >
                  Expense
                </button>
                <button 
                  type="button"
                  onClick={() => setNewTx({ ...newTx, type: 'income' })}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${newTx.type === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-500'}`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={newTx.title}
                  onChange={(e) => setNewTx({ ...newTx, title: e.target.value })}
                  placeholder={newTx.type === 'income' ? 'e.g., Salary, Freelance' : 'e.g., Grocery, Rent'}
                  className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Amount ($)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={newTx.amount}
                    onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                    placeholder="0.00"
                    className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                  {newTx.type === 'expense' ? (
                    <select 
                      value={newTx.category}
                      onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm`}
                    >
                      {expenseCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  ) : (
                    <div className={`w-full px-4 py-2.5 rounded-lg border ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'} text-sm cursor-not-allowed`}>
                      Income
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all shadow-md">
                Add Transaction
              </button>
            </form>
          </div>
        </div>
      )}
      <MobileNavbar />
    </div>
  );
}