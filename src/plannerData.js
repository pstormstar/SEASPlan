// initialPlan provides 4 empty years as a starting template
export const initialPlan = [
  {
    id: 1,
    yearLabel: 'Year 1',
    quarters: [
      { id: 'q1', label: 'Fall', courses: [{ id: 'c1', code: 'MATH 101', title: 'Calculus I', units: 4 }] },
      { id: 'q2', label: 'Winter', courses: [] },
      { id: 'q3', label: 'Spring', courses: [] },
      { id: 'q4', label: 'Summer', courses: [] }
    ]
  },
  {
    id: 2,
    yearLabel: 'Year 2',
    quarters: [
      { id: 'q1', label: 'Fall', courses: [{ id: 'c2', code: 'PHYS 101', title: 'Intro Physics', units: 4 }] },
      { id: 'q2', label: 'Winter', courses: [] },
      { id: 'q3', label: 'Spring', courses: [] },
      { id: 'q4', label: 'Summer', courses: [] }
    ]
  },
  {
    id: 3,
    yearLabel: 'Year 3',
    quarters: [
      { id: 'q1', label: 'Fall', courses: [] },
      { id: 'q2', label: 'Winter', courses: [] },
      { id: 'q3', label: 'Spring', courses: [] },
      { id: 'q4', label: 'Summer', courses: [] }
    ]
  },
  {
    id: 4,
    yearLabel: 'Year 4',
    quarters: [
      { id: 'q1', label: 'Fall', courses: [] },
      { id: 'q2', label: 'Winter', courses: [] },
      { id: 'q3', label: 'Spring', courses: [] },
      { id: 'q4', label: 'Summer', courses: [] }
    ]
  }
]
