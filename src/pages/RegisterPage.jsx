import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Sparkles, Moon, Sun, CheckCircle2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MobileNavbar from '../components/MobileNavbar';
export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // FORM STATES
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // TERMS MODAL STATE
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Dark mode logic
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Simple Password Strength Checker
  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 10) return 2;
    return 3;
  };
  const strength = getPasswordStrength();

  // MONGODB API REGISTER LOGIC
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all the fields!");
      return;
    }

    if (!acceptedTerms) {
      alert("Please accept the Terms of Service to continue.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://lifecoach-ai-169y.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('lifeCoach_userUid', data.userId);
        localStorage.setItem('lifeCoach_userName', name);
        alert("Account created successfully! Please login.");
        navigate('/');
      } else {
        alert(data.message || "Registration failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server se connect nahi ho paaya. Please check your backend deployment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex w-full ${isDarkMode ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'} transition-colors duration-500`}>
      
      {/* LEFT SIDE - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-light-primary to-blue-600 dark:from-dark-primary dark:to-dark-accent p-12 flex-col justify-between relative overflow-hidden">
        <motion.div animate={{ y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-3xl backdrop-blur-md transform rotate-12" />
        <motion.div animate={{ y: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 7 }} className="absolute bottom-40 left-10 w-48 h-48 bg-white/5 rounded-full backdrop-blur-sm" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white mb-16">
            <Sparkles className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">LifeCoach AI</span>
          </div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-5xl font-extrabold text-white leading-tight mb-6">
            Start your journey <br /> with LifeCoach AI
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-lg text-blue-100 max-w-md">
            Create an account to build habits, track goals, and unlock your true potential.
          </motion.p>
        </div>
      </div>

      {/* RIGHT SIDE - Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-12 relative overflow-y-auto">
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="absolute top-8 right-8 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md my-auto pt-10">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold mb-2">Create account</h2>
            <p className="text-gray-500 dark:text-gray-400">Join thousands improving their lives daily.</p>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Yash" 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-transparent focus:outline-none focus:ring-2 focus:ring-light-primary transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yash@example.com" 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-transparent focus:outline-none focus:ring-2 focus:ring-light-primary transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create a strong password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-transparent focus:outline-none focus:ring-2 focus:ring-light-primary transition-all" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <div className={`h-full ${strength >= 1 ? 'bg-danger' : 'bg-transparent'} w-1/3 transition-all`}></div>
                  <div className={`h-full ${strength >= 2 ? 'bg-warning' : 'bg-transparent'} w-1/3 transition-all`}></div>
                  <div className={`h-full ${strength === 3 ? 'bg-success' : 'bg-transparent'} w-1/3 transition-all`}></div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CheckCircle2 className="h-5 w-5 text-gray-400" /></div>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password" 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-transparent focus:outline-none focus:ring-2 focus:ring-light-primary transition-all" 
                />
              </div>
            </div>

            {/* Clickable Terms & Conditions Checkbox */}
            <div className="flex items-start text-sm mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="rounded text-light-primary focus:ring-light-primary w-4 h-4 mt-0.5 cursor-pointer" 
                />
                <span className="text-gray-500 dark:text-gray-400">
                  I agree to the{' '}
                  <button 
                    type="button" 
                    onClick={() => setIsTermsOpen(true)}
                    className="text-light-primary font-semibold hover:underline bg-transparent border-none cursor-pointer p-0 inline"
                  >
                    Terms of Service & Privacy Policy
                  </button>
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-light-primary hover:bg-light-hover text-white font-semibold py-3 rounded-xl shadow-lg shadow-light-primary/30 transition-all active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 pb-6 text-center text-sm text-gray-500">
            Already have an account? <Link to="/" className="text-light-primary font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>

      {/* --- TERMS & CONDITIONS MODAL --- */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl relative ${isDarkMode ? 'bg-[#161B26] border border-slate-800 text-white' : 'bg-white text-slate-800'}`}
          >
            <button 
              onClick={() => setIsTermsOpen(false)} 
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-4">Terms of Service & Privacy Policy</h2>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-4 leading-relaxed">
              <p><strong>1. Acceptance of Terms:</strong> By registering, accessing, or using LifeCoach AI, you agree to comply with and be bound by these Terms and Conditions.</p>
              
              <p><strong>2. Artificial Intelligence Disclaimer:</strong> LifeCoach AI provides automated coaching, scheduling tools, and organizational support. <em>Our AI assistant does not provide medical, psychological, or professional health diagnosis.</em> Always consult a qualified professional for serious personal or health concerns.</p>
              
              <p><strong>3. User Accounts & Security:</strong> You are responsible for maintaining the confidentiality of your account credentials (password and email). You agree to notify us immediately of any unauthorized use of your account.</p>
              
              <p><strong>4. Data Privacy & Security:</strong> We store your journal entries, task items, goals, and profile settings securely in our database. We value your privacy and do not sell, rent, or trade your personal data to third-party marketing companies.</p>
              
              <p><strong>5. Limitation of Liability:</strong> LifeCoach AI and its developers shall not be held liable for any direct, indirect, or incidental damages resulting from the use or inability to use our platform or AI-generated recommendations.</p>
              
              <p><strong>6. Account Termination:</strong> We reserve the right to suspend or terminate accounts that violate our community guidelines or exhibit abusive behavior on the platform.</p>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button 
                type="button"
                onClick={() => {
                  setAcceptedTerms(true);
                  setIsTermsOpen(false);
                }}
                className="px-6 py-2.5 bg-light-primary hover:bg-light-hover text-white font-semibold rounded-xl text-sm transition-all"
              >
                I Understand & Accept
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}