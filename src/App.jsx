import React, { useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { usePlannerStore } from './store/usePlannerStore';
import { supabase } from './lib/supabaseClient';
import CourseSidebar from './components/CourseSidebar';
import PlannerGrid from './components/PlannerGrid';
import Login from './components/Login';
import './index.css';

function App() {
  const moveCourse = usePlannerStore((state) => state.moveCourse);
  const isAllExpanded = usePlannerStore((state) => state.isAllExpanded);
  const toggleExpandAll = usePlannerStore((state) => state.toggleExpandAll);
  const currentUser = usePlannerStore((state) => state.currentUser);
  const setCurrentUser = usePlannerStore((state) => state.setCurrentUser);
  const loadUserPlan = usePlannerStore((state) => state.loadUserPlan);
  const logout = usePlannerStore((state) => state.logout);

  // Check for existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        loadUserPlan(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        loadUserPlan(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, [setCurrentUser, loadUserPlan]);

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

    const isFromSidebar =
      source.droppableId === 'sidebar' ||
      source.droppableId.startsWith('category-');

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

  if (!currentUser) {
    return <Login onLogin={(user) => { setCurrentUser(user); loadUserPlan(user.id); }} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <img src="/bruinBear.svg" alt="Bruin Logo" className="brand-icon" style={{ width: '32px', height: '32px' }} />
          <h1>BruinPlan</h1>
          <p className="user-email">{currentUser?.email}</p>
        </div>
        <div className="header-actions">
          <button 
            className="header-btn" 
            onClick={toggleExpandAll}
          >
            {isAllExpanded ? "Collapse All Cards" : "Expand All Cards"}
          </button>
          <button 
            className="header-btn btn-logout" 
            onClick={logout}
          >
            Logout
          </button>
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
