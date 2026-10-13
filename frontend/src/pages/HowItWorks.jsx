import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, Target, BookOpen, Sparkles, TrendingUp, 
  Briefcase, ArrowRight, ShieldCheck, CheckCircle2 
} from 'lucide-react';

const STEPS = [
  { 
    id: '01', 
    title: 'Assess Profile', 
    desc: 'Complete an honest 26-point profile evaluation across academics, coding consistency, past project portfolio, and interview readiness.', 
    icon: <BrainCircuit size={28}/>, 
    color: 'text-indigo-600', 
    bg: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    sub: 'DecisionTree Classifier Pipeline'
  },
  { 
    id: '02', 
    title: 'Analyze Gaps', 
    desc: 'Our model analyzes your input against historical placement datasets, calculating your CareerForge Readiness score and pinpointing high-impact gaps.', 
    icon: <Target size={28}/>, 
    color: 'text-brand-coral', 
    bg: 'bg-amber-50 text-amber-700 border border-amber-200',
    sub: 'Benchmark vs Accepted Candidates'
  },
  { 
    id: '03', 
    title: 'Learn Concepts', 
    desc: 'Study curated concept modules in DSA, SQL, and React. Grasp foundational intuition, code patterns, and common interview traps before testing.', 
    icon: <BookOpen size={28}/>, 
    color: 'text-brand-emerald', 
    bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    sub: 'Learn First, Practice Second'
  },
  { 
    id: '04', 
    title: 'Adaptive Practice', 
    desc: 'Challenge randomized 5-question test sessions from our 75+ verified database pool with instant answer diagnostics and continuous XP.', 
    icon: <Sparkles size={28}/>, 
    color: 'text-brand-amber', 
    bg: 'bg-brand-amber/15',
    sub: 'Zero Duplicate Questions'
  },
  { 
    id: '05', 
    title: 'Career Ready', 
    desc: 'Track milestones, unlock verifiable skill badges, view honest skill-overlap job matches, and export an ATS-optimized PDF resume.', 
    icon: <Briefcase size={28}/>, 
    color: 'text-brand-cyan', 
    bg: 'bg-brand-cyan/15',
    sub: 'ReportLab PDF + Skill Matching'
  },
];

export default function HowItWorks() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-20">
      
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="text-center max-w-2xl mx-auto space-y-3 relative">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-indigo-600 border border-brand-violet/30 text-xs font-semibold">
          <ShieldCheck size={14} />
          <span>Systematic Methodology</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
          How CareerForge AI Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-sans leading-relaxed">
          From fragmented study to demonstrable placement readiness. Here is the exact product loop powering your preparation.
        </p>
      </div>

      {/* ─── 5-STEP JOURNEY TIMELINE ──────────────────────────────────────── */}
      <div className="space-y-12 sm:space-y-20 relative">
        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-px w-0.5 bg-slate-200 z-0" />

        {STEPS.map((step, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5 }}
              className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16 relative z-10`}
            >
              <div className={`w-full md:w-1/2 flex ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-soft-md max-w-md w-full hover:border-indigo-400 transition-all">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${step.bg} ${step.color}`}>
                    {step.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-700 tracking-wider block mb-1">
                    {step.sub}
                  </span>
                  <h3 className="text-xl font-heading font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Center Timeline Badge */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#FAFAF7] border-2 border-slate-200 items-center justify-center text-xs font-mono font-bold text-slate-900 shadow-soft-sm z-20">
                {step.id}
              </div>

              <div className="hidden md:block w-full md:w-1/2" />
            </motion.div>
          );
        })}
      </div>

      {/* ─── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-soft-sm">
        <h3 className="text-2xl font-heading font-extrabold text-slate-900">
          Ready to experience the loop firsthand?
        </h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Start with your 26-point profile audit and unlock your personalized CareerForge dashboard today.
        </p>
        <div className="pt-2">
          <Link 
            to="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <span>Start Building My Career Plan</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

    </div>
  );
}
