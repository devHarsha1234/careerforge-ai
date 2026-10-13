import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Loader2, 
  Map, Sparkles, ChevronRight, ChevronDown, ChevronUp, Info 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Roadmap() {
  const [items, setItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const res = await api.get('/roadmap');
      const list = Array.isArray(res.data) ? res.data : (res.data.items || []);
      setItems(list);
      const currentPhase = list.find(i => i.status !== 'Completed');
      if (currentPhase) setExpandedId(currentPhase.id);
    } catch (err) {
      toast.error('Unable to load roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (id) => {
    try {
      await api.post('/roadmap/progress', { item_id: id, status: 'Completed' });
      toast.success('Milestone marked as complete! 🎉');
      fetchRoadmap();
    } catch (err) {
      toast.error('Failed to update roadmap milestone.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const completedCount = items.filter(i => i.status === 'Completed').length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-2">
            <Map size={14} />
            <span>Personalized Preparation Path</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            Your Career Roadmap
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Generated from your 26-point assessment, target role, and identified skill gaps to take you from core foundations to placement readiness.
          </p>
        </div>

        {/* Global Progress Gauge */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:w-64 shadow-soft-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span>Overall Completion</span>
            <span className="font-mono text-emerald-700 text-sm">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block text-right font-mono">
            {completedCount} of {items.length} Phases Completed
          </span>
        </div>
      </div>

      {/* ─── ROADMAP ITEMS ────────────────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-soft-sm">
          <Map size={40} className="text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Roadmap Generated</h3>
          <p className="text-xs text-slate-600 mb-6">Complete your profile assessment to derive your personalized milestone phases.</p>
          <Link to="/assessment" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm">
            Start Assessment
          </Link>
        </div>
      ) : (
        <div className="relative space-y-6 before:absolute before:inset-0 before:left-4 sm:before:left-6 before:w-0.5 before:bg-slate-200 before:z-0">
          {items.map((item, idx) => {
            const isCompleted = item.status === 'Completed' || item.stage === 'Completed';
            const isCurrent = !isCompleted && (item.stage === 'Current' || item.status === 'In Progress' || item.status === 'Recommended' || idx === completedCount);
            const stageLabel = isCompleted ? 'Completed' : isCurrent ? 'Current Focus' : 'Upcoming';
            const isExpanded = expandedId === item.id || isCurrent;

            let nodeColor = "bg-white border-slate-300 text-slate-500";
            if (isCompleted) nodeColor = "bg-emerald-600 border-emerald-600 text-white";
            else if (isCurrent) nodeColor = "bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100";

            return (
              <div key={item.id || idx} className="relative pl-10 sm:pl-16 z-10">
                
                {/* Timeline node icon */}
                <div className={`absolute left-1 sm:left-3 top-6 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${nodeColor}`}>
                  {isCompleted ? <CheckCircle2 size={14} /> : idx + 1}
                </div>

                {/* Milestone Card */}
                <div className={`bg-white border rounded-3xl p-6 sm:p-7 transition-all ${
                  isCompleted ? 'border-slate-200' : isCurrent ? 'border-indigo-300 shadow-soft-md' : 'border-slate-200 shadow-soft-sm'
                }`}>
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-lg bg-[#FAFAF7] text-slate-700 border border-slate-200">
                        {item.phase || `PHASE 0${idx + 1}`}
                      </span>
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        isCompleted 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : isCurrent 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {stageLabel}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  <h3 className={`text-lg sm:text-xl font-heading font-bold mb-2 ${isCompleted ? 'text-slate-600' : 'text-slate-900'}`}>
                    {item.title}
                  </h3>

                  {/* WHY THIS PHASE IS RECOMMENDED */}
                  {item.why_recommended && (
                    <div className="my-3 p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                      <Info size={15} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-mono font-bold uppercase text-[10px] text-indigo-800 block mb-0.5">
                          Why This Phase Is Recommended
                        </span>
                        <span>{item.why_recommended}</span>
                      </div>
                    </div>
                  )}

                  {/* Topic Tags */}
                  {isExpanded && item.topics && item.topics.length > 0 && (
                    <div className="my-4">
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block mb-2">
                        Key Focus Areas ({item.topics.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {item.topics.map((t, i) => (
                          <span key={i} className="px-3 py-1 rounded-xl bg-[#FAFAF7] border border-slate-200 text-xs text-slate-800 font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <Link 
                        to="/learn" 
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                      >
                        <span>Study Concept Modules</span>
                        <ChevronRight size={14} />
                      </Link>
                      <Link 
                        to="/practice" 
                        className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors flex items-center gap-1"
                      >
                        <Sparkles size={13} />
                        <span>Practice Quiz</span>
                      </Link>
                    </div>

                    {!isCompleted ? (
                      <button
                        onClick={() => markComplete(item.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 size={14} />
                        <span>Mark Phase Complete</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Completed
                      </span>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
