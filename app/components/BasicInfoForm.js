'use client';

import { useState } from 'react';

export default function BasicInfoForm({ data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="form-card" key="basic-info">
      <div className="form-card-header">
        <h2 className="form-card-title">
          <span className="icon">👤</span>
          Basic Information
        </h2>
        <p className="form-card-desc">
          Tell us about yourself. This info will appear in your profile header and about section.
        </p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            Full Name <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Bipladip Saha"
            value={data.fullName || ''}
            onChange={(e) => handleChange('fullName', e.target.value)}
            id="input-full-name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            GitHub Username <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. bipladipsaha"
            value={data.githubUsername || ''}
            onChange={(e) => handleChange('githubUsername', e.target.value)}
            id="input-github-username"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Tagline / Role <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. B.Tech CSE (AI & ML) student — Kolkata, India."
            value={data.tagline || ''}
            onChange={(e) => handleChange('tagline', e.target.value)}
            id="input-tagline"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Location <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Kolkata, IN — 22.57° N"
            value={data.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            id="input-location"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            University / Organization
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. IEM — 2024 / 2028"
            value={data.university || ''}
            onChange={(e) => handleChange('university', e.target.value)}
            id="input-university"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Club / Team
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. IDECLAB — Research and Open Innovation"
            value={data.club || ''}
            onChange={(e) => handleChange('club', e.target.value)}
            id="input-club"
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">
            Short Bio <span className="required">*</span>
          </label>
          <textarea
            className="form-textarea"
            placeholder="e.g. B.Tech student at Institute of Engineering and Management, Kolkata."
            value={data.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={2}
            id="input-bio"
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">
            What You Build
          </label>
          <textarea
            className="form-textarea"
            placeholder="e.g. building backend & IoT — Python · Java · JS · Firebase · MongoDB · Scikit-learn."
            value={data.buildDesc || ''}
            onChange={(e) => handleChange('buildDesc', e.target.value)}
            rows={2}
            id="input-build-desc"
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">
            Philosophy / Approach
          </label>
          <textarea
            className="form-textarea"
            placeholder="e.g. drawn to systems where hardware meets intelligence."
            value={data.philosophy || ''}
            onChange={(e) => handleChange('philosophy', e.target.value)}
            rows={2}
            id="input-philosophy"
          />
        </div>

        <div className="form-group full-width">
          <label className="form-label">
            Focus Areas (comma separated)
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Backend Architecture · Embedded IoT · Machine Learning Data Pipelines"
            value={data.focusAreas || ''}
            onChange={(e) => handleChange('focusAreas', e.target.value)}
            id="input-focus-areas"
          />
          <span className="form-hint">These appear as skill tags in your header</span>
        </div>

        <div className="form-group full-width">
          <label className="form-label">
            Availability
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. open to internships · freelance · collaboration"
            value={data.availability || ''}
            onChange={(e) => handleChange('availability', e.target.value)}
            id="input-availability"
          />
        </div>
      </div>
    </div>
  );
}
