import React, { useState, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { usePlannerStore } from '../store/usePlannerStore';

const CategoryAccordion = ({ categoryName, courses, renderItem }) => {
  const globalExpanded = usePlannerStore((state) => state.isAllCategoriesExpanded);
  const [isOpen, setIsOpen] = useState(globalExpanded);

  useEffect(() => {
    setIsOpen(globalExpanded);
  }, [globalExpanded]);

  return (
    <div className="category-accordion">
      <div 
        className="category-header" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="category-icon">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>
        <h3 className="category-title">{categoryName}</h3>
        <span className="category-count">{courses.length} courses</span>
      </div>
      
      {isOpen && (
        <Droppable 
          droppableId={`category-${categoryName}`} 
          isDropDisabled={true}
          renderClone={(provided, snapshot, rubric) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="sidebar-course-card dragging"
              style={{ ...provided.draggableProps.style, margin: 0 }}
            >
              <div className="course-card-header">
                <strong>{courses[rubric.source.index].code}</strong>
              </div>
              <div className="course-card-units">{courses[rubric.source.index].units} Units</div>
            </div>
          )}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="category-content"
            >
              {courses.length > 0 ? (
                courses.map((course, index) => renderItem(course, index))
              ) : (
                <div className="empty-category-msg">No courses available</div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )}
    </div>
  );
};

export default CategoryAccordion;
