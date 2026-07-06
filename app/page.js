'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, LayoutTemplate, Layers, Sparkles, Zap, Download, Eye, ChevronRight } from 'lucide-react';

const Github = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const STEPS = [
  { 
    icon: Eye, 
    title: 'Browse & Preview', 
    desc: 'Explore curated profile templates. Preview them live before committing.',
    color: 'from-blue-500/20 to-cyan-500/20'
  },
  { 
    icon: Sparkles, 
    title: 'Customize Live', 
    desc: 'Edit your name, projects, tech stack, and colors in a real-time editor.',
    color: 'from-purple-500/20 to-pink-500/20'
  },
  { 
    icon: Download, 
    title: 'Export & Deploy', 
    desc: 'Download a ready-to-use ZIP with README.md, SVGs, and GitHub Actions.',
    color: 'from-orange-500/20 to-red-500/20'
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      
      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="flex h-5 w-5 rounded-md bg-gradient-to-tr from-[hsl(var(--brand-peach))] to-[hsl(var(--brand-maroon))]"></span>
            ProfileForge
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Templates</Link>
            <Link href="https://github.com/bipladipsaha/github-project" target="_blank" className="text-muted-foreground hover:text-foreground">
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-24 pb-20">
        {/* Background blobs */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[hsl(var(--brand-peach))] rounded-full mix-blend-screen filter blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[hsl(var(--brand-maroon))] rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-[hsl(var(--brand-peach))] animate-pulse" />
            <span className="text-sm font-medium">Profile Design Studio v2.0</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            Design Your GitHub Profile <br className="hidden md:block" />
            <span className="text-gradient">Like a Portfolio</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mb-10"
          >
            Browse beautiful profile styles, preview them live, customize to your brand, and generate professional GitHub READMEs and SVGs instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <Link href="/templates" className="inline-flex h-12 items-center justify-center rounded-md bg-foreground px-8 py-2 text-sm font-medium text-background shadow transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring gap-2 group">
              Browse Templates
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="https://github.com/bipladipsaha/github-project" target="_blank" className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring gap-2">
              <Github className="w-4 h-4" />
              Star on GitHub
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── LIVE PREVIEW SHOWCASE ─── */}
      <section className="relative px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="w-full max-w-5xl mx-auto"
        >
          <div className="rounded-xl border border-border bg-card/50 shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md bg-background/50 border border-border text-xs text-muted-foreground font-mono">
                  github.com/yourname
                </div>
              </div>
            </div>
            {/* Preview content */}
            <div className="bg-[#0d1117] p-6 md:p-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://raw.githubusercontent.com/Sharann-del/Sharann-del/main/assets/dark/header-v1.svg" 
                alt="Template preview" 
                className="w-full rounded-md"
              />
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <img src="https://img.shields.io/badge/PORTFOLIO-FBBF24?style=flat-square&logoColor=000000" alt="Portfolio" />
                <img src="https://img.shields.io/badge/LINKEDIN-60A5FA?style=flat-square&logo=linkedin&logoColor=000000" alt="LinkedIn" />
                <img src="https://img.shields.io/badge/EMAIL-F87171?style=flat-square&logoColor=000000" alt="Email" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="px-4 py-20 border-t border-border/50">
        <div className="w-full max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Three simple steps to a professional GitHub profile.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="group relative rounded-2xl border border-border p-8 bg-card/30 backdrop-blur-sm hover:border-white/20 transition-all"
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-6">
                      <Icon className="w-6 h-6 text-[hsl(var(--brand-peach))]" />
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                      Step {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="px-4 py-16 border-t border-border/50">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { icon: LayoutTemplate, value: '20+', label: 'Premium Templates' },
            { icon: Layers, value: '100+', label: 'Reusable Blocks' },
            { icon: Zap, value: 'Auto', label: 'Generated SVGs' },
            { icon: Github, value: 'Ready', label: 'For GitHub' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center gap-3 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10">
                  <Icon className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-3xl font-bold">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-4 py-20 border-t border-border/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-peach))]/10 to-[hsl(var(--brand-maroon))]/10 rounded-3xl blur-2xl" />
          <div className="relative rounded-3xl border border-border p-12 md:p-16 bg-card/30 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Ready to stand out?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Your GitHub profile is your developer portfolio. Make it count.
            </p>
            <Link href="/customize/default" className="inline-flex h-12 items-center justify-center rounded-md bg-foreground px-8 py-2 text-sm font-medium text-background shadow transition-colors hover:bg-foreground/90 gap-2 group">
              Start Customizing
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border/50 px-4 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex h-4 w-4 rounded-sm bg-gradient-to-tr from-[hsl(var(--brand-peach))] to-[hsl(var(--brand-maroon))]"></span>
            ProfileForge &copy; {new Date().getFullYear()}
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/templates" className="hover:text-foreground transition-colors">Templates</Link>
            <Link href="https://github.com/bipladipsaha/github-project" target="_blank" className="hover:text-foreground transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
