import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { motion } from 'motion/react';

// Custom Building/Dome SVG icon designed to look high-quality and match the screenshot
const CourthouseIcon = ({ isActive }: { isActive: boolean }) => (
  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
    isActive ? 'bg-[#7c5dfa] text-white' : 'bg-slate-100 text-slate-500'
  }`}>
    <svg className="w-5 h-5 stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22h18" />
      <path d="M6 18v-7h12v7" />
      <path d="M4 11h16" />
      <path d="M12 2L3 8h18z" />
      <path d="M9 13v3" />
      <path d="M12 13v3" />
      <path d="M15 13v3" />
    </svg>
  </div>
);

// Switch Exam Icon (two opposing swap arrows) matching screenshot perfectly
const SwapIcon = () => (
  <svg className="w-4 h-4 text-white stroke-[2.8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="m17 2 4 4-4 4" />
    <path d="M3 6h18" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 18H3" />
  </svg>
);

interface ExamOption {
  id: string;
  category: "TNPSC" | "UPSC" | "CSE" | "Medical";
  title: string;
  subtitle: string;
  posts: string;
  fullName: string; // The group string representation in our database
}

const EXAM_OPTIONS: ExamOption[] = [
  // TNPSC GROUP
  { id: "e-tnpsc-1", category: "TNPSC", title: "TNPSC", subtitle: "Group 1 - 2026", posts: "200 Posts", fullName: "TNPSC Group 1 - 2026" },
  { id: "e-tnpsc-2", category: "TNPSC", title: "TNPSC", subtitle: "Group 2 - 2026", posts: "180 Posts", fullName: "TNPSC Group 2 - 2026" },
  { id: "e-tnpsc-3", category: "TNPSC", title: "TNPSC", subtitle: "Group 2a - 2026", posts: "100 Posts", fullName: "TNPSC Group 2a - 2026" },
  { id: "e-tnpsc-4", category: "TNPSC", title: "TNPSC", subtitle: "Group 4 - 2026", posts: "112 Posts", fullName: "TNPSC Group 4 - 2026" },

  // UPSC GROUP
  { id: "e-upsc-1", category: "UPSC", title: "UPSC", subtitle: "Civil Services - 2026", posts: "450 Posts", fullName: "UPSC Civil Services" },
  { id: "e-upsc-2", category: "UPSC", title: "UPSC", subtitle: "Indian Forest Service", posts: "120 Posts", fullName: "UPSC Indian Forest Service" },
  { id: "e-upsc-3", category: "UPSC", title: "UPSC", subtitle: "Geoscientist Exam", posts: "98 Posts", fullName: "UPSC Geoscientist" },

  // CSE GROUP
  { id: "e-cse-1", category: "CSE", title: "CSE", subtitle: "Engineering Services", posts: "150 Posts", fullName: "CSE Engineering Services" },
  { id: "e-cse-2", category: "CSE", title: "CSE", subtitle: "Medical Services", posts: "320 Posts", fullName: "CSE Medical Services" },

  // MEDICAL GROUP
  { id: "e-med-1", category: "Medical", title: "NEET PG", subtitle: "MD / MS / PG Diploma - 2026", posts: "200 Qs", fullName: "NEET PG - 2026" },
];

interface ChooseExamSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentGroup: string;
  onSelectGroup: (groupName: string) => void;
}

export default function ChooseExamSheet({
  isOpen,
  onClose,
  currentGroup,
  onSelectGroup
}: ChooseExamSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const defaultCategory = currentGroup.startsWith("NEET PG") ? "Medical" : currentGroup.startsWith("UPSC") ? "UPSC" : currentGroup.startsWith("CSE") ? "CSE" : "TNPSC";
  const [selectedCategory, setSelectedCategory] = useState<"TNPSC" | "UPSC" | "CSE" | "Medical">(defaultCategory);
  
  // Preview selection model (before hitting Switch Exam confirming updates)
  const [previewGroup, setPreviewGroup] = useState(currentGroup);

  if (!isOpen) return null;

  // Filter exams based on selected category pill and search query text
  const filteredExams = EXAM_OPTIONS.filter((ex) => {
    const matchesCategory = ex.category === selectedCategory;
    const matchesQuery = 
      ex.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleSwitchExam = () => {
    onSelectGroup(previewGroup);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center select-none" id="choose-exam-overlay-dialog animate-fade-in">
      {/* Dimmed glass background backdrop with close action trigger */}
      <div 
        className="absolute inset-0 bg-black/55 backdrop-blur-[2.5px] transition-opacity cursor-pointer duration-300"
        onClick={onClose}
      />

      {/* Slide-up active sheet panel */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="relative w-full max-w-md bg-[#f6f8fe] rounded-t-[30px] shadow-2xl flex flex-col overflow-hidden max-h-[88vh] z-50 border-t border-slate-100"
        style={{ fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif' }}
      >
        {/* White header region with Title and Close interactive trigger */}
        <div className="px-6 pt-5 pb-4 bg-white shrink-0 flex flex-col gap-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-[21px] font-black tracking-tight text-slate-800 text-center flex-1 ml-6">
              Choose Your Exam
            </h2>
            <button
              onClick={onClose}
              className="p-1 px-[5px] hover:bg-slate-100 text-slate-700 hover:text-black rounded-full transition active:scale-90 flex items-center justify-center shrink-0"
              title="Close exam chooser"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Interactive Search topics box with search glass icon */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[2.2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics.."
              className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400/90 outline-none transition shadow-sm"
            />
          </div>

          {/* Horizontal fast filtering tab row (Pills) */}
          <div className="flex gap-2 pb-1 bg-white select-none">
            {(["TNPSC", "UPSC", "CSE", "Medical"] as const).map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSearchQuery(""); // Reset search on category toggle
                  }}
                  className={`px-5 py-1.5 rounded-full text-[12px] font-black tracking-wide text-center cursor-pointer transition active:scale-95 border ${
                    isActive 
                      ? "bg-[#e2edd3] text-[#125652] border-[#c0e09e] font-black shadow-sm" 
                      : "bg-white text-slate-400 font-extrabold hover:text-slate-600 hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable list content area with Exam Cards */}
        <div className="flex-grow overflow-y-auto px-6 py-5 flex flex-col gap-3 min-h-[250px] max-h-[50vh]">
          {filteredExams.map((ex) => {
            const isSelectedInDB = currentGroup === ex.fullName;
            const isPreviewActive = previewGroup === ex.fullName;

            return (
              <div
                key={ex.id}
                onClick={() => { onSelectGroup(ex.fullName); onClose(); }}
                className={`w-full p-3.5 bg-white rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  isPreviewActive
                    ? "border-indigo-500 bg-indigo-50/5 shadow-md scale-[1.01]"
                    : "border-slate-100 hover:border-slate-200 active:scale-98 shadow-sm"
                }`}
              >
                {/* Visual Icon Badge and title */}
                <div className="flex items-center gap-3">
                  <CourthouseIcon isActive={isPreviewActive} />
                  
                  <div className="flex flex-col text-left">
                    <span className={`text-[15px] font-bold tracking-tight leading-none ${
                      isPreviewActive ? 'text-[#7c5dfa]' : 'text-slate-800'
                    }`}>
                      {ex.title}
                    </span>
                    <span className="text-[12.5px] font-extrabold text-slate-400 mt-1 leading-none">
                      {ex.subtitle}
                    </span>
                  </div>
                </div>

                {/* Right badges & interactive indicators */}
                <div className="flex items-center gap-3">
                  {/* Posts Pill count */}
                  <span className="px-2.5 py-1.5 text-[11px] font-black text-emerald-800 bg-[#ccf7e2] rounded-lg">
                    {ex.posts}
                  </span>

                  {/* Violet "Current" block or active selection pill */}
                  {isPreviewActive && (
                    <span className="px-3.5 py-1.5 text-[11px] font-extrabold text-white bg-[#7c5dfa] rounded-lg shadow-sm">
                      Current
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredExams.length === 0 && (
            <div className="text-center py-12 text-xs font-bold text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
              No matching exams found in this category.
            </div>
          )}
        </div>

        {/* STICKY BOTTOM BUTTON SECTION - NO CLOSE PLANNER BUTTON BUT SWITCH EXAM STAYS */}
        <div className="p-6 bg-white border-t border-slate-100 shrink-0 flex flex-col gap-3 sticky bottom-0 z-50">
          <button
            type="button"
            onClick={handleSwitchExam}
            className="w-full h-11.5 rounded-xl bg-[#125652] hover:bg-[#0c3e3b] text-white font-extrabold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <SwapIcon />
            <span>Switch Exam</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
