import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Bot, Sparkles, Target, Activity, Heart, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', age: '', gender: '', country: '', timezone: '', language: 'English',
    occupation: '', school: '', degree: '', semester: '',
    wakeUp: '', sleep: '', workingHours: '', studyHours: '', exercise: '',
    goals: [], habits: [], 
    height: '', weight: '', waterIntake: '', medicalIssues: '', foodPreference: '',
    coachStyle: '', notificationPreference: [], theme: 'Auto'
  });

  // 🔴 VALIDATION FUNCTION FOR EACH STEP 🔴
  const isStepValid = () => {
    switch (step) {
      case 1: return formData.name.trim() !== '';
      case 2: return formData.age !== '' && formData.gender !== '' && formData.country !== '';
      case 3: return formData.occupation !== '';
      case 4: return formData.school !== '' && formData.degree !== '';
      case 5: return formData.wakeUp !== '' && formData.sleep !== '';
      case 6: return formData.goals.length > 0;
      case 7: return formData.habits.length > 0;
      case 8: return formData.height !== '' && formData.weight !== '' && formData.foodPreference !== '';
      case 9: return formData.coachStyle !== '';
      default: return true; // Steps 10, 11, 12 ke liye compulsory nahi hai
    }
  };

  // 🔴 UPDATED HANDLE NEXT FOR MONGODB & VALIDATION 🔴
  const handleNext = async () => { 
    if (!isStepValid()) {
      alert("Bhai, pehle is step ki details bharein tabhi aage badh sakenge!");
      return;
    }

    if (step < 12) {
      setStep(step + 1); 
    } else {
      const userId = localStorage.getItem('lifeCoach_userUid');

      try {
        const response = await fetch('https://lifecoach-backend-ktdn.onrender.com/api/user/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            onboardingData: formData
          }),
        });

        if (response.ok) {
          localStorage.setItem('lifeCoach_userName', formData.name);
          navigate('/dashboard'); 
        } else {
          alert("Failed to save onboarding data.");
        }
      } catch (error) {
        console.error("Error saving onboarding data:", error);
        alert("Server error. Data couldn't be saved to MongoDB.");
      }
    }
  };

  const handlePrev = () => { if (step > 1) setStep(step - 1); };
  
  const goalOptions = ["Career", "Fitness", "Money", "Study", "Business", "Productivity", "Relationship", "Mental Health"];
  const habitOptions = ["Drink Water", "Exercise", "Reading", "Meditation", "Coding", "Gym", "Sleep", "Walking"];
  const coachStyles = ["Strict Coach", "Friendly Coach", "Funny Coach", "Professional Coach", "Motivator"];

  const toggleSelection = (field, item) => {
    const list = formData[field];
    if (list.includes(item)) setFormData({ ...formData, [field]: list.filter(i => i !== item) });
    else setFormData({ ...formData, [field]: [...list, item] });
  };

  const currentValid = isStepValid();

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex flex-col items-center justify-center p-6 transition-colors duration-500">
      
      <div className="w-full max-w-2xl mb-8">
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-light-primary dark:bg-dark-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 12) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-right mt-2 text-sm text-gray-500 font-medium">Step {step} of 12</div>
      </div>

      <div className="w-full max-w-2xl bg-white dark:bg-dark-card rounded-3xl shadow-xl border border-light-border dark:border-dark-border p-8 md:p-12 relative overflow-hidden min-h-[500px] flex flex-col justify-center">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {step === 1 && (
              <div className="text-center">
                <Bot className="w-24 h-24 text-light-primary mx-auto mb-6" />
                <h1 className="text-4xl font-bold mb-4 transition-all">
                  Hi {formData.name ? <span className="text-light-primary">{formData.name}</span> : 'there'} 👋
                </h1>
                <p className="text-xl text-gray-500 mb-8">I'm your personal AI Life Coach.</p>
                <div className="max-w-xs mx-auto text-left">
                  <label className="block text-sm mb-2 text-gray-500 font-medium text-center">What should I call you?</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name..." 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full p-3 rounded-xl border border-light-border dark:border-dark-border bg-transparent focus:outline-none focus:ring-2 focus:ring-light-primary text-center text-lg font-semibold transition-all shadow-sm"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Bot /> Basic Info</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-500">Age</label>
                    <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full p-3 rounded-xl border border-light-border dark:border-dark-border bg-transparent focus:ring-2 focus:ring-light-primary" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-500">Gender</label>
                    <input type="text" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full p-3 rounded-xl border border-light-border dark:border-dark-border bg-transparent focus:ring-2 focus:ring-light-primary" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm mb-1 text-gray-500">Country</label>
                    <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-3 rounded-xl border border-light-border dark:border-dark-border bg-transparent focus:ring-2 focus:ring-light-primary" />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">What is your occupation?</h2>
                <div className="grid grid-cols-2 gap-3">
                  {['Student', 'Employee', 'Business', 'Freelancer', 'Job Seeker', 'Other'].map(job => (
                    <button key={job} onClick={() => setFormData({...formData, occupation: job})} className={`p-4 rounded-xl border text-left transition-all ${formData.occupation === job ? 'border-light-primary bg-light-primary/10 text-light-primary' : 'border-light-border dark:border-dark-border hover:border-gray-400'}`}>
                      {job}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Education Details</h2>
                <div className="space-y-4">
                  <input type="text" placeholder="School / College" value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} className="w-full p-3 rounded-xl border border-light-border dark:border-dark-border bg-transparent" />
                  <input type="text" placeholder="Degree" value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} className="w-full p-3 rounded-xl border border-light-border dark:border-dark-border bg-transparent" />
                  <input type="text" placeholder="Semester" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full p-3 rounded-xl border border-light-border dark:border-dark-border bg-transparent" />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Clock /> Daily Routine</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-gray-500">Wake Up Time</label>
                    <input type="time" value={formData.wakeUp} onChange={e => setFormData({...formData, wakeUp: e.target.value})} className="w-full p-3 rounded-xl border border-light-border dark:border-dark-border bg-transparent focus:ring-2 focus:ring-light-primary" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-gray-500">Sleep Time</label>
                    <input type="time" value={formData.sleep} onChange={e => setFormData({...formData, sleep: e.target.value})} className="w-full p-3 rounded-xl border border-light-border dark:border-dark-border bg-transparent focus:ring-2 focus:ring-light-primary" />
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Target /> What are your goals?</h2>
                <p className="text-gray-500 mb-6">Select at least one goal.</p>
                <div className="flex flex-wrap gap-3">
                  {goalOptions.map(goal => (
                    <button key={goal} onClick={() => toggleSelection('goals', goal)} className={`px-5 py-3 rounded-full border transition-all ${formData.goals.includes(goal) ? 'bg-light-primary border-light-primary text-white shadow-lg' : 'border-light-border dark:border-dark-border hover:border-gray-400'}`}>
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Activity /> Habits to build</h2>
                <p className="text-gray-500 mb-6">Select at least one habit.</p>
                <div className="flex flex-wrap gap-3 mt-6">
                  {habitOptions.map(habit => (
                    <button key={habit} onClick={() => toggleSelection('habits', habit)} className={`px-5 py-3 rounded-full border transition-all ${formData.habits.includes(habit) ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'border-light-border dark:border-dark-border hover:border-gray-400'}`}>
                      {habit}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 8 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Heart /> Health Profile</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input type="number" placeholder="Height (cm)" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full p-3 rounded-xl border border-light-border dark:border-dark-border bg-transparent" />
                  <input type="number" placeholder="Weight (kg)" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full p-3 rounded-xl border border-light-border dark:border-dark-border bg-transparent" />
                </div>
                <h3 className="text-sm text-gray-500 mb-2">Food Preference</h3>
                <div className="flex gap-3">
                  {['Veg', 'Non Veg', 'Vegan', 'Other'].map(food => (
                    <button key={food} onClick={() => setFormData({...formData, foodPreference: food})} className={`px-4 py-2 rounded-lg border transition-all ${formData.foodPreference === food ? 'bg-light-primary text-white border-light-primary' : 'border-light-border dark:border-dark-border'}`}>
                      {food}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 9 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Sparkles /> AI Coach Style</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coachStyles.map(style => (
                    <button key={style} onClick={() => setFormData({...formData, coachStyle: style})} className={`p-5 rounded-xl border text-left transition-all ${formData.coachStyle === style ? 'border-light-primary bg-light-primary/10 text-light-primary' : 'border-light-border dark:border-dark-border'}`}>
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(step === 10 || step === 11) && (
              <div className="text-center py-10">
                <h2 className="text-2xl font-bold mb-4">{step === 10 ? 'Notification Preferences' : 'App Theme'}</h2>
                <p className="text-gray-500">Configuring your customized experience...</p>
              </div>
            )}

            {step === 12 && (
              <div className="text-center py-10">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Sparkles className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
                </motion.div>
                <h1 className="text-4xl font-bold mb-4">Awesome, {formData.name || 'Friend'}!</h1>
                <p className="text-xl text-gray-500 mb-8">Everything is ready.<br/>Let's build your best life together.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto flex justify-between items-center pt-8 border-t border-light-border dark:border-dark-border">
          <button 
            onClick={handlePrev} 
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          
          <button 
            onClick={handleNext} 
            disabled={step < 12 && !currentValid}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold shadow-lg transition-all active:scale-[0.98] ${
              step < 12 && !currentValid 
              ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
              : 'bg-light-primary hover:bg-light-hover text-white shadow-light-primary/30'
            }`}
          >
            {step === 12 ? 'Go to Dashboard' : 'Next'} {step !== 12 && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}