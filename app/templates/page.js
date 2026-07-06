'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, SlidersHorizontal, ArrowRight, ChevronRight, Sparkles, Clock, Palette } from 'lucide-react';
import { useState } from 'react';

const Github = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const MOCK_TEMPLATES = [
  {
    id: 'default',
    title: 'Developer Signature',
    description: 'A comprehensive, dark-themed profile with telemetry, project showcases, and animated SVG headers.',
    categories: ['Developer', 'Dark', 'Animated'],
    difficulty: 'Easy',
    image: 'https://raw.githubusercontent.com/Sharann-del/Sharann-del/main/assets/dark/header-v1.svg',
    featured: true,
  }
];

const COMING_SOON = [
  { title: 'Minimal Clean', desc: 'A stripped-back, light-mode profile for designers who let their work speak.', tags: ['Minimal', 'Light'] },
  { title: 'Cyber Terminal', desc: 'Green-on-black hacker aesthetic with a scrolling terminal header animation.', tags: ['Hacker', 'Dark', 'Terminal'] },
  { title: 'Gradient Mesh', desc: 'Vibrant gradients with a bento-grid layout for creative developers.', tags: ['Creative', 'Gradient'] },
  { title: 'Monochrome Pro', desc: 'Elegant black & white with precise Swiss typography and clean lines.', tags: ['Typography', 'B&W'] },
  { title: 'Neon Glow', desc: 'Cyberpunk-inspired with neon accent borders and glowing stat counters.', tags: ['Neon', 'Dark', 'Animated'] },
];

export default function TemplateCatalog() {
  const [search, setSearch] = useState('');

  const filteredTemplates = MOCK_TEMPLATES.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.categories.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="flex h-5 w-5 rounded-md bg-gradient-to-tr from-[hsl(var(--brand-peach))] to-[hsl(var(--brand-maroon))]"></span>
            ProfileForge
          </Link>
          <div className="flex items-center gap-4">
            <Link href="https://github.com/bipladipsaha/github-project" target="_blank" className="text-muted-foreground hover:text-foreground">
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-border pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Template Catalog</h1>
            <p className="text-lg text-muted-foreground max-w-xl">Browse high-quality templates for your GitHub profile. Select a style to preview and customize.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search templates..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <button className="h-10 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* ─── FEATURED TEMPLATE ─── */}
        {filteredTemplates.filter(t => t.featured).map((template) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            key={template.id}
            className="mb-16"
          >
            <div className="text-xs font-semibold text-[hsl(var(--brand-peach))] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Featured Template
            </div>
            <div className="group relative rounded-2xl border border-border bg-card/50 overflow-hidden hover:border-white/20 transition-all shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                {/* Preview */}
                <div className="lg:col-span-3 bg-[#0d1117] p-6 md:p-10 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={template.image} alt={template.title} className="w-full max-w-2xl transition-transform duration-500 group-hover:scale-[1.02]" />
                </div>
                {/* Info */}
                <div className="lg:col-span-2 p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-green-500/10 text-green-400">
                      Available Now
                    </span>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground">
                      {template.difficulty}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight mb-3">{template.title}</h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{template.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {template.categories.map(cat => (
                      <span key={cat} className="inline-flex items-center rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground bg-background/50">
                        {cat}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href={`/customize/${template.id}`} className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-6 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 gap-2 group/btn">
                      Start Customizing
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                    <Link href={`/templates/${template.id}`} className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-transparent px-6 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground gap-2">
                      Full Preview
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* ─── COMING SOON GRID ─── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-2xl font-bold tracking-tight">Coming Soon</h2>
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{COMING_SOON.length} templates</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMING_SOON.map((template, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                key={template.title}
                className="group relative flex flex-col rounded-xl border border-border/50 bg-card/20 text-card-foreground overflow-hidden hover:border-border transition-all"
              >
                {/* Placeholder preview */}
                <div className="relative w-full h-40 bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center border-b border-border/30">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                    <Palette className="w-10 h-10" />
                    <span className="text-xs font-semibold uppercase tracking-widest">Preview Coming Soon</span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg leading-none tracking-tight">{template.title}</h3>
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground/60 border-border/50">
                      Soon
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground/70 mb-5 flex-1">{template.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {template.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center rounded-md border border-border/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground/50 bg-background/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {filteredTemplates.length === 0 && (
          <div className="py-24 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* ─── REQUEST TEMPLATE CTA ─── */}
        <div className="mt-16 mb-8 rounded-2xl border border-dashed border-border p-10 text-center bg-card/10">
          <Palette className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold mb-2">Want a custom template?</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            We&apos;re building new templates every week. Request a style or submit your own design.
          </p>
          <Link href="https://github.com/bipladipsaha/github-project/issues" target="_blank" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground gap-2">
            <Github className="w-4 h-4" />
            Request on GitHub
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-4 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex h-4 w-4 rounded-sm bg-gradient-to-tr from-[hsl(var(--brand-peach))] to-[hsl(var(--brand-maroon))]"></span>
            ProfileForge &copy; {new Date().getFullYear()}
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="https://github.com/bipladipsaha/github-project" target="_blank" className="hover:text-foreground transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
