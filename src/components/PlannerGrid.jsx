import React from 'react';
import QuarterColumn from './QuarterColumn';
import { usePlannerStore } from '../store/usePlannerStore';

const YEARS = 4;
const QUARTERS = ['Fall', 'Winter', 'Spring', 'Summer'];

const PlannerGrid = () => {
  const planner = usePlannerStore((state) => state.planner);

  return (
    <div className="planner-grid">
      {Array.from({ length: YEARS }).map((_, yearIndex) => {
        const yearNum = yearIndex + 1;
        return (
          <div key={`year-${yearNum}`} className="year-row">
            <div className="year-label-container">
              <h2 className="year-label">Year {yearNum}</h2>
            </div>
            <div className="quarters-container">
              {QUARTERS.map((quarter) => {
                const quarterId = `year-${yearNum}-${quarter.toLowerCase()}`;
                const courses = planner[quarterId] || [];
                return (
                  <QuarterColumn 
                    key={quarterId}
                    quarterId={quarterId}
                    title={quarter}
                    courses={courses}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlannerGrid;
