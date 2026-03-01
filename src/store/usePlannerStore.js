import { create } from 'zustand';
import { mockCourses } from '../data/mockCourses';

const YEARS = 4;
const QUARTERS = ['Fall', 'Winter', 'Spring', 'Summer'];

// Mock categories for engineering majors
export const engineeringCategories = [
  'Lower Division Math',
  'Lower Division Physics',
  'Lower Division Programming',
  'Upper Division Core',
  'Required Electives'
];

// Initialize empty planner structure
const initialPlanner = {};
for (let y = 1; y <= YEARS; y++) {
  QUARTERS.forEach(q => {
    initialPlanner[`year-${y}-${q.toLowerCase()}`] = [];
  });
}

export const usePlannerStore = create((set) => ({
  planner: initialPlanner,
  availableCourses: mockCourses,
  isAllExpanded: false,
  isAllCategoriesExpanded: false,
  selectedMajor: 'none',

  setMajor: (major) => set({ selectedMajor: major }),
  toggleExpandAll: () => set((state) => ({ isAllExpanded: !state.isAllExpanded })),
  toggleExpandAllCategories: () => set((state) => ({ isAllCategoriesExpanded: !state.isAllCategoriesExpanded })),

  moveCourse: (sourceId, destinationId, sourceIndex, destIndex, courseId) => set((state) => {
    const newPlanner = { ...state.planner };
    const newAvailable = [...state.availableCourses];

    const isFromSidebar = sourceId === 'sidebar' || sourceId.startsWith('category-');
    const isToSidebar = destinationId === 'sidebar' || destinationId.startsWith('category-');

    // Prevent duplicate in the same quarter
    if (!isToSidebar && sourceId !== destinationId) {
      const destList = state.planner[destinationId] || [];
      if (destList.some(c => c.id === courseId)) {
        return state; // Drop is canceled, course bounces back
      }
    }

    let movedCourse;

    // Remove from source list
    if (isFromSidebar) {
      // Find course in availableCourses
      movedCourse = newAvailable.find(c => c.id === courseId);
    } else {
      const sourceList = Array.from(newPlanner[sourceId]);
      movedCourse = sourceList[sourceIndex];
      sourceList.splice(sourceIndex, 1);
      newPlanner[sourceId] = sourceList;
    }

    // Add to destination list
    if (isToSidebar) {
      // For now, if dragged to sidebar or a category, just don't add back to array unless we want it fully removed from planner
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
  })
}));
