import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage'; // Yahan import kiya
import AICoachPage from './pages/AICoachPage';
import HabitsPage from './pages/HabitsPage';
import GoalsPage from './pages/GoalsPage';
import JournalPage from './pages/JournalPage';
import CalendarPage from './pages/CalendarPage';
import FocusPage from './pages/FocusPage';
import './index.css'; // CSS import kiya
import NotesPage from './pages/NotesPage';
import FinancePage from './pages/FinancePage';
import HealthPage from './pages/HealthPage';
import ProfilePage from './pages/ProfilePage'; 
import SettingsPage from './pages/SettingsPage'; 
import ChatPage from './pages/ChatPage';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} /> {/* Yahan Route add kiya */}
        <Route path="/chat" element={<AICoachPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/focus" element={<FocusPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;