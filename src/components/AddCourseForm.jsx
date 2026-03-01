import React, { useState, useEffect } from 'react'

// Form to collect new course information. Calls onAdd(yearId, quarterId, course) when submitted.
const empty = { code: '', title: '', units: 4 }

// helpers for generating selection options
function renderYears(years) {
  return years.map(y => <option key={y.id} value={y.id}>{y.yearLabel}</option>)
}

function renderQuarters(quarters) {
  return quarters.map(q => <option key={q.id} value={q.id}>{q.label}</option>)
}

export default function AddCourseForm({ years, onAdd }) {
  const [form, setForm] = useState({ ...empty, yearId: years[0]?.id, quarterId: years[0]?.quarters[0]?.id })

  function change(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: name === 'units' ? Number(value) : value }))
  }

  // update quarter list when year selection changes
  useEffect(() => {
    const year = years.find(y => y.id == form.yearId)
    if (year) {
      setForm(f => ({ ...f, quarterId: year.quarters[0]?.id }))
    }
  }, [form.yearId, years])

  function submit(e) {
    e.preventDefault()
    if (!form.code || !form.title) return
    onAdd(form.yearId, form.quarterId, { code: form.code, title: form.title, units: form.units, id: 'c' + Date.now() })
    setForm({ ...empty, yearId: years[0]?.id, quarterId: years[0]?.quarters[0]?.id })
  }

  const currentYear = years.find(y => y.id == form.yearId)

  return (
    <form className="add-course-form" onSubmit={submit}>
      <select name="yearId" value={form.yearId} onChange={change}>
        {renderYears(years)}
      </select>
      <select name="quarterId" value={form.quarterId} onChange={change}>
        {currentYear && renderQuarters(currentYear.quarters)}
      </select>
      <input name="code" placeholder="Course code (e.g. HIST 10)" value={form.code} onChange={change} />
      <input name="title" placeholder="Course title" value={form.title} onChange={change} />
      <input name="units" type="number" min="0" max="6" value={form.units} onChange={change} />
      <button className="btn" type="submit">Add Course</button>
    </form>
  )
}
