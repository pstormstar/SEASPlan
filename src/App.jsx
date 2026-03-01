import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { usePlannerStore } from './store/usePlannerStore';
import CourseSidebar from './components/CourseSidebar';
import PlannerGrid from './components/PlannerGrid';
import './index.css';

function App() {
  const moveCourse = usePlannerStore((state) => state.moveCourse);

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a valid droppable
    if (!destination) {
      return;
    }

    // Dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Check if dragging from sidebar or a category
    const isFromSidebar = source.droppableId === 'sidebar' || source.droppableId.startsWith('category-');

    // Extract course ID, handling the potential '-index' suffix
    const courseId = isFromSidebar 
      ? draggableId 
      : draggableId.substring(0, draggableId.lastIndexOf('-'));

    moveCourse(
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index,
      courseId
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <img src="/bruinBear.svg" alt="Bruin Logo" className="brand-icon" style={{ width: '32px', height: '32px' }} />
          <h1>BruinPlan</h1>
        </div>
      </header>
      
      <main className="main-content">
        <DragDropContext onDragEnd={onDragEnd}>
          <CourseSidebar />
          <PlannerGrid />
        </DragDropContext>
      </main>
    </div>
  );
}

export default App;
