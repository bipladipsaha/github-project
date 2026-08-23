'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Download, User, Rocket, Zap, Link2, 
  ChevronDown, ChevronUp, MapPin, Briefcase, GraduationCap, 
  AtSign, Compass, Code, AlignLeft, Globe, Mail, FileText, 
  Palette, LayoutTemplate, Plus, Trash2, Terminal, Server, 
  Cpu, Box, Layers, Check, Upload, ArrowUp, ArrowDown, Eye, EyeOff
} from 'lucide-react';
import { buildReplacements, getSVGFileList, trimProjectsSvg, cleanupCorruptedCSS } from '../../../lib/svgGenerator';
import { computeFilledSections } from '../../../lib/sectionVisibility';
import DeploymentModal from '../../components/DeploymentModal';
import StarRepoModal from '../../components/StarRepoModal';
import AuthButton from '../../components/AuthButton';
import ResumeUploader from '../../components/ResumeUploader';

const GithubIcon = ({ className, size = 24 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// ─── DEFAULT DATA ───
const DEFAULT_FORM_DATA = {
  fullName: 'John Doe',
  githubUsername: 'johndoe',
  tagline: 'Full Stack Engineer',
  location: 'San Francisco, CA',
  university: 'Tech University',
  club: 'Open Source Club',
  bio: 'Building the future of web.',
  buildDesc: 'React, Node, and Rust.',
  philosophy: 'Clean code, clear mind.',
  focusAreas: 'Frontend · Backend · Systems',
  availability: 'open to opportunities',
  projects: [
    { name: 'Project A', desc1: 'Cool thing', desc2: 'Did it well', techStack: 'React' },
  ],
  stackRow1: 'JavaScript, TypeScript, Rust',
  stackRow2: 'React, Next.js, Tailwind',
  stackRow3: 'Node.js, Postgres',
  stackRow4: 'Git, Docker, AWS',
  stackRow5: 'Figma, Notion',
  platformsLabel: 'Web / Cloud',
  portfolioUrl: 'https://johndoe.com',
  linkedinUsername: 'johndoe',
  email: 'john@doe.com',
  twitterUsername: 'johndoe',
  websiteDomain: 'johndoe.com',
  resumeUrl: '',
  sectionsOrder: ['basic', 'about', 'career', 'projects', 'stack', 'links'],
  hiddenSections: [],
  customSections: [],
  accentLight: '#FFA586',
  accentDark: '#E51A2B',
  template: 'default',
};

// ─── REUSABLE INPUT COMPONENTS ───
const InputField = ({ label, icon: Icon, value, onChange, placeholder, type = 'text', required }) => (
  <div className="space-y-2">
    <label className="text-[13px] font-bold text-white/60 uppercase tracking-wide flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-[hsl(var(--brand-peach))]/80" />}
      {label} {required && <span className="text-red-400/80">*</span>}
    </label>
    <input
      type={type}
      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-[16px] text-white/90 transition-all placeholder:text-white/20 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-peach))]/30 focus:border-[hsl(var(--brand-peach))]/50"
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const TextAreaField = ({ label, icon: Icon, value, onChange, placeholder, required, rows = 2 }) => (
  <div className="space-y-2">
    <label className="text-[13px] font-bold text-white/60 uppercase tracking-wide flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-[hsl(var(--brand-peach))]/80" />}
      {label} {required && <span className="text-red-400/80">*</span>}
    </label>
    <textarea
      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-[16px] text-white/90 transition-all placeholder:text-white/20 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-peach))]/30 focus:border-[hsl(var(--brand-peach))]/50 resize-y"
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
    />
  </div>
);

