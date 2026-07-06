'use client';

import { Rocket, Trash2, Plus, Code, AlignLeft } from 'lucide-react';

export default function ProjectsForm({ data, onChange }) {
  const projects = data.projects || [
    { name: '', desc1: '', desc2: '', techStack: '' },
  ];

  const updateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, projects: updated });
  };

  const addProject = () => {
    if (projects.length >= 5) return;
    onChange({
      ...data,
      projects: [...projects, { name: '', desc1: '', desc2: '', techStack: '' }],
    });
  };

  const removeProject = (index) => {
    if (projects.length <= 1) return;
    const updated = projects.filter((_, i) => i !== index);
    onChange({ ...data, projects: updated });
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 mb-2">
        <h2 className="text-xl font-bold flex items-center gap-3 text-white">
          <Rocket className="w-5 h-5 text-[hsl(var(--brand-peach))]" />
          Featured Projects
        </h2>
        <p className="text-sm text-white/50 mt-1.5">
          Showcase up to 5 projects. Each gets its own card in the SVG.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {projects.map((project, index) => (
          <div className="rounded-xl border border-white/10 p-5 bg-white/[0.02] transition-all hover:border-white/15" key={index}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
              <span className="text-sm font-bold text-white/70 tracking-wide">
                {String(index + 1).padStart(2, '0')} / PROJECT
              </span>
              {projects.length > 1 && (
                <button
                  className="text-white/40 hover:text-red-400 p-1.5 rounded-md hover:bg-red-400/10 transition-colors text-xs font-semibold flex items-center gap-1.5"
                  onClick={() => removeProject(index)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>
            
            <div className="grid gap-4 grid-cols-2 mb-4">
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                  <Rocket className="w-3.5 h-3.5 text-[hsl(var(--brand-peach))]" /> Project Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="flex w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-[15px] text-white transition-all duration-200 placeholder:text-white/30 hover:border-white/25 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-peach))]/40 focus:border-[hsl(var(--brand-peach))]/60"
                  placeholder="e.g. IOT ALERT SYSTEM"
                  value={project.name || ''}
                  onChange={(e) => updateProject(index, 'name', e.target.value)}
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                  <Code className="w-3.5 h-3.5 text-[hsl(var(--brand-peach))]" /> Tech Stack
                </label>
                <input
                  type="text"
                  className="flex w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-[15px] text-white transition-all duration-200 placeholder:text-white/30 hover:border-white/25 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-peach))]/40 focus:border-[hsl(var(--brand-peach))]/60"
                  placeholder="e.g. ESP32 · GPS · FIREBASE"
                  value={project.techStack || ''}
                  onChange={(e) => updateProject(index, 'techStack', e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 grid-cols-1">
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                  <AlignLeft className="w-3.5 h-3.5 text-[hsl(var(--brand-peach))]" /> Description Line 1
                </label>
                <textarea
                  className="flex w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-[15px] text-white transition-all duration-200 placeholder:text-white/30 hover:border-white/25 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-peach))]/40 focus:border-[hsl(var(--brand-peach))]/60 min-h-[70px] resize-y"
                  placeholder="Main description of the project..."
                  value={project.desc1 || ''}
                  onChange={(e) => updateProject(index, 'desc1', e.target.value)}
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                  <AlignLeft className="w-3.5 h-3.5 text-[hsl(var(--brand-peach))]" /> Description Line 2
                </label>
                <textarea
                  className="flex w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-[15px] text-white transition-all duration-200 placeholder:text-white/30 hover:border-white/25 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-peach))]/40 focus:border-[hsl(var(--brand-peach))]/60 min-h-[70px] resize-y"
                  placeholder="Additional details or features..."
                  value={project.desc2 || ''}
                  onChange={(e) => updateProject(index, 'desc2', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        {projects.length < 5 && (
          <button 
            className="w-full border-2 border-dashed border-white/10 p-5 text-center text-sm font-semibold text-white/40 hover:text-white hover:border-white/25 hover:bg-white/[0.03] rounded-xl transition-all duration-200 flex flex-col items-center gap-2" 
            onClick={addProject}
          >
            <Plus className="w-5 h-5" />
            Add Another Project
          </button>
        )}
      </div>
    </div>
  );
}
