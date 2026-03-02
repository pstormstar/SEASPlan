import { create } from 'zustand';
import rawCourseGroups from '../../scraper_db.course_offerings.json';
import { supabase } from '../lib/supabaseClient';
import { majorsData } from '../data/majors';

// Process the raw scraped data into a flat active list
const parsedCourses = [];
const parsedDepartments = new Set();
rawCourseGroups.forEach(group => {
  group.table_data.forEach(course => {
    // Collect unique departments
    if (course.department) {
      parsedDepartments.add(course.department);
    }
    
    // Map availability bits to quarters
    const offered = [];
    if (course.availability_1 === 1) offered.push('Fall');
    if (course.availability_2 === 1) offered.push('Winter');
    if (course.availability_3 === 1) offered.push('Spring');

    // Create uniform course object
    parsedCourses.push({
      id: `${course.course_prefix} ${course.class_code}`,
      code: `${course.course_prefix} ${course.class_code}`,
      title: course.class_name,
      department: course.department,
      units: 4, // default as it's not present in source data
      offered: offered
    });
  });
});

// Ensure all courses required by majors exist in our data source
Object.values(majorsData).forEach(major => {
  major.categories.forEach(category => {
    category.courses.forEach(courseCode => {
      const exists = parsedCourses.some(c => c.code === courseCode);
      if (!exists) {
        parsedCourses.push({
          id: courseCode,
          code: courseCode,
          // Extract department prefix (everything before the first number)
          title: courseCode + ' (Requirement)',
          department: courseCode.replace(/[0-9].*/, '').trim(),
          units: 4,
          offered: ['Fall', 'Winter', 'Spring']
        });
        // Do NOT add synthetic major-requirement courses to the department dropdown
      }
    });
  });
});

// Freeze the department list here — only departments from the scraped JSON
export const availableDepartments = Array.from(parsedDepartments).sort();

// planner dimensions
const YEARS = 4;
const QUARTERS = ['Fall', 'Winter', 'Spring', 'Summer'];

// Initialize empty planner structure
const initialPlanner = {};
for (let y = 1; y <= YEARS; y++) {
  QUARTERS.forEach(q => {
    initialPlanner[`year-${y}-${q.toLowerCase()}`] = [];
  });
}

export const usePlannerStore = create((set) => ({
  planner: initialPlanner,
  availableCourses: parsedCourses,
  isAllExpanded: false,
  isAllCategoriesExpanded: false,
  selectedDepartment: 'none',
  selectedTerm: 'none',
  selectedMajor: 'none',
  currentUser: null,
  isLoading: false,
  error: null,

  setCurrentUser: (user) => set({ currentUser: user }),

  logout: async () => {
    await supabase.auth.signOut();
    set({ currentUser: null, planner: initialPlanner });
  },

  loadUserPlan: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('planner_data')
        .eq('user_id', userId)
        .single();
      console.log('loadUserPlan result:', { data, error });
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      if (data && data.planner_data) {
        set({ planner: data.planner_data, isLoading: false });
      } else {
        set({ planner: initialPlanner, isLoading: false });
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
      console.error('loadUserPlan error:', err);
    }
  },

  savePlan: async (userId) => {
    try {
      const state = usePlannerStore.getState();
      const { data, error } = await supabase
        .from('plans')
        .upsert({
          user_id: userId,
          planner_data: state.planner,
          updated_at: new Date()
        }, { onConflict: 'user_id' });
      console.log('savePlan result:', { data, error });
      if (error) throw error;
    } catch (err) {
      set({ error: err.message });
      console.error('savePlan error:', err);
    }
  },

  toggleExpandAll: () => set((state) => ({ isAllExpanded: !state.isAllExpanded })),
  toggleExpandAllCategories: () => set((state) => ({ isAllCategoriesExpanded: !state.isAllCategoriesExpanded })),

  setDepartment: (dept) => set({ selectedDepartment: dept }),
  
  setTerm: (term) => set({ selectedTerm: term }),
  
  setMajor: (majorId) => set({ selectedMajor: majorId }),

  setPlanner: (newPlanner) => set(() => {
    // Spread each quarter array into a new reference so Zustand detects the change
    const refreshed = {};
    Object.keys(newPlanner).forEach(key => {
      refreshed[key] = [...(newPlanner[key] || [])];
    });
    return { planner: refreshed };
  }),

  moveCourse: (sourceId, destinationId, sourceIndex, destIndex, courseId) => set((state) => {
    // Prevent duplicate in the same quarter
    if (destinationId !== 'sidebar' && sourceId !== destinationId) {
      const destList = state.planner[destinationId] || [];
      if (destList.some(c => c.id === courseId)) {
        return state; // Drop is canceled, course bounces back
      }
    }

    const newPlanner = { ...state.planner };
    const newAvailable = [...state.availableCourses];

    let movedCourse;
    
    const isSourceSidebar = sourceId === 'sidebar' || sourceId.startsWith('category-');
    const isDestSidebar = destinationId === 'sidebar' || destinationId.startsWith('category-');

    // Remove from source list
    if (isSourceSidebar) {
      // Find course in availableCourses
      movedCourse = newAvailable.find(c => c.id === courseId);
    } else {
      const sourceList = Array.from(newPlanner[sourceId] || []);
      movedCourse = sourceList[sourceIndex];
      sourceList.splice(sourceIndex, 1);
      newPlanner[sourceId] = sourceList;
    }

    // Check quarter availability warning
    // We do NOT use alert here anymore, we will just let CourseCard UI show the warning.
    // CourseCard can derive the quarter from the destinationId and course.offered array.

    // Add to destination list
    if (isDestSidebar) {
      // For now, if dragged to sidebar, just don't add back to array unless we want it fully removed from planner
      // We don't remove from sidebar when adding to planner, so availableCourses remains full list.
    } else {
      const destList = Array.from(newPlanner[destinationId] || []);
      destList.splice(destIndex, 0, movedCourse);
      newPlanner[destinationId] = destList;
    }

    return { planner: newPlanner };
  }),

  removeCourseFromPlanner: (quarterId, courseIndex) => set((state) => {
    const newPlanner = { ...state.planner };
    const list = Array.from(newPlanner[quarterId]);
    list.splice(courseIndex, 1);
    newPlanner[quarterId] = list;
    return { planner: newPlanner };
  }),

  addCourseToPlanner: (quarterId, courseId) => set((state) => {
    // Prevent duplicate in the same quarter
    const quarterList = state.planner[quarterId] || [];
    if (quarterList.some(c => c.id === courseId)) {
      alert("This course is already in this quarter.");
      return state;
    }

    const courseToAdd = state.availableCourses.find(c => c.id === courseId);
    if (!courseToAdd) return state;

    // Check quarter availability warning (no alert)
    // The CourseCard UI will handle displaying the warning icon.

    const newPlanner = { ...state.planner };
    const newList = [...(newPlanner[quarterId] || []), courseToAdd];
    newPlanner[quarterId] = newList;
    
    return { planner: newPlanner };
  })
}));
