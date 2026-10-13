import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, AlertTriangle, 
  ArrowRight, BookOpen, Sparkles, Map, Loader2, Compass, ShieldCheck 
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AssessmentResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/analysis');
        if (!res.data) {
          navigate('/assessment');
          return;
        }
        setData(res.data);
      } catch (err) {
        if (!data) {
          toast.error('Unable to fetch assessment results. Redirecting...');
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center bg-[#FAFAF7]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-600 font-mono">Loading Skill & Profile Analysis...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const readinessScore = data.careerforge_score ?? data.readiness_score ?? 70;
  const modelEstimate = data.model_estimate ?? data.ml_model_probability ?? 75;
  const currentPosition = data.current_position || {
    target_role: 'Software Development',
    tier: readinessScore >= 75 ? 'Placement Ready' : readinessScore >= 50 ? 'Developing Candidate' : 'Foundation Stage',
    summary: `Your CareerForge Readiness Score is ${Math.round(readinessScore)}/100.`
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          <CheckCircle2 size={14} />
          <span>26-Point Diagnostic Complete</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
          Skill & Profile Analysis
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed font-sans">
          An honest breakdown of where you stand today, your strongest capabilities, the priority gaps holding you back, and your immediate action plan.
        </p>
      </div>

      {/* ─── 1. CURRENT POSITION BANNER ──────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-xs font-mono uppercase font-bold text-indigo-600 tracking-wider">
            1. Current Position • {currentPosition.target_role}
          </span>
          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
            Status: {currentPosition.tier}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {currentPosition.summary}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/assessment"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Update Assessment
          </Link>
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>

      {/* ─── TOP METRIC COMPARISON ROW ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Metric 1: CareerForge Readiness Score */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600">
                CareerForge Readiness
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Composite Readiness Score
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-5xl sm:text-6xl font-heading font-extrabold text-slate-900">
                {Math.round(readinessScore)}
              </span>
              <span className="text-slate-500 text-lg font-semibold">/ 100</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your primary actionable readiness metric. Combines your academic foundation, technical scores, hands-on project depth, verified quiz accuracy, and roadmap progress.
            </p>
          </div>

          <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Current Standing:</span>
            <span className="font-bold text-emerald-700">
              {readinessScore >= 75 ? 'Placement Ready' : readinessScore >= 50 ? 'Developing Candidate' : 'Foundation Stage'}
            </span>
          </div>
        </div>

        {/* Metric 2: Model Estimate (Explicit Separation) */}
        <div className="bg-white border border-indigo-200 rounded-3xl p-7 sm:p-9 shadow-soft-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700">
                Model Estimate
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                Decision Tree Classifier
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-5xl sm:text-6xl font-heading font-extrabold text-indigo-600">
                {Math.round(modelEstimate)}%
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1.5">
              <p className="font-semibold text-slate-800">
                This is a statistical estimate generated from patterns learned from the training dataset. It does not guarantee placement.
              </p>
              <p>
                Because Decision Tree classifiers assign each profile to a discrete leaf node from historical placement data, extreme leaf values (such as 0% or 100%) reflect the training sample distribution in that leaf rather than a personal certainty. Use your <strong>CareerForge Readiness Score ({Math.round(readinessScore)}/100)</strong> above to track continuous, day-to-day growth.
              </p>
            </div>
          </div>

          <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Pipeline Contract:</span>
            <span className="font-mono text-slate-900 font-bold">26 Validated Features</span>
          </div>
        </div>

      </div>

      {/* ─── SKILL & PROFILE ANALYSIS (5 DIMENSIONS) ─────────────────────── */}
      {data.components && data.components.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 space-y-6 shadow-soft-sm">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
              Core Competency Dimensions
            </span>
            <h2 className="text-xl font-heading font-bold text-slate-900 mt-0.5">
              Skill & Profile Analysis
            </h2>
          </div>

          <div className="space-y-4">
            {data.components.map((comp, idx) => (
              <div key={idx} className="bg-[#FAFAF7] border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{comp.name}</span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">{comp.explanation}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm px-2.5 py-1 rounded-lg bg-white border border-slate-200">
                    {Math.round(comp.score)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(Math.round(comp.score), 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 2. STRENGTHS & 3. PRIORITY GAPS ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 space-y-4 shadow-soft-sm">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 size={20} />
            <h3 className="text-base font-heading font-bold text-slate-900">2. Strengths</h3>
          </div>
          <p className="text-xs text-slate-600">
            Areas where your current profile meets or exceeds target placement benchmarks:
          </p>

          <ul className="space-y-2.5 pt-2">
            {data.strengths?.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium p-3.5 rounded-xl bg-[#FAFAF7] border border-slate-200">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Priority Gaps */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 space-y-4 shadow-soft-sm">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle size={20} />
            <h3 className="text-base font-heading font-bold text-slate-900">3. Priority Gaps</h3>
          </div>
          <p className="text-xs text-slate-600">
            High-impact dimensions holding back your readiness score — address these first:
          </p>

          <div className="space-y-3 pt-2">
            {data.skill_gaps?.map((gap, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#FAFAF7] border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{gap.topic}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold uppercase">
                    {gap.priority || 'High'} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {gap.recommended_action || `Improve current ${gap.current_level} proficiency toward ${gap.target_level}.`}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── 4. WHAT TO DO NEXT ───────────────────────────────────────────── */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 space-y-4 shadow-soft-sm">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
              Actionable Guidance
            </span>
            <h2 className="text-xl font-heading font-bold text-slate-900 mt-0.5">
              4. What To Do Next
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.recommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#FAFAF7] border border-slate-200 flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold flex items-center justify-center flex-shrink-0">
                  0{i + 1}
                </span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 5. RECOMMENDED LEARNING, 6. PRACTICE & 7. ROADMAP ────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-6 shadow-soft-sm">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
            CONNECTED PREPARATION LOOP
          </span>
          <h2 className="text-2xl font-heading font-extrabold text-slate-900 mt-1 tracking-tight">
            Turn your analysis into measurable progress.
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Follow the Learn → Practice → Roadmap sequence tailored to your assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
          
          <Link 
            to={data.recommended_learning?.[0]?.link || "/learn"} 
            className="p-6 rounded-2xl bg-[#FAFAF7] border border-slate-200 hover:border-indigo-400 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center mb-3">
                <BookOpen size={20} />
              </div>
              <h4 className="text-sm font-bold text-slate-900">5. Recommended Learning</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {data.recommended_learning?.[0]?.reason || 'Study structured concept modules in DSA, SQL, and React before testing yourself.'}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>{data.recommended_learning?.[0]?.title ? `Start ${data.recommended_learning[0].title}` : 'Open Learning Tracks'}</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          <Link 
            to={data.recommended_practice?.[0]?.link || "/practice"} 
            className="p-6 rounded-2xl bg-[#FAFAF7] border border-slate-200 hover:border-amber-400 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-3">
                <Sparkles size={20} />
              </div>
              <h4 className="text-sm font-bold text-slate-900">6. Recommended Practice</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {data.recommended_practice?.[0]?.reason || 'Validate your understanding with randomized 5-question diagnostic quizzes and instant explanations.'}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 text-xs font-bold text-amber-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>Start Practice Quiz</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          <Link 
            to="/roadmap" 
            className="p-6 rounded-2xl bg-[#FAFAF7] border border-slate-200 hover:border-emerald-400 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-3">
                <Map size={20} />
              </div>
              <h4 className="text-sm font-bold text-slate-900">7. Personalized Roadmap</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Track your phase-by-phase preparation milestones from core foundations to interview readiness.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>View Career Roadmap</span>
              <ArrowRight size={14} />
            </div>
          </Link>

        </div>
      </div>

    </div>
  );
}
