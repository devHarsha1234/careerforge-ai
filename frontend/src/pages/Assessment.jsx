import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, BrainCircuit, 
  Sparkles, GraduationCap, Code2, Briefcase, Award, Compass, AlertCircle 
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const INITIAL_DATA = {
  // Step 1: Academic Foundation
  age: 21,
  gender: 'Male',
  cgpa: 8.2,
  attendance_percentage: 88,
  backlogs: 0,

  // Step 2: Technical Capability
  coding_score: 75,
  aptitude_score: 70,
  technical_score: 72,
  communication_score: 78,
  soft_skills_score: 75,
  coding_platform_score: 70,

  // Step 3: Experience & Projects
  projects_count: 3,
  major_projects: 1,
  github_projects: 5,
  internships_count: 1,
  internship_months: 3,
  training_hours: 80,

  // Step 4: Professional Presence
  certifications_count: 2,
  hackathons_participated: 1,
  hackathons_won: 0,
  linkedin_score: 75,
  resume_score: 72,
  leadership_score: 70,
  extracurricular_score: 65,
  mock_interview_score: 70,

  // Step 5: Career Preferences
  preferred_domain: 'Software Development',
};

const STEPS = [
  { id: 'academics', title: '1. Academic Foundation', desc: 'Your academic record, consistency, and standing', icon: <GraduationCap size={16} /> },
  { id: 'technical', title: '2. Technical Capability', desc: 'Coding, problem solving, core CS, and communication', icon: <Code2 size={16} /> },
  { id: 'experience', title: '3. Experience & Projects', desc: 'Projects built, GitHub work, and internship exposure', icon: <Briefcase size={16} /> },
  { id: 'presence', title: '4. Professional Presence', desc: 'Certifications, hackathons, resume, and mock interviews', icon: <Award size={16} /> },
  { id: 'preferences', title: '5. Career Preferences', desc: 'Select your target domain for role benchmarking', icon: <Compass size={16} /> },
];

const DOMAINS = [
  'Software Development',
  'Data Science',
  'AI/ML',
  'Cloud Computing',
  'Cyber Security',
  'Business Analytics'
];

