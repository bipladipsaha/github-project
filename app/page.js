'use client';

import { useState, useCallback } from 'react';
import BasicInfoForm from './components/BasicInfoForm';
import ProjectsForm from './components/ProjectsForm';
import TechStackForm from './components/TechStackForm';
import SocialLinksForm from './components/SocialLinksForm';

const STEPS = [
  { id: 'basic', label: 'Basic Info', icon: '👤' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'stack', label: 'Tech Stack', icon: '⚡' },
  { id: 'social', label: 'Links & Style', icon: '🔗' },
];

const DEFAULT_FORM_DATA = {
  fullName: '',
  githubUsername: '',
  tagline: '',
  location: '',
  university: '',
  club: '',
  bio: '',
  buildDesc: '',
  philosophy: '',
  focusAreas: '',
  availability: 'open to internships · freelance · collaboration',
  projects: [
    { name: '', desc1: '', desc2: '', techStack: '' },
    { name: '', desc1: '', desc2: '', techStack: '' },
    { name: '', desc1: '', desc2: '', techStack: '' },
  ],
  stackRow1: '',
  stackRow2: '',
  stackRow3: '',
  stackRow4: '',
  stackRow5: '',
  platformsLabel: '',
  portfolioUrl: '',
  linkedinUsername: '',
  email: '',
  twitterUsername: '',
  websiteDomain: '',
  resumeUrl: '',
  accentLight: '#FFA586',
  accentDark: '#E51A2B',
  template: 'default',
};

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFormChange = useCallback((newData) => {
    setFormData(newData);
  }, []);

  const goToStep = (step) => {
    if (step >= 0 && step < STEPS.length) {
      setCurrentStep(step);
    }
  };

  const handleGenerate = async () => {
    if (!formData.fullName || !formData.githubUsername) {
      setError('Please fill in your Full Name and GitHub Username (Step 1).');
      setCurrentStep(0);
      return;
    }

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
      a.download = `${formData.githubUsername}-github-profile.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setIsSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_FORM_DATA);
    setCurrentStep(0);
    setIsSuccess(false);
    setError(null);
  };

  if (isSuccess) {
    return (
      <>
        <Nav />
        <main className="main-content">
          <div className="success-card">
            <span className="success-icon">🎉</span>
            <h2 className="success-title">Profile Generated Successfully!</h2>
            <p className="success-desc">
              Your personalized GitHub profile has been downloaded as a ZIP file.
              Follow these steps to apply it:
            </p>
            <div className="success-steps">
              <div className="success-step">
                <span className="success-step-num">1</span>
                <p className="success-step-text">
                  Extract the ZIP file. You&apos;ll find your <code>README.md</code>,
                  <code>assets/</code> folder with all SVGs, and <code>.github/</code>
                  with the action workflows.
                </p>
              </div>
              <div className="success-step">
                <span className="success-step-num">2</span>
                <p className="success-step-text">
                  Create a GitHub repository named exactly <code>{formData.githubUsername}</code>
                  (must match your username). Make it public.
                </p>
              </div>
              <div className="success-step">
                <span className="success-step-num">3</span>
                <p className="success-step-text">
                  Push all extracted files to the <code>main</code> branch.
                  The GitHub Actions will auto-run to update your stats daily
                  and generate the snake animation.
                </p>
              </div>
              <div className="success-step">
                <span className="success-step-num">4</span>
                <p className="success-step-text">
                  Visit <code>github.com/{formData.githubUsername}</code> to see
                  your stunning new profile! 🎨
                </p>
              </div>
            </div>
            <div className="success-actions">
              <button className="btn btn-primary btn-large" onClick={handleReset} id="generate-another-btn">
                ✨ Generate Another
              </button>
              <a
                href={`https://github.com/${formData.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-large"
                id="view-profile-btn"
              >
                View GitHub Profile →
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Open Source Profile Generator
          </div>
          <h1>
            Transform Your GitHub
            <br />
            <span className="gradient-text">Into a Work of Art</span>
          </h1>
          <p className="hero-subtitle">
            Generate a stunning, SVG-based GitHub profile with animated stats,
            dark mode support, and auto-updating telemetry — in under 2 minutes.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">11+</div>
              <div className="hero-stat-label">Custom SVGs</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">2</div>
              <div className="hero-stat-label">Color Modes</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">∞</div>
              <div className="hero-stat-label">Customizations</div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ marginBottom: 'var(--space-3xl)' }}>
          <div className="section-header">
            <div className="section-number">// How It Works</div>
            <h2 className="section-title">Three Simple Steps</h2>
            <p className="section-desc">Fill in your details, generate, and push to GitHub.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">📝</span>
              <h3 className="feature-title">Fill Your Details</h3>
              <p className="feature-desc">
                Enter your name, projects, tech stack, and social links.
                Everything is customizable.
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⚙️</span>
              <h3 className="feature-title">Generate Profile</h3>
              <p className="feature-desc">
                We fetch premium SVG templates, inject your data, and bundle
                everything into a ready-to-deploy ZIP.
              </p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🚀</span>
              <h3 className="feature-title">Push & Done</h3>
              <p className="feature-desc">
                Extract, push to your GitHub profile repo, and watch
                your profile transform instantly.
              </p>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section>
          <div className="section-header">
            <div className="section-number">// Configure</div>
            <h2 className="section-title">Build Your Profile</h2>
          </div>

          {/* Step Indicator */}
          <div className="step-indicator">
            {STEPS.map((step, index) => (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  className={`step-item ${
                    index === currentStep ? 'active' : index < currentStep ? 'completed' : ''
                  }`}
                  onClick={() => goToStep(index)}
                  id={`step-btn-${step.id}`}
                >
                  <div className="step-circle">
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <span className="step-label">{step.label}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={`step-connector ${index < currentStep ? 'active' : ''}`} />
                )}
              </div>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="error-banner">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {/* Form Steps */}
          {currentStep === 0 && (
            <BasicInfoForm data={formData} onChange={handleFormChange} />
          )}
          {currentStep === 1 && (
            <ProjectsForm data={formData} onChange={handleFormChange} />
          )}
          {currentStep === 2 && (
            <TechStackForm data={formData} onChange={handleFormChange} />
          )}
          {currentStep === 3 && (
            <SocialLinksForm data={formData} onChange={handleFormChange} />
          )}

          {/* Navigation Buttons */}
          <div className="form-actions">
            <button
              className="btn btn-secondary"
              onClick={() => goToStep(currentStep - 1)}
              disabled={currentStep === 0}
              id="prev-step-btn"
            >
              ← Previous
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                className="btn btn-primary"
                onClick={() => goToStep(currentStep + 1)}
                id="next-step-btn"
              >
                Next Step →
              </button>
            ) : (
              <button
                className="btn btn-primary btn-large"
                onClick={handleGenerate}
                disabled={isGenerating}
                id="generate-btn"
              >
                {isGenerating ? (
                  <>
                    <span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    Generating...
                  </>
                ) : (
                  <>🎨 Generate Profile</>
                )}
              </button>
            )}
          </div>

          {/* Live Preview */}
          {formData.fullName && (
            <div className="preview-panel">
              <div className="preview-header">
                <span className="preview-dot red" />
                <span className="preview-dot yellow" />
                <span className="preview-dot green" />
                <span className="preview-title">README.md — preview</span>
              </div>
              <div className="preview-body">
{`<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/dark/header-v1.svg"/>
    <img src="assets/header-v1.svg" alt="${formData.fullName}"/>
  </picture>
</div>

<!-- 01 — whoami -->
Name: ${formData.fullName}
Role: ${formData.tagline || '...'}
Location: ${formData.location || '...'}
University: ${formData.university || '...'}

<!-- 02 — projects -->
${(formData.projects || []).filter(p => p.name).map((p, i) => 
  `${String(i + 1).padStart(2, '0')} / ${p.name.toUpperCase()}
    ${p.desc1 || '...'}
    Tech: ${p.techStack || '...'}`
).join('\n\n')}

<!-- 03 — stack -->
Row 1: ${formData.stackRow1 || '...'}
Row 2: ${formData.stackRow2 || '...'}
Row 3: ${formData.stackRow3 || '...'}
Row 4: ${formData.stackRow4 || '...'}
Row 5: ${formData.stackRow5 || '...'}

<!-- GitHub Stats + Snake Animation + Footer -->
✨ All auto-generated with dark mode support`}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <div className="loading-text">Forging your profile...</div>
          <div className="loading-subtext">
            Downloading SVGs → Applying customizations → Bundling ZIP
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

function Nav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="/" className="nav-brand">
          <div className="nav-logo">PF</div>
          <span className="nav-title">
            Profile<span>Forge</span>
          </span>
        </a>
        <div className="nav-links">
          <a
            href="https://github.com/bipladipsaha"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-github"
            id="nav-github-link"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-text">
          Built with ❤️ by{' '}
          <a href="https://github.com/bipladipsaha" target="_blank" rel="noopener noreferrer">
            Bipladip Saha
          </a>
        </p>
        <p className="footer-credit">
          Template credit: Sharann-del
        </p>
      </div>
    </footer>
  );
}
