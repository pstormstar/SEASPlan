import React from 'react'
import CourseCard from './CourseCard'

// YearGrid renders the plan data as a series of horizontal rows (one per year).
// each row contains four quarters which themselves hold course cards.
export default function YearGrid({ plan, onRemoveCourse, onMoveCourse, onEditCourse }) {
  return (
    <div className="year-grid">
      {plan.map((year, yidx) => (
        <div key={year.id} className="year-row">
          <div className="year-header">{year.yearLabel}</div>
          <div className="quarters">
            {year.quarters.map((q, qidx) => (
              <div key={q.id} className="quarter-column">
                <div className="quarter-label">{q.label}</div>
                <div className="quarter-courses">
                  {q.courses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onRemove={() => onRemoveCourse(year.id, q.id, course.id)}
                      onEdit={() => onEditCourse(year.id, q.id, course)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
