import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { usePlannerStore, engineeringCategories } from '../store/usePlannerStore';
import { Search, ChevronDown, ChevronUp, Plus, Minus, Book } from 'lucide-react';
import CategoryAccordion from './CategoryAccordion';

const SidebarCourseItem = ({ course, index }) => {
  const globalExpanded = usePlannerStore((state) => state.isAllExpanded);
  const planner = usePlannerStore((state) => state.planner);
  const [isExpanded, setIsExpanded] = React.useState(globalExpanded);

  // Check if course is already in the planner
  const isPlanned = Object.values(planner).some(quarterList => 
    quarterList.some(c => c.id === course.id)
  );

  React.useEffect(() => {
    setIsExpanded(globalExpanded);
  }, [globalExpanded]);
  
  return (
    <Draggable draggableId={course.id} index={index} isDragDisabled={isPlanned}>
      {(dragProvided, dragSnapshot) => (
        <div
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
          className={`sidebar-course-card ${dragSnapshot.isDragging ? 'dragging' : ''} ${isPlanned ? 'planned-course' : ''}`}
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

const CourseSidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const availableCourses = usePlannerStore((state) => state.availableCourses);
  const isAllExpanded = usePlannerStore((state) => state.isAllExpanded);
  const toggleExpandAll = usePlannerStore((state) => state.toggleExpandAll);
  const isAllCategoriesExpanded = usePlannerStore((state) => state.isAllCategoriesExpanded);
  const toggleExpandAllCategories = usePlannerStore((state) => state.toggleExpandAllCategories);
  const selectedMajor = usePlannerStore((state) => state.selectedMajor);
  const setMajor = usePlannerStore((state) => state.setMajor);

  const filteredCourses = availableCourses.filter(course => 
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group courses by filler category if a major is selected
  // For now, sequentially assign courses to categories to simulate grouping
  const groupedCourses = {};
  if (selectedMajor !== 'none') {
    engineeringCategories.forEach(cat => {
      groupedCourses[cat] = [];
    });
    
    // Distribute filtered courses evenly into the filler categories
    filteredCourses.forEach((course, i) => {
      const categoryIndex = i % engineeringCategories.length;
      groupedCourses[engineeringCategories[categoryIndex]].push(course);
    });
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Course Catalog</h2>
      </div>
      
      <div className="major-select-container" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <label htmlFor="major-select" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Select Major:</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem' }}>
          <Book size={16} color="var(--ucla-blue)" />
          <select 
            id="major-select" 
            value={selectedMajor} 
            onChange={(e) => setMajor(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            <option value="none">None (View All)</option>
            <option value="0279">Aerospace Engineering BS</option>
            <option value="0288">Bioengineering BS</option>
            <option value="0294">Chemical Engineering BS</option>
            <option value="0300">Civil Engineering BS</option>
            <option value="0302">Computer Engineering BS</option>
            <option value="0193">Computer Science and Engineering BS</option>
            <option value="0201">Computer Science BS</option>
            <option value="0303">Electrical Engineering BS</option>
            <option value="0336">Materials Engineering BS</option>
            <option value="0306">Mechanical Engineering BS</option>
          </select>
        </div>
      </div>

      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search courses..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      <div style={{ padding: '0.75rem 1rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
        {selectedMajor !== 'none' && (
          <button 
            className="text-action-btn" 
            onClick={toggleExpandAllCategories}
            style={{ alignSelf: 'flex-start' }}
          >
            {isAllCategoriesExpanded ? <Minus size={16} /> : <Plus size={16} />}
            <span>{isAllCategoriesExpanded ? "Collapse All Categories" : "Expand All Categories"}</span>
          </button>
        )}
        <button 
          className="text-action-btn" 
          onClick={toggleExpandAll}
          style={{ alignSelf: 'flex-start' }}
        >
          {isAllExpanded ? <Minus size={16} /> : <Plus size={16} />}
          <span>{isAllExpanded ? "Collapse All Classes" : "Expand All Classes"}</span>
        </button>
      </div>
      <div className="sidebar-course-list-container" style={{ flex: 1, overflowY: 'auto' }}>
        {selectedMajor === 'none' ? (
          <Droppable 
            droppableId="sidebar" 
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
                  <strong>{filteredCourses[rubric.source.index].code}</strong>
                </div>
                <div className="course-card-units">{filteredCourses[rubric.source.index].units} Units</div>
              </div>
            )}
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="sidebar-course-list flat-list"
              >
                {filteredCourses.map((course, index) => (
                  <SidebarCourseItem key={course.id} course={course} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ) : (
          <div className="sidebar-course-list grouped-list" style={{ padding: '0.5rem 1rem 1rem' }}>
            {engineeringCategories.map(category => (
              <CategoryAccordion 
                key={category}
                categoryName={category}
                courses={groupedCourses[category]}
                renderItem={(course, idx) => (
                  <SidebarCourseItem key={course.id} course={course} index={idx} />
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSidebar;
