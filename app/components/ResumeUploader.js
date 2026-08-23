'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, Check, AlertCircle, Loader2, Sparkles, File, ChevronDown, ChevronUp } from 'lucide-react';

// ─── Field labels for the review step ───
const FIELD_LABELS = {
  fullName: 'Full Name',
  githubUsername: 'GitHub Username',
  tagline: 'Tagline / Role',
  location: 'Location',
  university: 'University',
  club: 'Club / Team',
  bio: 'Short Bio',
  buildDesc: 'What You Build',
  philosophy: 'Philosophy',
  focusAreas: 'Focus Areas',
  availability: 'Availability',
  stackRow1: 'Languages & Core',
  stackRow2: 'Frameworks & DB',
  stackRow3: 'Platforms',
  stackRow4: 'Tools',
  stackRow5: 'Concepts',
  portfolioUrl: 'Portfolio URL',
  linkedinUsername: 'LinkedIn',
  email: 'Email',
  twitterUsername: 'Twitter / X',
  websiteDomain: 'Website Domain',
  resumeUrl: 'Resume URL',
};

// ─── States ───
const STATE = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  REVIEW: 'review',
  ERROR: 'error',
};

export default function ResumeUploader({ onApply, onClose }) {
  const [state, setState] = useState(STATE.IDLE);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [rawPreview, setRawPreview] = useState('');
  const [error, setError] = useState('');
  const [selectedFields, setSelectedFields] = useState({});
  const [showRawText, setShowRawText] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      setError('Please upload a PDF or DOCX file.');
      setState(STATE.ERROR);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      setState(STATE.ERROR);
      return;
    }

    setState(STATE.UPLOADING);
    setFileName(file.name);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      setExtractedData(data.extracted);
      setRawPreview(data.rawTextPreview || '');
      
      // Pre-select all extracted fields
      const initial = {};
      for (const key of Object.keys(data.extracted)) {
        if (key !== 'projects') {
          initial[key] = true;
        }
      }
      // Projects are always selected if found
      if (data.extracted.projects && data.extracted.projects.length > 0) {
        initial.projects = true;
      }
      setSelectedFields(initial);
      setState(STATE.REVIEW);
    } catch (err) {
      setError(err.message);
      setState(STATE.ERROR);
    }
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleApply = () => {
    if (!extractedData) return;

    const result = {};
    for (const [key, value] of Object.entries(extractedData)) {
      if (key === 'projects') {
        if (selectedFields.projects) {
          result.projects = value;
        }
      } else if (selectedFields[key]) {
        result[key] = value;
      }
    }
    onApply(result);
  };

  const toggleField = (field) => {
    setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const selectedCount = Object.values(selectedFields).filter(Boolean).length;
  const totalCount = Object.keys(selectedFields).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/[0.1] bg-[#0c0e14] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-black/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[hsl(var(--brand-peach))]/15">
              <Sparkles className="w-4.5 h-4.5 text-[hsl(var(--brand-peach))]" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-white/95">Auto-Fill from Resume</h2>
              <p className="text-[13px] text-white/40">Upload your CV to auto-populate the form</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-white/40 hover:text-white/90 hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6">
          
          {/* ── IDLE: Upload Zone ── */}
          {state === STATE.IDLE && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300
                ${dragActive 
                  ? 'border-[hsl(var(--brand-peach))] bg-[hsl(var(--brand-peach))]/5 scale-[1.02]' 
                  : 'border-white/15 hover:border-white/30 hover:bg-white/[0.02]'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="flex flex-col items-center gap-4">
                <div className={`flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${
                  dragActive ? 'bg-[hsl(var(--brand-peach))]/20 scale-110' : 'bg-white/5'
                }`}>
                  <Upload className={`w-7 h-7 transition-colors ${dragActive ? 'text-[hsl(var(--brand-peach))]' : 'text-white/40'}`} />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-white/80 mb-1">
                    {dragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
                  </p>
                  <p className="text-[14px] text-white/40">
                    or <span className="text-[hsl(var(--brand-peach))] font-medium">click to browse</span>
                  </p>
                </div>
                <div className="flex items-center gap-6 mt-2">
                  <div className="flex items-center gap-2 text-[13px] text-white/30">
                    <FileText className="w-4 h-4" />
                    <span>PDF</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-white/30">
                    <File className="w-4 h-4" />
                    <span>DOCX</span>
                  </div>
                  <span className="text-[12px] text-white/20">Max 10MB</span>
                </div>
              </div>
            </div>
          )}

          {/* ── UPLOADING: Progress ── */}
          {state === STATE.UPLOADING && (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--brand-peach))]/10 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-[hsl(var(--brand-peach))] animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[16px] font-semibold text-white/80 mb-1">Parsing your resume...</p>
                <p className="text-[14px] text-white/40">{fileName}</p>
              </div>
              <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-[hsl(var(--brand-peach))] rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {/* ── ERROR ── */}
          {state === STATE.ERROR && (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-[16px] font-semibold text-white/80 mb-2">Parsing Failed</p>
                <p className="text-[14px] text-red-400/80 max-w-md">{error}</p>
              </div>
              <button
                onClick={() => { setState(STATE.IDLE); setError(''); }}
                className="px-6 py-2.5 rounded-xl bg-white/10 text-[14px] font-medium text-white/80 hover:bg-white/15 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ── REVIEW: Extracted Data ── */}
          {state === STATE.REVIEW && extractedData && (
            <div className="space-y-5">
              {/* Success banner */}
              <div className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3">
                <Check className="w-5 h-5 text-green-400 shrink-0" />
                <div>
                  <p className="text-[14px] font-medium text-green-400">Successfully parsed {fileName}</p>
                  <p className="text-[13px] text-green-400/60">Select the fields you want to apply to the form</p>
                </div>
              </div>

              {/* Selection count */}
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-white/50">
                  {selectedCount} of {totalCount} fields selected
                </span>
                <button
                  onClick={() => {
                    const allSelected = selectedCount === totalCount;
                    const newState = {};
                    for (const key of Object.keys(selectedFields)) {
                      newState[key] = !allSelected;
                    }
                    setSelectedFields(newState);
                  }}
                  className="text-[13px] font-medium text-[hsl(var(--brand-peach))] hover:text-[hsl(var(--brand-peach))]/80 transition-colors"
                >
                  {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Field list */}
              <div className="space-y-2">
                {Object.entries(extractedData).map(([key, value]) => {
                  if (key === 'projects') {
                    if (!Array.isArray(value) || value.length === 0) return null;
                    return (
                      <button
                        key={key}
                        onClick={() => toggleField(key)}
                        className={`w-full flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                          selectedFields[key]
                            ? 'border-[hsl(var(--brand-peach))]/30 bg-[hsl(var(--brand-peach))]/5'
                            : 'border-white/[0.06] bg-white/[0.01] opacity-50'
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                          selectedFields[key] ? 'border-[hsl(var(--brand-peach))] bg-[hsl(var(--brand-peach))]/20' : 'border-white/20'
                        }`}>
                          {selectedFields[key] && <Check className="w-3 h-3 text-[hsl(var(--brand-peach))]" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-bold text-white/50 uppercase tracking-wide">Projects ({value.length})</div>
                          <div className="text-[14px] text-white/80 mt-1">
                            {value.map(p => p.name).join(', ')}
                          </div>
                        </div>
                      </button>
                    );
                  }

                  const label = FIELD_LABELS[key] || key;
                  const displayValue = typeof value === 'string' ? value : JSON.stringify(value);

                  return (
                    <button
                      key={key}
                      onClick={() => toggleField(key)}
                      className={`w-full flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                        selectedFields[key]
                          ? 'border-[hsl(var(--brand-peach))]/30 bg-[hsl(var(--brand-peach))]/5'
                          : 'border-white/[0.06] bg-white/[0.01] opacity-50'
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                        selectedFields[key] ? 'border-[hsl(var(--brand-peach))] bg-[hsl(var(--brand-peach))]/20' : 'border-white/20'
                      }`}>
                        {selectedFields[key] && <Check className="w-3 h-3 text-[hsl(var(--brand-peach))]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-bold text-white/50 uppercase tracking-wide">{label}</div>
                        <div className="text-[14px] text-white/80 mt-1 break-words">{displayValue}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Raw text toggle */}
              {rawPreview && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowRawText(!showRawText)}
                    className="flex items-center gap-2 text-[13px] text-white/30 hover:text-white/50 transition-colors"
                  >
                    {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Raw extracted text
                  </button>
                  {showRawText && (
                    <pre className="mt-3 p-4 rounded-xl bg-black/40 border border-white/[0.06] text-[12px] text-white/40 font-mono overflow-x-auto max-h-40 whitespace-pre-wrap">
                      {rawPreview}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {state === STATE.REVIEW && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-black/30">
            <button
              onClick={() => { setState(STATE.IDLE); setExtractedData(null); }}
              className="px-5 py-2.5 rounded-xl text-[14px] font-medium text-white/50 hover:text-white/80 hover:bg-white/10 transition-all"
            >
              Upload Different File
            </button>
            <button
              onClick={handleApply}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[hsl(var(--brand-peach))] text-black text-[14px] font-bold transition-all hover:bg-[hsl(var(--brand-peach))]/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[hsl(var(--brand-peach))]/20"
            >
              <Check className="w-4 h-4" />
              Apply {selectedCount} Field{selectedCount !== 1 ? 's' : ''} to Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
