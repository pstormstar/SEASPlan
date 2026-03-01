import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import CourseCard from './CourseCard';
import { usePlannerStore } from '../store/usePlannerStore';

const QuarterColumn = ({ title, quarterId, courses }) => {
  const removeCourse = usePlannerStore((state) => state.removeCourseFromPlanner);
  const totalUnits = courses.reduce((sum, course) => sum + course.units, 0);

  return (
    <div className="quarter-column">
      <div className="quarter-header">
        <h3>{title}</h3>
        <span className="unit-count">{totalUnits} Units</span>
      </div>
      <Droppable droppableId={quarterId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`quarter-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
          >
            {courses.map((course, index) => (
              <CourseCard 
                key={`${course.id}-${index}`} 
                course={course} 
                index={index} 
                isRemovable={true}
                onRemove={() => removeCourse(quarterId, index)}
              />
            ))}
            {provided.placeholder}
            {courses.length === 0 && !snapshot.isDraggingOver && (
              <div className="empty-placeholder">Drag courses here</div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default QuarterColumn;
