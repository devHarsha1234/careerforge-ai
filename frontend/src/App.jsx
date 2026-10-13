import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import HowItWorks from './pages/HowItWorks';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Assessment from './pages/Assessment';
import AssessmentResults from './pages/AssessmentResults';
import Skills from './pages/Skills';
import Learn from './pages/Learn';
import LearnTopic from './pages/LearnTopic';
import Practice from './pages/Practice';
import Roadmap from './pages/Roadmap';
import Jobs from './pages/Jobs';
import ResumeBuilder from './pages/ResumeBuilder';
import Progress from './pages/Progress';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#FAFAF7] text-slate-900 font-sans selection:bg-brand-violet/20">
        <Toaster position="top-right" toastOptions={{ style: { background: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' } }} />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Profile />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/assessment/results" element={<AssessmentResults />} />
              <Route path="/analysis" element={<AssessmentResults />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/learn/:id" element={<LearnTopic />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/resume" element={<ResumeBuilder />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
