import React, { useState, useRef, useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { usePlannerStore, availableDepartments } from '../store/usePlannerStore';
import { Search, ChevronDown, Plus, Minus, Book, GraduationCap, Maximize2, Minimize2 } from 'lucide-react';
import CategoryAccordion from './CategoryAccordion';
import { majorsData } from '../data/majors';

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
                className={`expand-btn ${isExpanded ? 'expanded' : ''}`} 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                title="More info"
              >
                <ChevronDown size={18} />
              </button>
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

const CourseSidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [topHeight, setTopHeight] = useState(260);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !sidebarRef.current) return;
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const newHeight = e.clientY - sidebarRect.top;
      // Clamp between 150px and sidebar height - 150px
      const clampedHeight = Math.max(150, Math.min(newHeight, sidebarRect.height - 150));
      setTopHeight(clampedHeight);
    };
    
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const availableCourses = usePlannerStore((state) => state.availableCourses);
  const isAllExpanded = usePlannerStore((state) => state.isAllExpanded);
  const toggleExpandAll = usePlannerStore((state) => state.toggleExpandAll);
  const selectedDepartment = usePlannerStore((state) => state.selectedDepartment);
  const setDepartment = usePlannerStore((state) => state.setDepartment);
  const selectedTerm = usePlannerStore((state) => state.selectedTerm);
  const setTerm = usePlannerStore((state) => state.setTerm);
  const selectedMajor = usePlannerStore((state) => state.selectedMajor);
  const setMajor = usePlannerStore((state) => state.setMajor);
  const isAllCategoriesExpanded = usePlannerStore((state) => state.isAllCategoriesExpanded);
  const toggleExpandAllCategories = usePlannerStore((state) => state.toggleExpandAllCategories);

  // Filter first by department, then by term, then by search term
  const filteredCourses = availableCourses.filter(course => {
    // If a specific department is selected, filter by it
    if (selectedDepartment !== 'none' && course.department !== selectedDepartment) {
      return false;
    }
    // Filter by term
    if (selectedTerm !== 'none') {
      const offeredLower = (course.offered || []).map(q => q.toLowerCase());
      if (!offeredLower.includes(selectedTerm.toLowerCase())) {
        return false;
      }
    }
    // Then apply search constraint if it exists
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const code = course.code || "";
      const title = course.title || "";
      return code.toLowerCase().includes(lowerSearch) || 
             title.toLowerCase().includes(lowerSearch);
    }
    return true;
  });

  return (
    <div className="sidebar" ref={sidebarRef} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {!isFullscreen && (
        <div 
          className="sidebar-top-section" 
          style={{ 
            height: `${topHeight}px`, 
            flexShrink: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div className="major-select-container" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label htmlFor="major-select" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Major Requirements:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem' }}>
                <GraduationCap size={16} color="var(--ucla-blue)" />
                <select 
                  id="major-select" 
                  value={selectedMajor} 
                  onChange={(e) => setMajor(e.target.value)}
                  style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <option value="none">Select Major...</option>
                  {Object.values(majorsData).map(major => (
                    <option key={major.id} value={major.id}>{major.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="dept-select" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Department:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem' }}>
                <Book size={16} color="var(--ucla-blue)" />
                <select 
                  id="dept-select" 
                  value={selectedDepartment} 
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <option value="none">All Departments</option>
                  {availableDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="term-select" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Term Offered:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem' }}>
                <select 
                  id="term-select" 
                  value={selectedTerm} 
                  onChange={(e) => setTerm(e.target.value)}
                  style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <option value="none">All Terms</option>
                  <option value="fall">Fall</option>
                  <option value="winter">Winter</option>
                  <option value="spring">Spring</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Resizer */}
      {!isFullscreen && (
        <div 
          className="horizontal-resizer" 
          onMouseDown={() => setIsDragging(true)}
        >
          <div className="horizontal-resizer-line"></div>
        </div>
      )}

      {/* Bottom Section */}
      <div 
        className="sidebar-bottom-section" 
        style={{ 
           flex: 1, 
           display: 'flex', 
           flexDirection: 'column', 
           overflow: 'hidden', 
           position: 'relative' 
        }}
      >
        <div className="search-container" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
          <span className="search-icon"><Search size={18} color="var(--text-secondary)" strokeWidth={2} /></span>
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div style={{ padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
          <button 
            className="text-action-btn" 
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Restore Split View" : "Fullscreen Class Cards"}
            style={{ padding: '0.25rem', marginTop: '0.25rem' }}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
        
        <div className="sidebar-course-list-container" style={{ flex: 1, overflowY: 'auto' }}>
          {selectedMajor !== 'none' && (
            <div className="major-categories" style={{ padding: '1rem' }}>
              {majorsData[selectedMajor].categories.map(category => {
                const categoryCourses = category.courses.map(code => availableCourses.find(c => c.code === code)).filter(Boolean);
                return (
                  <CategoryAccordion 
                    key={category.id}
                    categoryName={category.title}
                    courses={categoryCourses}
                    renderItem={(course, index, catName) => (
                      <SidebarCourseItem key={course.id} course={course} index={index} />
                    )}
                  />
                );
              })}
              <div style={{ margin: '1rem 0 0.5rem', borderBottom: '2px dashed var(--border-color)' }}></div>
              <div style={{ padding: '0.25rem 0 0.75rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                General Catalog
              </div>
            </div>
          )}

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
        </div>
      </div>
    </div>
  );
};

export default CourseSidebar;
