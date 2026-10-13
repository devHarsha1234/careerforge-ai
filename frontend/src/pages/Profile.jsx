import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Save, Loader2, Link as LinkIcon, Briefcase, 
  GraduationCap, ShieldCheck, Plus, X, FileText, Code2 
} from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const DOMAINS = [
  "Software Development",
  "Data Science",
  "AI/ML",
  "Cloud Computing",
  "Cyber Security",
  "Business Analytics"
];

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState(null);
  const [newSkill, setNewSkill] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming Languages');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectTech, setNewProjectTech] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        setFormData({
          ...res.data,
          skills_list: Array.isArray(res.data.skills_list) ? res.data.skills_list : [],
          projects: Array.isArray(res.data.projects) ? res.data.projects : []
        });
      } catch (err) {
        toast.error('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    const exists = (formData.skills_list || []).some(
      s => (typeof s === 'string' ? s : s.name).toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      toast.error('Skill already in your profile.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      skills_list: [
        ...(prev.skills_list || []),
        { name: trimmed, category: newSkillCategory, proficiency: 75 }
      ]
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skillName) => {
    setFormData(prev => ({
      ...prev,
      skills_list: (prev.skills_list || []).filter(
        s => (typeof s === 'string' ? s : s.name) !== skillName
      )
    }));
  };

  const handleAddProject = () => {
    const title = newProjectTitle.trim();
    if (!title) {
      toast.error('Please enter a project title.');
      return;
    }
    const projEntry = {
      title,
      role: 'Full-Stack Developer',
      tech_stack: newProjectTech.trim(),
      description: newProjectDesc.trim(),
      bullets: newProjectDesc.trim() ? [newProjectDesc.trim()] : [],
      include_in_resume: true
    };
    setFormData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), projEntry]
    }));
    setNewProjectTitle('');
    setNewProjectTech('');
    setNewProjectDesc('');
  };

  const handleRemoveProject = (idx) => {
    setFormData(prev => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.name.trim()) {
      toast.error('Full Name is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        skills: formData.skills_list,
        projects: formData.projects || []
      };
      const res = await api.post('/profile', payload);
      if (res.data?.profile) {
        setFormData(prev => ({
          ...prev,
          ...res.data.profile
        }));
      }
      if (updateUser && user) {
        updateUser({ ...user, name: formData.name.trim(), target_role: formData.target_role });
      }
      toast.success('Career Profile saved and synced with Resume Builder!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center font-heading font-extrabold text-white text-xl shadow-sm">
            {formData.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
              {formData.name || 'Candidate Profile'}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">{formData.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-soft-sm">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">Profile Completeness</span>
              <span className="text-base font-heading font-bold text-emerald-700">
                {formData.completion_percentage || 40}%
              </span>
            </div>
            <ShieldCheck size={20} className="text-emerald-600" />
          </div>
          <Link
            to="/resume"
            className="px-4 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <FileText size={15} />
            <span>Open Resume Builder</span>
          </Link>
        </div>
      </div>

      {/* ─── PROFILE FORM ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-10 space-y-9 shadow-soft-md">
        
        {/* Section 1: Personal Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-2">
            <User size={14} /> 1. Personal Information
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name || ''} 
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Email Address (Verified)</label>
              <input 
                type="email" 
                value={formData.email || ''} 
                disabled
                className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone || ''} 
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">City & Country</label>
              <input 
                type="text" 
                name="location" 
                value={formData.location || ''} 
                onChange={handleChange}
                placeholder="e.g. Bengaluru, India"
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic Profile */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-xs font-mono uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-2">
            <GraduationCap size={14} /> 2. Academic Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Institute / University Name</label>
              <input 
                type="text" 
                name="institute" 
                value={formData.institute || ''} 
                onChange={handleChange}
                placeholder="Enter your college or university name"
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Degree Program</label>
              <input 
                type="text" 
                name="degree" 
                value={formData.degree || ''} 
                onChange={handleChange}
                placeholder="e.g. B.Tech / B.E. / M.Sc."
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Branch / Specialization</label>
              <input 
                type="text" 
                name="branch" 
                value={formData.branch || ''} 
                onChange={handleChange}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Graduation Year</label>
              <input 
                type="text" 
                name="graduation_year" 
                value={formData.graduation_year || ''} 
                onChange={handleChange}
                placeholder="e.g. 2026"
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Current CGPA (0 – 10)</label>
              <input 
                type="number" 
                name="cgpa" 
                value={formData.cgpa ?? ''} 
                onChange={handleChange}
                step="0.01"
                min="0"
                max="10"
                placeholder="e.g. 8.4"
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Career Preferences */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-xs font-mono uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-2">
            <Briefcase size={14} /> 3. Career Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Target Career Domain</label>
              <select 
                name="target_role" 
                value={formData.target_role || DOMAINS[0]} 
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
              >
                {DOMAINS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Professional Headline / Summary</label>
              <input 
                type="text" 
                name="summary" 
                value={formData.summary || ''} 
                onChange={handleChange}
                placeholder="Short objective or headline for your resume"
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Professional Presence */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-xs font-mono uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-2">
            <LinkIcon size={14} /> 4. Professional Presence
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">LinkedIn URL</label>
              <input 
                type="url" 
                name="linkedin" 
                value={formData.linkedin || ''} 
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">GitHub URL</label>
              <input 
                type="url" 
                name="github" 
                value={formData.github || ''} 
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Portfolio / Website URL</label>
              <input 
                type="url" 
                name="portfolio" 
                value={formData.portfolio || ''} 
                onChange={handleChange}
                placeholder="https://yourportfolio.dev"
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAF7] border border-slate-200 text-slate-900 text-sm focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Skills & Experience */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-mono uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-2">
              <Code2 size={14} /> 5. Technical Skills (Used for Job Matching & Resume)
            </h3>
            <span className="text-[11px] text-slate-500">
              {(formData.skills_list || []).length} skills added
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-xs font-semibold text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="Programming Languages">Programming Languages</option>
              <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
              <option value="Web Development">Web Development</option>
              <option value="Databases">Databases</option>
              <option value="Frameworks & Libraries">Frameworks & Libraries</option>
              <option value="Tools & Platforms">Tools & Platforms</option>
              <option value="Cloud / DevOps">Cloud / DevOps</option>
              <option value="Core CS Subjects">Core CS Subjects</option>
            </select>
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              placeholder="Add a skill (e.g. Python, React, SQL, Docker, DSA)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>Add Skill</span>
            </button>
          </div>

          {(formData.skills_list || []).length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {formData.skills_list.map((sk, idx) => {
                const name = typeof sk === 'string' ? sk : sk.name;
                const cat = typeof sk === 'object' && sk.category ? sk.category : '';
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-900"
                  >
                    <span>{name}</span>
                    {cat && <span className="text-[10px] font-mono text-indigo-600">({cat})</span>}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(name)}
                      className="text-indigo-500 hover:text-rose-600 transition-colors"
                      aria-label={`Remove ${name}`}
                    >
                      <X size={13} />
                    </button>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No skills added yet. Add your technical skills above to improve your Job Match accuracy and populate your Resume Builder.
            </p>
          )}
        </div>

        {/* Section 6: Projects (Synced with Resume Builder) */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-mono uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-2">
              <Briefcase size={14} /> 6. Key Projects (Synced with Resume Builder)
            </h3>
            <span className="text-[11px] text-slate-500">
              {(formData.projects || []).length} projects added
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              placeholder="Project Title (e.g. Cloud Task Manager)"
              className="px-4 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
            <input
              type="text"
              value={newProjectTech}
              onChange={(e) => setNewProjectTech(e.target.value)}
              placeholder="Tech Stack (e.g. React, Python, PostgreSQL)"
              className="px-4 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="1-line outcome or feature summary..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#FAFAF7] border border-slate-200 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddProject}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 flex-shrink-0 transition-colors"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          </div>

          {(formData.projects || []).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {formData.projects.map((proj, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-slate-200 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{proj.title || proj.name}</p>
                    {proj.tech_stack && (
                      <p className="text-[11px] font-mono text-indigo-700 mt-0.5">
                        {Array.isArray(proj.tech_stack) ? proj.tech_stack.join(', ') : proj.tech_stack}
                      </p>
                    )}
                    {(proj.description || (proj.bullets && proj.bullets[0])) && (
                      <p className="text-[11px] text-slate-600 mt-1">
                        {proj.description || proj.bullets[0]}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(idx)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    aria-label="Remove project"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Add your projects here or directly inside the Resume Builder to include them in your ATS PDF resume.
            </p>
          )}
        </div>

        {/* Submit Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            Changes saved here automatically sync with your Dashboard, Job Matches, and Resume Builder.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save Profile Information</span>
          </button>
        </div>

      </form>

    </div>
  );
}
