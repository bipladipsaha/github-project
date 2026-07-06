'use client';

export default function ProjectsForm({ data, onChange }) {
  const projects = data.projects || [
    { name: '', desc1: '', desc2: '', techStack: '' },
    { name: '', desc1: '', desc2: '', techStack: '' },
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
    <div className="form-card" key="projects">
      <div className="form-card-header">
        <h2 className="form-card-title">
          <span className="icon">🚀</span>
          Featured Projects
        </h2>
        <p className="form-card-desc">
          Showcase up to 5 projects. Each project gets its own styled card in the SVG.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {projects.map((project, index) => (
          <div className="project-entry" key={index}>
            <div className="project-entry-header">
              <span className="project-number">
                {String(index + 1).padStart(2, '0')} / PROJECT
              </span>
              {projects.length > 1 && (
                <button
                  className="remove-project-btn"
                  onClick={() => removeProject(index)}
                  title="Remove project"
                  id={`remove-project-${index}`}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Project Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. IOT ALERT SYSTEM"
                  value={project.name}
                  onChange={(e) => updateProject(index, 'name', e.target.value)}
                  id={`input-project-name-${index}`}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tech Stack</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ESP32 · GPS NEO-6M · FIREBASE"
                  value={project.techStack}
                  onChange={(e) => updateProject(index, 'techStack', e.target.value)}
                  id={`input-project-tech-${index}`}
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Description Line 1</label>
                <textarea
                  className="form-textarea"
                  placeholder="Main description of the project..."
                  value={project.desc1}
                  onChange={(e) => updateProject(index, 'desc1', e.target.value)}
                  rows={2}
                  id={`input-project-desc1-${index}`}
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Description Line 2</label>
                <textarea
                  className="form-textarea"
                  placeholder="Additional details or features..."
                  value={project.desc2}
                  onChange={(e) => updateProject(index, 'desc2', e.target.value)}
                  rows={2}
                  id={`input-project-desc2-${index}`}
                />
              </div>
            </div>
          </div>
        ))}

        {projects.length < 5 && (
          <button className="add-project-btn" onClick={addProject} id="add-project-btn">
            + Add Another Project
          </button>
        )}
      </div>
    </div>
  );
}
