import React from 'react'

// Sidebar shown on the right-hand side with basic controls
// for manipulating the overall plan.
export default function Sidebar({ onAddYear, onReset }) {
  return (
    <aside className="planner-sidebar">
      <div className="brand">BruinPlan</div>
      <p className="lead">Build your 4‑year plan. Add years and place courses into quarters.</p>
      <div className="sidebar-actions">
        <button className="btn" onClick={onAddYear}>+ Add Year</button>
        <button className="btn btn-ghost" onClick={onReset}>Reset</button>
      </div>
      <div className="help">Tip: click 'Edit' on a course to change its details.</div>
    </aside>
  )
}
