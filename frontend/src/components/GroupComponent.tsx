import React from 'react';
import { WeeklyLog } from '../types';

interface GroupComponentProps {
  weeklyLogs: WeeklyLog[];
  completedMinutes: number;
  totalTasks: number;
  completedTasks: number;
  targetHours: number;
  onUpdateTargetHours: (hours: number) => void;
  onOpenAddTask: () => void;
  onOpenGraph?: () => void;
}

export default function GroupComponent({
  weeklyLogs,
  completedMinutes,
  totalTasks,
  completedTasks,
  targetHours,
  onUpdateTargetHours,
  onOpenAddTask,
  onOpenGraph
}: GroupComponentProps) {
  // Focus progress mathematics
  const focusHr = Math.floor(completedMinutes / 60);
  const focusMin = completedMinutes % 60;
  
  const targetMinutes = targetHours * 60;
  const progressPercent = targetMinutes > 0
    ? Math.min(Math.round((completedMinutes / targetMinutes) * 100), 100)
    : 0;

  return (
    <div 
      className="w-full bg-[#1b4e4a] rounded-[16px] p-4 flex flex-col justify-between text-white border border-[#143e3b] shadow-xl relative select-none mt-3.5"
      id="daily-goal-group-panel"
    >
      {/* Top section: Title, Edit Icon, Graph Icon, Task Completed Status */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="font-extrabold text-[15px] text-white tracking-tight leading-none">
              Daily Study Goal
            </h2>
          </div>

          {/* ✓ 0/0 Task Done Capsule Button */}
          <button 
            type="button"
            onClick={onOpenAddTask}
            className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/5 hover:bg-white/10 active:scale-95 transition-all rounded-[6px] border border-white/10 text-[10.5px] font-semibold text-white tracking-wide cursor-pointer"
          >
            ✓ {completedTasks}/{totalTasks} Task{totalTasks !== 1 ? 's' : ''} Done
          </button>
        </div>

        {/* Small rising graph button in the top right exactly as image */}
        <button 
          onClick={onOpenGraph}
          className="border border-white/20 w-8 h-8 rounded-[8px] flex items-center justify-center text-white bg-[#0f3d39] hover:bg-[#12504b] active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Open Weekly Focus Analytics"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="21" x2="21" y2="21" />
            <path d="M3 16l5-5 6 6 7-10" />
          </svg>
        </button>
      </div>

      {/* SINGLE INTERACTIVE DRAG TRACKER PROGRESS BAR LINE */}
      <div className="mt-4 w-full flex flex-col">
        {/* Drag hint */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-white/50 font-semibold tracking-wide">Daily Goal</span>
          <span className="text-[10px] text-[#2cee99] font-bold">← drag to set →</span>
        </div>
        {/* Bar container with better contrast track */}
        <div className="relative w-full h-[7px] bg-white/10 rounded-full flex items-center">
          {/* Active green progress fill, transitioning based on 50% split of total track: first 50% (up to 6 hrs) is light green, last 50% is dark green */}
          <div 
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-300 ease-out" 
            style={{ 
              width: `${(targetHours / 12) * 100}%`,
              background: targetHours <= 6 
                ? '#2cee99' 
                : `linear-gradient(to right, #2cee99 ${(6 / targetHours) * 100}%, #0c4d40 ${(6 / targetHours) * 100}%)`
            }}
          />
          
          {/* Circular handle/thumb positioned precisely at targetHours marker */}
          <div 
            className="absolute w-3.5 h-3.5 rounded-full border-2 shadow-md -translate-x-1/2 cursor-ew-resize transition-all duration-300 pointer-events-none"
            style={{ 
              left: `${(targetHours / 12) * 100}%`,
              backgroundColor: targetHours <= 6 ? '#2cee99' : '#0c4d40',
              borderColor: targetHours <= 6 ? '#0c4d40' : '#2cee99'
            }}
          />

          {/* Actual underlying transparent slider input allowing immediate drag capability */}
          <input
            type="range"
            min={1}
            max={12}
            step={1}
            value={targetHours}
            onChange={(e) => onUpdateTargetHours(parseInt(e.target.value) || 1)}
            className="absolute inset-0 w-full h-[18px] opacity-0 cursor-ew-resize -top-1.5 z-10"
            title="Drag tracker line to fix daily study goal in hours"
          />
        </div>

        {/* Labels underneath the progress line exactly matching the screenshot */}
        <div className="flex items-center justify-between text-[11px] font-bold text-white/90 mt-2 leading-none">
          <span className="font-medium">
            {focusHr}h : {focusMin}m /{targetHours}h
          </span>
          <span className="text-white/95 font-semibold">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Weekday boxes representing progress for each day of the week exactly matching image */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="grid grid-cols-7 gap-1.5 text-center items-end">
          {weeklyLogs.map((log) => {
            // Visual height ratio of each container
            const heightPercentage = Math.min(Math.max(log.percentage, 0), 100);
            return (
              <div key={log.day} className="flex flex-col items-center gap-1 justify-end h-full">
                {/* The rounded rounded-rect day card exactly as mockup */}
                <div 
                  className="w-full h-7 rounded-[4px] bg-[#1a4744] overflow-hidden relative flex items-end shadow-inner"
                  title={`${log.day}: ${log.percentage}% complete`}
                >
                  {/* Dynamic green fill representing today's completion */}
                  <div 
                    className="w-full bg-[#0ec38c] rounded-b-[4px] transition-all duration-500 ease-out" 
                    style={{ height: `${heightPercentage}%` }}
                  />
                </div>
                {/* Micro Label */}
                <span className="text-[9.5px] font-bold text-white/70 capitalize mt-0.5">
                  {log.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
