import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lifecoach';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Complete Mongoose User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  onboardingData: { type: Object, default: {} },
  
  profile: {
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  
  calendarEvents: { type: Array, default: [] },
  tasks: { type: Array, default: [] },
  goals: { type: Array, default: [] },
  habits: { type: Array, default: [] },
  notes: { type: Array, default: [] },
  finance: { type: Array, default: [] },
  health: { type: Object, default: {} },
  journal: { type: Array, default: [] },
  
  settings: { 
    theme: { type: String, default: 'light' },
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    themeDark: { type: Boolean, default: false },
    general: { type: Object, default: {} },
    privacy: { type: Object, default: {} }
  },
  
  focusStats: {
    totalFocusTime: { type: Number, default: 0 }, 
    sessionsToday: { type: Number, default: 0 },
    sessions: { type: Array, default: [] }        
  }
});

const User = mongoose.model('User', userSchema);

// 1. Register API Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists!' });
    }
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// 2. Login API Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found with this email!' });
    }
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid password!' });
    }
    const hasCompletedOnboarding = user.onboardingData && Object.keys(user.onboardingData).length > 0;
    res.status(200).json({
      message: 'Login successful',
      userId: user._id,
      name: user.name,
      isOnboarded: hasCompletedOnboarding
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// 2.5 Reset Password API Route
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found in our database!" });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error while resetting password." });
  }
});

// 3. Onboarding API Route
app.post('/api/user/onboarding', async (req, res) => {
  try {
    const { userId, onboardingData } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { onboardingData: onboardingData },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'Onboarding data saved successfully' });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ message: 'Server error saving onboarding data' });
  }
});

// 4. Get User Specific Data API Routes (Handled both /data/:userId and /get-data?userId=...)
const handleGetUserData = async (req, res) => {
  try {
    const userId = req.params.userId || req.query.userId;
    if (!userId) return res.status(400).json({ message: 'UserId is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({
      name: user.name,
      email: user.email,
      tasks: user.tasks || [],
      goals: user.goals || [],
      habits: user.habits || [],
      notes: user.notes || [],
      finance: user.finance || [],
      health: user.health || {},
      journal: user.journal || [],
      calendarEvents: user.calendarEvents || [],
      profile: user.profile || {},
      settings: user.settings || {},
      focusStats: user.focusStats || {}
    });
  } catch (error) {
    console.error('Fetch data error:', error);
    res.status(500).json({ message: 'Server error fetching user data' });
  }
};

app.get('/api/user/data/:userId', handleGetUserData);
app.get('/api/user/get-data', handleGetUserData);

// 5. Update/Save Module Data API Route
app.post('/api/user/update-data', async (req, res) => {
  try {
    const { userId, dataType, dataValue } = req.body; 
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { [dataType]: dataValue },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'Data updated successfully', [dataType]: updatedUser[dataType] });
  } catch (error) {
    console.error('Update data error:', error);
    res.status(500).json({ message: 'Server error updating data' });
  }
});

// 🔴 Extra fallback endpoints for specific module updates if frontend calls them directly 🔴
['tasks', 'goals', 'habits', 'notes', 'finance', 'health', 'journal', 'calendarEvents', 'profile', 'settings', 'focusStats'].forEach(moduleName => {
  app.post(`/api/user/${moduleName}`, async (req, res) => {
    try {
      const { userId, ...data } = req.body;
      const dataValue = data[moduleName] !== undefined ? data[moduleName] : data;
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { [moduleName]: dataValue },
        { new: true }
      );
      if (!updatedUser) return res.status(404).json({ message: 'User not found' });
      res.status(200).json({ message: `${moduleName} updated successfully`, [moduleName]: updatedUser[moduleName] });
    } catch (err) {
      console.error(`Error updating ${moduleName}:`, err);
      res.status(500).json({ message: `Server error updating ${moduleName}` });
    }
  });
});

// 6. AI Chat API Route
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { userId, prompt } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'UserId is required for AI chat' });
    }

    const user = await User.findById(userId);
    const userName = user ? user.name : 'Yash';

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ 
        reply: `Hey ${userName}! Main tumhara AI Life Coach hu. Tumne pucha: "${prompt}". (Note: Add your GROQ_API_KEY in backend .env to enable real AI responses!)` 
      });
    }

    const onboardingDetails = user.onboardingData && Object.keys(user.onboardingData).length > 0 
      ? JSON.stringify(user.onboardingData, null, 2) 
      : "No onboarding details submitted yet.";

    const systemPrompt = `You are LifeCoach AI, a personal life coach for ${userName}. 
    Here are the user's Onboarding details and personal goals: ${onboardingDetails}.
    Be direct, motivating, concise, and always tailor your advice, routine suggestions, and motivation according to the user's specific onboarding background and goals.`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error("Groq API Detailed Error:", JSON.stringify(data, null, 2));
      return res.status(200).json({ 
        reply: `Bhai ${userName}, abhi AI server ki taraf se limit error aa rahi hai. Lekin main sun raha hu! Tumne pucha: "${prompt}".` 
      });
    }

    const aiReply = data.choices?.[0]?.message?.content || "I couldn't generate a response right now.";
    res.status(200).json({ reply: aiReply });

  } catch (error) {
    console.error('AI chat catch error:', error);
    res.status(200).json({ reply: "Bhai, server par choti si network issue aayi hai, par sab set hai!" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});