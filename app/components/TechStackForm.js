'use client';

export default function TechStackForm({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="form-card" key="tech-stack">
      <div className="form-card-header">
        <h2 className="form-card-title">
          <span className="icon">⚡</span>
          Tech Stack &amp; Skills
        </h2>
        <p className="form-card-desc">
          Your skills are organized into 5 categories in the stack SVG. Fill in what fits you best.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <div className="stack-category">
          <div className="form-group">
            <label className="form-label">
              Category 1 — Languages &amp; Core
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Python, Java, C, C++, JavaScript, HTML5, CSS3"
              value={data.stackRow1 || ''}
              onChange={(e) => handleChange('stackRow1', e.target.value)}
              id="input-stack-row1"
            />
            <span className="form-hint">Primary programming languages you work with</span>
          </div>
        </div>

        <div className="stack-category">
          <div className="form-group">
            <label className="form-label">
              Category 2 — Frameworks &amp; Databases
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. MongoDB, Firebase, SQL, REST APIs, JSON"
              value={data.stackRow2 || ''}
              onChange={(e) => handleChange('stackRow2', e.target.value)}
              id="input-stack-row2"
            />
            <span className="form-hint">Frameworks, databases, and data technologies</span>
          </div>
        </div>

        <div className="stack-category">
          <div className="form-group">
            <label className="form-label">
              Category 3 — Platforms &amp; Hardware
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. ESP32, Raspberry Pi, Arduino, Sensors, Hardware"
              value={data.stackRow3 || ''}
              onChange={(e) => handleChange('stackRow3', e.target.value)}
              id="input-stack-row3"
            />
            <span className="form-hint">Cloud, infrastructure, or hardware platforms</span>
          </div>
        </div>

        <div className="stack-category">
          <div className="form-group">
            <label className="form-label">
              Category 4 — ML / AI / Specialization
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Scikit-learn, OpenCV, MediaPipe, NLP, Analytics"
              value={data.stackRow4 || ''}
              onChange={(e) => handleChange('stackRow4', e.target.value)}
              id="input-stack-row4"
            />
            <span className="form-hint">Domain-specific tools and libraries</span>
          </div>
        </div>

        <div className="stack-category">
          <div className="form-group">
            <label className="form-label">
              Category 5 — Tools &amp; Workflows
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Jupyter, Colab, Git, Problem Solving, DSA"
              value={data.stackRow5 || ''}
              onChange={(e) => handleChange('stackRow5', e.target.value)}
              id="input-stack-row5"
            />
            <span className="form-hint">Dev tools, productivity, and workflows</span>
          </div>
        </div>

        <div className="stack-category">
          <div className="form-group">
            <label className="form-label">
              Platforms Label
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. BACKEND / ML / IOT"
              value={data.platformsLabel || ''}
              onChange={(e) => handleChange('platformsLabel', e.target.value)}
              id="input-platforms-label"
            />
            <span className="form-hint">Short label that appears in your telemetry section</span>
          </div>
        </div>
      </div>
    </div>
  );
}
