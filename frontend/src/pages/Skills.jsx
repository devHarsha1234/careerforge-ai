import React, { useEffect, useState } from 'react';
import { Target, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Skills() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analysis')
      .then(res => setAnalysis(res.data))
      .catch(() => toast.error('Unable to load skill analysis.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center bg-[#FAFAF7]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FAFAF7] border border-slate-200 flex items-center justify-center text-slate-500 mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-heading font-bold text-slate-900 mb-2">No Skill Audit Available</h2>
        <p className="text-xs text-slate-600 mb-6">Complete your baseline profile assessment to calculate your strengths and competency gaps.</p>
        <Link to="/assessment" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm">
          Take Assessment
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <div className="pb-6 border-b border-slate-200">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
          DIAGNOSTIC MATRIX
        </span>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight mt-1">
          Skill & Profile Analysis
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Strengths and priority gaps derived from your 26-point profile evaluation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strengths */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 space-y-6 shadow-soft-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-slate-900">Verified Strengths</h2>
              <span className="text-xs text-slate-600">Competitive advantages above applicant benchmarks</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {analysis.strengths?.map((strength, i) => (
              <div key={i} className="bg-[#FAFAF7] border border-slate-200 p-4 rounded-2xl flex items-center gap-3 text-xs text-slate-800">
                <div className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gaps */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7 space-y-6 shadow-soft-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <Target size={20} />
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-slate-900">Priority Skill Gaps</h2>
              <span className="text-xs text-slate-600">Prioritized target areas to elevate placement readiness</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {analysis.skill_gaps?.map((gap, i) => (
              <div key={i} className="bg-[#FAFAF7] border border-slate-200 p-5 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <h3 className="font-bold text-slate-900 text-sm">{gap.topic}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                    {gap.priority} Priority
                  </span>
                </div>
                <div className="flex items-center text-xs text-slate-600 font-mono">
                  <span className="text-amber-700 font-semibold">{gap.current_level}</span>
                  <ChevronRight size={14} className="mx-1.5 text-slate-400" />
                  <span className="text-emerald-700 font-semibold">{gap.target_level}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{gap.recommended_action}</p>
                <div className="pt-2">
                  <Link to="/learn" className="text-indigo-600 hover:underline text-xs font-bold inline-flex items-center gap-1">
                    <span>Study concept modules</span>
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
