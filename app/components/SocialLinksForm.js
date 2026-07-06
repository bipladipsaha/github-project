'use client';

export default function SocialLinksForm({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="form-card" key="social-links">
      <div className="form-card-header">
        <h2 className="form-card-title">
          <span className="icon">🔗</span>
          Social Links &amp; Contact
        </h2>
        <p className="form-card-desc">
          Add links that will appear as badges in your profile header.
        </p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Portfolio URL</label>
          <input
            type="url"
            className="form-input"
            placeholder="https://your-portfolio.com"
            value={data.portfolioUrl || ''}
            onChange={(e) => handleChange('portfolioUrl', e.target.value)}
            id="input-portfolio-url"
          />
        </div>

        <div className="form-group">
          <label className="form-label">LinkedIn Username</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. bipladip-saha"
            value={data.linkedinUsername || ''}
            onChange={(e) => handleChange('linkedinUsername', e.target.value)}
            id="input-linkedin"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            placeholder="e.g. you@gmail.com"
            value={data.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            id="input-email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Twitter / X Username</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. yourhandle"
            value={data.twitterUsername || ''}
            onChange={(e) => handleChange('twitterUsername', e.target.value)}
            id="input-twitter"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Website / Domain</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. github.com/bipladipsaha"
            value={data.websiteDomain || ''}
            onChange={(e) => handleChange('websiteDomain', e.target.value)}
            id="input-website"
          />
          <span className="form-hint">Appears in the footer SVG</span>
        </div>

        <div className="form-group">
          <label className="form-label">Resume URL</label>
          <input
            type="url"
            className="form-input"
            placeholder="https://your-resume.pdf"
            value={data.resumeUrl || ''}
            onChange={(e) => handleChange('resumeUrl', e.target.value)}
            id="input-resume"
          />
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-xl)' }}>
        <div className="form-card-header">
          <h3 className="form-card-title" style={{ fontSize: '1.1rem' }}>
            <span className="icon">🎨</span>
            Accent Color
          </h3>
          <p className="form-card-desc">
            Choose a primary accent color for light mode. Dark mode uses a complementary brighter variant.
          </p>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Light Mode Accent</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <input
                type="color"
                value={data.accentLight || '#0284c7'}
                onChange={(e) => handleChange('accentLight', e.target.value)}
                style={{
                  width: '48px',
                  height: '36px',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  cursor: 'pointer',
                  padding: '2px',
                }}
                id="input-accent-light"
              />
              <input
                type="text"
                className="form-input"
                placeholder="#0284c7"
                value={data.accentLight || '#0284c7'}
                onChange={(e) => handleChange('accentLight', e.target.value)}
                style={{ maxWidth: '140px' }}
                id="input-accent-light-text"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Dark Mode Accent</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <input
                type="color"
                value={data.accentDark || '#38bdf8'}
                onChange={(e) => handleChange('accentDark', e.target.value)}
                style={{
                  width: '48px',
                  height: '36px',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  cursor: 'pointer',
                  padding: '2px',
                }}
                id="input-accent-dark"
              />
              <input
                type="text"
                className="form-input"
                placeholder="#38bdf8"
                value={data.accentDark || '#38bdf8'}
                onChange={(e) => handleChange('accentDark', e.target.value)}
                style={{ maxWidth: '140px' }}
                id="input-accent-dark-text"
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-xl)' }}>
        <div className="form-card-header">
          <h3 className="form-card-title" style={{ fontSize: '1.1rem' }}>
            <span className="icon">🖼️</span>
            Profile Template
          </h3>
          <p className="form-card-desc">
            Select the overall design template for your generated profile SVGs. More templates coming soon!
          </p>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Template Style</label>
            <select
              className="form-select"
              value={data.template || 'default'}
              onChange={(e) => handleChange('template', e.target.value)}
              id="input-template"
            >
              <option value="default">Default Style (Sharann)</option>
              <option value="minimal">Minimalist Style (Coming Soon)</option>
              <option value="compact">Compact Style (Coming Soon)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
