import React from 'react';
import { Home, ClipboardList, Printer, Apple, AlignVerticalJustifyCenter } from 'lucide-react';

interface GroupComponent3Props {
  activeTab: "Home" | "Syllabus" | "Print" | "Food";
  onChangeTab: (tab: "Home" | "Syllabus" | "Print" | "Food") => void;
}

export default function GroupComponent3({ activeTab, onChangeTab }: GroupComponent3Props) {
  const tabs = [
    { id: "Home" as const, label: "Home", icon: Home },
    { id: "Syllabus" as const, label: "Syllabus", icon: ClipboardList },
    { id: "Print" as const, label: "Print", icon: Printer },
    { id: "Food" as const, label: "Food", icon: Apple }
  ];

  return (
    <div
      className="w-full bg-white border-t border-slate-100 flex items-center justify-around py-2 pb-3 shrink-0 select-none z-40"
      style={{
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        boxShadow: '0px -4px 16px rgba(0, 0, 0, 0.07)'
      }}
      id="bottom-dock-navigation-bar"
    >
      {tabs.map((tb) => {
        const IconComponent = tb.icon;
        const isActive = activeTab === tb.id;

        return (
          <button
            key={tb.id}
            onClick={() => onChangeTab(tb.id)}
            className="flex flex-col items-center gap-1 py-1 px-4 cursor-pointer group active:scale-95 transition-transform"
            id={`bottom-dock-tab-btn-${tb.id.toLowerCase()}`}
          >
            {/* Icon with active background pill */}
            <div className={`relative flex items-center justify-center rounded-xl transition-all duration-200 ${
              isActive ? 'bg-[#e8f7f2] w-10 h-7' : 'w-10 h-7'
            }`}>
              <IconComponent
                className={`w-5 h-5 transition-colors duration-200 shrink-0 ${
                  isActive ? 'text-[#0a8d65]' : 'text-slate-400 group-hover:text-slate-600'
                }`}
                style={{ strokeWidth: isActive ? '2.5px' : '2px' }}
              />
            </div>

            {/* Label */}
            <span
              className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                isActive ? 'text-[#0a8d65]' : 'text-slate-400 group-hover:text-slate-600'
              }`}
            >
              {tb.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}





