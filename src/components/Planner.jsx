import React, { useState, useEffect } from 'react'
// Top-level component orchestrating the planner state and layout.
import Sidebar from './Sidebar'
import YearGrid from './YearGrid'
import AddCourseForm from './AddCourseForm'
import { initialPlan } from '../plannerData'
import '../planner.css'

export default function Planner() {
  const [plan, setPlan] = useState(() => {
    try {
      const raw = localStorage.getItem('plan')
      return raw ? JSON.parse(raw) : initialPlan
    } catch {
      return initialPlan
    }
  })

  useEffect(() => {
    localStorage.setItem('plan', JSON.stringify(plan))
  }, [plan])

  function addYear() {
    const newYear = {
      id: Date.now(),
      yearLabel: `Year ${plan.length + 1}`,
      quarters: [
        { id: 'q1', label: 'Fall', courses: [] },
        { id: 'q2', label: 'Winter', courses: [] },
        { id: 'q3', label: 'Spring', courses: [] },
        { id: 'q4', label: 'Summer', courses: [] }
      ]
    }
    setPlan(p => [...p, newYear])
  }

  function resetPlan() {
    localStorage.removeItem('plan')
    setPlan(initialPlan)
  }

  function addCourseToQuarter(yearId, quarterId, course) {
    setPlan(p => p.map(y => {
      if (y.id !== yearId) return y
      return { ...y, quarters: y.quarters.map(q => q.id === quarterId ? { ...q, courses: [...q.courses, course] } : q) }
    }))
  }

  function removeCourse(yearId, quarterId, courseId) {
    setPlan(p => p.map(y => {
      if (y.id !== yearId) return y
      return { ...y, quarters: y.quarters.map(q => q.id === quarterId ? { ...q, courses: q.courses.filter(c => c.id !== courseId) } : q) }
    }))
  }

  function editCourse(yearId, quarterId, course) {
    // simple prompt-based edit for template
    const code = prompt('Course code', course.code)
    const title = prompt('Course title', course.title)
    if (code == null || title == null) return
    setPlan(p => p.map(y => {
      if (y.id !== yearId) return y
      return {
        ...y,
        quarters: y.quarters.map(q => {
          if (q.id !== quarterId) return q
          return { ...q, courses: q.courses.map(c => c.id === course.id ? { ...c, code, title } : c) }
        })
      }
    }))
  }

  // handleAddCourse now receives a yearId and quarterId from the form
  function handleAddCourse(yearId, quarterId, course) {
    addCourseToQuarter(yearId, quarterId, course)
  }

  return (
    <div className="planner-app">
      <header className="planner-header">
        <h1>BruinPlan</h1>
      </header>
      <div className="planner-content">
        <Sidebar onAddYear={addYear} onReset={resetPlan} />
        <main className="planner-main">
          <div className="planner-controls">
            <AddCourseForm years={plan} onAdd={handleAddCourse} />
          </div>
          <YearGrid plan={plan} onRemoveCourse={removeCourse} onEditCourse={(yid,qid,course)=>editCourse(yid,qid,course)} />
        </main>
      </div>
    </div>
  )
}
