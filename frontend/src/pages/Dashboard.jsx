import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, Activity, BookOpen, Sparkles, 
  ArrowRight, TrendingUp, Award, CheckCircle2, AlertCircle, 
  ChevronRight, Compass, ShieldCheck, Flame, Target
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../api/axios';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (err) {
        setError('Failed to load dashboard data. Please verify your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="h-8 w-72 bg-slate-200 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-3xl border border-slate-200" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 animate-pulse rounded-3xl border border-slate-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-heading font-bold text-slate-900 mb-2">Command Center Offline</h2>
        <p className="text-sm text-slate-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // EMPTY STATE: User hasn't taken the assessment
  if (!data?.has_assessment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-sm text-slate-600 mt-1">Your career intelligence command center is ready to configure.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-14 text-center max-w-3xl mx-auto shadow-soft-lg relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto mb-6 shadow-sm">
            <ShieldCheck size={32} />
          </div>

          <span className="text-[11px] font-mono uppercase font-bold text-indigo-700 tracking-widest inline-block mb-2">
            STEP 01 OF YOUR CAREER OPERATING SYSTEM
          </span>
          
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight mb-3">
            Complete your baseline assessment
          </h2>
          
          <p className="text-sm text-slate-600 max-w-lg mx-auto mb-8 leading-relaxed">
            CareerForge evaluates 26 profile vectors across academics, technical aptitude, past projects, and portfolio presence to compute your true placement readiness score.
          </p>

          <Link 
            to="/assessment" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <span>Start 26-Point Profile Assessment</span>
            <ArrowRight size={16} />
          </Link>

          <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>Personalized skill gap audit</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>Tailored learning roadmap</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>ATS resume & job matching</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const primaryPriority = data.top_priorities?.[0];
  const nextBestAction = data.next_best_action || (primaryPriority ? {
    title: primaryPriority.title,
    reason: `Your current proficiency (${primaryPriority.current}%) is below the ${primaryPriority.target}% target benchmark for ${data.target_role}.`,
    cta_label: primaryPriority.action_text || 'Start Recommended Step',
    cta_link: primaryPriority.action_link || '/learn'
  } : {
    title: 'Explore Core Learning Tracks',
    reason: 'Review structured concepts in DSA, SQL, and React before challenging the diagnostic question bank.',
    cta_label: 'Open Learning Hub',
    cta_link: '/learn'
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ─── 1. COMMAND CENTER HEADER ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">Active Career Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Target Role: <strong className="text-slate-900 font-semibold">{data.target_role}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/assessment/results" 
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-soft-sm transition-colors flex items-center gap-1.5"
          >
            <span>Skill & Profile Analysis</span>
            <ChevronRight size={14} />
          </Link>
          <Link 
            to="/assessment" 
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Re-assess Profile
          </Link>
        </div>
      </div>

      {/* ─── 2. DOMINANT NEXT BEST ACTION BANNER ───────────────────────────── */}
      {nextBestAction && (
        <div className="bg-gradient-to-r from-indigo-50 via-white to-amber-50 border border-indigo-200 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-soft-md">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <Target size={22} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  NEXT BEST ACTION
                </span>
                {primaryPriority && (
                  <span className="text-xs text-slate-500 font-medium">
                    Current: {primaryPriority.current}% • Target: {primaryPriority.target}%
                  </span>
                )}
              </div>
              <h3 className="text-lg font-heading font-bold text-slate-900 mt-1">
                {nextBestAction.title}
              </h3>
              {nextBestAction.reason && (
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {nextBestAction.reason}
                </p>
              )}
            </div>
          </div>

          <Link 
            to={nextBestAction.cta_link || "/learn"}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            <span>{nextBestAction.cta_label || "Start Learning"}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* ─── 3. METRIC CARDS ROW ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: CareerForge Readiness Score */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">
                CareerForge Readiness
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Composite Score
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl sm:text-5xl font-heading font-extrabold text-slate-900">
                {data.readiness_score}
              </span>
              <span className="text-slate-400 text-base font-semibold">/ 100</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Synthesized from your 26-point profile, academic consistency, validated quiz accuracy, and roadmap completion.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Status tier:</span>
            <span className="font-bold text-emerald-700">
              {data.readiness_score >= 75 ? 'Placement Ready' : data.readiness_score >= 50 ? 'Developing Candidate' : 'Foundation Building'}
            </span>
          </div>
        </div>

        {/* Card 2: Model Estimate (Explicit Separation) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase font-bold text-indigo-700 tracking-wider">
                Model Estimate
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Decision Tree
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl sm:text-5xl font-heading font-extrabold text-indigo-600">
                {data.model_estimate}%
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed italic">
              Statistical model estimate derived from historical placement datasets. Not a guaranteed outcome.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Features Evaluated:</span>
            <span className="font-mono font-bold text-slate-900">26 Data Points</span>
          </div>
        </div>

        {/* Card 3: Learning Momentum */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase font-bold text-amber-700 tracking-wider">
                Learning Momentum
              </span>
              <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                <Flame size={14} />
                <span>Active</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2">
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center">
                <span className="block text-xl font-heading font-bold text-slate-900">{data.stats?.xp || 0}</span>
                <span className="text-[10px] text-slate-500 font-medium">XP Earned</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center">
                <span className="block text-xl font-heading font-bold text-slate-900">{data.stats?.quiz_accuracy || 0}%</span>
                <span className="text-[10px] text-slate-500 font-medium">Quiz Acc.</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center">
                <span className="block text-xl font-heading font-bold text-slate-900">{data.stats?.badges_earned || 0}</span>
                <span className="text-[10px] text-slate-500 font-medium">Badges</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Roadmap completion currently at <strong className="text-slate-900 font-bold">{data.stats?.roadmap_progress || 0}%</strong> across targeted phases.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/progress" className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1">
              <span>View Progress Center</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

      </div>

      {/* ─── 4. SKILL HEALTH & PRIORITY ROADMAP ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Actionable Priorities (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-soft-sm">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-heading font-bold text-slate-900">Identified Skill Targets</h3>
              <p className="text-xs text-slate-500 mt-0.5">Ranked from your profile audit to unlock the largest score gains.</p>
            </div>
            <span className="text-xs font-mono text-slate-500 font-semibold">{data.top_priorities?.length || 0} Items</span>
          </div>

          <div className="space-y-4">
            {data.top_priorities?.map((priority, idx) => (
              <div 
                key={priority.id || idx}
                className="bg-[#FAFAF7] border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{priority.title}</span>
                    <span className="text-slate-500 font-mono text-[11px] font-semibold">
                      {priority.current}% → Target {priority.target}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${Math.min(priority.current, 100)}%` }}
                    />
                  </div>
                </div>

                <Link 
                  to={priority.action_link || "/learn"}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 transition-colors flex items-center justify-center gap-1 sm:self-center shadow-soft-sm"
                >
                  <span>{priority.action_text || "Practice"}</span>
                  <ChevronRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Real Activity & Hub (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Recent Activity Timeline */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-500">Recent Activity</h3>
              <Activity size={14} className="text-slate-400" />
            </div>

            <div className="space-y-3.5">
              {data.recent_activity?.map((act, i) => (
                <div key={act.id || i} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{act.title}</p>
                    <span className="text-[10px] text-slate-500 font-mono">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/learn" className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 transition-all text-center shadow-soft-sm">
              <BookOpen size={20} className="text-indigo-600 mx-auto mb-2" />
              <span className="block text-xs font-bold text-slate-900">Learn Hub</span>
              <span className="text-[10px] text-slate-500">Concepts first</span>
            </Link>
            <Link to="/practice" className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 transition-all text-center shadow-soft-sm">
              <Sparkles size={20} className="text-amber-500 mx-auto mb-2" />
              <span className="block text-xs font-bold text-slate-900">Practice</span>
              <span className="text-[10px] text-slate-500">75+ questions</span>
            </Link>
            <Link to="/jobs" className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 transition-all text-center shadow-soft-sm">
              <Briefcase size={20} className="text-emerald-600 mx-auto mb-2" />
              <span className="block text-xs font-bold text-slate-900">Jobs</span>
              <span className="text-[10px] text-slate-500">Skill match</span>
            </Link>
            <Link to="/resume" className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 transition-all text-center shadow-soft-sm">
              <Compass size={20} className="text-blue-600 mx-auto mb-2" />
              <span className="block text-xs font-bold text-slate-900">Resume</span>
              <span className="text-[10px] text-slate-500">ATS generator</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
