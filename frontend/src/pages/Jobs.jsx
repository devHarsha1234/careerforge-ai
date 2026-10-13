import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, MapPin, CheckCircle2, AlertCircle, Loader2, 
  ChevronRight, Sparkles 
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        const sorted = (res.data || []).sort((a, b) => b.match_percentage - a.match_percentage);
        setJobs(sorted);
      } catch (err) {
        toast.error('Failed to load job matches.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-2">
            <Briefcase size={14} />
            <span>Skill Match Benchmark</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            Jobs That Match Your Skills
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Role benchmarks showing your normalized skill overlap against industry requirements, plus the exact missing skills to study next.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-soft-sm transition-colors"
          >
            Update My Skills
          </Link>
        </div>
      </div>

      {/* ─── JOB CARDS GRID ───────────────────────────────────────────────── */}
      {jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-soft-sm">
          <Briefcase size={40} className="text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Matching Roles Found</h3>
          <p className="text-xs text-slate-600 mb-6">Complete your profile or add technical skills to calculate your role overlap.</p>
          <Link to="/profile" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm">
            Update Profile Skills
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => {
            const isHigh = job.match_percentage >= 70;
            const isMid = job.match_percentage >= 40;

            const badgeColor = isHigh 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : isMid 
              ? 'bg-amber-50 text-amber-700 border-amber-200' 
              : 'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <div 
                key={job.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-400 transition-all duration-300 shadow-soft-sm"
              >
                <div>
                  
                  {/* Top: Monogram & Match Pill */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#FAFAF7] border border-slate-200 flex items-center justify-center font-heading font-bold text-slate-900 text-sm">
                        {job.company?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-base text-slate-900 leading-snug">
                          {job.title}
                        </h3>
                        <span className="text-xs text-slate-600 font-medium">
                          {job.company}
                        </span>
                      </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-xl border text-xs font-mono font-bold flex-shrink-0 ${badgeColor}`}>
                      {job.match_percentage}% {job.match_label || 'Skill Match'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-5 font-mono">
                    <MapPin size={13} />
                    <span>{job.location || 'India'}</span>
                  </div>

                  {/* Skills lists */}
                  <div className="space-y-4 mb-6">
                    {/* Matched */}
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 tracking-wider block mb-2">
                        Matched Skills ({job.matched_skills?.length || 0})
                      </span>
                      {job.matched_skills?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {job.matched_skills.map((s, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                              <CheckCircle2 size={11} /> {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Add skills in Profile or Resume Builder to match</span>
                      )}
                    </div>

                    {/* Missing */}
                    {job.missing_skills?.length > 0 && (
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-amber-700 tracking-wider block mb-2">
                          Skills To Learn Next ({job.missing_skills.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {job.missing_skills.map((s, i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200">
                              <AlertCircle size={11} /> {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link 
                    to="/learn"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 text-xs font-bold transition-colors"
                  >
                    <span>Learn Missing Skills</span>
                    <ChevronRight size={14} />
                  </Link>
                  <Link
                    to="/practice"
                    className="px-3.5 py-2.5 rounded-xl bg-[#FAFAF7] hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
                    title="Practice Quizzes"
                  >
                    <Sparkles size={14} />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
