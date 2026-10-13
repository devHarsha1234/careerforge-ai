import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, CheckCircle2, Circle, AlertCircle, 
  Loader2, Sparkles, User, Briefcase, GraduationCap, 
  Plus, Trash2, ArrowUp, ArrowDown, Save, RefreshCw, Code2, Award, Eye 
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SKILL_CATEGORIES = [
  "Programming Languages",
  "Data Structures & Algorithms",
  "Web Development",
  "Databases",
  "Frameworks & Libraries",
  "Tools & Platforms",
  "Cloud / DevOps",
  "Core CS Subjects"
];

const EMPTY_EDUCATION = {
  degree: '',
  branch: '',
  institute: '',
  start_year: '',
  end_year: '',
  cgpa: '',
  coursework: ''
};

const EMPTY_PROJECT = {
  title: '',
  role: 'Full-Stack Developer',
  tech_stack: '',
  live_url: '',
  github_url: '',
  duration: '',
  problem: '',
  features: '',
  outcome: '',
  bullets: [''],
  include_in_resume: true
};

const EMPTY_EXPERIENCE = {
  company: '',
  role: '',
  duration: '',
  location: '',
  bullets: [''],
  include_in_resume: true
};

const EMPTY_CERTIFICATION = {
  name: '',
  issuer: '',
  year: '',
  credential_url: ''
};

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [assistingId, setAssistingId] = useState(null);

  // Full structured resume state
  const [personal, setPersonal] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: ''
  });
  const [targetRole, setTargetRole] = useState('Software Development');
  const [summary, setSummary] = useState('');
  const [education, setEducation] = useState([]);
  const [skillsByCategory, setSkillsByCategory] = useState({});
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // New skill input state
  const [selectedCategory, setSelectedCategory] = useState(SKILL_CATEGORIES[0]);
  const [skillInput, setSkillInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  const [profileSnapshot, setProfileSnapshot] = useState(null);

  useEffect(() => {
    fetchResumeWorkspace();
  }, []);

  const normalizeProjects = (rawProjects) => {
    if (!Array.isArray(rawProjects)) return [];
    return rawProjects.map(p => ({
      title: p.title || p.name || '',
      role: p.role || '',
      tech_stack: Array.isArray(p.tech_stack) ? p.tech_stack.join(', ') : (p.tech_stack || p.tech || ''),
      live_url: p.live_url || '',
      github_url: p.github_url || p.link || '',
      duration: p.duration || '',
      problem: p.problem || '',
      features: p.features || '',
      outcome: p.outcome || '',
      bullets: Array.isArray(p.bullets) && p.bullets.length > 0
        ? p.bullets
        : p.description ? [p.description] : [''],
      include_in_resume: p.include_in_resume !== false
    }));
  };

  const fetchResumeWorkspace = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resume');
      const data = res.data || {};
      setPersonal(data.personal || {});
      setTargetRole(data.target_role || 'Software Development');
      setSummary(data.summary || '');
      setEducation(Array.isArray(data.education) && data.education.length > 0 ? data.education : []);
      setSkillsByCategory(data.skills_by_category || {});
      setProjects(normalizeProjects(data.projects));
      setExperience(Array.isArray(data.experience) ? data.experience : []);
      setCertifications(Array.isArray(data.certifications) ? data.certifications : []);
      setAchievements(Array.isArray(data.achievements) ? data.achievements.map(a => typeof a === 'string' ? a : a.title) : []);
      setProfileSnapshot(data.profile_snapshot || null);
    } catch (err) {
      toast.error('Failed to load Resume Builder data.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromProfile = async () => {
    try {
      const res = await api.get('/profile');
      const p = res.data || {};
      setPersonal(prev => ({
        name: p.name || prev.name || '',
        email: p.email || prev.email || '',
        phone: p.phone || prev.phone || '',
        location: p.location || prev.location || '',
        linkedin: p.linkedin || prev.linkedin || '',
        github: p.github || prev.github || '',
        portfolio: p.portfolio || prev.portfolio || ''
      }));
      if (p.target_role) setTargetRole(p.target_role);
      if (p.summary && !summary) setSummary(p.summary);

      // Import academic profile if user entered it in Profile
      if ((p.institute || p.degree || p.cgpa) && education.length === 0) {
        setEducation([{
          degree: p.degree || '',
          branch: p.branch || '',
          institute: p.institute || '',
          start_year: '',
          end_year: p.graduation_year || '',
          cgpa: p.cgpa ? String(p.cgpa) : '',
          coursework: ''
        }]);
      }

      // Import skills from profile
      if (Array.isArray(p.skills_list) && p.skills_list.length > 0) {
        setSkillsByCategory(prev => {
          const next = { ...prev };
          for (const sk of p.skills_list) {
            const sName = typeof sk === 'string' ? sk : sk.name;
            const sCat = (typeof sk === 'object' && sk.category) ? sk.category : 'Programming Languages';
            if (!sName) continue;
            const list = next[sCat] ? [...next[sCat]] : [];
            if (!list.some(x => x.toLowerCase() === sName.toLowerCase())) {
              list.push(sName);
            }
            next[sCat] = list;
          }
          return next;
        });
      }

      // Import projects from profile if present
      if (Array.isArray(p.projects) && p.projects.length > 0 && projects.length === 0) {
        setProjects(normalizeProjects(p.projects));
      }

      toast.success('Imported details, education, and skills from your CareerForge Profile!');
    } catch (err) {
      toast.error('Could not import from profile.');
    }
  };

  const buildPayload = () => {
    const cleanedProjects = projects
      .filter(p => p.title && p.title.trim())
      .map(p => ({
        ...p,
        title: p.title.trim(),
        tech_stack: typeof p.tech_stack === 'string'
          ? p.tech_stack.split(',').map(s => s.trim()).filter(Boolean)
          : (p.tech_stack || []),
        bullets: (p.bullets || []).map(b => b.trim()).filter(Boolean)
      }));

    const cleanedEducation = education.filter(
      ed => (ed.degree && ed.degree.trim()) || (ed.institute && ed.institute.trim())
    );

    const cleanedExperience = experience
      .filter(ex => (ex.company && ex.company.trim()) || (ex.role && ex.role.trim()))
      .map(ex => ({
        ...ex,
        bullets: (ex.bullets || []).map(b => b.trim()).filter(Boolean)
      }));

    const cleanedCerts = certifications.filter(c => c && (typeof c === 'string' ? c.trim() : c.name?.trim()));

    return {
      personal,
      target_role: targetRole,
      summary,
      education: cleanedEducation,
      skills_by_category: skillsByCategory,
      projects: cleanedProjects,
      experience: cleanedExperience,
      certifications: cleanedCerts,
      achievements: achievements.filter(Boolean)
    };
  };

  const handleSaveResume = async (silent = false) => {
    setSaving(true);
    try {
      const payload = buildPayload();
      await api.post('/resume', payload);
      if (!silent) toast.success('Resume saved to your workspace!');
      return payload;
    } catch (err) {
      if (!silent) toast.error('Failed to save resume data.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!personal.name || !personal.name.trim()) {
      toast.error('Please enter your Full Name in Personal Info before generating your PDF.');
      setActiveTab('personal');
      return;
    }
    setGenerating(true);
    try {
      const payload = buildPayload();
      await api.post('/resume', payload);
      const res = await api.post('/resume/generate', payload, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const safeName = personal.name.trim().replace(/\s+/g, '_');
      link.setAttribute('download', `${safeName}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('ATS Resume PDF generated & downloaded! 🎉');
    } catch (err) {
      toast.error('Failed to generate resume PDF.');
    } finally {
      setGenerating(false);
    }
  };

  // Factual AI Wording Assist
  const handleAssistSummary = async () => {
    setAssistingId('summary');
    try {
      const allSkills = Object.values(skillsByCategory).flat();
      const res = await api.post('/resume/assist', {
        type: 'summary',
        target_role: targetRole,
        text: summary,
        skills: allSkills
      });
      if (res.data?.improved_text) {
        setSummary(res.data.improved_text);
        toast.success('Summary wording refined using your actual skills!');
      }
    } catch {
      toast.error('Could not refine summary.');
    } finally {
      setAssistingId(null);
    }
  };

  const handleAssistProject = async (idx) => {
    const proj = projects[idx];
    if (!proj) return;
    setAssistingId(`proj_${idx}`);
    try {
      const rawText = [proj.problem, proj.features, proj.outcome, ...(proj.bullets || [])]
        .filter(Boolean)
        .join('. ');
      const res = await api.post('/resume/assist', {
        type: 'project',
        title: proj.title,
        tech_stack: proj.tech_stack,
        text: rawText
      });
      if (res.data?.bullets && res.data.bullets.length > 0) {
        setProjects(prev => prev.map((p, i) => i === idx ? { ...p, bullets: res.data.bullets } : p));
        toast.success('Refined into clean action-oriented bullet points!');
      }
    } catch {
      toast.error('Could not refine project bullets.');
    } finally {
      setAssistingId(null);
    }
  };

  // Skill Helpers
  const addSkillToCategory = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    setSkillsByCategory(prev => {
      const existing = prev[selectedCategory] || [];
      if (existing.some(s => s.toLowerCase() === trimmed.toLowerCase())) return prev;
      return {
        ...prev,
        [selectedCategory]: [...existing, trimmed]
      };
    });
    setSkillInput('');
  };

  const removeSkillFromCategory = (cat, skillName) => {
    setSkillsByCategory(prev => ({
      ...prev,
      [cat]: (prev[cat] || []).filter(s => s !== skillName)
    }));
  };

  // Project Reordering & Management
  const moveProject = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= projects.length) return;
    setProjects(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const totalSkillsCount = Object.values(skillsByCategory).reduce((acc, arr) => acc + (arr?.length || 0), 0);
  const includedProjects = projects.filter(p => p.include_in_resume !== false && p.title?.trim());
  const validEducation = education.filter(ed => ed.degree?.trim() || ed.institute?.trim());
  const includedExperience = experience.filter(ex => ex.include_in_resume !== false && (ex.company?.trim() || ex.role?.trim()));
  const validCerts = certifications.filter(c => typeof c === 'string' ? c.trim() : c.name?.trim());

  const completenessChecks = [
    { label: 'Personal Information', ok: Boolean(personal.name?.trim() && personal.email?.trim() && personal.phone?.trim()), optional: false, hint: 'Add your full name, email, and phone number.' },
    { label: 'Education', ok: validEducation.length > 0, optional: false, hint: 'Add your degree, institute/university, and graduation year.' },
    { label: 'Skills', ok: totalSkillsCount >= 3, optional: false, hint: 'Add at least 3 technical skills categorized for ATS parsing.' },
    { label: 'Projects', ok: includedProjects.length >= 1, optional: false, hint: 'Add at least 1 technical project with action bullets.' },
    { label: 'Summary', ok: Boolean(summary?.trim()), optional: false, hint: 'Write or refine a 2-sentence role-aligned professional summary.' },
    { label: 'Experience (Optional)', ok: includedExperience.length > 0, optional: true, hint: 'Include internships or work experience if applicable.' },
    { label: 'Certifications (Optional)', ok: validCerts.length > 0, optional: true, hint: 'Add verified technical certifications if available.' },
  ];
  const coreChecks = completenessChecks.filter(c => !c.optional);
  const passedChecks = coreChecks.filter(c => c.ok).length;
  const completenessPercent = Math.round((passedChecks / coreChecks.length) * 100);
  const missingHints = coreChecks.filter(c => !c.ok).map(c => c.hint);

  const TABS = [
    { id: 'personal', label: '1. Personal & Role', icon: <User size={14} /> },
    { id: 'education', label: `2. Education (${validEducation.length})`, icon: <GraduationCap size={14} /> },
    { id: 'skills', label: `3. Skills (${totalSkillsCount})`, icon: <Code2 size={14} /> },
    { id: 'projects', label: `4. Projects (${includedProjects.length})`, icon: <Briefcase size={14} /> },
    { id: 'experience', label: '5. Experience & Certs', icon: <Award size={14} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* ─── TOP WORKSPACE BAR ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold mb-2">
            <FileText size={14} />
            <span>ATS Resume Studio • Zero Fabricated Content</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            Resume Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Add your real education, technical skills, and projects on the left. Preview your live ATS layout on the right and export a clean ReportLab PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleImportFromProfile}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-soft-sm transition-all flex items-center gap-1.5"
          >
            <RefreshCw size={14} className="text-indigo-600" />
            <span>Import from Profile</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveResume(false)}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={handleGeneratePDF}
            disabled={generating}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span>{generating ? 'Generating PDF...' : 'Download PDF Resume'}</span>
          </button>
        </div>
      </div>

      {/* ─── SPLIT WORKSPACE: LEFT EDITOR (7 COLS) / RIGHT PREVIEW (5 COLS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ═══ LEFT COLUMN: STRUCTURED RESUME EDITOR ═══ */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section Navigation Tabs */}
          <div className="flex flex-wrap gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-soft-sm">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Editor Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-md space-y-6">
            
            {/* ── TAB 1: PERSONAL INFO, LINKS & SUMMARY ── */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-heading font-bold text-slate-900">Personal Info & Target Role</h2>
                    <p className="text-xs text-slate-500">Contact header and role-aligned summary for your resume.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={personal.name || ''}
                      onChange={e => setPersonal(p => ({ ...p, name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={personal.email || ''}
                      onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={personal.phone || ''}
                      onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Location (City, Country)</label>
                    <input
                      type="text"
                      value={personal.location || ''}
                      onChange={e => setPersonal(p => ({ ...p, location: e.target.value }))}
                      placeholder="e.g. Pune, India"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={personal.linkedin || ''}
                      onChange={e => setPersonal(p => ({ ...p, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={personal.github || ''}
                      onChange={e => setPersonal(p => ({ ...p, github: e.target.value }))}
                      placeholder="https://github.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Portfolio / Website</label>
                    <input
                      type="url"
                      value={personal.portfolio || ''}
                      onChange={e => setPersonal(p => ({ ...p, portfolio: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Target Role / Track</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={e => setTargetRole(e.target.value)}
                      placeholder="e.g. Software Engineer, Backend Developer, Data Analyst"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Professional Summary
                      </label>
                      <button
                        type="button"
                        onClick={handleAssistSummary}
                        disabled={assistingId === 'summary'}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold transition-colors"
                      >
                        {assistingId === 'summary' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        <span>Improve Wording</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={summary}
                      onChange={e => setSummary(e.target.value)}
                      placeholder="Write a concise 2-sentence summary highlighting your core technical focus and career goal..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-xs sm:text-sm text-slate-900 focus:border-indigo-600 focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: EDUCATION (MULTI-ENTRY, NEVER HARDCODED) ── */}
            {activeTab === 'education' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-heading font-bold text-slate-900">Education</h2>
                    <p className="text-xs text-slate-500">Add your degree, university/college, graduation year, and CGPA.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEducation(prev => [...prev, { ...EMPTY_EDUCATION }])}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Add Education</span>
                  </button>
                </div>

                {education.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#FAFAF7] border border-dashed border-slate-300 text-center space-y-3">
                    <GraduationCap size={28} className="text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600">
                      No education entries added yet. We never hardcode institutions — add your actual university or college below.
                    </p>
                    <button
                      type="button"
                      onClick={() => setEducation([{ ...EMPTY_EDUCATION }])}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Add Degree / College</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {education.map((ed, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-[#FAFAF7] border border-slate-200 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono uppercase font-bold text-indigo-700">
                            Education Entry #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEducation(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-600 text-xs flex items-center gap-1"
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Institute / University *</label>
                            <input
                              type="text"
                              value={ed.institute || ''}
                              onChange={e => setEducation(prev => prev.map((item, i) => i === idx ? { ...item, institute: e.target.value } : item))}
                              placeholder="Enter your college or university name"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Degree *</label>
                            <input
                              type="text"
                              value={ed.degree || ''}
                              onChange={e => setEducation(prev => prev.map((item, i) => i === idx ? { ...item, degree: e.target.value } : item))}
                              placeholder="e.g. Bachelor of Technology (B.Tech)"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Branch / Specialization</label>
                            <input
                              type="text"
                              value={ed.branch || ''}
                              onChange={e => setEducation(prev => prev.map((item, i) => i === idx ? { ...item, branch: e.target.value } : item))}
                              placeholder="e.g. Computer Science & Engineering"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Start Year</label>
                              <input
                                type="text"
                                value={ed.start_year || ''}
                                onChange={e => setEducation(prev => prev.map((item, i) => i === idx ? { ...item, start_year: e.target.value } : item))}
                                placeholder="2022"
                                className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">End Year</label>
                              <input
                                type="text"
                                value={ed.end_year || ''}
                                onChange={e => setEducation(prev => prev.map((item, i) => i === idx ? { ...item, end_year: e.target.value } : item))}
                                placeholder="2026"
                                className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">CGPA / %</label>
                              <input
                                type="text"
                                value={ed.cgpa || ''}
                                onChange={e => setEducation(prev => prev.map((item, i) => i === idx ? { ...item, cgpa: e.target.value } : item))}
                                placeholder="8.5"
                                className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Relevant Coursework (Optional)</label>
                          <input
                            type="text"
                            value={ed.coursework || ''}
                            onChange={e => setEducation(prev => prev.map((item, i) => i === idx ? { ...item, coursework: e.target.value } : item))}
                            placeholder="e.g. Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks"
                            className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: TECHNICAL SKILLS BY CATEGORY ── */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-heading font-bold text-slate-900">Technical Skills</h2>
                    <p className="text-xs text-slate-500">Organize your skills by category for clean ATS parsing.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleImportFromProfile}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold"
                  >
                    Sync Skills from Profile
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-xs font-bold text-slate-800 focus:border-indigo-600 focus:outline-none"
                  >
                    {SKILL_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkillToCategory();
                      }
                    }}
                    placeholder={`Add skill to ${selectedCategory}...`}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addSkillToCategory}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {SKILL_CATEGORIES.map(cat => {
                    const list = skillsByCategory[cat] || [];
                    return (
                      <div key={cat} className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800">{cat}</span>
                          <span className="text-[10px] font-mono text-slate-500">{list.length} skills</span>
                        </div>
                        {list.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {list.map((sk, i) => (
                              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800">
                                <span>{sk}</span>
                                <button
                                  type="button"
                                  onClick={() => removeSkillFromCategory(cat, sk)}
                                  className="text-slate-400 hover:text-rose-600"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No skills in this category yet</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TAB 4: PROJECTS (MULTI-PROJECT WORKSPACE) ── */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-heading font-bold text-slate-900">Projects</h2>
                    <p className="text-xs text-slate-500">Add your own projects, reorder them, toggle inclusion, or refine bullet wording.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProjects(prev => [...prev, { ...EMPTY_PROJECT, bullets: [''] }])}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Add Project</span>
                  </button>
                </div>

                {projects.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#FAFAF7] border border-dashed border-slate-300 text-center space-y-3">
                    <Briefcase size={28} className="text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      No projects added yet. Click <strong>+ Add Project</strong> to showcase your academic, personal, or hackathon projects.
                    </p>
                    <button
                      type="button"
                      onClick={() => setProjects([{ ...EMPTY_PROJECT, bullets: [''] }])}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Add First Project</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {projects.map((proj, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-[#FAFAF7] border border-slate-200 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold uppercase text-indigo-700">
                              Project #{idx + 1}
                            </span>
                            <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={proj.include_in_resume !== false}
                                onChange={e => setProjects(prev => prev.map((p, i) => i === idx ? { ...p, include_in_resume: e.target.checked } : p))}
                                className="rounded accent-indigo-600"
                              />
                              <span>Include in Resume</span>
                            </label>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => moveProject(idx, -1)}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                              title="Move Up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveProject(idx, 1)}
                              disabled={idx === projects.length - 1}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                              title="Move Down"
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setProjects(prev => prev.filter((_, i) => i !== idx))}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50"
                              title="Delete Project"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Project Title *</label>
                            <input
                              type="text"
                              value={proj.title || ''}
                              onChange={e => setProjects(prev => prev.map((p, i) => i === idx ? { ...p, title: e.target.value } : p))}
                              placeholder="e.g. Distributed Task Queue & Job Scheduler"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Tech Stack (Comma-separated)</label>
                            <input
                              type="text"
                              value={proj.tech_stack || ''}
                              onChange={e => setProjects(prev => prev.map((p, i) => i === idx ? { ...p, tech_stack: e.target.value } : p))}
                              placeholder="e.g. Python, Flask, React, PostgreSQL, Docker"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Role / Project Type</label>
                            <input
                              type="text"
                              value={proj.role || ''}
                              onChange={e => setProjects(prev => prev.map((p, i) => i === idx ? { ...p, role: e.target.value } : p))}
                              placeholder="e.g. Full-Stack Developer • Capstone Project"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Duration / Timeline</label>
                            <input
                              type="text"
                              value={proj.duration || ''}
                              onChange={e => setProjects(prev => prev.map((p, i) => i === idx ? { ...p, duration: e.target.value } : p))}
                              placeholder="e.g. Jan 2025 – Apr 2025"
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">GitHub Repository URL</label>
                            <input
                              type="url"
                              value={proj.github_url || ''}
                              onChange={e => setProjects(prev => prev.map((p, i) => i === idx ? { ...p, github_url: e.target.value } : p))}
                              placeholder="https://github.com/..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">Live Demo URL (Optional)</label>
                            <input
                              type="url"
                              value={proj.live_url || ''}
                              onChange={e => setProjects(prev => prev.map((p, i) => i === idx ? { ...p, live_url: e.target.value } : p))}
                              placeholder="https://..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                            />
                          </div>
                        </div>

                        {/* Bullet Points + Factual Wording Assist */}
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold uppercase text-slate-700">
                              Key Contributions & Impact Bullets
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleAssistProject(idx)}
                                disabled={assistingId === `proj_${idx}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold"
                              >
                                {assistingId === `proj_${idx}` ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                <span>Format as Action Bullets</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setProjects(prev => prev.map((p, i) => i === idx ? { ...p, bullets: [...(p.bullets || []), ''] } : p))}
                                className="text-[11px] font-bold text-slate-700 hover:text-indigo-600"
                              >
                                + Add Bullet
                              </button>
                            </div>
                          </div>

                          {(proj.bullets || ['']).map((b, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-bold">•</span>
                              <input
                                type="text"
                                value={b}
                                onChange={e => {
                                  const val = e.target.value;
                                  setProjects(prev => prev.map((p, i) => {
                                    if (i !== idx) return p;
                                    const nextBullets = [...(p.bullets || [''])];
                                    nextBullets[bIdx] = val;
                                    return { ...p, bullets: nextBullets };
                                  }));
                                }}
                                placeholder="Describe what you built, the technologies used, and the outcome..."
                                className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                              />
                              {(proj.bullets || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setProjects(prev => prev.map((p, i) => i === idx ? { ...p, bullets: p.bullets.filter((_, bi) => bi !== bIdx) } : p))}
                                  className="text-slate-400 hover:text-rose-600 text-xs px-1"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 5: EXPERIENCE, CERTIFICATIONS & ACHIEVEMENTS ── */}
            {activeTab === 'experience' && (
              <div className="space-y-8">
                {/* Internships / Work Experience */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base font-heading font-bold text-slate-900">Internships & Work Experience (Optional)</h2>
                      <p className="text-xs text-slate-500">Add internships, research roles, or part-time engineering experience.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExperience(prev => [...prev, { ...EMPTY_EXPERIENCE, bullets: [''] }])}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Plus size={13} />
                      <span>Add Experience</span>
                    </button>
                  </div>

                  {experience.map((exp, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#FAFAF7] border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-indigo-700">Experience #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setExperience(prev => prev.filter((_, i) => i !== idx))}
                          className="text-xs text-rose-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={exp.role || ''}
                          onChange={e => setExperience(prev => prev.map((item, i) => i === idx ? { ...item, role: e.target.value } : item))}
                          placeholder="Role (e.g. Software Engineering Intern)"
                          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                        />
                        <input
                          type="text"
                          value={exp.company || ''}
                          onChange={e => setExperience(prev => prev.map((item, i) => i === idx ? { ...item, company: e.target.value } : item))}
                          placeholder="Company / Organization"
                          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                        />
                        <input
                          type="text"
                          value={exp.duration || ''}
                          onChange={e => setExperience(prev => prev.map((item, i) => i === idx ? { ...item, duration: e.target.value } : item))}
                          placeholder="Duration (e.g. May 2025 – Jul 2025)"
                          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={(exp.bullets || []).join('\n')}
                        onChange={e => setExperience(prev => prev.map((item, i) => i === idx ? { ...item, bullets: e.target.value.split('\n') } : item))}
                        placeholder="Enter key responsibilities and outcomes (one bullet per line)..."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900"
                      />
                    </div>
                  ))}
                </div>

                {/* Certifications */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-heading font-bold text-slate-900">Certifications</h2>
                      <p className="text-xs text-slate-500">Add verified technical certifications.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCertifications(prev => [...prev, { ...EMPTY_CERTIFICATION }])}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Plus size={13} />
                      <span>Add Certification</span>
                    </button>
                  </div>

                  {certifications.map((cert, idx) => {
                    const cObj = typeof cert === 'string' ? { name: cert, issuer: '', year: '' } : cert;
                    return (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-7 gap-2.5 items-center bg-[#FAFAF7] p-3 rounded-xl border border-slate-200">
                        <input
                          type="text"
                          value={cObj.name || ''}
                          onChange={e => setCertifications(prev => prev.map((c, i) => i === idx ? { ...cObj, name: e.target.value } : c))}
                          placeholder="Certification Name"
                          className="sm:col-span-3 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                        />
                        <input
                          type="text"
                          value={cObj.issuer || ''}
                          onChange={e => setCertifications(prev => prev.map((c, i) => i === idx ? { ...cObj, issuer: e.target.value } : c))}
                          placeholder="Issuer (e.g. AWS, Coursera)"
                          className="sm:col-span-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                        />
                        <input
                          type="text"
                          value={cObj.year || ''}
                          onChange={e => setCertifications(prev => prev.map((c, i) => i === idx ? { ...cObj, year: e.target.value } : c))}
                          placeholder="Year"
                          className="sm:col-span-1 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setCertifications(prev => prev.filter((_, i) => i !== idx))}
                          className="sm:col-span-1 text-rose-600 text-xs font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Achievements */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h2 className="text-base font-heading font-bold text-slate-900">Achievements & Hackathons</h2>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={achievementInput}
                      onChange={e => setAchievementInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && achievementInput.trim()) {
                          e.preventDefault();
                          setAchievements(prev => [...prev, achievementInput.trim()]);
                          setAchievementInput('');
                        }
                      }}
                      placeholder="e.g. Finalist at Smart India Hackathon, Solved 300+ DSA problems..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#FAFAF7] border border-slate-200 text-xs text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (achievementInput.trim()) {
                          setAchievements(prev => [...prev, achievementInput.trim()]);
                          setAchievementInput('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                  {achievements.length > 0 && (
                    <ul className="space-y-1.5">
                      {achievements.map((ach, idx) => (
                        <li key={idx} className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#FAFAF7] border border-slate-200 text-xs text-slate-800">
                          <span>• {ach}</span>
                          <button
                            type="button"
                            onClick={() => setAchievements(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-600 font-bold"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ═══ RIGHT COLUMN: COMPLETENESS & LIVE ATS PREVIEW ═══ */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          
          {/* Resume Completeness Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-soft-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-700">
                Resume Completeness
              </span>
              <span className="text-sm font-mono font-extrabold text-indigo-600">
                {completenessPercent}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${completenessPercent}%` }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {completenessChecks.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[11px]">
                  {item.ok ? (
                    <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Circle size={14} className="text-slate-300 flex-shrink-0" />
                  )}
                  <span className={item.ok ? 'text-slate-800 font-semibold' : 'text-slate-500'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
            {missingHints.length > 0 && (
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Recommendations to reach 100%:</span>
                <p>{missingHints[0]}</p>
              </div>
            )}
          </div>

          {/* Live ATS Document Sheet Preview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-mono uppercase font-bold text-slate-500 flex items-center gap-1.5">
                <Eye size={14} className="text-indigo-600" />
                <span>Live ATS Preview</span>
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                100% USER-CONTROLLED
              </span>
            </div>

            {/* Paper Sheet */}
            <div className="bg-[#FAFAF7] border border-slate-300 rounded-xl p-5 sm:p-6 space-y-4 font-sans text-[11px] text-slate-800 min-h-[420px]">
              
              {/* Header */}
              <div className="border-b border-slate-300 pb-3 text-center">
                <h2 className="text-base font-heading font-extrabold text-slate-900 uppercase tracking-wide">
                  {personal.name?.trim() || 'YOUR FULL NAME'}
                </h2>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {[personal.email, personal.phone, personal.location].filter(Boolean).join('  |  ') || 'email@example.com  |  +91 ...'}
                </p>
                {[personal.linkedin, personal.github, personal.portfolio].filter(Boolean).length > 0 && (
                  <p className="text-[10px] text-indigo-700 font-medium mt-0.5 break-all">
                    {[personal.linkedin, personal.github, personal.portfolio].filter(Boolean).join('  |  ')}
                  </p>
                )}
              </div>

              {/* Summary */}
              {(summary?.trim() || targetRole?.trim()) && (
                <div>
                  <h4 className="font-heading font-bold text-[10px] uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1">
                    Professional Summary
                  </h4>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {summary?.trim() || `Candidate targeting ${targetRole} roles.`}
                  </p>
                </div>
              )}

              {/* Education */}
              {validEducation.length > 0 && (
                <div>
                  <h4 className="font-heading font-bold text-[10px] uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5">
                    Education
                  </h4>
                  <div className="space-y-2">
                    {validEducation.map((ed, i) => (
                      <div key={i}>
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{[ed.degree, ed.branch].filter(Boolean).join(' — ')}</span>
                          <span className="font-mono text-[10px] text-slate-600">
                            {[ed.start_year, ed.end_year].filter(Boolean).join(' – ')}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600 text-[10px]">
                          <span>{ed.institute}</span>
                          {ed.cgpa && <span className="font-semibold">CGPA: {ed.cgpa}</span>}
                        </div>
                        {ed.coursework && (
                          <p className="text-[10px] text-slate-500 mt-0.5">Coursework: {ed.coursework}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              {totalSkillsCount > 0 && (
                <div>
                  <h4 className="font-heading font-bold text-[10px] uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1">
                    Technical Skills
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(skillsByCategory).map(([cat, list]) => (
                      list && list.length > 0 ? (
                        <p key={cat} className="text-[10px] leading-snug">
                          <strong className="text-slate-900">{cat}:</strong> {list.join(', ')}
                        </p>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {includedProjects.length > 0 && (
                <div>
                  <h4 className="font-heading font-bold text-[10px] uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5">
                    Projects
                  </h4>
                  <div className="space-y-2.5">
                    {includedProjects.map((proj, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-900">
                            {proj.title}
                            {proj.role && <span className="font-normal text-slate-600"> — {proj.role}</span>}
                          </span>
                          {proj.duration && <span className="text-[10px] font-mono text-slate-500">{proj.duration}</span>}
                        </div>
                        {proj.tech_stack && (
                          <p className="text-[10px] text-indigo-700 font-medium">
                            Tech: {Array.isArray(proj.tech_stack) ? proj.tech_stack.join(', ') : proj.tech_stack}
                          </p>
                        )}
                        <ul className="list-disc list-inside text-[10px] text-slate-700 space-y-0.5 mt-0.5">
                          {(proj.bullets || []).filter(b => b && b.trim()).map((b, bi) => (
                            <li key={bi}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {includedExperience.length > 0 && (
                <div>
                  <h4 className="font-heading font-bold text-[10px] uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1.5">
                    Experience & Internships
                  </h4>
                  <div className="space-y-2">
                    {includedExperience.map((ex, i) => (
                      <div key={i}>
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{[ex.role, ex.company].filter(Boolean).join(' — ')}</span>
                          <span className="text-[10px] font-mono text-slate-500">{ex.duration}</span>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-700 space-y-0.5 mt-0.5">
                          {(ex.bullets || []).filter(b => b && b.trim()).map((b, bi) => (
                            <li key={bi}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications & Achievements */}
              {(validCerts.length > 0 || achievements.length > 0) && (
                <div>
                  <h4 className="font-heading font-bold text-[10px] uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5 mb-1">
                    Certifications & Achievements
                  </h4>
                  <ul className="list-disc list-inside text-[10px] text-slate-700 space-y-0.5">
                    {validCerts.map((c, i) => {
                      const label = typeof c === 'string' ? c : [c.name, c.issuer, c.year].filter(Boolean).join(' — ');
                      return <li key={`c_${i}`}>{label}</li>;
                    })}
                    {achievements.filter(Boolean).map((a, i) => (
                      <li key={`a_${i}`}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            <button
              type="button"
              onClick={handleGeneratePDF}
              disabled={generating}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Generating ReportLab ATS PDF...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download ATS Resume (PDF)</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
