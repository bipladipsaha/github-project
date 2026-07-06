'use client';

import { User, MapPin, Briefcase, GraduationCap, AtSign, Compass } from 'lucide-react';

export default function BasicInfoForm({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const InputField = ({ label, icon: Icon, field, placeholder, type = 'text', required }) => (
    <div className="space-y-2.5">
      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-[hsl(var(--brand-peach))]" />}
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        className="flex w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-[15px] text-white transition-all duration-200 placeholder:text-white/30 hover:border-white/25 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-peach))]/40 focus:border-[hsl(var(--brand-peach))]/60 focus:bg-white/[0.07]"
        placeholder={placeholder}
        value={data[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
      />
    </div>
  );

  const TextAreaField = ({ label, icon: Icon, field, placeholder, hint, required }) => (
    <div className="space-y-2.5">
      <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-[hsl(var(--brand-peach))]" />}
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <textarea
        className="flex w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-[15px] text-white transition-all duration-200 placeholder:text-white/30 hover:border-white/25 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-peach))]/40 focus:border-[hsl(var(--brand-peach))]/60 focus:bg-white/[0.07] min-h-[90px] resize-y"
        placeholder={placeholder}
        value={data[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
      />
      {hint && <span className="text-xs text-white/40 block ml-1">{hint}</span>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="pb-4 mb-2">
        <h2 className="text-xl font-bold flex items-center gap-3 text-white">
          <User className="w-5 h-5 text-[hsl(var(--brand-peach))]" />
          Basic Information
        </h2>
        <p className="text-sm text-white/50 mt-1.5">
          This info will appear in your profile header and about section.
        </p>
      </div>

      <div className="grid gap-5 grid-cols-1">
        <div className="grid gap-5 grid-cols-2">
          <InputField label="Full Name" icon={User} field="fullName" placeholder="e.g. Bipladip Saha" required />
          <InputField label="GitHub Username" icon={AtSign} field="githubUsername" placeholder="e.g. bipladipsaha" required />
        </div>
        <InputField label="Tagline / Role" icon={Briefcase} field="tagline" placeholder="e.g. B.Tech CSE (AI & ML) student — Kolkata, India." required />
        <div className="grid gap-5 grid-cols-2">
          <InputField label="Location" icon={MapPin} field="location" placeholder="e.g. Kolkata, IN" required />
          <InputField label="University" icon={GraduationCap} field="university" placeholder="e.g. IEM — 2024/2028" />
        </div>
        <InputField label="Club / Team" icon={Compass} field="club" placeholder="e.g. IDECLAB — Research and Open Innovation" />
        
        <TextAreaField label="Short Bio" field="bio" placeholder="e.g. B.Tech student at Institute of Engineering and Management, Kolkata." required />
        <TextAreaField label="What You Build" field="buildDesc" placeholder="e.g. building backend & IoT — Python · Java · JS · Firebase." />
        <TextAreaField label="Philosophy" field="philosophy" placeholder="e.g. drawn to systems where hardware meets intelligence." />
        
        <InputField label="Focus Areas" field="focusAreas" placeholder="e.g. Backend Architecture · Embedded IoT · ML Pipelines" />
        <InputField label="Availability" field="availability" placeholder="e.g. open to internships · freelance · collaboration" />
      </div>
    </div>
  );
}
