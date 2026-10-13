import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ShieldCheck, Sparkles, BrainCircuit, Target, BookOpen, 
  CheckCircle2, AlertCircle, Compass, Briefcase, Award, Zap, Code2, 
  Database, ChevronRight, Layers, TrendingUp, Check, Activity, Terminal
} from 'lucide-react';

export default function Landing() {
  const [practiceAnswer, setPracticeAnswer] = useState(null);
  const [activePreviewTab, setActivePreviewTab] = useState('assessment');

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#FAFAF7] text-slate-900 selection:bg-indigo-100 overflow-x-hidden">
      
      {/* ─── 1. HERO SECTION — EXACT PROVIDED CAREER SUCCESS VIDEO ───────── */}
      <section 
        className="relative w-full min-h-[85vh] lg:min-h-[90vh] flex items-center overflow-hidden border-b border-slate-200 bg-[#FAFAF7]"
        aria-label="Hero Introduction"
      >

        {/* ── FULL-WIDTH BACKGROUND VIDEO CONTAINER ── */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/assets/hero-career-poster.jpg"
            aria-hidden="true"
            className="w-full h-full object-cover object-[center_25%] lg:object-[60%_center]"
          >
            <source src="/assets/hero-career.mp4" type="video/mp4" />
            <source src="/assets/careerforge-hero.mp4" type="video/mp4" />
          </video>

          {/* ── CINEMATIC DIRECTIONAL OVERLAYS (EDITORIAL SAAS + CAREER IMAGERY) ── */}
          {/* Layer 1: Left reading mask (strong left for text, clear feather to right so video stays clearly visible) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAF7] via-[#FAFAF7]/75 via-45% to-transparent to-80% z-10" />

          {/* Layer 2: Subtle vertical blend for smooth integration into navbar and next section */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAF7]/70 via-transparent to-[#FAFAF7] z-10" />
        </div>

        {/* ── HERO FOREGROUND CONTENT ── */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 z-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* ── LEFT-SIDE CONTENT AREA: Editorial Value Proposition ── */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6">

              {/* Eyebrow badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-soft-sm"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-700 font-heading">
                  CAREER INTELLIGENCE FOR STUDENTS
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
                className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-slate-900 tracking-tight leading-[1.08] text-balance drop-shadow-sm"
              >
                Know where you stand. <br />
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900 bg-clip-text text-transparent">
                  Know what comes next.
                </span>
              </motion.h1>

              {/* Supporting Copy */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16, ease: 'easeOut' }}
                className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-sans"
              >
                Assess your readiness, identify the skills holding you back, and turn them into a personalized plan for placement preparation.
              </motion.p>

              {/* Call to Actions */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1 w-full sm:w-auto"
              >
                <Link
                  to="/signup"
                  aria-label="Build My Career Plan - Sign up for CareerForge AI"
                  className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-soft-md hover:shadow-soft-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <span>Build My Career Plan</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/how-it-works"
                  aria-label="See how CareerForge AI works"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white/95 hover:bg-white border border-slate-300 text-slate-800 hover:text-slate-950 font-bold text-base shadow-soft-sm transition-all backdrop-blur-sm"
                >
                  See How It Works
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="pt-5 border-t border-slate-200/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600 font-medium"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>26-feature assessment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>Learn before practice</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>Personalized career roadmap</span>
                </div>
              </motion.div>

            </div>

            {/* ── RIGHT-SIDE VISUAL EMPHASIS: Elegant Floating Product Preview Card ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative hidden sm:block"
            >
              <div className="p-6 rounded-2xl bg-white/90 backdrop-blur-lg border border-white/80 shadow-soft-lg max-w-sm ml-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-500">
                    CAREER READINESS
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                
                <div className="py-3.5 space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Current Position</span>
                    <span className="text-xs font-bold text-slate-800">Software Development</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-600 block font-bold">Skill Gap Identified</span>
                    <span className="text-xs font-semibold text-slate-700">DSA / Problem Solving</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-600 block font-bold">Next Recommended Focus</span>
                    <span className="text-xs font-semibold text-slate-700">Binary Search & Arrays</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Assess → Learn → Practice</span>
                  <span className="text-indigo-600 font-bold font-sans">Active Loop</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

      </section>

      {/* ─── 2. THE PROBLEM SECTION ────────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-700 font-heading">
            The Student Dilemma
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 mt-2 tracking-tight">
            Most students know they want a good career.<br />
            They don't know what to improve first.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Without diagnostic precision, preparation turns into endless tutorial hopping and random practice without measurable progression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-soft-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-5 font-bold text-lg">
              01
            </div>
            <h3 className="text-lg font-heading font-bold text-slate-900 mb-2">
              Unclear Skill Gaps
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Students guess what recruiters want instead of knowing where their personal academic, algorithmic, or project shortcomings actually lie.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-soft-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5 font-bold text-lg">
              02
            </div>
            <h3 className="text-lg font-heading font-bold text-slate-900 mb-2">
              Random, Disconnected Learning
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Jumping into quizzes or YouTube courses without structured milestones leads to cognitive overload and fast forgetting.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-soft-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-5 font-bold text-lg">
              03
            </div>
            <h3 className="text-lg font-heading font-bold text-slate-900 mb-2">
              No Bridge Between Practice & Placement
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Solving questions in isolation doesn't translate into ATS resumes, verified competency proof, or confident technical interview responses.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 3. HOW CAREERFORGE WORKS (5-STEP CONNECTED PATHWAY) ─────────── */}
      <section className="border-y border-slate-200 bg-white py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-700 font-heading">
              The Product Pathway
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 mt-2 tracking-tight">
              How CareerForge AI works.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3">
              A continuous, feedback-driven progression loop designed for real engineering readiness.
            </p>
          </div>

          {/* 5-Step Visual Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            
            <div className="bg-[#FAFAF7] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-400 hover:shadow-soft-sm transition-all">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-700 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 inline-block mb-3">
                  01 ASSESS
                </span>
                <h3 className="text-sm font-heading font-bold text-slate-900">26-Point Profile Audit</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Understand your academics, code fluency, projects, and career targets.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
                Baseline discovery
              </div>
            </div>

            <div className="bg-[#FAFAF7] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-400 hover:shadow-soft-sm transition-all">
              <div>
                <span className="text-xs font-mono font-bold text-amber-700 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 inline-block mb-3">
                  02 ANALYZE
                </span>
                <h3 className="text-sm font-heading font-bold text-slate-900">Pinpoint Skill Gaps</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Identify exact topics dragging down your placement readiness score.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
                Prioritized targets
              </div>
            </div>

            <div className="bg-[#FAFAF7] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-400 hover:shadow-soft-sm transition-all">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-700 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 inline-block mb-3">
                  03 LEARN
                </span>
                <h3 className="text-sm font-heading font-bold text-slate-900">Study Concept Modules</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Master fundamentals, Big-O analysis, and interview patterns first.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
                Learn-first model
              </div>
            </div>

            <div className="bg-[#FAFAF7] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-400 hover:shadow-soft-sm transition-all">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-700 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 inline-block mb-3">
                  04 PRACTICE
                </span>
                <h3 className="text-sm font-heading font-bold text-slate-900">Diagnostic Quizzes</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Lock in retention with 75+ randomized questions and instant feedback.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
                Verified XP & accuracy
              </div>
            </div>

            <div className="bg-[#FAFAF7] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-400 hover:shadow-soft-sm transition-all">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-700 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 inline-block mb-3">
                  05 PROGRESS
                </span>
                <h3 className="text-sm font-heading font-bold text-slate-900">Target Role Readiness</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Match real job skills, export ATS resumes, and build confidence.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
                Placement certified
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 4. CAREER INTELLIGENCE & TRANSPARENCY ────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-soft-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono uppercase font-bold text-indigo-700 tracking-wider">
                Ethical Scoring Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
                Clear distinction between statistical ML models and your CareerForge Readiness Score.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Many tools present opaque percentages that mislead students. At CareerForge, we believe in radical transparency:
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                    1. CareerForge Readiness Score (0 – 100)
                  </h4>
                  <p className="text-xs text-slate-700 mt-1">
                    Your real-time composite operational score. Combines your academic standing, actual verified quiz accuracy, completed curriculum modules, and profile completeness.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    2. Model Estimate (Statistical Benchmark)
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    An objective pattern match computed by our scikit-learn Decision Tree pipeline against historical placement outcomes. <strong>Clearly labeled as a statistical training benchmark — not a legal guarantee.</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#FAFAF7] border border-slate-200 rounded-2xl p-6 text-center space-y-4">
              <ShieldCheck size={36} className="text-emerald-600 mx-auto" />
              <h3 className="text-base font-heading font-bold text-slate-900">
                Placement Ethics Commitment
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every calculation is reproducible and grounded in your own active participation. You can improve your readiness score at any time by studying modules and acing practice sets.
              </p>
              <Link 
                to="/how-it-works" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                <span>Read Full Methodology</span>
                <ChevronRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 5. LEARN BEFORE PRACTICE & INTERACTIVE SIMULATOR ─────────────── */}
      <section className="py-20 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-700 font-heading">
                Core Differentiator
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
                Learn first. Practice second.
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                We never throw you into quizzes to guess answers. Review structured mental models, time complexity trade-offs, and common interviewer tricks before testing.
              </p>
              
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">16 In-Depth Concept Modules</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Big-O, Arrays, Sliding Window, Relational JOINs, ACID, and React Hooks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mt-0.5">
                    <Check size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Instant Diagnostic Explanations</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Every option details the architectural rationale, eliminating guesswork.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/learn" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700">
                  <span>Explore Curriculum Modules</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Interactive Practice Card */}
            <div className="lg:col-span-7">
              <div className="bg-[#FAFAF7] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-sm">
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-200">
                      DSA • Arrays & Complexity
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Interactive Demo</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-600 flex items-center gap-1">
                    <Sparkles size={14} /> +10 XP
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900 mb-5 leading-snug">
                  What is the worst-case time complexity of accessing an element by index in a contiguous array?
                </h3>

                <div className="space-y-2.5 mb-5">
                  {[
                    { id: 'A', text: 'O(1) — Direct offset memory computation', correct: true },
                    { id: 'B', text: 'O(n) — Sequential pointer traversal', correct: false },
                    { id: 'C', text: 'O(log n) — Binary subdivision search', correct: false },
                    { id: 'D', text: 'O(n²) — Nested address calculation', correct: false },
                  ].map((option) => {
                    const isSelected = practiceAnswer === option.id;
                    let cardStyle = "bg-white border-slate-200 text-slate-700 hover:border-slate-300";
                    
                    if (practiceAnswer !== null) {
                      if (option.correct) {
                        cardStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold";
                      } else if (isSelected && !option.correct) {
                        cardStyle = "bg-rose-50 border-rose-300 text-rose-800 font-medium";
                      }
                    }

                    return (
                      <button
                        key={option.id}
                        onClick={() => setPracticeAnswer(option.id)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${cardStyle}`}
                      >
                        <span>{option.text}</span>
                        {practiceAnswer !== null && option.correct && (
                          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {practiceAnswer && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-soft-sm"
                  >
                    <p className="font-bold text-slate-900 mb-1">
                      {practiceAnswer === 'A' ? '✓ Correct Answer!' : '✕ Not Quite.'}
                    </p>
                    Arrays allocate contiguous memory blocks. The hardware calculates element memory addresses in O(1) constant time via direct memory offset indexing.
                  </motion.div>
                )}

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 6. CURRICULUM CATALOG TRACKS ─────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-700 font-heading">
              Engineering Curriculum
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 mt-1 tracking-tight">
              Learning Tracks
            </h2>
          </div>
          <Link to="/learn" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1">
            <span>View all 16 modules</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Track 1: DSA */}
          <div className="bg-white border border-slate-200 rounded-3xl p-7 hover:border-indigo-400 hover:shadow-soft-md transition-all flex flex-col justify-between shadow-soft-sm">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-5">
                <Code2 size={24} />
              </div>
              <span className="text-[11px] font-mono uppercase font-bold text-indigo-700 tracking-wider">
                Algorithms & Coding
              </span>
              <h3 className="text-xl font-heading font-bold text-slate-900 mt-1">Data Structures & Algorithms</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Big-O Analysis, Two-Pointers, Sliding Window, Stacks & Queues, Binary Search, and Tree Traversals (BFS & DFS).
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">6 Modules</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">25 Questions</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-mono font-bold">Priority Track</span>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link to="/learn/1" className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors">
                Start DSA Track
              </Link>
            </div>
          </div>

          {/* Track 2: SQL */}
          <div className="bg-white border border-slate-200 rounded-3xl p-7 hover:border-indigo-400 hover:shadow-soft-md transition-all flex flex-col justify-between shadow-soft-sm">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5">
                <Database size={24} />
              </div>
              <span className="text-[11px] font-mono uppercase font-bold text-amber-700 tracking-wider">
                Database Systems
              </span>
              <h3 className="text-xl font-heading font-bold text-slate-900 mt-1">SQL & Relational DBMS</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Relational Modeling, INNER/LEFT Joins, Window Functions, 1NF-3NF Normalization, and ACID Transaction Management.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">5 Modules</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">25 Questions</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold">Backend Ready</span>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link to="/learn/2" className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors">
                Start SQL Track
              </Link>
            </div>
          </div>

          {/* Track 3: React */}
          <div className="bg-white border border-slate-200 rounded-3xl p-7 hover:border-indigo-400 hover:shadow-soft-md transition-all flex flex-col justify-between shadow-soft-sm">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-5">
                <Layers size={24} />
              </div>
              <span className="text-[11px] font-mono uppercase font-bold text-emerald-700 tracking-wider">
                Frontend Architecture
              </span>
              <h3 className="text-xl font-heading font-bold text-slate-900 mt-1">Modern React & Web</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Virtual DOM Reconciliation, useState & useEffect Lifecycle, Component Communication, Context API, and Custom Hooks.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">5 Modules</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">25 Questions</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono font-bold">Web Tier</span>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link to="/learn/3" className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors">
                Start React Track
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 7. INTERACTIVE PRODUCT PREVIEW ───────────────────────────────── */}
      <section className="py-20 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-700 font-heading">
              End-to-End Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 mt-1 tracking-tight">
              A Connected Product Experience
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Every step directly unlocks and improves the next stage in your placement readiness.
            </p>
          </div>

          {/* Interactive Flow Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { id: 'assessment', label: '1. Assessment' },
              { id: 'skillgap', label: '2. Skill Gaps' },
              { id: 'learning', label: '3. Learn Module' },
              { id: 'quiz', label: '4. Practice Arena' },
              { id: 'resume', label: '5. ATS Resume' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActivePreviewTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activePreviewTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-soft-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Preview Panel Body */}
          <div className="bg-[#FAFAF7] border border-slate-200 rounded-3xl p-8 max-w-4xl mx-auto shadow-soft-sm">
            {activePreviewTab === 'assessment' && (
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase font-bold text-indigo-700">Step 01 Discovery</span>
                <h3 className="text-xl font-heading font-bold text-slate-900">26-Point Profile Audit</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluates CGPA, attendance, backlogs, past projects, hackathons, and mock interview ratings without complicated ML jargon.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-center"><span className="block text-xs font-bold text-slate-900">Academics</span><span className="text-[10px] text-slate-500">CGPA & Record</span></div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-center"><span className="block text-xs font-bold text-slate-900">Coding</span><span className="text-[10px] text-slate-500">Aptitude & Speed</span></div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-center"><span className="block text-xs font-bold text-slate-900">Projects</span><span className="text-[10px] text-slate-500">GitHub & Major</span></div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-center"><span className="block text-xs font-bold text-slate-900">Interviews</span><span className="text-[10px] text-slate-500">Soft Skills & Mock</span></div>
                </div>
              </div>
            )}

            {activePreviewTab === 'skillgap' && (
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-700">Step 02 Diagnostics</span>
                <h3 className="text-xl font-heading font-bold text-slate-900">Pinpoint Weaknesses Before Interviewers Do</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Clear visual priority list showing exact gaps between your current level and the target hiring benchmark.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">Data Structures & Algorithms</span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">Gap: -17%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">SQL Normalization & Indexing</span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">Gap: -12%</span>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'learning' && (
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase font-bold text-indigo-700">Step 03 Preparation</span>
                <h3 className="text-xl font-heading font-bold text-slate-900">Deep Conceptual Mastery</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In-depth markdown lessons complete with real code snippets, time & space complexity proofs, and interview traps.
                </p>
                <div className="p-4 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800 space-y-1">
                  <span className="text-indigo-600 font-bold"># Big-O Complexity Analysis</span>
                  <p className="text-slate-600 font-sans text-[11px]">Arrays provide O(1) indexed reads because memory addresses are pre-computed.</p>
                </div>
              </div>
            )}

            {activePreviewTab === 'quiz' && (
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-700">Step 04 Validation</span>
                <h3 className="text-xl font-heading font-bold text-slate-900">Adaptive Diagnostic Quizzes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Randomized 5-question test sessions with instant answer explanations, strict accuracy bounding (0-100%), and XP awards.
                </p>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-700">✓ Diagnostic explanation revealed upon selection</span>
                  <span className="text-amber-600 font-bold">+10 XP</span>
                </div>
              </div>
            )}

            {activePreviewTab === 'resume' && (
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase font-bold text-indigo-700">Step 05 Execution</span>
                <h3 className="text-xl font-heading font-bold text-slate-900">Automated ATS PDF Resume</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Compiled via ReportLab Platypus directly from your verified profile, assessment milestones, and coursework records.
                </p>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-800 font-bold">Single-page ATS-formatted PDF</span>
                  <span className="text-indigo-600 font-bold">Instant Download</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ─── 8. TRUST & TECHNICAL FOUNDATION ──────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-700 font-heading">
            Engineering Integrity
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 mt-2 tracking-tight">
            Built on verifiable technology.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center shadow-soft-sm">
            <CheckCircle2 size={20} className="text-emerald-600 mx-auto mb-2" />
            <span className="block text-xs font-bold text-slate-900">26-Feature ML Pipeline</span>
            <span className="text-[10px] text-slate-500">Scikit-learn model</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center shadow-soft-sm">
            <CheckCircle2 size={20} className="text-emerald-600 mx-auto mb-2" />
            <span className="block text-xs font-bold text-slate-900">ReportLab Platypus</span>
            <span className="text-[10px] text-slate-500">ATS PDF generator</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center shadow-soft-sm">
            <CheckCircle2 size={20} className="text-emerald-600 mx-auto mb-2" />
            <span className="block text-xs font-bold text-slate-900">JWT Authentication</span>
            <span className="text-[10px] text-slate-500">Secure user isolation</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 text-center shadow-soft-sm">
            <CheckCircle2 size={20} className="text-emerald-600 mx-auto mb-2" />
            <span className="block text-xs font-bold text-slate-900">75+ Question Bank</span>
            <span className="text-[10px] text-slate-500">Verified zero-leakage</span>
          </div>
        </div>
      </section>

      {/* ─── 9. FINAL CALL TO ACTION ──────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="max-w-3xl mx-auto p-10 sm:p-14 rounded-3xl bg-white border border-slate-200 shadow-soft-lg relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/50 blur-[100px] rounded-full pointer-events-none" />

          <span className="text-xs font-mono uppercase tracking-widest text-indigo-700 font-bold inline-block mb-3">
            STOP GUESSING WHAT TO LEARN NEXT
          </span>
          
          <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
            Build a career plan around <br />
            <span className="text-indigo-600">where you actually are.</span>
          </h2>
          
          <p className="text-slate-600 text-sm sm:text-base mt-4 max-w-lg mx-auto leading-relaxed font-sans">
            Start with your 26-point profile audit. Discover exactly what you're missing, study the core concepts, and track your progress to graduation.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3.5">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Start My Career Plan</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              to="/how-it-works" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-base transition-colors shadow-soft-sm"
            >
              See How It Works
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
