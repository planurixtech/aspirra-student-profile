import React, { useState, useRef } from 'react';
import { Plus, Calendar, X, ChevronLeft } from 'lucide-react';
import { TaskItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface GroupComponent2Props {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onAddTask: (title: string, time: string) => void;
  onDeleteTask: (id: string) => void;
}

const COMMON_TIMES_SUGGESTIONS = [
  "08:00 AM",
  "09:00 AM",
  "09:20 AM",
  "09:40 AM",
  "10:20 AM",
  "10:30 AM",
  "10:40 AM",
  "11:30 AM",
  "01:00 PM",
  "03:00 PM"
];

// --- HIGH FIDELITY EXACT ICON SVGs ---
const SunIcon = () => (
  <svg className="w-4 h-4 text-white stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41-1.41M17.66 6.34l-1.41 1.41" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-4 h-4 text-white stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const SquareRootIcon = () => (
  <svg className="w-[18px] h-[18px] text-white stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h2.5l2.5 7.5L12.5 5H21" />
    <path d="M15 11l4 4m0-4l-4 4" />
  </svg>
);

const PencilIcon = () => (
  <svg className="w-[15px] h-[15px] text-white stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-4 h-4 text-white stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

const CoffeeCupIcon = () => (
  <svg className="w-[15px] h-[15px] text-white stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8h1a3 3 0 1 1 0 6h-1" />
    <path d="M3 8h14v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <path d="M6 3v2M10 3v2M14 3v2" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="w-4 h-4 text-white stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 11h6M9 15h6" />
  </svg>
);

interface TaskStyle {
  icon: React.ReactNode;
  bgClass: string;
  haloClass: string;
  hexColor: string;
}

const getTaskStyle = (title: string, isInput: boolean = false): TaskStyle => {
  if (isInput) {
    return {
      icon: <SunIcon />,
      bgClass: "bg-[#f24e1e]",
      haloClass: "bg-[#f24e1e]/15",
      hexColor: "#f24e1e"
    };
  }

  const t = title.toLowerCase();
  if (t.includes("science")) {
    return {
      icon: <BookIcon />,
      bgClass: "bg-[#1866f2]",
      haloClass: "bg-[#1866f2]/15",
      hexColor: "#1866f2"
    };
  }
  if (t.includes("math") || t.includes("aptitude") || t.includes("reasoning") || t.includes("arithmetic") || t.includes("simplification")) {
    return {
      icon: <SquareRootIcon />,
      bgClass: "bg-[#0fa968]",
      haloClass: "bg-[#0fa968]/15",
      hexColor: "#0fa968"
    };
  }
  if (t.includes("english") || t.includes("tamil") || t.includes("write") || t.includes("language")) {
    return {
      icon: <PencilIcon />,
      bgClass: "bg-[#ffa500]",
      haloClass: "bg-[#ffa500]/15",
      hexColor: "#ffa500"
    };
  }
  if (t.includes("geography") || t.includes("geo") || t.includes("templates") || t.includes("globe")) {
    return {
      icon: <GlobeIcon />,
      bgClass: "bg-[#1a73e8]",
      haloClass: "bg-[#1a73e8]/15",
      hexColor: "#1a73e8"
    };
  }
  if (t.includes("break") || t.includes("tea") || t.includes("coffee") || t.includes("lunch")) {
    return {
      icon: <CoffeeCupIcon />,
      bgClass: "bg-[#804dfa]",
      haloClass: "bg-[#804dfa]/15",
      hexColor: "#804dfa"
    };
  }
  if (t.includes("history") || t.includes("historical") || t.includes("theory") || t.includes("polity") || t.includes("economy") || t.includes("news")) {
    return {
      icon: <ClipboardIcon />,
      bgClass: "bg-[#ff8c00]",
      haloClass: "bg-[#ff8c00]/15",
      hexColor: "#ff8c00"
    };
  }

  // Fallback
  return {
    icon: <SunIcon />,
    bgClass: "bg-[#f24e1e]",
    haloClass: "bg-[#f24e1e]/15",
    hexColor: "#f24e1e"
  };
};

const WEEK_DAYS = [
  { id: "day-1", name: "Sun", num: "1", dateStr: "11 May 2026" },
  { id: "day-2", name: "Tue", num: "2", dateStr: "12 May 2026" },
  { id: "day-3", name: "Wed", num: "3", dateStr: "13 May 2026" },
  { id: "day-4", name: "Thu", num: "4", dateStr: "14 May 2026", active: true },
  { id: "day-5", name: "Fri", num: "5", dateStr: "15 May 2026" },
  { id: "day-6", name: "Sat", num: "6", dateStr: "16 May 2026" },
  { id: "day-7", name: "Mon", num: "7", dateStr: "17 May 2026" }
];

export default function GroupComponent2({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask
}: GroupComponent2Props) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("14 May 2026");

  // Input states
  const [taskTitle, setTaskTitle] = useState("");
  const [taskTime, setTaskTime] = useState("09:00 AM");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const timeStripRef = useRef<HTMLDivElement>(null);
  const [timeDragging, setTimeDragging] = useState(false);
  const [timeDragStartX, setTimeDragStartX] = useState(0);
  const [timeDragScrollLeft, setTimeDragScrollLeft] = useState(0);

  const [showPlusOptions, setShowPlusOptions] = useState(false);
  const [addMode, setAddMode] = useState<'none' | 'addTask' | 'addTime'>('none');
  const [rulerTimeMinutes, setRulerTimeMinutes] = useState(9 * 60);
  const rulerRef = useRef<HTMLDivElement>(null);
  const [rulerDragging, setRulerDragging] = useState(false);
  const [timeSwipeStartY, setTimeSwipeStartY] = useState(0);
  const [timeFixed, setTimeFixed] = useState(false);

  const handleSubmitted = () => {
    if (taskTitle.trim()) {
      const formattedTime = taskTime.replace(/\s*:\s*/g, ':');
      onAddTask(taskTitle.trim(), formattedTime);
      setTaskTitle("");
      setAddMode('none');
      setShowPlusOptions(false);
    }
  };

  const handlePlusToggle = () => {
    if (addMode !== 'none') {
      setAddMode('none');
      setShowPlusOptions(false);
    } else {
      setShowPlusOptions(prev => !prev);
    }
  };

  const handleRulerDrag = (clientX: number) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = x / rect.width;
    const totalMins = Math.round((360 + pct * 960) / 15) * 15;
    setRulerTimeMinutes(Math.max(360, Math.min(1320, totalMins)));
  };

  const formatRulerTime = (totalMins: number): string => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const firstTsk = tasks[0];
  const firstTskStyle = firstTsk ? getTaskStyle(firstTsk.title) : getTaskStyle("", true);

  return (
    <>
      {/* 1. PRIMARY APP SECTION - TODAY ' S PLAN CARD (Dashboard view: super clean checklist style) */}
      <div
        className="w-full bg-white rounded-2xl p-4 flex flex-col gap-4 border border-slate-200 select-none shadow-sm"
        id="today-plan-scheduler-container"
      >
        {/* Header section with uppercase font and interactive calendar button */}
        <div className="flex items-center justify-between pb-1">
          <h3 className="font-extrabold text-[15px] text-slate-900 tracking-wider uppercase-title" style={{ fontFamily: 'Segoe UI, sans-serif', fontWeight: '800' }}>
            TODAY ' S PLAN
          </h3>
          <div className="flex items-center gap-1.5">
            <AnimatePresence>
              {showPlusOptions && addMode === 'none' && (
                <>
                  <motion.button
                    key="chip-addtime"
                    initial={{ x: 48, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 48, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 28, delay: 0.07 }}
                    type="button"
                    onClick={() => { setAddMode('addTime'); setShowPlusOptions(false); setTimeFixed(false); }}
                    className="flex items-center gap-1 h-7 px-2.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded-full text-[10.5px] font-bold text-[#065f46] shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="6" cy="6" r="4.5"/><path d="M6 3.5v2.5l1.5 1"/>
                    </svg>
                    Add Time
                  </motion.button>
                  <motion.button
                    key="chip-addtask"
                    initial={{ x: 48, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 48, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                    type="button"
                    onClick={() => { setAddMode('addTask'); setShowPlusOptions(false); }}
                    className="flex items-center gap-1 h-7 px-2.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded-full text-[10.5px] font-bold text-[#065f46] shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M6 2v8M2 6h8"/>
                    </svg>
                    Add Task
                  </motion.button>
                </>
              )}
            </AnimatePresence>
            <motion.button
              type="button"
              animate={{ rotate: (showPlusOptions || addMode !== 'none') ? 45 : 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 24 }}
              onClick={handlePlusToggle}
              className="p-1.5 rounded-full bg-[#125652] text-white cursor-pointer active:scale-90 flex items-center justify-center shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </motion.button>
            <button
              type="button"
              onClick={() => setIsCalendarOpen(true)}
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-800 transition cursor-pointer active:scale-95 flex items-center justify-center border border-slate-100 shadow-sm"
              title="Open Interactive Calendar View"
            >
              <Calendar className="w-5 h-5 text-slate-800 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Task input row + Study task items inside timeline */}
        <div className="relative flex flex-col gap-4">
          
          {/* ADD TASK / ADD TIME FORMS — shown based on addMode */}
          <AnimatePresence>

            {/* ADD TASK MODE */}
            {addMode === 'addTask' && (
              <motion.div
                key="addtask-form"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="flex items-center gap-2 relative z-10"
              >
                {/* Time Selector — tap to open dropdown, swipe up/down to cycle times */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                    onTouchStart={(e) => { setTimeSwipeStartY(e.touches[0].clientY); }}
                    onTouchMove={(e) => {
                      const delta = e.touches[0].clientY - timeSwipeStartY;
                      if (Math.abs(delta) > 14) {
                        const idx = COMMON_TIMES_SUGGESTIONS.indexOf(taskTime);
                        if (delta < 0 && idx > 0) setTaskTime(COMMON_TIMES_SUGGESTIONS[idx - 1]);
                        else if (delta > 0 && idx < COMMON_TIMES_SUGGESTIONS.length - 1) setTaskTime(COMMON_TIMES_SUGGESTIONS[idx + 1]);
                        setTimeSwipeStartY(e.touches[0].clientY);
                      }
                    }}
                    className="w-[76px] h-9 border border-slate-300 bg-white rounded flex items-center justify-center font-bold text-[11px] text-slate-400 hover:border-slate-400 transition-colors shadow-sm focus:outline-none select-none"
                  >
                    <span>{taskTime === "09:00 AM" && taskTitle === "" ? "Add time" : taskTime}</span>
                  </button>

                  <AnimatePresence>
                    {showTimeDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.14, ease: "easeOut" }}
                        className="absolute bottom-full left-0 mb-1.5 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-1.5"
                        style={{ width: 'max-content', maxWidth: '268px' }}
                      >
                        <div
                          ref={timeStripRef}
                          className="flex gap-1 overflow-x-auto"
                          style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            cursor: timeDragging ? 'grabbing' : 'grab'
                          }}
                          onMouseDown={(e) => {
                            if ((e.target as HTMLElement).closest('button')) return;
                            setTimeDragging(true);
                            setTimeDragStartX(e.pageX);
                            setTimeDragScrollLeft(timeStripRef.current?.scrollLeft ?? 0);
                          }}
                          onMouseMove={(e) => {
                            if (!timeDragging || !timeStripRef.current) return;
                            timeStripRef.current.scrollLeft = timeDragScrollLeft - (e.pageX - timeDragStartX);
                          }}
                          onMouseUp={() => setTimeDragging(false)}
                          onMouseLeave={() => setTimeDragging(false)}
                        >
                          {COMMON_TIMES_SUGGESTIONS.map((tm) => (
                            <button
                              key={tm}
                              type="button"
                              onClick={() => { setTaskTime(tm); setShowTimeDropdown(false); }}
                              className={`shrink-0 px-2.5 py-1 rounded-full border text-[10px] font-bold whitespace-nowrap transition-colors ${
                                taskTime === tm
                                  ? 'bg-[#108c5c] text-white border-[#108c5c]'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#108c5c] hover:text-[#108c5c]'
                              }`}
                            >
                              {tm}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Timeline ring */}
                <div className="w-6 h-6 flex items-center justify-center relative shrink-0">
                  <div className="absolute top-1/2 bottom-[-16px] left-1/2 w-[1.5px] -translate-x-1/2 border-r-[1.5px] border-dashed border-slate-300 z-0 pointer-events-none" />
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-[#108c5c] bg-white relative z-10" />
                </div>

                {/* Task title input */}
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleSubmitted(); }
                  }}
                  placeholder="Add Task"
                  className="flex-1 min-w-0 h-9 bg-white border border-slate-300 rounded py-1.5 px-3 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#108c5c] font-medium text-slate-800 shadow-sm"
                  id="main-add-task-input"
                  autoFocus
                />

                <div className="w-[30px] h-[30px] flex items-center justify-center shrink-0">
                  <AnimatePresence>
                    {(taskTitle.trim() !== '' || isInputFocused) && (
                      <motion.button
                        type="button"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 380, damping: 26 }}
                        onClick={handleSubmitted}
                        className="w-7 h-7 rounded-full bg-[#125652] hover:bg-[#0c3e3b] active:scale-95 transition-all text-white flex items-center justify-center shadow"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ADD TIME MODE — same row layout as addTask; right box switches ruler ↔ input */}
            {addMode === 'addTime' && (
              <motion.div
                key="addtime-ruler"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="flex items-center gap-2 relative z-10"
              >
                {/* Left: time label / fixed time — same width as task-mode time button */}
                <div className="w-[76px] h-9 border rounded flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm select-none"
                  style={timeFixed
                    ? { borderColor: '#a7f3d0', background: '#ecfdf5', color: '#065f46' }
                    : { borderColor: '#cbd5e1', background: '#fff', color: '#94a3b8' }
                  }
                >
                  {timeFixed ? formatRulerTime(rulerTimeMinutes) : 'Add time'}
                </div>

                {/* Middle: timeline circle — same as addTask */}
                <div className="w-6 h-6 flex items-center justify-center relative shrink-0">
                  <div className="absolute top-1/2 bottom-[-16px] left-1/2 w-[1.5px] -translate-x-1/2 border-r-[1.5px] border-dashed border-slate-300 z-0 pointer-events-none" />
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-[#108c5c] bg-white relative z-10" />
                </div>

                {/* Right box: ruler OR task input — occupies same flex-1 space */}
                <AnimatePresence mode="wait">
                  {!timeFixed ? (
                    <motion.div
                      key="ruler-box"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 min-w-0 relative rounded overflow-hidden select-none"
                      ref={rulerRef}
                      style={{
                        height: '36px',
                        cursor: rulerDragging ? 'grabbing' : 'grab',
                        background: 'linear-gradient(135deg, #0f3d2e 0%, #1a5c42 60%, #125652 100%)',
                        boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3)',
                      }}
                      onMouseDown={(e) => { setRulerDragging(true); handleRulerDrag(e.clientX); }}
                      onMouseMove={(e) => { if (rulerDragging) handleRulerDrag(e.clientX); }}
                      onMouseUp={() => { setRulerDragging(false); setTimeFixed(true); }}
                      onMouseLeave={() => { if (rulerDragging) setTimeFixed(true); setRulerDragging(false); }}
                      onTouchStart={(e) => { setRulerDragging(true); handleRulerDrag(e.touches[0].clientX); }}
                      onTouchMove={(e) => { e.preventDefault(); if (rulerDragging) handleRulerDrag(e.touches[0].clientX); }}
                      onTouchEnd={() => { setRulerDragging(false); setTimeFixed(true); }}
                    >
                      {/* Tick marks */}
                      <div className="absolute bottom-0 left-0 right-0 flex items-end" style={{ height: '24px' }}>
                        {Array.from({ length: 33 }, (_, i) => (
                          <div key={i} className="flex-1 flex justify-center items-end pb-[4px]">
                            <div style={{
                              width: '1.5px',
                              height: i % 4 === 0 ? '13px' : '7px',
                              backgroundColor: i % 4 === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)',
                              borderRadius: '1px'
                            }} />
                          </div>
                        ))}
                      </div>

                      {/* Progress glow */}
                      <div className="absolute inset-y-0 left-0 pointer-events-none" style={{
                        width: `${((rulerTimeMinutes - 360) / 960) * 100}%`,
                        background: 'linear-gradient(90deg, rgba(62,209,142,0.22) 0%, rgba(62,209,142,0.04) 100%)'
                      }} />

                      {/* Vertical handle line */}
                      <div className="absolute top-[4px] bottom-0 pointer-events-none" style={{
                        left: `${((rulerTimeMinutes - 360) / 960) * 100}%`,
                        width: '2px',
                        transform: 'translateX(-50%)',
                        background: 'rgba(255,255,255,0.8)',
                        boxShadow: '0 0 5px rgba(255,255,255,0.5)',
                        borderRadius: '1px'
                      }} />

                      {/* Glowing dot */}
                      <div className="absolute pointer-events-none" style={{
                        top: '40%',
                        left: `${((rulerTimeMinutes - 360) / 960) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                        width: '9px', height: '9px',
                        borderRadius: '50%',
                        background: '#3ed18e',
                        boxShadow: '0 0 7px #3ed18e, 0 0 14px rgba(62,209,142,0.5)'
                      }} />

                      {/* Floating time label inside ruler */}
                      <div className="absolute top-[3px] right-[8px] pointer-events-none">
                        <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.04em' }}>
                          {formatRulerTime(rulerTimeMinutes)}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="task-input-box"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 min-w-0 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (taskTitle.trim()) {
                              onAddTask(taskTitle.trim(), formatRulerTime(rulerTimeMinutes));
                              setTaskTitle("");
                              setAddMode('none');
                              setTimeFixed(false);
                            }
                          }
                        }}
                        placeholder="Add Task"
                        className="flex-1 min-w-0 h-9 bg-white border border-slate-300 rounded py-1.5 px-3 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#108c5c] font-medium text-slate-800 shadow-sm"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Right action button — same slot as addTask mode */}
                <div className="w-[30px] h-[30px] flex items-center justify-center shrink-0">
                  <AnimatePresence>
                    {timeFixed && taskTitle.trim() !== '' && (
                      <motion.button
                        type="button"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                        onClick={() => {
                          onAddTask(taskTitle.trim(), formatRulerTime(rulerTimeMinutes));
                          setTaskTitle("");
                          setAddMode('none');
                          setTimeFixed(false);
                        }}
                        className="w-7 h-7 rounded-full bg-[#125652] hover:bg-[#0c3e3b] active:scale-95 transition-all text-white flex items-center justify-center shadow"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* TASKS TIMELINE PREVIEW LIST */}
          {tasks.map((tsk, idx) => {
            const isLast = idx === tasks.length - 1;
            const isCompleted = tsk.completed;
            const formattedTime = tsk.time.replace(/\s*:\s*/g, ':');

            const isLineUpSolid = isCompleted;
            const isLineDownSolid = !isLast && tasks[idx + 1].completed;

            return (
              <div key={tsk.id} className="flex items-center gap-2 relative z-10 transition-all">

                {/* Time Indicator */}
                <div className={`w-[76px] h-9 border rounded flex items-center justify-center font-bold text-[11px] select-none shadow-sm shrink-0 ${
                  isCompleted 
                    ? "border-slate-200 bg-slate-50 text-slate-400 line-through" 
                    : "border-slate-300 bg-white text-slate-700"
                }`}>
                  <span>{formattedTime}</span>
                </div>

                {/* Timeline node ring */}
                <div className="w-6 h-6 flex items-center justify-center relative shrink-0">
                  <div className={`absolute top-[-16px] bottom-1/2 left-1/2 w-[1.5px] -translate-x-1/2 z-0 pointer-events-none ${
                      isLineUpSolid 
                        ? "bg-[#108c5c]" 
                        : "border-r-[1.5px] border-dashed border-slate-300"
                    }`} 
                  />

                  {!isLast && (
                    <div className={`absolute top-1/2 bottom-[-16px] left-1/2 w-[1.5px] -translate-x-1/2 z-0 pointer-events-none ${
                        isLineDownSolid 
                          ? "bg-[#108c5c]" 
                          : "border-r-[1.5px] border-dashed border-slate-300"
                      }`} 
                    />
                  )}

                  {isCompleted ? (
                    <div className="w-[18px] h-[18px] rounded-full bg-[#108c5c] flex items-center justify-center text-white relative z-10 shadow-sm">
                      <span className="text-[9px] font-black leading-none">✓</span>
                    </div>
                  ) : (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-[#108c5c] bg-white relative z-10" />
                  )}
                </div>

                {/* Task Title panel */}
                <div className={`flex-1 min-w-0 h-9 border rounded px-3 flex items-center justify-between font-bold text-xs shadow-sm transition-all ${
                  isCompleted
                    ? "border-slate-200 bg-slate-50 text-slate-400 line-through"
                    : "border-slate-300 bg-white text-slate-800"
                }`}>
                  <span className="truncate pr-1 font-semibold">{tsk.title}</span>
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => onDeleteTask(tsk.id)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition cursor-pointer flex items-center justify-center"
                      title="Delete task"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status checkmark trigger */}
                <div className="w-[30px] h-[30px] flex items-center justify-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleTask(tsk.id)}
                    className="w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer focus:outline-none"
                    title={isCompleted ? "Mark incomplete" : "Mark completed"}
                  >
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-[#3ed18e] border border-[#2db175] text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                        ✓
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[#108c5c] bg-white hover:bg-emerald-50 transition-colors" />
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 2. FULL MOCK-UP DESIGN CALENDAR SUB-PAGE (SLIDES BOTTOM TO UP) */}
      <AnimatePresence>
        {isCalendarOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed inset-0 bg-white z-[999] flex flex-col overflow-y-auto select-none"
            style={{ fontFamily: 'Segoe UI, system-ui, sans-serif' }}
            id="fullscreen-slid-calendar-page"
          >
            {/* Header Area exactly mimicking the bottom-to-up layout */}
            <div className="px-6 pt-5 pb-4 flex flex-col gap-6 shrink-0 bg-white border-b border-slate-100 sticky top-0 z-50">
              
              {/* Back button, 14 May 2026 button pill, and Calendar icon */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(false)}
                  className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-800 transition active:scale-90"
                  title="Close and return"
                >
                  <ChevronLeft className="w-7 h-7 stroke-[3] text-slate-900" />
                </button>

                {/* Styled center pill exactly matching "14 May 2026" */}
                <div 
                  className="bg-[#125652] text-white font-extrabold text-[13.5px] px-5 py-2.5 rounded-full select-none shadow flex items-center justify-center tracking-wide"
                >
                  <span>{selectedDate}</span>
                </div>

                <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-900">
                  <Calendar className="w-6 h-6 stroke-[2]" />
                </div>
              </div>

              {/* Weekly Calendar strip row — any clicked date becomes the active purple selection */}
              <div className="flex justify-between items-center px-1 text-center">
                {WEEK_DAYS.map((wd) => {
                  const isDaySelected = wd.dateStr === selectedDate;

                  if (isDaySelected) {
                    return (
                      <button
                        key={wd.id}
                        type="button"
                        onClick={() => setSelectedDate(wd.dateStr)}
                        className="flex flex-col items-center justify-center bg-[#7c5dfa] text-white rounded-2xl w-[48px] h-[64px] shadow-md scale-105 active:scale-95 transition-all outline-none"
                      >
                        <span className="text-[10px] font-bold tracking-tight uppercase opacity-90">{wd.name}</span>
                        <span className="text-[18px] font-black leading-none mt-1">{wd.num}</span>
                        <div className="flex gap-[2px] mt-1">
                          <span className="rounded-full bg-pink-300 block" style={{ height: '3px', width: '3px' }} />
                          <span className="rounded-full bg-pink-300 block" style={{ height: '3px', width: '3px' }} />
                        </div>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={wd.id}
                      type="button"
                      onClick={() => setSelectedDate(wd.dateStr)}
                      className="flex flex-col items-center justify-center w-[40px] h-[55px] rounded-xl transition-all active:scale-95 hover:bg-slate-50"
                    >
                      <span className="text-[10px] text-slate-400 font-extrabold block">{wd.name}</span>
                      <span className="text-[15px] font-black block mt-1.5 text-slate-800">
                        {wd.num}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* SCROLLABLE CONTENT BODY */}
            <div className="flex-grow px-6 py-6 overflow-y-auto bg-white flex flex-col gap-6">
              
              {/* TIMELINE LIST CONTAINER */}
              <div className="flex flex-col gap-5 relative">
                
                {/* ROW A - ADD TASK PANEL */}
                <div className="flex items-center gap-4 relative z-10">
                  {/* Add time display panel */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                      className="w-[88px] h-[44px] border border-slate-300 bg-white rounded-lg flex items-center justify-center font-extrabold text-[12.5px] text-slate-400 hover:border-slate-400 hover:text-slate-500 transition shadow-sm focus:outline-none whitespace-nowrap"
                    >
                      <span>{taskTime === "09:00 AM" && taskTitle === "" ? "Add time" : taskTime}</span>
                    </button>
                    {showTimeDropdown && (
                      <div className="absolute left-0 mt-1 w-[110px] max-h-44 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-y-auto py-1 text-[11px] font-bold text-slate-700">
                        {COMMON_TIMES_SUGGESTIONS.map((tm) => (
                          <button
                            key={tm}
                            type="button"
                            onClick={() => {
                              setTaskTime(tm);
                              setShowTimeDropdown(false);
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 transition"
                          >
                            {tm}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Circle outer wrapper with soft halo glow */}
                  <div className="w-11 h-11 rounded-full bg-[#f24e1e]/15 flex items-center justify-center relative shrink-0 z-10 transition-all duration-300">
                    <div className="w-8 h-8 rounded-full bg-[#f24e1e] flex items-center justify-center text-white shadow">
                      <SunIcon />
                    </div>

                    {/* Highly responsive SVG line underneath connecting to next node with custom gradient */}
                    {tasks.length > 0 && (
                      <svg className="absolute top-[22px] h-[64px] w-[4px] left-1/2 -translate-x-1/2 z-[-1]" style={{ pointerEvents: 'none' }}>
                        <defs>
                          <linearGradient id="grad-addtask" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f24e1e" />
                            <stop offset="100%" stopColor={firstTskStyle.hexColor} />
                          </linearGradient>
                        </defs>
                        <line 
                          x1="2" 
                          y1="0" 
                          x2="2" 
                          y2="64" 
                          stroke="url(#grad-addtask)" 
                          strokeWidth="2" 
                          strokeDasharray="3,3" 
                        />
                      </svg>
                    )}
                  </div>

                  {/* Add Task Input Field */}
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmitted();
                      }
                    }}
                    placeholder="Add Task"
                    className="flex-grow h-[44px] bg-white border border-slate-300 rounded-lg py-1.5 px-4 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#108c5c] font-bold text-slate-800 shadow"
                  />

                  {/* Dark pine circular Plus trigger */}
                  <button
                    type="button"
                    onClick={handleSubmitted}
                    className="w-[42px] h-[42px] rounded-full bg-[#125652] hover:bg-[#0c3e3b] active:scale-95 transition text-white flex items-center justify-center shrink-0 shadow-md"
                  >
                    <Plus className="w-6 h-6 stroke-[3]" />
                  </button>
                </div>

                {/* RENDER TASKS WITH EXACT PREMIUM SPECIFICATIONS */}
                {tasks.map((tsk, idx) => {
                  const isCompleted = tsk.completed;
                  const formattedTime = tsk.time.replace(/\s*:\s*/g, ':');
                  const isLast = idx === tasks.length - 1;

                  const currentStyle = getTaskStyle(tsk.title);
                  const nextTsk = !isLast ? tasks[idx + 1] : null;
                  const nextStyle = nextTsk ? getTaskStyle(nextTsk.title) : currentStyle;

                  return (
                    <div key={tsk.id} className="flex items-center gap-4 relative z-10 transition-all">
                      
                      {/* Left: Time indicator */}
                      <button
                        type="button"
                        className={`w-[88px] h-[44px] border rounded-lg flex items-center justify-center font-extrabold text-[12px] select-none shadow whitespace-nowrap ${
                          isCompleted
                            ? "border-slate-200 bg-slate-50 text-slate-300 line-through"
                            : "border-slate-300 bg-white text-slate-800"
                        }`}
                      >
                        {formattedTime}
                      </button>

                      {/* Middle: Custom Colored Circle Badge with outer Halo glow and crisp Topic icon */}
                      <div className={`${currentStyle.haloClass} w-11 h-11 rounded-full flex items-center justify-center relative shrink-0 z-10 transition-all duration-300`}>
                        <div className={`${currentStyle.bgClass} w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm duration-300 transition-transform`}>
                          {currentStyle.icon}
                        </div>

                        {/* Highly responsive SVG line underneath connecting to next node with custom gradient from current node color to next node color */}
                        {!isLast && (
                          <svg className="absolute top-[22px] h-[64px] w-[4px] left-1/2 -translate-x-1/2 z-[-1]" style={{ pointerEvents: 'none' }}>
                            <defs>
                              <linearGradient id={`grad-${tsk.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={currentStyle.hexColor} />
                                <stop offset="100%" stopColor={nextStyle.hexColor} />
                              </linearGradient>
                            </defs>
                            <line 
                              x1="2" 
                              y1="0" 
                              x2="2" 
                              y2="64" 
                              stroke={`url(#grad-${tsk.id})`} 
                              strokeWidth="2" 
                              strokeDasharray="3,3" 
                            />
                          </svg>
                        )}
                      </div>

                      {/* Right: Task Title strip containing an X delete action */}
                      <div className={`flex-grow h-[44px] border rounded-lg px-4 flex items-center justify-between font-bold text-[13px] shadow transition-all ${
                        isCompleted
                          ? "border-slate-200 bg-slate-50 text-slate-400 line-through"
                          : "border-slate-300 bg-white text-slate-800"
                      }`}>
                        <span className="truncate pr-1 font-semibold">{tsk.title}</span>
                        {!isCompleted && (
                          <button
                            type="button"
                            onClick={() => onDeleteTask(tsk.id)}
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition cursor-pointer flex items-center justify-center"
                            title="Remove"
                          >
                            <X className="w-4 h-4 stroke-[2]" />
                          </button>
                        )}
                      </div>

                      {/* Toggle status control (circle slider checkbox matching third screenshot perfectly) */}
                      <div className="w-[42px] h-[42px] flex items-center justify-center shrink-0">
                        <button
                          type="button"
                          onClick={() => onToggleTask(tsk.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer focus:outline-none"
                          title={isCompleted ? "Incomplete" : "Complete"}
                        >
                          {isCompleted ? (
                            <div className="w-6 h-6 rounded-full bg-[#3ed18e] text-white flex items-center justify-center text-[11px] font-black shadow-sm border border-[#2db175]">
                              ✓
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-[#125652] bg-white hover:bg-emerald-50 transition-colors" />
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })}

                {/* Empty state message when list has zero items */}
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400 font-bold border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    No items found. Create some above!
                  </div>
                )}

              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
