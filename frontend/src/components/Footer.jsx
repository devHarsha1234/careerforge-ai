import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-violet to-brand-cobalt flex items-center justify-center text-xs font-bold text-white shadow-sm">
                CF
              </div>
              <span className="font-heading font-extrabold text-xl text-slate-900 tracking-tight">CareerForge AI</span>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              The student career operating system. Evaluate your true profile, identify high-impact skill gaps, master core concepts, and build demonstrable placement readiness.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>26-Feature Profile Intelligence • Scikit-Learn Model Engine • Verifiable Progress</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-900">Product Loop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/assessment" className="hover:text-indigo-600 transition-colors">Career Assessment</Link></li>
              <li><Link to="/learn" className="hover:text-indigo-600 transition-colors">Learning Hub</Link></li>
              <li><Link to="/practice" className="hover:text-indigo-600 transition-colors">Interactive Practice</Link></li>
              <li><Link to="/roadmap" className="hover:text-indigo-600 transition-colors">Career Roadmap</Link></li>
              <li><Link to="/jobs" className="hover:text-indigo-600 transition-colors">Skill-Match Jobs</Link></li>
              <li><Link to="/resume" className="hover:text-indigo-600 transition-colors">ATS Resume Builder</Link></li>
            </ul>
          </div>

          {/* Platform & Transparency */}
          <div className="space-y-3">
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-900">Platform Transparency</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/how-it-works" className="hover:text-indigo-600 transition-colors">How Scoring Works</Link></li>
              <li className="text-xs leading-relaxed text-slate-500">
                Placement predictions represent statistical model estimates from historical training patterns and do not constitute legal guarantees.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} CareerForge AI. All rights reserved.</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">CF-AI-PRODUCT-2026</span>
          </div>
          <div className="text-slate-600 font-medium">
            Build your skills. Shape your career. Get placement-ready.
          </div>
        </div>
      </div>
    </footer>
  );
}
