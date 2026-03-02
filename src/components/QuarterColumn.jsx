import React, { useState, useRef, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import CourseCard from './CourseCard';
import { usePlannerStore } from '../store/usePlannerStore';
import { Search, X, Plus, AlertTriangle } from 'lucide-react';

const QuarterColumn = ({ title, quarterId, courses }) => {
  const removeCourse = usePlannerStore((state) => state.removeCourseFromPlanner);
  const addCourse = usePlannerStore((state) => state.addCourseToPlanner);
  const availableCourses = usePlannerStore((state) => state.availableCourses);
  const totalUnits = courses.reduce((sum, course) => sum + course.units, 0);

  // Quick Add State
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearching(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCourseAdd = (courseId) => {
    addCourse(quarterId, courseId);
    setIsSearching(false);
    setSearchTerm('');
  };

  const filteredCourses = searchTerm ? availableCourses.filter(course => {
    const code = course.code || "";
    const title = course.title || "";
    const searchLower = searchTerm.toLowerCase();
    
    return code.toLowerCase().includes(searchLower) || 
           title.toLowerCase().includes(searchLower);
  }).slice(0, 15) : []; // limit to 15 results for performance

  // CSS class helper for seasonal coloring
  const seasonClass = `quarter-${title.toLowerCase()}`;

  return (
    <div className={`quarter-column ${seasonClass}`}>
      <div className="quarter-header">
        <h3>{title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {totalUnits > 21 && (
            <div className="unit-warning" data-title="You can take a maximum of 21 units.">
              <AlertTriangle size={16} color="var(--danger, #ef4444)" />
            </div>
          )}
          <span className={`unit-count ${totalUnits > 21 ? 'units-exceeded' : ''}`}>{totalUnits} Units</span>
        </div>
      </div>
      <Droppable droppableId={quarterId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`quarter-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            style={{ position: 'relative' }}
          >
            {courses.map((course, index) => (
              <CourseCard 
                key={`${course.id}-${index}`} 
                course={course} 
                index={index} 
                isRemovable={true}
                onRemove={() => removeCourse(quarterId, index)}
                quarterId={quarterId}
              />
            ))}
            {provided.placeholder}
            
            {courses.length === 0 && !snapshot.isDraggingOver && !isSearching && (
              <div className="empty-placeholder" onClick={() => setIsSearching(true)} style={{ cursor: 'pointer' }}>
                <Plus size={16} style={{ marginBottom: '4px' }}/>
                Drag or Add Courses
              </div>
            )}
            {courses.length > 0 && !snapshot.isDraggingOver && !isSearching && (
                <div className="quick-add-btn" onClick={() => setIsSearching(true)}>
                    + Add Course
                </div>
            )}

            {isSearching && (
              <div className="quick-search-overlay" ref={searchRef}>
                <div className="quick-search-input-wrapper">
                  <Search size={14} className="quick-search-icon" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="quick-search-input"
                  />
                  <X size={14} className="quick-search-close" onClick={() => setIsSearching(false)} />
                </div>
                {searchTerm && filteredCourses.length > 0 && (
                  <div className="quick-search-results">
                    {filteredCourses.map(course => (
                      <div 
                        key={course.id} 
                        className="quick-search-item"
                        onClick={() => handleCourseAdd(course.id)}
                      >
                        <strong>{course.code}</strong> - <span className="quick-search-item-title">{course.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                {searchTerm && filteredCourses.length === 0 && (
                  <div className="quick-search-results">
                     <div className="quick-search-item empty">No classes found.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default QuarterColumn;
