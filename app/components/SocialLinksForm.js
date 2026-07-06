'use client';

import { Link as LinkIcon, Link2, Mail, AtSign, Globe, FileText, Palette, LayoutTemplate } from 'lucide-react';

export default function SocialLinksForm({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const InputField = ({ label, icon: Icon, field, placeholder, type = "text", hint }) => (
    <div className="space-y-2.5">
      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-[hsl(var(--brand-peach))]" />}
        {label}
      </label>
      <input
        type={type}
        className="flex w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-[15px] text-white transition-all duration-200 placeholder:text-white/30 hover:border-white/25 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-peach))]/40 focus:border-[hsl(var(--brand-peach))]/60 focus:bg-white/[0.07]"
        placeholder={placeholder}
        value={data[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
      />
      {hint && <span className="text-xs text-white/30 block ml-1">{hint}</span>}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Social Links */}
      <div>
        <div className="pb-4 mb-4">
          <h2 className="text-xl font-bold flex items-center gap-3 text-white">
            <LinkIcon className="w-5 h-5 text-[hsl(var(--brand-peach))]" />
            Social Links & Contact
          </h2>
          <p className="text-sm text-white/50 mt-1.5">
            Links that appear as badges in your profile.
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1">
          <div className="grid gap-4 grid-cols-2">
            <InputField label="Portfolio URL" icon={Globe} field="portfolioUrl" type="url" placeholder="https://your-site.com" />
            <InputField label="LinkedIn" icon={Link2} field="linkedinUsername" placeholder="e.g. bipladip-saha" />
          </div>
          <div className="grid gap-4 grid-cols-2">
            <InputField label="Email" icon={Mail} field="email" type="email" placeholder="you@gmail.com" />
            <InputField label="Twitter / X" icon={AtSign} field="twitterUsername" placeholder="e.g. yourhandle" />
          </div>
          <div className="grid gap-4 grid-cols-2">
            <InputField label="Website Domain" icon={Globe} field="websiteDomain" placeholder="github.com/you" hint="Footer SVG" />
            <InputField label="Resume URL" icon={FileText} field="resumeUrl" type="url" placeholder="https://resume.pdf" />
          </div>
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <div className="pb-4 mb-4">
          <h3 className="text-lg font-bold flex items-center gap-3 text-white">
            <Palette className="w-5 h-5 text-[hsl(var(--brand-peach))]" />
            Accent Color
          </h3>
        </div>
        <div className="grid gap-5 grid-cols-2">
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Light Mode</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={data.accentLight || '#0284c7'}
                onChange={(e) => handleChange('accentLight', e.target.value)}
                className="w-11 h-11 rounded-lg border border-white/15 bg-transparent cursor-pointer shrink-0"
              />
              <input
                type="text"
                className="flex flex-1 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-peach))]/40"
                placeholder="#0284c7"
                value={data.accentLight || '#0284c7'}
                onChange={(e) => handleChange('accentLight', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Dark Mode</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={data.accentDark || '#38bdf8'}
                onChange={(e) => handleChange('accentDark', e.target.value)}
                className="w-11 h-11 rounded-lg border border-white/15 bg-transparent cursor-pointer shrink-0"
              />
              <input
                type="text"
                className="flex flex-1 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-peach))]/40"
                placeholder="#38bdf8"
                value={data.accentDark || '#38bdf8'}
                onChange={(e) => handleChange('accentDark', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Template */}
      <div>
        <div className="pb-4 mb-4">
          <h3 className="text-lg font-bold flex items-center gap-3 text-white">
            <LayoutTemplate className="w-5 h-5 text-[hsl(var(--brand-peach))]" />
            Profile Template
          </h3>
        </div>
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Template Style</label>
          <select
            className="flex w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-[15px] text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-peach))]/40"
            value={data.template || 'default'}
            onChange={(e) => handleChange('template', e.target.value)}
          >
            <option value="default" className="bg-[#0d1117]">Default Style (Sharann)</option>
            <option value="minimal" className="bg-[#0d1117]">Minimalist Style (Coming Soon)</option>
            <option value="compact" className="bg-[#0d1117]">Compact Style (Coming Soon)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
