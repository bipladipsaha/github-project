'use client';

import { Zap, Layers, Server, Box, Terminal, Cpu, Globe } from 'lucide-react';

export default function TechStackForm({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const CATEGORIES = [
    { label: 'Languages & Core', icon: Terminal, field: 'stackRow1', placeholder: 'e.g. Python, Java, C, C++, JavaScript', hint: 'Primary programming languages' },
    { label: 'Frameworks & Databases', icon: Server, field: 'stackRow2', placeholder: 'e.g. MongoDB, Firebase, SQL, REST APIs', hint: 'Frameworks & data technologies' },
    { label: 'Platforms & Hardware', icon: Cpu, field: 'stackRow3', placeholder: 'e.g. Arduino, ESP32, Cloudflare, Vercel', hint: 'Cloud & hardware platforms' },
    { label: 'Cloud & Tools', icon: Box, field: 'stackRow4', placeholder: 'e.g. Git, GitHub, VS Code, Figma', hint: 'Dev tools & IDEs' },
    { label: 'Concepts & Domains', icon: Layers, field: 'stackRow5', placeholder: 'e.g. Machine Learning, IoT, DSA', hint: 'Specializations' },
    { label: 'Platforms Label', icon: Globe, field: 'platformsLabel', placeholder: 'e.g. BACKEND / ML / IOT', hint: 'Short label for telemetry section' },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-4 mb-2">
        <h2 className="text-xl font-bold flex items-center gap-3 text-white">
          <Zap className="w-5 h-5 text-[hsl(var(--brand-peach))]" />
          Tech Stack & Skills
        </h2>
        <p className="text-sm text-white/50 mt-1.5">
          Your skills are organized into 5 categories in the stack SVG.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.field} className="space-y-2.5">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-[hsl(var(--brand-peach))]" />
                {cat.label}
              </label>
              <input
                type="text"
                className="flex w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-[15px] text-white transition-all duration-200 placeholder:text-white/30 hover:border-white/25 hover:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-peach))]/40 focus:border-[hsl(var(--brand-peach))]/60 focus:bg-white/[0.07]"
                placeholder={cat.placeholder}
                value={data[cat.field] || ''}
                onChange={(e) => handleChange(cat.field, e.target.value)}
              />
              <span className="text-xs text-white/30 block ml-1">{cat.hint}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
