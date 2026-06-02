import React from 'react';
import { Printer, BookOpen, PlusCircle, Utensils } from 'lucide-react';

interface UtilityBarProps {
  onSelectAction: (actionName: "Home" | "Syllabus" | "Print" | "Food" | "AddTask" | "Auth") => void;
}

export default function UtilityBar({ onSelectAction }: UtilityBarProps) {
  const actions = [
    {
      id: "Print" as const,
      label: "Print",
      gradient: "from-[#01b6eb] to-[#01abff]",
      icon: Printer,
      tooltip: "Generate Study Notes PDF"
    },
    {
      id: "Syllabus" as const,
      label: "Syllabus",
      gradient: "from-[#b175ff] to-[#b74ffe]",
      icon: BookOpen,
      tooltip: "View TNPSC Group Syllabus"
    },
    {
      id: "AddTask" as const,
      label: "Add Task",
      gradient: "from-[#fe1795] to-[#ff4983]",
      icon: PlusCircle,
      tooltip: "Schedule new study plan task"
    },
    {
      id: "Food" as const,
      label: "Food",
      gradient: "from-[#fea500] to-[#ff7000]",
      icon: Utensils,
      tooltip: "Log Hydration & Healthy Meals"
    },
  ];

  return (
    <div className="w-full bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-md border border-slate-100 select-none mt-3.5" id="quick-access-utility-bar">
      <h3 className="font-extrabold text-[13.5px] text-slate-800 tracking-tight leading-none">
        Quick Access
      </h3>
      
      {/* 4 buttons row */}
      <div className="grid grid-cols-4 gap-2.5 pr-0.5" id="utility-buttons-row">
        {actions.map((act) => {
          const IconComponent = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onSelectAction(act.id)}
              className="flex flex-col items-center gap-2.5 group cursor-pointer"
              title={act.tooltip}
              id={`quick-access-btn-${act.id.toLowerCase()}`}
            >
              {/* Visual solid gradient circles with shadow drop effects */}
              <div 
                className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${act.gradient} flex items-center justify-center text-white shadow-md active:scale-95 hover:scale-105 transition-all duration-200`}
                style={{
                  boxShadow: '0px 2.5px 5px rgba(0, 0, 0, 0.15)'
                }}
              >
                <IconComponent className="w-[19px] h-[19px] text-white stroke-[2.5]" />
              </div>

              {/* Action textual marker representing original layout font size */}
              <span className="text-[10px] text-slate-700 font-extrabold uppercase tracking-wide group-hover:text-emerald-600 transition-colors">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
