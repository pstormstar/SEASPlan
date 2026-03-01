import React, { useState, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
// placeholder arrows instead of lucide-react icons

import { usePlannerStore } from '../store/usePlannerStore';

const CourseCard = ({ course, index, isRemovable, onRemove }) => {
  const globalExpanded = usePlannerStore((state) => state.isAllExpanded);
  const [isExpanded, setIsExpanded] = useState(globalExpanded);

  // Sync internal state if global state toggles
  useEffect(() => {
    setIsExpanded(globalExpanded);
  }, [globalExpanded]);

  return (
    <Draggable draggableId={`${course.id}-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`course-card ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          <div className="course-card-header">
            <strong>{course.code}</strong>
            <div className="course-card-actions">
              <button 
                className="expand-btn" 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                title="More info"
              >
                {isExpanded ? '▲' : '▼'}
              </button>
              {isRemovable && (
                <button 
                  className="remove-course-btn" 
                  onClick={(e) => { e.stopPropagation(); onRemove(); }}
                  title="Remove Course"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
          <div className="course-card-units">{course.units} Units</div>
          
          {isExpanded && (
            <div className="course-card-expanded">
              <div className="course-card-title">{course.title}</div>
              <div className="course-card-offered">
                <strong>Offered:</strong> {course.offered ? course.offered.join(', ') : 'Unknown'}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default CourseCard;
