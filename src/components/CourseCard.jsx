import React, { useState, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { ChevronDown, AlertTriangle } from 'lucide-react';

import { usePlannerStore } from '../store/usePlannerStore';

const CourseCard = ({ course, index, isRemovable, onRemove, quarterId }) => {
  const globalExpanded = usePlannerStore((state) => state.isAllExpanded);
  const [isExpanded, setIsExpanded] = useState(globalExpanded);

  // Check quarter availability warning
  let showWarning = false;
  let warningMessage = '';
  
  if (quarterId) {
    const targetQuarterMatch = quarterId.match(/year-\d+-(fall|winter|spring|summer)/i);
    if (targetQuarterMatch) {
      const targetQ = targetQuarterMatch[1].toLowerCase();
      if (targetQ !== 'summer') {
        const offeredLower = (course.offered || []).map(q => q.toLowerCase());
        if (offeredLower.length > 0 && !offeredLower.includes(targetQ)) {
          showWarning = true;
          warningMessage = `${course.code} is typically not offered in ${targetQuarterMatch[1]}. It is offered in: ${course.offered.join(', ')}.`;
        }
      }
    }
  }

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
            <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {course.code}
              {showWarning && (
                <div className="course-warning" data-title={warningMessage}>
                  <AlertTriangle size={16} color="var(--warning-color, #f59e0b)" />
                </div>
              )}
            </strong>
            <div className="course-card-actions">
              <button 
                className={`expand-btn ${isExpanded ? 'expanded' : ''}`} 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                title="More info"
              >
                <ChevronDown size={18} />
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
                <strong>Offered:</strong> {course.offered && course.offered.length > 0 ? (
                  <div className="offered-pills">
                    {course.offered.map(q => (
                      <span key={q} className={`offered-pill offered-${q.toLowerCase()}`}>{q}</span>
                    ))}
                  </div>
                ) : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Not offered this year</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default CourseCard;