export default function Assessment() {
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const savedStep = localStorage.getItem('careerforge_assessment_step');
      return savedStep ? Math.min(Math.max(Number(savedStep), 0), STEPS.length - 1) : 0;
    } catch {
      return 0;
    }
  });
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('careerforge_assessment_draft');
      return saved ? { ...INITIAL_DATA, ...JSON.parse(saved) } : INITIAL_DATA;
    } catch {
      return INITIAL_DATA;
    }
  });
  const [validationError, setValidationError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setValidationError('');
    setFormData(prev => {
      const next = {
        ...prev,
        [name]: type === 'number' || type === 'range' ? (value === '' ? '' : Number(value)) : value
      };
      try {
        localStorage.setItem('careerforge_assessment_draft', JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  };

  const validateStep = (stepIndex) => {
    if (stepIndex === 0) {
      const age = Number(formData.age);
      const cgpa = Number(formData.cgpa);
      const att = Number(formData.attendance_percentage);
      const backlogs = Number(formData.backlogs);
      if (isNaN(age) || age < 16 || age > 100) return 'Age must be between 16 and 100.';
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) return 'CGPA must be between 0.0 and 10.0.';
      if (isNaN(att) || att < 0 || att > 100) return 'Attendance percentage must be between 0% and 100%.';
      if (isNaN(backlogs) || backlogs < 0) return 'Active backlogs cannot be negative.';
    }
    if (stepIndex === 1) {
      const scoreFields = ['coding_score', 'aptitude_score', 'technical_score', 'communication_score', 'soft_skills_score', 'coding_platform_score'];
      for (const f of scoreFields) {
        const val = Number(formData[f]);
        if (isNaN(val) || val < 0 || val > 100) return 'All skill scores must be between 0 and 100.';
      }
    }
    if (stepIndex === 2) {
      const projects = Number(formData.projects_count);
      const major = Number(formData.major_projects);
      const github = Number(formData.github_projects);
      const internships = Number(formData.internships_count);
      const months = Number(formData.internship_months);
      const hours = Number(formData.training_hours);
      if (projects < 0 || major < 0 || github < 0 || internships < 0 || months < 0 || hours < 0) {
        return 'Counts and durations cannot be negative.';
      }
      if (major > projects) {
        return 'Major capstone projects cannot exceed your total completed projects.';
      }
    }
    if (stepIndex === 3) {
      const certs = Number(formData.certifications_count);
      const hackPart = Number(formData.hackathons_participated);
      const hackWon = Number(formData.hackathons_won);
      if (certs < 0 || hackPart < 0 || hackWon < 0) {
        return 'Counts cannot be negative.';
      }
      if (hackWon > hackPart) {
        return 'Hackathons won cannot exceed hackathons participated.';
      }
      const presenceScores = ['linkedin_score', 'resume_score', 'leadership_score', 'extracurricular_score', 'mock_interview_score'];
      for (const f of presenceScores) {
        const val = Number(formData[f]);
        if (isNaN(val) || val < 0 || val > 100) return 'All rating scores must be between 0 and 100.';
      }
    }
    if (stepIndex === 4) {
      if (!DOMAINS.includes(formData.preferred_domain)) {
        return 'Please select a valid target career domain.';
      }
    }
    return '';
  };

  const handleNext = (e) => {
    e.preventDefault();
    const err = validateStep(currentStep);
    if (err) {
      setValidationError(err);
      toast.error(err);
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    setValidationError('');
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      const err = validateStep(i);
      if (err) {
        setCurrentStep(i);
        setValidationError(err);
        toast.error(err);
        return;
      }
    }

    setIsAnalyzing(true);
    try {
      const sanitizedPayload = {
        age: Number(formData.age),
        gender: formData.gender === 'Prefer not to say' ? 'Other' : formData.gender,
        cgpa: Number(formData.cgpa),
        attendance_percentage: Number(formData.attendance_percentage),
        backlogs: Number(formData.backlogs),
        coding_score: Number(formData.coding_score),
        aptitude_score: Number(formData.aptitude_score),
        communication_score: Number(formData.communication_score),
        technical_score: Number(formData.technical_score),
        projects_count: Number(formData.projects_count),
        major_projects: Number(formData.major_projects),
        internships_count: Number(formData.internships_count),
        internship_months: Number(formData.internship_months),
        certifications_count: Number(formData.certifications_count),
        hackathons_participated: Number(formData.hackathons_participated),
        hackathons_won: Number(formData.hackathons_won),
        coding_platform_score: Number(formData.coding_platform_score),
        github_projects: Number(formData.github_projects),
        linkedin_score: Number(formData.linkedin_score),
        resume_score: Number(formData.resume_score),
        soft_skills_score: Number(formData.soft_skills_score),
        leadership_score: Number(formData.leadership_score),
        extracurricular_score: Number(formData.extracurricular_score),
        training_hours: Number(formData.training_hours),
        mock_interview_score: Number(formData.mock_interview_score),
        preferred_domain: formData.preferred_domain
      };

      const res = await api.post('/predict', sanitizedPayload);
      
      setTimeout(() => {
        navigate('/assessment/results', { state: { result: res.data, payload: sanitizedPayload } });
      }, 900);
    } catch (err) {
      setIsAnalyzing(false);
      const msg = err.response?.data?.error || 'Analysis failed. Please verify all inputs and retry.';
      setValidationError(msg);
      toast.error(msg);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-[calc(100vh-68px)] flex items-center justify-center bg-[#FAFAF7] px-4">
        <div className="text-center space-y-6 max-w-md bg-white border border-slate-200 rounded-3xl p-10 shadow-soft-md relative overflow-hidden">
          <div className="relative w-20 h-20 mx-auto">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl"
            />
            <div className="absolute inset-0 flex items-center justify-center text-indigo-600 bg-indigo-50 rounded-2xl border border-indigo-200">
              <BrainCircuit size={36} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
              Evaluating Your 26-Point Profile...
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed font-sans">
              Computing your CareerForge Readiness Score, benchmarking against your target domain, and building your personalized roadmap.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-mono text-indigo-600 font-semibold">
            <Sparkles size={14} />
            <span>Generating Skill & Profile Analysis</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
      
      {/* ─── PROGRESS HEADER ──────────────────────────────────────────────── */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
              Step {currentStep + 1} of {STEPS.length} • Guided Career Diagnostic
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight mt-0.5">
              {STEPS[currentStep].title}
            </h1>
          </div>
          <span className="text-xs text-slate-600 font-medium">
            {STEPS[currentStep].desc}
          </span>
        </div>

        {/* 5-Step indicator bar */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {STEPS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                if (idx < currentStep) {
                  setValidationError('');
                  setCurrentStep(idx);
                }
              }}
              className="text-left space-y-1.5 focus:outline-none"
            >
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    idx < currentStep 
                      ? 'bg-emerald-500' 
                      : idx === currentStep 
                      ? 'bg-indigo-600' 
                      : 'bg-transparent'
                  }`}
                />
              </div>
              <span className={`text-[11px] font-mono hidden sm:block truncate ${idx === currentStep ? 'text-indigo-700 font-bold' : 'text-slate-500'}`}>
                {s.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── WIZARD FORM CONTAINER ────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-soft-md relative">
        {validationError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-800 font-medium">
            <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleNext}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >

              {/* ── STEP 1: ACADEMIC FOUNDATION ── */}
              {currentStep === 0 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Age (16 – 100)</label>
                      <input 
                        type="number" 
                        name="age" 
                        value={formData.age} 
                        onChange={handleChange} 
                        min="16" 
                        max="100"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Gender</label>
                      <select 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Current CGPA (0 – 10)</label>
                      <input 
                        type="number" 
                        name="cgpa" 
                        value={formData.cgpa} 
                        onChange={handleChange} 
                        step="0.1" 
                        min="0" 
                        max="10"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Cumulative grade point average</span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Academic Attendance (%)</label>
                      <input 
                        type="number" 
                        name="attendance_percentage" 
                        value={formData.attendance_percentage} 
                        onChange={handleChange} 
                        min="0" 
                        max="100"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Average coursework attendance</span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Active Backlogs</label>
                      <input 
                        type="number" 
                        name="backlogs" 
                        value={formData.backlogs} 
                        onChange={handleChange} 
                        min="0" 
                        max="20"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Enter 0 if all subjects are cleared</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: TECHNICAL CAPABILITY ── */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <p className="text-xs text-slate-600">
                    Rate your current proficiency honestly from 0 (Beginner) to 100 (Advanced) so we can pinpoint your exact skill gaps.
                  </p>

                  {[
                    { key: 'coding_score', label: 'Data Structures & Coding Fluency', desc: 'Arrays, trees, graphs, recursion, and clean implementation' },
                    { key: 'aptitude_score', label: 'Quantitative & Analytical Aptitude', desc: 'Logical reasoning, probability, and timed problem solving' },
                    { key: 'technical_score', label: 'Core CS & Engineering Fundamentals', desc: 'DBMS/SQL, Operating Systems, Computer Networks, OOP' },
                    { key: 'coding_platform_score', label: 'Problem-Solving Practice', desc: 'Regularity on coding practice platforms and algorithmic challenges' },
                    { key: 'communication_score', label: 'Technical Communication & Clarity', desc: 'Explaining trade-offs and thought process during interviews' },
                    { key: 'soft_skills_score', label: 'Team Collaboration & Professional Readiness', desc: 'Ownership, adaptability, and structured communication' },
                  ].map(field => (
                    <div key={field.key} className="space-y-2 p-4 rounded-2xl bg-[#FAFAF7] border border-slate-200">
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{field.label}</span>
                          <span className="text-[11px] text-slate-500 block">{field.desc}</span>
                        </div>
                        <span className="font-mono font-bold text-indigo-700 text-sm px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200">
                          {formData[field.key]} / 100
                        </span>
                      </div>
                      <input 
                        type="range" 
                        name={field.key} 
                        value={formData[field.key]} 
                        onChange={handleChange} 
                        min="0" 
                        max="100"
                        className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ── STEP 3: EXPERIENCE & PROJECTS ── */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Total Projects Built
                      </label>
                      <input 
                        type="number" 
                        name="projects_count" 
                        value={formData.projects_count} 
                        onChange={handleChange} 
                        min="0" 
                        max="50"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Academic + personal builds</span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Major / Full-Stack Projects
                      </label>
                      <input 
                        type="number" 
                        name="major_projects" 
                        value={formData.major_projects} 
                        onChange={handleChange} 
                        min="0" 
                        max={formData.projects_count || 50}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Must be ≤ Total Projects ({formData.projects_count})</span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Public GitHub Repositories
                      </label>
                      <input 
                        type="number" 
                        name="github_projects" 
                        value={formData.github_projects} 
                        onChange={handleChange} 
                        min="0" 
                        max="100"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Documented repositories</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Internships Completed
                      </label>
                      <input 
                        type="number" 
                        name="internships_count" 
                        value={formData.internships_count} 
                        onChange={handleChange} 
                        min="0" 
                        max="10"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Total Internship Duration (Months)
                      </label>
                      <input 
                        type="number" 
                        name="internship_months" 
                        value={formData.internship_months} 
                        onChange={handleChange} 
                        min="0" 
                        max="36"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Dedicated Technical Training (Hours)
                      </label>
                      <input 
                        type="number" 
                        name="training_hours" 
                        value={formData.training_hours} 
                        onChange={handleChange} 
                        min="0" 
                        max="2000"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 4: PROFESSIONAL PRESENCE ── */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Verified Certifications
                      </label>
                      <input 
                        type="number" 
                        name="certifications_count" 
                        value={formData.certifications_count} 
                        onChange={handleChange} 
                        min="0" 
                        max="30"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Hackathons Participated
                      </label>
                      <input 
                        type="number" 
                        name="hackathons_participated" 
                        value={formData.hackathons_participated} 
                        onChange={handleChange} 
                        min="0" 
                        max="30"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Hackathons Won / Finalist
                      </label>
                      <input 
                        type="number" 
                        name="hackathons_won" 
                        value={formData.hackathons_won} 
                        onChange={handleChange} 
                        min="0" 
                        max={formData.hackathons_participated || 30}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">Must be ≤ Participated ({formData.hackathons_participated})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Professional Profile Strength (0 – 100)
                      </label>
                      <input 
                        type="number" 
                        name="linkedin_score" 
                        value={formData.linkedin_score} 
                        onChange={handleChange} 
                        min="0" 
                        max="100"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Resume Readiness (0 – 100)
                      </label>
                      <input 
                        type="number" 
                        name="resume_score" 
                        value={formData.resume_score} 
                        onChange={handleChange} 
                        min="0" 
                        max="100"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Leadership Experience (0 – 100)
                      </label>
                      <input 
                        type="number" 
                        name="leadership_score" 
                        value={formData.leadership_score} 
                        onChange={handleChange} 
                        min="0" 
                        max="100"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Extracurricular Involvement (0 – 100)
                      </label>
                      <input 
                        type="number" 
                        name="extracurricular_score" 
                        value={formData.extracurricular_score} 
                        onChange={handleChange} 
                        min="0" 
                        max="100"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Mock Interview Readiness (0 – 100)
                      </label>
                      <input 
                        type="number" 
                        name="mock_interview_score" 
                        value={formData.mock_interview_score} 
                        onChange={handleChange} 
                        min="0" 
                        max="100"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 5: CAREER PREFERENCES ── */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Select Your Target Career Domain
                    </label>
                    <p className="text-xs text-slate-600 mb-4">
                      Your 26 profile parameters will be benchmarked against hiring requirements for this domain to generate your personalized learning tracks and roadmap phases.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {DOMAINS.map(domain => {
                        const selected = formData.preferred_domain === domain;
                        return (
                          <button
                            key={domain}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, preferred_domain: domain }))}
                            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                              selected
                                ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-soft-sm'
                                : 'bg-[#FAFAF7] border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <span className="text-sm font-heading font-bold block">{domain}</span>
                              <span className="text-[11px] text-slate-500">Role-aligned roadmap & skill benchmarks</span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                            }`}>
                              {selected && <span className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <span>All 26 profile indicators ready for evaluation</span>
                    <span className="font-mono font-bold text-emerald-700">✓ Validated</span>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* ─── WIZARD ACTION BUTTONS ────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-200">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors ${
                currentStep === 0 
                  ? 'opacity-40 cursor-not-allowed text-slate-400' 
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ArrowLeft size={14} />
              <span>Previous Step</span>
            </button>

            <button
              type="submit"
              className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
            >
              <span>{currentStep === STEPS.length - 1 ? 'Compute Career Readiness →' : 'Continue to Next Step'}</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
