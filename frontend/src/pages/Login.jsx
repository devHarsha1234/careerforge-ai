import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Eye, EyeOff, Loader2, BrainCircuit, BookOpen, 
  ArrowRight, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import api from '../api/axios';

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    if (location.state?.registeredEmail) {
      setEmail(location.state.registeredEmail);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/login', { 
        email: email.trim().toLowerCase(), 
        password 
      });
      const token = res.data.access_token;
      if (!token || token === 'undefined') {
        throw new Error('Authentication token was not returned by server.');
      }
      login(token, res.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Invalid email or password';
      setErrorMsg(msg);
      toast.error(msg);
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
            <span className="text-indigo-600">Shape your career.</span>
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Sign in to access your diagnostic profile analysis, learning tracks, practice quizzes, and resume builder.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3.5 text-sm text-slate-700">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <BrainCircuit size={18} />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">26-Feature Career Assessment</span>
                <span className="text-slate-600 text-xs">Evaluate your current readiness and identify priority gaps</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 text-sm text-slate-700">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <BookOpen size={18} />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Learn Before Practice</span>
                <span className="text-slate-600 text-xs">16 structured concept modules across DSA, SQL & DBMS, and React</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 text-sm text-slate-700">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Practice & Measure Progress</span>
                <span className="text-slate-600 text-xs">75 topic-isolated questions with explanations and roadmap tracking</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono relative z-10">
          CareerForge AI • Assess → Understand → Learn → Practice → Improve
        </div>
      </div>

      {/* ─── RIGHT: LOGIN FORM ────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-7 bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-soft-md">
          
          <div>
            <span className="text-xs font-mono uppercase font-bold text-indigo-600 tracking-wider block mb-1">
              SIGN IN
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Enter your email and password to continue.
            </p>
          </div>

          {errorMsg && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <input 
                id="login-email"
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
              <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input 
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
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
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="pt-5 border-t border-slate-200 text-center text-xs text-slate-600">
            <span>Don't have an account yet? </span>
            <Link to="/signup" className="text-indigo-600 hover:underline font-bold">
              Create an account →
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
