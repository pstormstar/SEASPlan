import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Printer, Upload } from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';
import { exportCSV, exportPDF, importCSV } from '../utils/exportPlan';

const ExportButton = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  // Keep file input at top level — NOT inside the overflow:hidden dropdown
  const fileInputRef = useRef(null);
  const planner = usePlannerStore(s => s.planner);
  const availableCourses = usePlannerStore(s => s.availableCourses);
  const setPlanner = usePlannerStore(s => s.setPlanner);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleImportClick = () => {
    setOpen(false);
    // Small delay so dropdown has closed before file dialog opens
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset so same file can be re-imported
    try {
      console.log('[Import] Reading file:', file.name);
      const newPlanner = await importCSV(file, availableCourses);
      console.log('[Import] Parsed planner:', newPlanner);
      const totalCourses = Object.values(newPlanner).reduce((s, a) => s + a.length, 0);
      console.log('[Import] Total courses found:', totalCourses);
      setPlanner(newPlanner);
      console.log('[Import] setPlanner called');
    } catch (err) {
      console.error('[Import] Error:', err);
      alert(`Import failed: ${err.message}`);
    }
  };

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    width: '100%',
    padding: '0.65rem 1rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    textAlign: 'left',
    transition: 'background 0.15s',
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Hidden file input lives here — outside overflow:hidden dropdown */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <button
        className="header-btn btn-login"
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <Download size={15} />
        Export / Import
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          minWidth: '210px',
          zIndex: 1000,
        }}>
          {/* Export section */}
          <div style={{ padding: '0.4rem 1rem 0.2rem', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
            Export
          </div>
          <button
            onClick={() => { exportCSV(planner); setOpen(false); }}
            style={itemStyle}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f4f8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ color: 'var(--ucla-blue)' }}><FileText size={15} /></span>
            Export as CSV
          </button>
          <button
            onClick={() => { exportPDF(planner); setOpen(false); }}
            style={itemStyle}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f4f8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ color: 'var(--ucla-blue)' }}><Printer size={15} /></span>
            Print / Save as PDF
          </button>

          {/* Divider */}
          <div style={{ margin: '0.35rem 0', borderTop: '1px solid var(--border-color)' }} />

          {/* Import section */}
          <div style={{ padding: '0.4rem 1rem 0.2rem', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
            Import
          </div>
          <button
            onClick={handleImportClick}
            style={itemStyle}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f4f8'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ color: 'var(--ucla-blue)' }}><Upload size={15} /></span>
            Import from CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
