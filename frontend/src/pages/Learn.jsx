import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Code2, Database, Layers, Server, BrainCircuit, 
  Shield, Cloud, ArrowRight, Sparkles, Clock, CheckCircle2 
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const getTopicIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('dsa') || n.includes('algorithm')) return <Code2 size={24} className="text-indigo-600" />;
  if (n.includes('database') || n.includes('sql') || n.includes('dbms')) return <Database size={24} className="text-amber-600" />;
  if (n.includes('frontend') || n.includes('react') || n.includes('ui')) return <Layers size={24} className="text-emerald-600" />;
  if (n.includes('backend') || n.includes('api')) return <Server size={24} className="text-blue-600" />;
  if (n.includes('machine learning') || n.includes('ai') || n.includes('data')) return <BrainCircuit size={24} className="text-purple-600" />;
  if (n.includes('security')) return <Shield size={24} className="text-rose-600" />;
  if (n.includes('cloud') || n.includes('aws')) return <Cloud size={24} className="text-sky-600" />;
  return <BookOpen size={24} className="text-indigo-600" />;
};

export default function Learn() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get('/learn/topics');
        setTopics(res.data || []);
      } catch (err) {
        toast.error('Unable to load learning tracks.');
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      
      {/* ─── HEADER WITH LEARNING MANIFESTO ───────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold mb-2">
            <BookOpen size={14} />
            <span>Mastery Before Testing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            Learning Tracks
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Understand the concepts, interview relevance, and time complexities first. Attempt practice quizzes once your mental models are locked in.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-soft-sm flex items-center gap-3 text-xs text-slate-700">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">Learn First, Practice Second</span>
            <span className="text-[11px] text-slate-500">16 structured concept modules across 3 core tracks</span>
          </div>
        </div>
      </div>

      {/* ─── TOPIC CARDS GRID ─────────────────────────────────────────────── */}
      {topics.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-soft-sm">
          <BookOpen size={40} className="text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Curriculum Initializing</h3>
          <p className="text-xs text-slate-600 mb-6">Complete your profile assessment to prioritize your required tracks.</p>
          <Link to="/assessment" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm">
            Take Assessment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map(topic => {
            const savedCompleted = JSON.parse(localStorage.getItem(`cf_learn_${topic.id}`) || '[]');
            const totalMods = topic.module_count || (topic.name?.includes('DSA') ? 6 : 5);
            const completedCount = Math.min(savedCompleted.length, totalMods);

            return (
              <div 
                key={topic.id} 
                className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col justify-between hover:border-indigo-400 hover:shadow-soft-md transition-all duration-300 group shadow-soft-sm"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {getTopicIcon(topic.name)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-mono font-bold text-indigo-700">
                        {totalMods} Modules
                      </span>
                      {topic.category && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono font-bold text-slate-700">
                          {topic.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-heading font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {topic.name}
                  </h3>
                  
                  <p className="text-xs text-slate-600 leading-relaxed mb-5 font-sans">
                    {topic.description || "Structured concept breakdown and coding patterns relevant for technical hiring assessments."}
                  </p>

                  {/* Track Progress Indicator */}
                  <div className="mb-5 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono text-slate-500">
                      <span>Completion</span>
                      <span className="font-bold text-slate-700">{completedCount} / {totalMods} modules</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${Math.round((completedCount / totalMods) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5 font-medium">
                    <Clock size={14} />
                    <span>{topic.estimated_time || '45 mins'}</span>
                  </span>

                  <Link 
                    to={`/learn/${topic.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <span>{completedCount > 0 ? 'Continue Track' : 'Start Learning'}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── READY TO PRACTICE CALLOUT ────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-amber-50 border border-slate-200 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-soft-sm">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase font-bold text-indigo-700 tracking-wider">
            Already confident in fundamentals?
          </span>
          <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
            Jump directly into adaptive practice quizzes.
          </h3>
          <p className="text-xs text-slate-600 max-w-lg leading-relaxed">
            Test yourself against 75+ randomized questions across DSA, SQL, and React with immediate diagnostic explanations and XP.
          </p>
        </div>

        <Link 
          to="/practice" 
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex-shrink-0"
        >
          <Sparkles size={16} />
          <span>Start Practice Quiz</span>
        </Link>
      </div>

    </div>
  );
}
