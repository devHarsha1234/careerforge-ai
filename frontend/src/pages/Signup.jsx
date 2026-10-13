import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, Loader2, ArrowRight, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const ROLES = [
  "Software Development",
  "Data Science",
  "AI/ML",
  "Cloud Computing",
  "Cyber Security",
  "Business Analytics"
];

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState(ROLES[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      await api.post('/auth/register', { 
        name: name.trim(), 
        email: email.trim().toLowerCase(), 
        password, 
        target_role: targetRole 
      });
      toast.success('Account created! Please sign in to continue.');
      navigate('/login', { state: { registeredEmail: email.trim().toLowerCase() } });
    } catch (err) {
      const status = err.response?.status;
      const serverErr = err.response?.data?.error || err.response?.data?.message || '';
      if (status === 409 || (status === 400 && serverErr.toLowerCase().includes('exists'))) {
        setErrorMsg('Email already exists. Please sign in instead.');
        toast.error('Email already exists.');
      } else {
        setErrorMsg(serverErr || 'Could not create account. Please verify your details and try again.');
        toast.error(serverErr || 'Registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex bg-[#F8FAFC]">
      
      {/* ─── LEFT: EDITORIAL BRAND PANEL ──────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 bg-white border-r border-slate-200 relative overflow-hidden">
        <div className="absolute top-[-100px] left-[-80px] w-[420px] h-[420px] bg-indigo-50/70 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 space-y-6 max-w-lg">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-heading font-extrabold text-sm text-white shadow-sm">
              CF
            </div>
            <span className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">CareerForge AI</span>
          </Link>

          <h2 className="text-4xl sm:text-5xl font-heading font-extrabold text-slate-900 leading-[1.12] tracking-tight pt-4">
            Build your skills. <br />
            <span className="text-indigo-600">Get placement-ready.</span>
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Turn your academic background, technical skills, and project experience into a structured, step-by-step plan for career readiness.
          </p>

          <div className="space-y-3.5 pt-4">
            {[
              { step: '01 Assess', title: '26-Feature Career Diagnostic', desc: 'Understand where your profile currently stands across academics, coding, and projects.' },
              { step: '02 Learn & Practice', title: 'Targeted Concept Tracks & Quizzes', desc: 'Study core modules first, then validate understanding with topic-specific quizzes.' },
              { step: '03 Present', title: 'Personalized Roadmap & ATS Resume', desc: 'Follow clear milestones and generate a clean resume from your real experience.' }
            ].map((item) => (
              <div key={item.step} className="p-4 rounded-2xl bg-[#FCFBF8] border border-slate-200/90 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-indigo-600">{item.step}</span>
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono relative z-10">
          CareerForge AI • Assess → Understand → Learn → Practice → Improve
        </div>
      </div>

      {/* ─── RIGHT: SIGNUP FORM ───────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-7 bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-soft-md">
          
          <div>
            <span className="text-xs font-mono uppercase font-bold text-indigo-600 tracking-wider block mb-1">
              CREATE YOUR ACCOUNT
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
              Start your career plan
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Enter your details below to initialize your profile.
            </p>
          </div>

          {errorMsg && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="signup-fullname" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <input 
                id="signup-fullname"
                type="text" 
                name="fullName"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <input 
                id="signup-email"
                type="email" 
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="signup-role" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Career Track
              </label>
              <select 
                id="signup-role"
                name="targetRole"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors"
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input 
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:bg-white focus:outline-none transition-colors pr-12"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="pt-5 border-t border-slate-200 text-center text-xs text-slate-600">
            <span>Already have an account? </span>
            <Link to="/login" className="text-indigo-600 hover:underline font-bold">
              Sign in →
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
