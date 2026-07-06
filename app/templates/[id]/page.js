'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Layout, Image as ImageIcon, FileCode2, Play } from 'lucide-react';

const MOCK_TEMPLATES = {
  default: {
    id: 'default',
    title: 'Developer Signature',
    description: 'A comprehensive, dark-themed profile with telemetry, project showcases, and animated SVG headers.',
    features: ['Dark Mode Ready', 'Animated Stats', 'Custom Projects', 'Auto-updating Telemetry'],
    widgets: ['Contribution Snake', 'Language Stats', 'Activity Graph'],
    image: 'https://raw.githubusercontent.com/Sharann-del/Sharann-del/main/assets/dark/header-v1.svg',
  }
};

export default function TemplateDetail() {
  const { id } = useParams();
  const template = MOCK_TEMPLATES[id] || MOCK_TEMPLATES.default;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4 gap-4">
          <Link href="/templates" className="inline-flex items-center justify-center rounded-md h-9 w-9 hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-semibold text-lg flex items-center gap-2">
            Back to Catalog
          </span>
        </div>
      </nav>

      <main className="container mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left: Info */}
          <div className="flex flex-col gap-8 lg:col-span-1">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-extrabold tracking-tight mb-4"
              >
                {template.title}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-muted-foreground"
              >
                {template.description}
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-4"
            >
              <Link href={`/customize/${template.id}`} className="inline-flex h-12 w-full items-center justify-center rounded-md bg-foreground px-8 py-2 text-md font-medium text-background shadow transition-colors hover:bg-foreground/90 gap-2">
                Use Template
              </Link>
              <button className="inline-flex h-12 w-full items-center justify-center rounded-md border border-input bg-transparent px-8 py-2 text-md font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground gap-2">
                <Play className="w-4 h-4 fill-current" />
                Live Demo
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6 pt-6 border-t border-border"
            >
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <Layout className="w-5 h-5 text-[hsl(var(--brand-peach))]" />
                  Features
                </h3>
                <ul className="space-y-3">
                  {template.features.map(feat => (
                    <li key={feat} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-[hsl(var(--brand-peach))] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 mt-8">
                  <FileCode2 className="w-5 h-5 text-[hsl(var(--brand-peach))]" />
                  Included Widgets
                </h3>
                <div className="flex flex-wrap gap-2">
                  {template.widgets.map(w => (
                    <span key={w} className="inline-flex items-center rounded-md border border-border px-3 py-1 text-sm bg-muted/50">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Preview Gallery */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-xl border border-border bg-card p-2 md:p-8 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur-md border border-border rounded-full px-3 py-1.5 text-xs font-medium z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon className="w-3 h-3" />
                Preview Mode
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={template.image} alt={template.title} className="w-full rounded-md object-cover border border-border/50 bg-background" />
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}
