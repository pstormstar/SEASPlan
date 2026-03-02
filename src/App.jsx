import React, { useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { usePlannerStore } from './store/usePlannerStore';
import { supabase } from './lib/supabaseClient';
import CourseSidebar from './components/CourseSidebar';
import PlannerGrid from './components/PlannerGrid';
import Login from './components/Login';
import ExportButton from './components/ExportButton';
import './index.css';

function App() {
  const moveCourse = usePlannerStore((state) => state.moveCourse);
  const isAllExpanded = usePlannerStore((state) => state.isAllExpanded);
  const toggleExpandAll = usePlannerStore((state) => state.toggleExpandAll);
  const currentUser = usePlannerStore((state) => state.currentUser);
  const setCurrentUser = usePlannerStore((state) => state.setCurrentUser);
  const loadUserPlan = usePlannerStore((state) => state.loadUserPlan);
  const logout = usePlannerStore((state) => state.logout);

  const [showLogin, setShowLogin] = React.useState(false);

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

  const handleLogin = (user) => {
    setCurrentUser(user);
    loadUserPlan(user.id);
    setShowLogin(false);
  };

  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = React.useState(320);
  const [isResizing, setIsResizing] = React.useState(false);
  const sidebarRef = React.useRef(null);

  const startResizing = React.useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent) => {
      if (isResizing) {
        // limit minimum and maximum width
        const newWidth = Math.max(250, Math.min(600, mouseMoveEvent.clientX));
        setSidebarWidth(newWidth);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // Handles drag & drop across quarters and from the sidebar
  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return; // Dropped outside valid area

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return; // Dropped in same place
    }

    // Since we removed 'category' groupings from CourseSidebar, 
    // the draggableId is just the clean 'course.id'.
    moveCourse(
      source.droppableId, 
      destination.droppableId, 
      source.index, 
      destination.index,
      draggableId
    );
  };

  // don't short‑circuit rendering; planner is always visible
  // login screen will be shown in a modal when requested

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand">
          <img src="/bruinBear.svg" alt="Bruin Logo" className="brand-icon" style={{ width: '32px', height: '32px' }} />
          <h1>SEASplan</h1>
        </div>
        <div className="header-actions">
          {currentUser && (
            <span className="user-email-right">{currentUser.email}</span>
          )}
          <div style={{ marginRight: '1rem' }}>
            <ExportButton />
          </div>
          {currentUser ? (
            <button 
              className="header-btn btn-logout" 
              onClick={logout}
            >
              Logout
            </button>
          ) : (
            <button
              className="header-btn btn-login"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
          )}
        </div>
      </header>
      
      <main className="main-content">
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ width: `${sidebarWidth}px`, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CourseSidebar />
          </div>
          <div className="resizer" onMouseDown={startResizing}>
            <div className="resizer-dot" />
            <div className="resizer-dot" />
            <div className="resizer-dot" />
          </div>
          <PlannerGrid />
        </DragDropContext>
      </main>

      {/* login modal overlay */}
      {showLogin && !currentUser && (
        <div className="login-overlay">
          <div className="login-modal">
            <button className="close-modal-btn" onClick={() => setShowLogin(false)}>
              ×
            </button>
            <Login onLogin={handleLogin} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
