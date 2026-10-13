import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, ChevronRight, BookOpen, Clock, 
  ArrowLeft, ArrowRight, Sparkles, Award 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function LearnTopic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [completedModules, setCompletedModules] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`cf_learn_${id}`) || '[]');
      return new Set(saved);
    } catch {
      return new Set();
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const res = await api.get(`/learn/${id}`);
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load topic curriculum.');
        navigate('/learn');
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex h-[500px] gap-8">
        <div className="w-1/4 h-full bg-slate-100 animate-pulse rounded-3xl" />
        <div className="w-3/4 h-full bg-slate-100 animate-pulse rounded-3xl" />
      </div>
    );
  }

  const topicInfo = data?.topic || data || {};
  const modules = data?.modules || [];
  const topicName = topicInfo.name || 'Concept Track';
  const practiceQueryTopic = topicName.includes('DSA') ? 'DSA' : topicName.includes('SQL') ? 'SQL & DBMS' : 'React';

  if (!modules || modules.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-heading font-bold text-slate-900 mb-2">Modules Not Found</h2>
        <p className="text-xs text-slate-600 mb-6">This learning track is currently undergoing curriculum refinement.</p>
        <Link to="/learn" className="text-xs font-bold text-indigo-600 hover:underline">
          ← Return to Learning Tracks
        </Link>
      </div>
    );
  }

  const activeModule = modules[activeModuleIdx] || {};
  const wordCount = activeModule.content ? activeModule.content.split(/\s+/).length : 200;
  const readTime = Math.max(1, Math.ceil(wordCount / 180));

  const handleMarkComplete = () => {
    setCompletedModules(prev => {
      const updated = new Set(prev).add(activeModuleIdx);
      try {
        localStorage.setItem(`cf_learn_${id}`, JSON.stringify(Array.from(updated)));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
    if (activeModuleIdx < modules.length - 1) {
      setActiveModuleIdx(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isAllCompleted = completedModules.size === modules.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      
      {/* ─── BREADCRUMB ───────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center text-xs text-slate-500 font-medium">
        <Link to="/learn" className="hover:text-slate-900 transition-colors">Learning Tracks</Link>
        <ChevronRight size={14} className="mx-2 text-slate-400" />
        <span className="text-slate-900 font-bold">{topicName}</span>
        <ChevronRight size={14} className="mx-2 text-slate-400" />
        <span className="text-indigo-600 truncate max-w-xs">{activeModule.title}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ─── SIDEBAR: CONCEPT CURRICULUM ROADMAP ────────────────────────── */}
        <div className="w-full lg:w-80 lg:shrink-0 order-2 lg:order-1">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sticky top-24 space-y-6 shadow-soft-sm">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-indigo-700 tracking-wider">
                  Track Modules
                </span>
                <h3 className="font-heading font-bold text-sm text-slate-900 mt-0.5">
                  {topicName}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500 font-bold">
                {completedModules.size}/{modules.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${(completedModules.size / modules.length) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 block text-right font-mono font-medium">
                {Math.round((completedModules.size / modules.length) * 100)}% Complete
              </span>
            </div>

            {/* Module Nav Links */}
            <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
              {modules.map((mod, idx) => {
                const isActive = activeModuleIdx === idx;
                const isCompleted = completedModules.has(idx);

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveModuleIdx(idx);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all flex items-center justify-between gap-2 ${
                      isActive 
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold shadow-soft-sm' 
                        : isCompleted
                        ? 'bg-slate-50 text-slate-800 hover:text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate pr-1">
                      {idx + 1}. {mod.title}
                    </span>
                    {isCompleted && (
                      <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Jump to practice link */}
            <div className="pt-4 border-t border-slate-100">
              <Link 
                to={`/practice?topic=${encodeURIComponent(practiceQueryTopic)}`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 text-xs font-bold text-indigo-700 hover:text-white transition-colors shadow-soft-sm"
              >
                <Sparkles size={14} />
                <span>Start Practice Quiz</span>
              </Link>
            </div>

          </div>
        </div>

        {/* ─── MAIN LESSON VIEW ───────────────────────────────────────────── */}
        <div className="flex-1 order-1 lg:order-2 space-y-8">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-soft-md relative">
            
            {/* Lesson Header */}
            <header className="pb-6 mb-8 border-b border-slate-100 space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                  <Clock size={12} /> ~{readTime} min read
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                  <BookOpen size={12} /> Module {activeModuleIdx + 1} of {modules.length}
                </span>
                {completedModules.has(activeModuleIdx) && (
                  <span className="text-emerald-600 flex items-center gap-1 font-bold">
                    <CheckCircle2 size={12} /> Completed
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                {activeModule.title}
              </h1>
            </header>

            {/* Markdown Content */}
            <div className="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
              <ReactMarkdown>{activeModule.content || 'Content for this module is loading...'}</ReactMarkdown>
            </div>

            {/* Lesson Navigation Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-10 border-t border-slate-100">
              <button
                onClick={() => {
                  if (activeModuleIdx > 0) {
                    setActiveModuleIdx(prev => prev - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                disabled={activeModuleIdx === 0}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} />
                <span>Previous Module</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleMarkComplete}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {activeModuleIdx < modules.length - 1 
                      ? 'Mark Complete & Next →' 
                      : 'Mark Final Module Complete'}
                  </span>
                </button>

                {activeModuleIdx === modules.length - 1 && (
                  <Link
                    to={`/practice?topic=${encodeURIComponent(practiceQueryTopic)}`}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} />
                    <span>Start Practice Quiz</span>
                  </Link>
                )}
              </div>
            </div>

          </div>

          {/* ─── TRACK COMPLETION BANNER ─────────────────────────────────── */}
          {isAllCompleted && (
            <div className="bg-gradient-to-r from-emerald-50 via-white to-indigo-50 border border-emerald-200 rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-soft-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto">
                <Award size={28} />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
                  Concept Track Mastered! 🎉
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                  You have completed all {modules.length} modules for {topicName}. Validate your mastery by taking a randomized practice quiz.
                </p>
              </div>

              <div className="pt-2">
                <Link 
                  to={`/practice?topic=${encodeURIComponent(practiceQueryTopic)}`}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all"
                >
                  <Sparkles size={16} />
                  <span>Start Practice Quiz</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
