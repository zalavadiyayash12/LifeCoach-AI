import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, Moon, Sun, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';
export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // LOGIN STATES
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // FORGOT PASSWORD MODAL STATES
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Dark mode toggle logic
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // MONGODB LOGIN API LOGIC WITH SAFETY CHECK
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://lifecoach-ai-169y.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const rawText = await response.text();
      
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.error("Non-JSON response received:", rawText);
        throw new Error("Backend server did not return valid JSON. Ensure server.js is running.");
      }

      if (response.ok) {
        localStorage.setItem('lifeCoach_userUid', data.userId);
        localStorage.setItem('lifeCoach_userName', data.name);

        if (data.isOnboarded) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      } else {
        setError(data.message || "Invalid credentials!");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Server error. Make sure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // DIRECT FORGOT / RESET PASSWORD API LOGIC
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setIsForgotLoading(true);

    try {
      const response = await fetch('https://lifecoach-ai-169y.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotMessage("Password updated successfully! You can now log in.");
        setTimeout(() => {
          setIsForgotOpen(false);
          setForgotEmail('');
          setNewPassword('');
          setForgotMessage('');
        }, 2000);
      } else {
        setForgotError(data.message || "Failed to reset password. Email not found?");
      }
    } catch (err) {
      console.error("Reset error:", err);
      setForgotError("Server error. Make sure backend is running.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex w-full ${isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'} transition-colors duration-500`}>
      
      {/* LEFT SIDE - Branding & Animation */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-light-primary to-blue-600 dark:from-dark-primary dark:to-dark-accent p-12 flex-col justify-between relative overflow-hidden">
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-3xl backdrop-blur-md transform rotate-12"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          className="absolute bottom-40 left-10 w-48 h-48 bg-white/5 rounded-full backdrop-blur-sm"
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white mb-16">
            <Sparkles className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">LifeCoach AI</span>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-extrabold text-white leading-tight mb-6"
          >
            Your personal AI coach, <br /> always by your side
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-blue-100 max-w-md"
          >
            Organize tasks, build habits, track goals, and get intelligent guidance — all in one beautiful place.
          </motion.p>
        </div>

        <div className="relative z-10 p-6 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl">
          <p className="text-white/90 italic">"The secret of getting ahead is getting started."</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">AI Suggestion</p>
              <p className="text-blue-200 text-xs">Ready to optimize your day.</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-24 relative">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-8 right-8 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400">Sign in to continue to LifeCoach AI</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yash@example.com" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-light-border dark:border-dark-border bg-transparent focus:outline-none focus:ring-2 focus:ring-light-primary transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-light-border dark:border-dark-border bg-transparent focus:outline-none focus:ring-2 focus:ring-light-primary transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-light-primary focus:ring-light-primary w-4 h-4" />
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                onClick={() => setIsForgotOpen(true)}
                className="text-light-primary hover:text-light-hover font-medium bg-transparent border-none cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-light-primary hover:bg-light-hover text-white font-semibold py-3 rounded-xl shadow-lg shadow-light-primary/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account? <Link to="/register" className="text-light-primary font-medium hover:underline">Sign up</Link>
          </p>
        </motion.div>

        {/* Footer */}
        <div className="absolute bottom-6 text-sm text-gray-400">
          Made with ❤️ by Yash
        </div>
      </div>

      {/* --- FORGOT PASSWORD MODAL --- */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-md rounded-2xl p-6 shadow-2xl relative ${isDarkMode ? 'bg-[#161B26] border border-slate-800 text-white' : 'bg-white text-slate-800'}`}
          >
            <button 
              onClick={() => setIsForgotOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold mb-2">Reset Password</h3>
            <p className="text-xs text-gray-400 mb-6">Enter your registered email and set a new password instantly.</p>

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle size={16} /> {forgotError}
              </div>
            )}

            {forgotMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
                <CheckCircle2 size={16} /> {forgotMessage}
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Registered Email</label>
                <input 
                  type="email" 
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="yash@example.com" 
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-light-primary`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">New Password</label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password" 
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm ${isDarkMode ? 'border-slate-700 bg-[#0F111A] text-white' : 'border-slate-200 bg-slate-50 text-slate-800'} focus:outline-none focus:ring-1 focus:ring-light-primary`}
                />
              </div>

              <button 
                type="submit" 
                disabled={isForgotLoading}
                className="w-full mt-4 py-3 bg-light-primary hover:bg-light-hover text-white font-semibold rounded-xl text-sm transition-all shadow-md disabled:opacity-70"
              >
                {isForgotLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}