// ─── SECTION CARD ───
const SectionCard = ({ id, icon: Icon, title, description, children, defaultOpen = false, isHidden, onMoveUp, onMoveDown, onToggleVisibility, onRemoveCustom }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={`section-${id}`} className={`rounded-2xl border ${isHidden ? 'border-white/[0.04] opacity-50' : 'border-white/[0.08]'} bg-white/[0.02] overflow-hidden transition-all shadow-lg`}>
      <div className="flex items-center w-full px-4 py-3 bg-white/[0.01] border-b border-white/[0.04]">
        <button onClick={() => setOpen(!open)} className="flex-1 flex items-center justify-between text-left pr-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(var(--brand-peach))]/15 shrink-0">
              <Icon className="w-5 h-5 text-[hsl(var(--brand-peach))]" />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-white/95">{title} {isHidden && <span className="text-[12px] font-normal text-white/30 ml-2">(Hidden)</span>}</h3>
              <p className="text-[14px] text-white/50 mt-1">{description}</p>
            </div>
          </div>
        </button>
        
        <div className="flex items-center gap-1">
          {onMoveUp && (
            <button onClick={onMoveUp} className="p-2 text-white/40 hover:text-white/90 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
          {onMoveDown && (
            <button onClick={onMoveDown} className="p-2 text-white/40 hover:text-white/90 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowDown className="w-4 h-4" />
            </button>
          )}
          {onToggleVisibility && (
            <button onClick={onToggleVisibility} className="p-2 text-white/40 hover:text-white/90 hover:bg-white/10 rounded-lg transition-colors">
              {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
          {onRemoveCustom && (
            <button onClick={onRemoveCustom} className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ml-1">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setOpen(!open)} className="p-2 text-white/40 hover:text-white/90 hover:bg-white/10 rounded-lg transition-colors ml-2">
            {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && !isHidden && (
        <div className="px-6 pb-6 pt-2 border-t border-white/[0.04]">
          {children}
        </div>
      )}
    </div>
  );
};

// ─── SECTION NAV ───
const SECTION_NAV = [
  { id: 'basic', label: 'Basic', icon: User },
  { id: 'about', label: 'About', icon: AlignLeft },
  { id: 'career', label: 'Career', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: Rocket },
  { id: 'stack', label: 'Stack', icon: Zap },
  { id: 'links', label: 'Links', icon: Link2 },
];

// ─── MAIN COMPONENT ───
export default function LiveCustomizer() {
  const { id } = useParams();
  const [formData, setFormData] = useState({ ...DEFAULT_FORM_DATA, template: id });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreparingDeploy, setIsPreparingDeploy] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isStarModalOpen, setIsStarModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [deployData, setDeployData] = useState({ generatedReadme: "", assets: [] });
  const [error, setError] = useState(null);
  const [svgTemplates, setSvgTemplates] = useState({});
  const [showUploader, setShowUploader] = useState(false);
  const formRef = useRef(null);

  // Compute which sections have been filled (non-default) for conditional rendering
  const filledSections = useMemo(() => computeFilledSections(formData), [formData]);

  // Fetch all base SVG templates once
  useEffect(() => {
    const fetchAllSvgs = async () => {
      const files = getSVGFileList();
      const templates = {};
      await Promise.all(
        files.map(async (filename) => {
          try {
            const res = await fetch(`https://raw.githubusercontent.com/Sharann-del/Sharann-del/main/assets/dark/${filename}`);
            if (res.ok) templates[filename] = await res.text();
          } catch (err) {
            console.error(`Failed to fetch ${filename}:`, err);
          }
        })
      );
      setSvgTemplates(templates);
    };
    fetchAllSvgs();
  }, []);

  // Memoize rendered SVGs
  const liveSvgs = useMemo(() => {
    const rendered = {};
    const replacements = buildReplacements(formData);
    for (const [filename, templateSvg] of Object.entries(svgTemplates)) {
      let result = cleanupCorruptedCSS(templateSvg);
      for (const [key, value] of Object.entries(replacements)) {
        result = result.split(key).join(value || '');
      }
      if (filename === 'projects.svg') {
        const numProjects = (formData.projects || []).filter(p => p.name && p.name.trim() !== '').length || 1;
        result = trimProjectsSvg(result, numProjects);
      }
      result = result.replace(/--accent:\s*#[A-Fa-f0-9]{6}/g, `--accent:${formData.accentDark || '#E51A2B'}`);
      rendered[filename] = result;
    }
    return rendered;
  }, [svgTemplates, formData]);

  const update = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateProject = useCallback((index, key, value) => {
    setFormData(prev => {
      const newProjects = [...(prev.projects || [])];
      newProjects[index] = { ...newProjects[index], [key]: value };
      return { ...prev, projects: newProjects };
    });
  }, []);

  const addProject = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), { name: '', desc1: '', desc2: '', techStack: '' }]
    }));
  }, []);

  const removeProject = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index)
    }));
  }, []);

  // ─── DYNAMIC SECTION ACTIONS ───
  const moveSection = (index, direction) => {
    const newOrder = [...(formData.sectionsOrder || [])];
    if (direction === 'up' && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    }
    setFormData({ ...formData, sectionsOrder: newOrder });
  };

  const toggleSectionVisibility = (id) => {
    const newHidden = new Set(formData.hiddenSections || []);
    if (newHidden.has(id)) {
      newHidden.delete(id);
    } else {
      newHidden.add(id);
    }
    setFormData({ ...formData, hiddenSections: Array.from(newHidden) });
  };

  const addCustomSection = () => {
    const newId = `custom-${Date.now()}`;
    const newOrder = [...(formData.sectionsOrder || [])];
    newOrder.push(newId);
    setFormData({
      ...formData,
      sectionsOrder: newOrder,
      customSections: [
        ...(formData.customSections || []),
        { id: newId, title: 'Custom Section', content: 'Describe something interesting here...' }
      ]
    });
  };

  const removeCustomSection = (id) => {
    setFormData({
      ...formData,
      sectionsOrder: (formData.sectionsOrder || []).filter(s => s !== id),
      customSections: (formData.customSections || []).filter(s => s.id !== id),
      hiddenSections: (formData.hiddenSections || []).filter(s => s !== id),
    });
  };

  const updateCustomSection = (id, key, value) => {
    const newCustom = [...(formData.customSections || [])];
    const index = newCustom.findIndex(s => s.id === id);
    if (index >= 0) {
      newCustom[index] = { ...newCustom[index], [key]: value };
      setFormData({ ...formData, customSections: newCustom });
    }
  };

  // ─── RENDER HELPER ───
  const renderSectionContent = (id) => {
    if (id === 'basic') return (
      <div className="space-y-4 pt-3">
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Full Name" icon={User} value={formData.fullName} onChange={v => update('fullName', v)} placeholder="John Doe" required />
          <InputField label="GitHub Username" icon={AtSign} value={formData.githubUsername} onChange={v => update('githubUsername', v)} placeholder="johndoe" required />
        </div>
        <InputField label="Tagline / Role" icon={Briefcase} value={formData.tagline} onChange={v => update('tagline', v)} placeholder="Full Stack Engineer" required />
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Location" icon={MapPin} value={formData.location} onChange={v => update('location', v)} placeholder="San Francisco, CA" required />
          <InputField label="University" icon={GraduationCap} value={formData.university} onChange={v => update('university', v)} placeholder="Tech University" />
        </div>
        <InputField label="Club / Team" icon={Compass} value={formData.club} onChange={v => update('club', v)} placeholder="Open Source Club" />
      </div>
    );
    if (id === 'about') return (
      <div className="space-y-4 pt-3">
        <TextAreaField label="Short Bio" value={formData.bio} onChange={v => update('bio', v)} placeholder="Building the future of web." required rows={2} />
        <TextAreaField label="What You Build" value={formData.buildDesc} onChange={v => update('buildDesc', v)} placeholder="React, Node, and Rust." rows={2} />
        <TextAreaField label="Philosophy" value={formData.philosophy} onChange={v => update('philosophy', v)} placeholder="Clean code, clear mind." rows={2} />
      </div>
    );
    if (id === 'career') return (
      <div className="space-y-4 pt-3">
        <InputField label="Focus Areas" value={formData.focusAreas} onChange={v => update('focusAreas', v)} placeholder="Frontend · Backend · Systems" />
        <InputField label="Availability" value={formData.availability} onChange={v => update('availability', v)} placeholder="open to opportunities" />
      </div>
    );
    if (id === 'projects') return (
      <div className="space-y-4 pt-3">
        {projects.map((project, i) => (
          <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.01] p-4">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/[0.06]">
              <span className="text-[13px] font-bold text-white/50 uppercase tracking-wide">{String(i + 1).padStart(2, '0')} / PROJECT</span>
              {projects.length > 1 && (
                <button onClick={() => removeProject(i)} className="text-white/40 hover:text-red-400 text-[13px] font-bold flex items-center gap-1.5 transition-colors">
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <InputField label="Name" icon={Rocket} value={project.name} onChange={v => updateProject(i, 'name', v)} placeholder="Project Name" required />
              <InputField label="Tech" icon={Code} value={project.techStack} onChange={v => updateProject(i, 'techStack', v)} placeholder="React" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TextAreaField label="Description 1" icon={AlignLeft} value={project.desc1} onChange={v => updateProject(i, 'desc1', v)} placeholder="Main description..." rows={2} />
              <TextAreaField label="Description 2" icon={AlignLeft} value={project.desc2} onChange={v => updateProject(i, 'desc2', v)} placeholder="Additional details..." rows={2} />
            </div>
          </div>
        ))}
        {projects.length < 5 && (
          <button onClick={addProject} className="w-full border-2 border-dashed border-white/10 p-5 text-center text-[15px] font-bold text-white/40 hover:text-white/80 hover:border-white/20 hover:bg-white/[0.03] rounded-xl transition-all flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Add Another Project
          </button>
        )}
      </div>
    );
    if (id === 'stack') return (
      <div className="space-y-3 pt-3">
        {STACK_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <InputField key={cat.field} label={cat.label} icon={Icon} value={formData[cat.field]} onChange={v => update(cat.field, v)} placeholder={cat.placeholder} />
          );
        })}
        <InputField label="Platforms Label" icon={Globe} value={formData.platformsLabel} onChange={v => update('platformsLabel', v)} placeholder="Web / Cloud" />
      </div>
    );
    if (id === 'links') return (
      <div className="space-y-4 pt-3">
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Portfolio" icon={Globe} value={formData.portfolioUrl} onChange={v => update('portfolioUrl', v)} placeholder="https://your-site.com" type="url" />
          <InputField label="LinkedIn" icon={Link2} value={formData.linkedinUsername} onChange={v => update('linkedinUsername', v)} placeholder="johndoe" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Email" icon={Mail} value={formData.email} onChange={v => update('email', v)} placeholder="john@doe.com" type="email" />
          <InputField label="Twitter / X" icon={AtSign} value={formData.twitterUsername} onChange={v => update('twitterUsername', v)} placeholder="johndoe" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Website" icon={Globe} value={formData.websiteDomain} onChange={v => update('websiteDomain', v)} placeholder="johndoe.com" />
          <InputField label="Resume" icon={FileText} value={formData.resumeUrl} onChange={v => update('resumeUrl', v)} placeholder="https://resume.pdf" type="url" />
        </div>

        {/* Accent Colors */}
        <div className="pt-3">
          <p className="text-[13px] font-bold text-white/60 uppercase tracking-wide mb-3 flex items-center gap-2"><Palette className="w-3.5 h-3.5 text-[hsl(var(--brand-peach))]/80" /> Accent Colors</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input type="color" value={formData.accentLight || '#FFA586'} onChange={e => update('accentLight', e.target.value)} className="w-12 h-12 rounded-lg border border-white/10 bg-transparent cursor-pointer shrink-0" />
              <div>
                <div className="text-[13px] font-semibold text-white/50">Light Mode</div>
                <div className="text-[15px] text-white/90 font-mono mt-0.5">{formData.accentLight || '#FFA586'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={formData.accentDark || '#E51A2B'} onChange={e => update('accentDark', e.target.value)} className="w-12 h-12 rounded-lg border border-white/10 bg-transparent cursor-pointer shrink-0" />
              <div>
                <div className="text-[13px] font-semibold text-white/50">Dark Mode</div>
                <div className="text-[15px] text-white/90 font-mono mt-0.5">{formData.accentDark || '#E51A2B'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Template Select */}
        <div className="pt-4">
          <label className="text-[13px] font-bold text-white/60 uppercase tracking-wide flex items-center gap-2 mb-2">
            <LayoutTemplate className="w-3.5 h-3.5 text-[hsl(var(--brand-peach))]/80" /> Template
          </label>
          <select
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-[16px] text-white/90 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-peach))]/30"
            value={formData.template || 'default'}
            onChange={e => update('template', e.target.value)}
          >
            <option value="default" className="bg-[#0d1117]">Default Style (Sharann)</option>
            <option value="minimal" className="bg-[#0d1117]">Minimalist (Coming Soon)</option>
            <option value="compact" className="bg-[#0d1117]">Compact (Coming Soon)</option>
          </select>
        </div>
      </div>
    );
    if (id.startsWith('custom-')) {
      const customData = (formData.customSections || []).find(s => s.id === id);
      if (!customData) return null;
      return (
        <div className="space-y-4 pt-3">
          <InputField label="Section Title" icon={FileText} value={customData.title} onChange={v => updateCustomSection(id, 'title', v)} placeholder="My Journey" required />
          <TextAreaField label="Section Content" icon={AlignLeft} value={customData.content} onChange={v => updateCustomSection(id, 'content', v)} placeholder="Describe this section..." required rows={4} />
        </div>
      );
    }
    return null;
  };

  const getSectionProps = (id) => {
    if (id === 'basic') return { icon: User, title: 'Basic Information', description: 'Name, username, role, and location', defaultOpen: true };
    if (id === 'about') return { icon: AlignLeft, title: 'About You', description: 'Bio, what you build, and philosophy' };
    if (id === 'career') return { icon: Briefcase, title: 'Career', description: 'Focus areas and availability' };
    if (id === 'projects') return { icon: Rocket, title: 'Featured Projects', description: `${projects.filter(p => p.name).length} project(s) added` };
    if (id === 'stack') return { icon: Zap, title: 'Tech Stack', description: 'Skills organized into 5 categories' };
    if (id === 'links') return { icon: Link2, title: 'Links & Style', description: 'Social links, accent colors, and template' };
    if (id.startsWith('custom-')) {
      const customData = (formData.customSections || []).find(s => s.id === id);
      return { icon: FileText, title: customData?.title || 'Custom Section', description: 'User-defined section' };
    }
    return {};
  };

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Handle resume auto-fill: merge extracted data into form, only overwriting non-empty extracted fields
  const handleResumeApply = useCallback((extractedData) => {
    setFormData(prev => {
      const merged = { ...prev };
      for (const [key, value] of Object.entries(extractedData)) {
        if (key === 'projects' && Array.isArray(value) && value.length > 0) {
          merged.projects = value;
        } else if (typeof value === 'string' && value.trim()) {
          merged[key] = value;
        }
      }
      return merged;
    });
    setShowUploader(false);
  }, []);

  const executeGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Generation failed');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.githubUsername || 'profile'}-assets.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const executePrepareDeploy = async () => {
    setIsPreparingDeploy(true);
    setError(null);
    try {
      const res = await fetch('/api/generate?format=json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to prepare deployment data');
      }
      const data = await res.json();
      setDeployData(data);
      setIsDeployModalOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPreparingDeploy(false);
    }
  };

  const checkStarAndProceed = (action) => {
    const hasStarred = localStorage.getItem('hasStarredRepo');
    if (!hasStarred) {
      setPendingAction(action);
      setIsStarModalOpen(true);
    } else {
      if (action === 'deploy') executePrepareDeploy();
      if (action === 'export') executeGenerate();
    }
  };

  const handleStarContinue = () => {
    localStorage.setItem('hasStarredRepo', 'true');
    setIsStarModalOpen(false);
    if (pendingAction === 'deploy') executePrepareDeploy();
    if (pendingAction === 'export') executeGenerate();
    setPendingAction(null);
  };

  const handleGenerate = () => checkStarAndProceed('export');
  const handlePrepareDeploy = () => checkStarAndProceed('deploy');

  const projects = formData.projects || [];

  const STACK_CATEGORIES = [
    { label: 'Languages & Core', icon: Terminal, field: 'stackRow1', placeholder: 'Python, Java, C++, JavaScript' },
    { label: 'Frameworks & DB', icon: Server, field: 'stackRow2', placeholder: 'React, Next.js, MongoDB' },
    { label: 'Platforms', icon: Cpu, field: 'stackRow3', placeholder: 'Arduino, ESP32, Vercel' },
    { label: 'Tools', icon: Box, field: 'stackRow4', placeholder: 'Git, Docker, VS Code' },
    { label: 'Concepts', icon: Layers, field: 'stackRow5', placeholder: 'ML, IoT, DSA' },
  ];

  return (
    <div className="customize-page flex flex-col h-[100dvh] bg-[#090b11] overflow-hidden">
      {/* ─── CENTERING WRAPPER FOR ULTRAWIDE SCREENS ─── */}
      <div className="flex flex-col h-full w-full max-w-[1600px] mx-auto bg-[hsl(var(--background))] border-x border-white/[0.04] shadow-2xl relative">
      
        {/* ─── TOP BAR ─── */}
        <header className="h-14 shrink-0 border-b border-white/[0.08] bg-black/40 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 z-20">
          <div className="flex items-center gap-2 lg:gap-4">
            <Link href="/templates" className="text-white/40 hover:text-white/90 transition-colors bg-white/5 p-2 rounded-lg hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            </Link>
            <div className="hidden lg:block h-5 w-px bg-white/10" />
            <span className="font-medium text-[13px] lg:text-[15px] text-white/50 hidden sm:inline">Editing Template: <span className="text-white/90 font-bold ml-1">{id}</span></span>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="hidden sm:block">
              <AuthButton />
            </div>
            <button 
              onClick={handlePrepareDeploy}
              disabled={isPreparingDeploy || isGenerating}
              className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--brand-peach))] text-black px-3 lg:px-5 py-2 text-[13px] lg:text-[15px] font-bold transition-all hover:bg-[hsl(var(--brand-peach))]/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-[hsl(var(--brand-peach))]/20"
            >
              {isPreparingDeploy ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> <span className="hidden sm:inline">Preparing...</span></span>
              ) : (
                <><GithubIcon className="w-4 h-4" /> <span className="hidden sm:inline">Deploy</span></>
              )}
            </button>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || isPreparingDeploy}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-3 lg:px-5 py-2 text-[13px] lg:text-[15px] font-bold transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-white/10"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> <span className="hidden sm:inline">Generating...</span></span>
              ) : (
                <><Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span></>
              )}
            </button>
          </div>
        </header>

        {/* ─── MAIN SPLIT ─── */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative">
        
          {/* ─── LEFT: FORM (60%) ─── */}
          <div className="w-full lg:w-[60%] h-[55vh] lg:h-full order-2 lg:order-1 flex flex-col overflow-hidden lg:border-r border-white/[0.08] bg-[#0c0e14]">
            
            {/* Fill Mode Toggle + Section Nav */}
            <div className="shrink-0 border-b border-white/[0.06] bg-black/20 shadow-sm z-10">
              {/* Fill Mode Toggle */}
              <div className="flex items-center gap-3 px-4 lg:px-8 py-2.5 border-b border-white/[0.04]">
                <span className="text-[12px] font-bold text-white/30 uppercase tracking-widest">Fill Mode</span>
                <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5">
                  <button
                    onClick={() => {}}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-md bg-white/10 text-white/90 transition-all"
                  >
                    <User className="w-3.5 h-3.5" />
                    Manual
                  </button>
                  <button
                    onClick={() => setShowUploader(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-md text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Resume
                  </button>
                </div>
              </div>

              {/* Section Nav */}
              <div className="flex items-center justify-start lg:justify-center gap-2 px-4 lg:px-8 py-3 lg:py-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {SECTION_NAV.map(sec => {
                  const Icon = sec.icon;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className="flex items-center gap-2 px-3 lg:px-4 py-2 text-[13px] lg:text-[15px] font-bold text-white/50 rounded-xl hover:text-white/90 hover:bg-white/10 transition-all whitespace-nowrap shrink-0"
                    >
                      <Icon className="w-4 h-4" />
                      {sec.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Form */}
            <div ref={formRef} className="flex-1 overflow-y-auto custom-scrollbar relative">
              <div className="max-w-[850px] mx-auto px-4 lg:px-10 py-6 lg:py-10 space-y-6 lg:space-y-8">

              {/* ── DYNAMIC SECTIONS ── */}
              {(formData.sectionsOrder || []).map((id, index) => {
                const props = getSectionProps(id);
                const isHidden = (formData.hiddenSections || []).includes(id);
                return (
                  <SectionCard 
                    key={id}
                    id={id}
                    icon={props.icon}
                    title={props.title}
                    description={props.description}
                    defaultOpen={props.defaultOpen}
                    isHidden={isHidden}
                    onMoveUp={index > 0 ? () => moveSection(index, 'up') : undefined}
                    onMoveDown={index < formData.sectionsOrder.length - 1 ? () => moveSection(index, 'down') : undefined}
                    onToggleVisibility={() => toggleSectionVisibility(id)}
                    onRemoveCustom={id.startsWith('custom-') ? () => removeCustomSection(id) : undefined}
                  >
                    {renderSectionContent(id)}
                  </SectionCard>
                );
              })}

              <button onClick={addCustomSection} className="w-full border-2 border-dashed border-white/10 p-5 text-center text-[15px] font-bold text-white/40 hover:text-white/80 hover:border-white/20 hover:bg-white/[0.03] rounded-xl transition-all flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Add Custom Section
              </button>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/20">
                  {error}
                </div>
              )}

              {/* Bottom spacer */}
              <div className="h-20" />
            </div>
          </div>
        </div>

          {/* ─── RIGHT: STICKY LIVE PREVIEW (40%) ─── */}
          <div className="w-full lg:w-[40%] h-[45vh] lg:h-full order-1 lg:order-2 bg-[#08090d] overflow-y-auto custom-scrollbar relative border-b lg:border-b-0 border-white/[0.08]">
            {/* Browser Chrome */}
            <div className="sticky top-0 z-10 flex items-center gap-3 px-5 py-3 bg-[#0d1117]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-sm">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1.5 bg-black/50 rounded-md border border-white/5 flex items-center gap-2">
                  <span className="text-[13px] text-white/40 font-mono tracking-tight">github.com/{formData.githubUsername || 'yourname'}</span>
                </div>
              </div>
            </div>

            {/* SVG Content Wrapper - Constrained width so it doesn't blow up on 4K screens */}
            <div className="w-full flex justify-center p-8 pb-32">
              <div className="w-full max-w-[700px] bg-[#0d1117] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                {Object.keys(liveSvgs).length > 0 ? (
                  <div className="w-full flex flex-col gap-0">
                    {/* Header — always shown at top */}
                    {filledSections.header && liveSvgs['header-v1.svg'] && <div dangerouslySetInnerHTML={{ __html: liveSvgs['header-v1.svg'] }} className="w-full" />}
                    
                    {/* Badges — conditional at top */}
                    {filledSections.badges && (
                      <div className="flex flex-wrap justify-center gap-2 my-4 px-4">
                        {formData.portfolioUrl && <img src={`https://img.shields.io/badge/PORTFOLIO-FBBF24?style=for-the-badge&logoColor=000000`} alt="Portfolio" className="h-7" />}
                        {formData.linkedinUsername && <img src={`https://img.shields.io/badge/LINKEDIN-60A5FA?style=for-the-badge&logo=linkedin&logoColor=000000`} alt="LinkedIn" className="h-7" />}
                        {formData.email && <img src={`https://img.shields.io/badge/EMAIL-F87171?style=for-the-badge&logoColor=000000`} alt="Email" className="h-7" />}
                      </div>
                    )}

                    {/* Iterate over ordered visible sections */}
                    {(filledSections.orderedVisibleSections || []).map(id => {
                      if (id === 'about') return (
                        <div key={id}>
                          {liveSvgs['s01.svg'] && <div dangerouslySetInnerHTML={{ __html: liveSvgs['s01.svg'] }} className="w-full" />}
                          {liveSvgs['whoami.svg'] && <div dangerouslySetInnerHTML={{ __html: liveSvgs['whoami.svg'] }} className="w-full" />}
                        </div>
                      );
                      if (id === 'projects') return (
                        <div key={id}>
                          {liveSvgs['s03.svg'] && <div dangerouslySetInnerHTML={{ __html: liveSvgs['s03.svg'] }} className="w-full" />}
                          {liveSvgs['projects.svg'] && <div dangerouslySetInnerHTML={{ __html: liveSvgs['projects.svg'] }} className="w-full" />}
                        </div>
                      );
                      if (id === 'stack') return (
                        <div key={id}>
                          {liveSvgs['s06.svg'] && <div dangerouslySetInnerHTML={{ __html: liveSvgs['s06.svg'] }} className="w-full" />}
                          {liveSvgs['stack.svg'] && <div dangerouslySetInnerHTML={{ __html: liveSvgs['stack.svg'] }} className="w-full" />}
                        </div>
                      );
                      if (id === 'custom' || id.startsWith('custom-')) return (
                        <div key={id}>
                          {liveSvgs[`${id}-divider.svg`] && <div dangerouslySetInnerHTML={{ __html: liveSvgs[`${id}-divider.svg`] }} className="w-full" />}
                          {liveSvgs[`${id}-content.svg`] && <div dangerouslySetInnerHTML={{ __html: liveSvgs[`${id}-content.svg`] }} className="w-full" />}
                        </div>
                      );
                      if (id === 'telemetry') return (
                        <div key={id}>
                          {liveSvgs['s04.svg'] && <div dangerouslySetInnerHTML={{ __html: liveSvgs['s04.svg'] }} className="w-full" />}
                          {liveSvgs['telemetry.svg'] && <div dangerouslySetInnerHTML={{ __html: liveSvgs['telemetry.svg'] }} className="w-full" />}
                          <div className="flex justify-center w-full px-2">
                            {liveSvgs['github-stats.svg'] && <div dangerouslySetInnerHTML={{ __html: liveSvgs['github-stats.svg'] }} className="w-full" />}
                          </div>
                          <div className="flex justify-center w-full mt-2 px-2">
                            <img src={`https://github-readme-activity-graph.vercel.app/graph?username=${formData.githubUsername}&bg_color=00000000&color=ffffff&line=ffffff&point=ffffff&area_color=ffffff&area=true&hide_border=true&radius=0&custom_title=CONTRIBUTION%20TELEMETRY`} className="w-full" alt="Contribution graph" />
                          </div>
                        </div>
                      );
                      return null;
                    })}

                    {/* Footer — always shown at bottom */}
                    {filledSections.footer && liveSvgs['footer.svg'] && <div dangerouslySetInnerHTML={{ __html: liveSvgs['footer.svg'] }} className="w-full mt-4" />}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                    <span className="w-8 h-8 border-4 border-white/10 border-t-[hsl(var(--brand-peach))] rounded-full animate-spin" />
                    <span className="text-white/40 text-[15px] font-medium tracking-wide">Rendering Profile...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <StarRepoModal 
        isOpen={isStarModalOpen}
        onClose={() => setIsStarModalOpen(false)}
        onContinue={handleStarContinue}
      />
      
      <DeploymentModal 
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        generatedReadme={deployData.generatedReadme || deployData.readmeContent}
        assets={deployData.assets}
        workflows={deployData.workflows}
      />

      {/* Resume Upload Modal */}
      {showUploader && (
        <ResumeUploader
          onApply={handleResumeApply}
          onClose={() => setShowUploader(false)}
        />
      )}
    </div>
  );
}
