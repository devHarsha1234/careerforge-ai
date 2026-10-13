import React, { useState, useEffect } from 'react';
import { 
  Award, BrainCircuit, Target, CheckCircle2, FileText, 
  Zap, Loader2, Sparkles, Activity, ChevronRight, TrendingUp 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SYSTEM_BADGES = [
  { id: 'first_assessment', name: 'First Assessment', desc: 'Completed 26-point profile diagnostic', icon: <BrainCircuit size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50 border border-indigo-200' },
  { id: 'quiz_starter', name: 'Quiz Starter', desc: 'Attempted first diagnostic practice quiz', icon: <Zap size={20} />, color: 'text-amber-600', bg: 'bg-amber-50 border border-amber-200' },
  { id: 'quiz_master', name: 'Quiz Master', desc: 'Completed 5+ technical quizzes or scored ≥80%', icon: <Award size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50 border border-emerald-200' },
  { id: 'concept_master', name: 'Concept Master', desc: 'Studied curriculum modules in Learning Tracks', icon: <Target size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50 border border-indigo-200' },
  { id: 'skill_builder', name: 'Skill Builder', desc: 'Cleared a personalized Roadmap phase', icon: <CheckCircle2 size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50 border border-emerald-200' },
  { id: 'resume_ready', name: 'Resume Ready', desc: 'Generated an ATS-ready PDF resume', icon: <FileText size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50 border border-indigo-200' },
];

export default function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get('/progress');
        setData(res.data);
      } catch (err) {
        toast.error('Failed to load progress metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const readiness = data?.career_readiness ?? data?.stats?.readiness_score ?? 0;
  const accuracy = data?.quiz_accuracy ?? data?.stats?.quiz_accuracy ?? 0;
  const roadmapComp = data?.roadmap_completion ?? data?.stats?.roadmap_progress ?? 0;
  const totalXp = data?.xp ?? data?.stats?.xp ?? 0;
  const earnedBadges = data?.badges || [];
  const historyItems = data?.history || [];
  const topicBreakdown = data?.topic_breakdown || [];
  const readinessTimeline = data?.readiness_timeline || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold mb-2">
            <Activity size={14} />
            <span>Continuous Momentum • {totalXp} XP Earned</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            Progress & Achievements
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Track your readiness score over time, topic-by-topic quiz accuracy, roadmap completion, and verified skill badges.
          </p>
        </div>

        <Link 
          to="/practice" 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
        >
          <Sparkles size={14} />
          <span>Practice to Earn XP</span>
        </Link>
      </div>

      {/* ─── TOP THREE STAT CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: Readiness */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase font-bold text-slate-500 tracking-wider block mb-2">
              CareerForge Readiness
            </span>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl sm:text-5xl font-heading font-extrabold text-slate-900">
                {readiness}
              </span>
              <span className="text-slate-500 text-sm font-semibold">/ 100</span>
            </div>
            <p className="text-xs text-slate-600">
              Synthesized from your 26-point profile, academic metrics, and verified test accuracy.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Status tier:</span>
            <span className="text-emerald-700 font-bold">
              {readiness >= 75 ? 'Placement Ready' : readiness >= 50 ? 'Developing Candidate' : 'Foundation Stage'}
            </span>
          </div>
        </div>

        {/* Metric 2: Quiz Accuracy */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase font-bold text-emerald-700 tracking-wider block mb-2">
              Diagnostic Quiz Accuracy
            </span>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl sm:text-5xl font-heading font-extrabold text-emerald-600">
                {accuracy}%
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Bounded 0–100% accuracy across all attempted technical practice quizzes in DSA, SQL, and React.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Question pool:</span>
            <span className="text-slate-900 font-mono font-bold">75 Verified Questions</span>
          </div>
        </div>

        {/* Metric 3: Roadmap Completion */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase font-bold text-indigo-700 tracking-wider block mb-2">
              Roadmap Milestones Cleared
            </span>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl sm:text-5xl font-heading font-extrabold text-indigo-600">
                {roadmapComp}%
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Progression across Foundation, Core Skills, Projects, and Interview Readiness phases.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/roadmap" className="text-indigo-600 hover:underline font-bold flex items-center gap-1">
              <span>View Roadmap</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

      </div>

      {/* ─── TOPIC QUIZ BREAKDOWN & READINESS TIMELINE ────────────────────── */}
      {(topicBreakdown.length > 0 || readinessTimeline.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-7 space-y-5 shadow-soft-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-indigo-600" />
                <h3 className="font-heading font-bold text-base text-slate-900">Topic Accuracy Breakdown</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">By Track</span>
            </div>
            {topicBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">Complete a practice quiz to see topic-level accuracy.</p>
            ) : (
              <div className="space-y-4">
                {topicBreakdown.map((tb, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAFAF7] border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{tb.topic}</span>
                      <span className="font-mono text-slate-600">
                        {tb.attempts} {tb.attempts === 1 ? 'Attempt' : 'Attempts'} • <strong className="text-emerald-700">{tb.average_accuracy}% Avg</strong> (Best: {tb.best_accuracy}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${Math.min(tb.average_accuracy, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-7 space-y-5 shadow-soft-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600" />
                <h3 className="font-heading font-bold text-base text-slate-900">Readiness History</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">Assessments</span>
            </div>
            {readinessTimeline.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">Complete your profile assessment to track readiness over time.</p>
            ) : (
              <div className="space-y-3">
                {readinessTimeline.map((pt, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">Assessment Snapshot #{i + 1}</span>
                      <span className="text-[11px] font-mono text-slate-500">{pt.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-heading font-extrabold text-sm text-indigo-700 block">{pt.readiness_score} / 100</span>
                      <span className="text-[10px] font-mono text-slate-500">Model Est: {pt.model_estimate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── BADGES AND ACTIVITY TIMELINE ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Badges Showcase (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-7 space-y-6 shadow-soft-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-amber-600" />
              <h3 className="font-heading font-bold text-base text-slate-900">Skill & Milestone Badges</h3>
            </div>
            <span className="text-xs font-mono text-slate-600">
              {earnedBadges.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SYSTEM_BADGES.map(badge => {
              const matched = earnedBadges.find(b => 
                (b.name || b.title || '').toLowerCase().includes(badge.name.toLowerCase()) ||
                badge.id === (b.badge_name || '').toLowerCase()
              );
              const isUnlocked = !!matched;

              return (
                <div 
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isUnlocked 
                      ? 'bg-[#FAFAF7] border-slate-200 shadow-soft-sm' 
                      : 'bg-slate-50/70 border-slate-200/60 opacity-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isUnlocked ? `${badge.bg} ${badge.color}` : 'bg-slate-100 text-slate-400'
                  }`}>
                    {badge.icon}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block leading-snug">
                      {badge.name}
                    </span>
                    <span className="text-[11px] text-slate-600 block mt-0.5 leading-relaxed">
                      {badge.desc}
                    </span>
                    {isUnlocked && (
                      <span className="text-[10px] font-mono text-emerald-700 font-semibold block mt-1.5">
                        ✓ Unlocked ({matched.date || 'Active'})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: XP Activity Timeline (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-7 space-y-6 shadow-soft-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-amber-600" />
              <h3 className="font-heading font-bold text-base text-slate-900">Activity Log</h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Recorded Sessions</span>
          </div>

          {historyItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Activity size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-xs">No activity logged yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">Complete an assessment or quiz to generate your timeline.</p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {historyItems.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-slate-200 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {item.title || item.activity || 'Activity Completed'}
                      </span>
                      {item.activity && item.title && (
                        <span className="text-[11px] text-slate-600 block mt-0.5">
                          {item.activity}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500 block mt-1">
                        {item.date}
                      </span>
                    </div>
                  </div>

                  {item.xp > 0 && (
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg flex-shrink-0">
                      +{item.xp} XP
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
