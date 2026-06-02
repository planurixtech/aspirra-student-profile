import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, Square, Pause, Sliders, Volume2, VolumeX, Sparkles, ChevronRight, Check, ChevronLeft, Plus, Clock, BookOpen, Layers, X, Send, Trees } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FocusTheme, StudyModeType, TaskItem } from '../types';

interface GroupComponent1Props {
  onSessionComplete: (minutes: number, theme: string) => void;
  selectedTheme: FocusTheme;
  setSelectedTheme: (theme: FocusTheme) => void;
  studyMode: StudyModeType;
  setStudyMode: (mode: StudyModeType) => void;
  setTimerActiveState: (active: boolean) => void;
  tasks?: TaskItem[];
  onAddTask?: (title: string, time: string) => void;
  syllabusTopics?: { id: string; name: string; completed: boolean }[];
  completedMinutes?: number;
}

// Five traditional Indian/Tamil Sangam Landscapes (Thinai)
interface LandscapeDetail {
  url: string;
  color: string;
  accent: string;
  tamilName: string;
  englishMeaning: string;
  subtitle: string;
  era: string;
  icon: string;
}

const LANDSCAPES: Record<FocusTheme, LandscapeDetail> = {
  Kurinji: {
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    color: "from-slate-950/50 to-indigo-950/70",
    accent: "bg-indigo-500/25 text-indigo-200 border-indigo-400/30",
    tamilName: "Kurinji",
    englishMeaning: "Mountainous",
    subtitle: "Mountains & Hills",
    era: "UNION",
    icon: "🏔️"
  },
  Mullai: {
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop",
    color: "from-emerald-950/50 to-slate-950/70",
    accent: "bg-emerald-500/25 text-emerald-200 border-emerald-400/30",
    tamilName: "Mullai",
    englishMeaning: "Forest",
    subtitle: "Forests & Pastoral",
    era: "WAITING",
    icon: "🌲"
  },
  Marutham: {
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop",
    color: "from-teal-950/50 to-yellow-950/70",
    accent: "bg-teal-500/25 text-teal-200 border-teal-400/30",
    tamilName: "Marutham",
    englishMeaning: "Riverside",
    subtitle: "Agricultural Plains",
    era: "QUARRELING",
    icon: "🌾"
  },
  Neythal: {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
    color: "from-sky-950/50 to-blue-900/70",
    accent: "bg-sky-500/25 text-sky-200 border-sky-400/30",
    tamilName: "Neythal",
    englishMeaning: "Coastal",
    subtitle: "Coastal & Seashore",
    era: "LONGING",
    icon: "🌊"
  },
  Palai: {
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?q=80&w=800&auto=format&fit=crop",
    color: "from-amber-950/50 to-orange-950/70",
    accent: "bg-amber-500/25 text-amber-200 border-amber-400/30",
    tamilName: "Palai",
    englishMeaning: "Desert",
    subtitle: "Desert & Wasteland",
    era: "SEPARATION",
    icon: "🏜️"
  }
};

const MINUTE_PRESETS = [5, 15, 25, 45, 60, 90, 120];

const FALLBACK_TOPICS = [
  "Indian Polity & Fundamental Rights",
  "Geography - Monsoon Cycle & Soils",
  "Indian History - Sangam Era Literature",
  "Modern Indian Economy & Planning Commission",
  "Aptitude - Time & Distance Formulas",
  "General Science - Physics & Biology Core"
];

const PX_PER_MIN  = 4;
const MAX_MINUTES = 120;
const EXTRA_TICKS = 80;
const TOTAL_TICKS = EXTRA_TICKS + MAX_MINUTES + 1 + EXTRA_TICKS;

export default function GroupComponent1({
  onSessionComplete,
  selectedTheme,
  setSelectedTheme,
  studyMode,
  setStudyMode,
  setTimerActiveState,
  tasks = [],
  onAddTask,
  syllabusTopics = [],
  completedMinutes = 60
}: GroupComponent1Props) {
  // Timer States
  const [presetMinutes, setPresetMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Custom states for Save confirmation, screen saver, and Study Day summary screen
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState<number>(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSummaryScreen, setShowSummaryScreen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [improvementText, setImprovementText] = useState("");
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio state simulations (ambient sound)
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  // Swipe-left-to-stop drag offset tracker
  const [capsuleDragOffset, setCapsuleDragOffset] = useState(0);

  // Selector panels visibility
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showPresetSlider, setShowPresetSlider] = useState(false);

  // Immersive Mobile Full Screen Overlay States
  const [isImmersiveOpen, setIsImmersiveOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState("");

  // References
  const timerRef        = useRef<NodeJS.Timeout | null>(null);
  const dragStartXRef   = useRef(0);
  const dragStartMinsRef = useRef(25);

  // Tick-ruler state & refs
  const rulerRef        = useRef<HTMLDivElement>(null);
  const [wrapW, setWrapW] = useState(320);
  const rulerDragging   = useRef(false);
  const rulerDragX      = useRef(0);
  const rulerDragMins   = useRef(25);

  // Initialize or reset timer when configs change
  useEffect(() => {
    if (!isTimerRunning) {
      if (studyMode === 'Pomodoro') {
        setTimeLeft(25 * 60);
      } else if (studyMode === 'Infinite') {
        setTimeLeft(0);
      } else {
        setTimeLeft(presetMinutes * 60);
      }
    }
  }, [presetMinutes, isTimerRunning, studyMode]);

  // Tick Hook supports both countdown and stopwatch count up
  useEffect(() => {
    setTimerActiveState(isTimerRunning && !isPaused);
    
    if (isTimerRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        if (studyMode === 'Infinite') {
          // Count up
          setTimeLeft((prev) => prev + 1);
        } else {
          // Count down
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handleTimerFinish();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isPaused, studyMode, presetMinutes]);

  // Idle screen-saver reset and listener hook
  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    if (isImmersiveOpen && isTimerRunning && !isPaused) {
      idleTimeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, 5000);
    }
  };

  useEffect(() => {
    if (isImmersiveOpen) {
      resetIdleTimer();
      
      const handleActivity = () => {
        resetIdleTimer();
      };

      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('mousedown', handleActivity);
      window.addEventListener('keypress', handleActivity);
      window.addEventListener('touchstart', handleActivity);
      window.addEventListener('scroll', handleActivity);

      return () => {
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('mousedown', handleActivity);
        window.removeEventListener('keypress', handleActivity);
        window.removeEventListener('touchstart', handleActivity);
        window.removeEventListener('scroll', handleActivity);
      };
    } else {
      setIsIdle(false);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
    }
  }, [isImmersiveOpen, isTimerRunning, isPaused]);

  // Ruler ResizeObserver
  useEffect(() => {
    const el = rulerRef.current;
    if (!el) return;
    const sync = () => setWrapW(el.offsetWidth);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onRulerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTimerRunning || studyMode !== 'Focus') return;
    rulerDragging.current  = true;
    rulerDragX.current     = e.clientX;
    rulerDragMins.current  = presetMinutes;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
  };
  const onRulerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!rulerDragging.current) return;
    const delta = rulerDragX.current - e.clientX;
    const next  = Math.max(5, Math.min(MAX_MINUTES, rulerDragMins.current + Math.round(delta / PX_PER_MIN)));
    setPresetMinutes(next);
    setTimeLeft(next * 60);
  };
  const onRulerUp = () => { rulerDragging.current = false; };

  const rulerX = wrapW / 2 - (EXTRA_TICKS + presetMinutes) * PX_PER_MIN;

  const handleTimerFinish = () => {
    setIsTimerRunning(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Natural completion transitions direct to the Study Ends summary screen!
    const completedMins = studyMode === 'Pomodoro' ? 25 : presetMinutes;
    setSessionDurationMinutes(completedMins);
    setShowSummaryScreen(true);
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    setIsPaused(false);
    setIsImmersiveOpen(true);
    setSessionStartTime(new Date()); // Log exact start timestamp
    
    if (studyMode === 'Pomodoro') {
      setTimeLeft(25 * 60);
    } else if (studyMode === 'Infinite') {
      setTimeLeft(0);
    } else {
      setTimeLeft(presetMinutes * 60);
    }
  };

  const handleStartStop = () => {
    if (isTimerRunning) {
      // Already running: opens immersive view
      setIsImmersiveOpen(true);
    } else {
      // Starts a fresh focus timer session
      handleStartTimer();
    }
  };

  const handlePauseToggle = () => {
    if (isTimerRunning) {
      setIsPaused(!isPaused);
    }
  };

  const triggerStopPopup = () => {
    setShowSaveModal(true);
  };

  const handleCancelSessionInline = () => {
    // If running, show save modal inside immersive study
    if (isTimerRunning) {
      setShowSaveModal(true);
    } else {
      setIsImmersiveOpen(false);
    }
  };

  const handleMinimizeImmersive = () => {
    // Keeps active timer running in the background and closes immersive portal
    setIsImmersiveOpen(false);
  };

  const formatTimer = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const padStr = (n: number) => n < 10 ? `0${n}` : `${n}`;
    return `${padStr(mins)} : ${padStr(secs)}`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTimerRunning && studyMode === 'Focus') {
      const val = parseInt(e.target.value);
      setPresetMinutes(val);
      setTimeLeft(val * 60);
    }
  };

  const handleQuickAddPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTaskTitle.trim() && onAddTask) {
      onAddTask(quickTaskTitle.trim(), "09:00 AM");
      setSelectedTopic(quickTaskTitle.trim());
      setQuickTaskTitle("");
      setShowQuickAddModal(false);
    }
  };

  const activeLandscape = LANDSCAPES[selectedTheme];

  // Dynamic lists of incomplete tasks + fallback learning topics
  const incompleteTasks = tasks.filter(t => !t.completed).map(t => t.title);
  
  // Filter uncompleted syllabus topics and order bottom to up (reversed list!)
  const uncompletedSyllabusTopics = (syllabusTopics || [])
    .filter(t => !t.completed)
    .reverse();

  const syllabusTopicNames = uncompletedSyllabusTopics.map(t => t.name);

  // If we have unread syllabus topics, display them reversed. Else default to incomplete tasks or fallback topics
  const topicList = syllabusTopicNames.length > 0 
    ? syllabusTopicNames 
    : (incompleteTasks.length > 0 ? incompleteTasks : FALLBACK_TOPICS);

  return (
    <div className="flex flex-col items-center mt-4 self-center w-full" id="focus-suite-wrapper">
      {/* Dynamic hardware-accelerated style injector for modern transitions */}
      <style dangerouslySetInnerHTML={{ __html: `
        .transition-effects-all {
          transition: filter 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.4s;
        }
      `}} />
      
      {/* Focus Landscape Frame Card */}
      <div
        onClick={() => setIsImmersiveOpen(true)}
        className="relative overflow-hidden select-none cursor-pointer active:scale-[0.99] transition-effects-all group w-full"
        style={{ borderRadius: '18px', boxShadow: '0px 8px 24px rgba(0,0,0,0.25)' }}
        id="thinai-landscape-frame"
        title="Maximize Immersive Study Cockpit"
      >
        {/* Background image */}
        <img
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
          src={activeLandscape.url}
          alt="Focus theme wallpaper"
          className="group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.44) 0%, rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.64) 100%)' }}
        />

        <div className="relative z-10 px-4 pt-3.5 pb-3.5 flex flex-col gap-[5px]" onClick={(e) => e.stopPropagation()}>

          {/* 1 · Mode label */}
          <p
            className="text-center tracking-[0.22em] uppercase font-extrabold leading-none"
            style={{ fontSize: 13, color: '#fef08a', textShadow: '0 1px 6px rgba(0,0,0,0.55)', fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            {studyMode === 'Focus' ? 'Focus' : studyMode === 'Pomodoro' ? 'Pomodoro' : 'Infinite'}
          </p>

          {/* 2 · Timer display */}
          <div className="flex items-baseline justify-center leading-none" style={{ gap: 5 }}>
            <span
              style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, fontSize: 72, color: '#ffffff', textShadow: '0 2px 16px rgba(0,0,0,0.45)', lineHeight: 1 }}
            >
              {formatTimer()}
            </span>
          </div>

          {/* 3 · KEEP LEARNING! */}
          <p
            className="text-center font-extrabold tracking-[0.20em] uppercase"
            style={{ fontSize: 11, color: '#00d87a', fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            {isPaused ? 'PAUSED' : 'KEEP LEARNING!'}
          </p>

          {/* 4 · Tick-mark ruler — slide to set minutes */}
          <div
            ref={rulerRef}
            className="relative w-full touch-none"
            style={{ height: 38, marginTop: 4, marginBottom: 2, cursor: isTimerRunning ? 'not-allowed' : 'ew-resize' }}
            onPointerDown={onRulerDown}
            onPointerMove={onRulerMove}
            onPointerUp={onRulerUp}
            onPointerCancel={onRulerUp}
          >
            {/* Centre marker */}
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none rounded-full"
              style={{ width: 2, background: 'rgba(255,255,255,0.97)' }}
            />
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute top-0 h-full"
                style={{ width: TOTAL_TICKS * PX_PER_MIN, transform: `translateX(${rulerX}px)`, willChange: 'transform' }}
              >
                {Array.from({ length: TOTAL_TICKS }, (_, idx) => {
                  const minVal  = idx - EXTRA_TICKS;
                  const inRange = minVal >= 0 && minVal <= MAX_MINUTES;
                  const isMajor = inRange && minVal % 15 === 0;
                  const isMed   = inRange && minVal % 5  === 0;
                  const h  = isMajor ? 30 : isMed ? 20 : inRange ? 11 : 6;
                  const op = isMajor ? 0.95 : isMed ? 0.62 : inRange ? 0.36 : 0.11;
                  const w  = isMajor ? 2 : 1;
                  return (
                    <div
                      key={idx}
                      style={{ position: 'absolute', left: idx * PX_PER_MIN, top: '50%', transform: 'translateY(-50%)', width: w, height: h, backgroundColor: `rgba(255,255,255,${op})`, borderRadius: 1 }}
                    />
                  );
                })}
              </div>
            </div>
            {/* Edge fade masks */}
            <div className="absolute inset-y-0 left-0 w-14 pointer-events-none z-10" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent)' }} />
            <div className="absolute inset-y-0 right-0 w-14 pointer-events-none z-10" style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.3), transparent)' }} />
          </div>

          {/* 5 · Theme + Mode buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => { if (!isTimerRunning) { setShowThemeSelector(true); setShowModeSelector(false); } }}
              disabled={isTimerRunning}
              className="flex-1 flex items-center justify-between px-3 py-[9px] rounded-[12px] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'rgba(0,0,0,0.42)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)' }}
            >
              <span className="flex items-center gap-[6px] text-white font-semibold text-[13px]">
                <Trees className="w-4 h-4 text-white shrink-0" />
                <span>{activeLandscape.englishMeaning}</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/65 shrink-0" />
            </button>

            <button
              onClick={() => { if (!isTimerRunning) { setShowModeSelector(true); setShowThemeSelector(false); } }}
              disabled={isTimerRunning}
              className="flex-1 flex items-center justify-between px-3 py-[9px] rounded-[12px] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'rgba(0,0,0,0.42)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)' }}
            >
              <span className="flex items-center gap-[6px] text-white font-semibold text-[13px]">
                <div className="w-[17px] h-[17px] border-2 border-white rounded-full flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
                <span>Study Mode</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/65 shrink-0" />
            </button>
          </div>

          {/* 6 · Start Session */}
          <button
            onClick={handleStartStop}
            className="w-full py-[13px] rounded-[13px] font-bold text-[15px] text-white active:scale-[0.975] transition-all"
            style={{
              background:    isTimerRunning ? '#ef4444' : '#22c55e',
              boxShadow:     isTimerRunning ? '0 4px 18px rgba(239,68,68,0.40)' : '0 4px 18px rgba(34,197,94,0.40)',
              letterSpacing: '0.025em',
              fontFamily:    '"Plus Jakarta Sans", sans-serif',
            }}
          >
            {isTimerRunning ? (isPaused ? 'Resume Session' : 'Stop Session') : 'Start Session'}
          </button>

          {/* INLINE THEME SELECTION PANEL */}
          {showThemeSelector && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl z-30 flex flex-col rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 px-4 pt-4 pb-2 shrink-0">
                <button onClick={() => setShowThemeSelector(false)} className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center active:scale-90 transition">
                  <ChevronLeft className="w-4 h-4 text-white stroke-[3]" />
                </button>
                <span className="text-white font-bold text-[14px] tracking-wide">Select Theme</span>
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 px-2 pb-3">
                {(Object.keys(LANDSCAPES) as FocusTheme[]).map((thm) => {
                  const info = LANDSCAPES[thm];
                  const isSel = selectedTheme === thm;
                  return (
                    <button key={thm} type="button" onClick={() => { setSelectedTheme(thm); setShowThemeSelector(false); }} className="relative h-[72px] rounded-xl overflow-hidden w-full active:scale-[0.98] transition">
                      <img src={info.url} alt={thm} className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-black/20" />
                      <div className="relative z-10 h-full flex items-center justify-between px-4">
                        <div className="text-left">
                          <p className="text-white font-black text-[13.5px] tracking-wide leading-none">{thm.toUpperCase()} <span className="text-white/50 font-normal text-[11px]">{info.era}</span></p>
                          <p className="text-white/70 text-[11px] font-medium mt-0.5">{info.subtitle}</p>
                        </div>
                        {isSel && <div className="w-6 h-6 rounded-full bg-white/20 border-2 border-white flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white stroke-[3]" /></div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* INLINE STUDY MODE SELECTION PANEL */}
          {showModeSelector && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xl z-30 flex flex-col justify-center px-5 rounded-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-8">
                <button onClick={() => setShowModeSelector(false)} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:scale-90 transition">
                  <ChevronLeft className="w-5 h-5 text-white stroke-[3]" />
                </button>
                <div className="flex-1 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/70 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white/70" /></div>
                  <span className="text-white font-bold text-[15px] tracking-wide">Select Mode</span>
                </div>
                <div className="w-9" />
              </div>
              <div className="flex gap-3">
                {([
                  { mode: 'Pomodoro' as StudyModeType, label: 'POMODORO', icon: (<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="15" stroke="currentColor" strokeWidth="2.5" /><path d="M18 10v8l5 3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>) },
                  { mode: 'Focus'    as StudyModeType, label: 'GOAL',     icon: (<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="15" stroke="currentColor" strokeWidth="2.5" /><circle cx="18" cy="18" r="8" stroke="currentColor" strokeWidth="2" /><circle cx="18" cy="18" r="3" fill="currentColor" /></svg>) },
                  { mode: 'Infinite' as StudyModeType, label: 'INFINITE', icon: (<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><path d="M8 18c0-4 3-7 7-7s6 5 10 5 7-3 7-7-3-7-7-7-6 5-10 5-7-3-7 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/><path d="M8 18c0 4 3 7 7 7s6-5 10-5 7 3 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>) },
                ] as const).map(({ mode, label, icon }) => {
                  const isSel = studyMode === mode;
                  return (
                    <button key={mode} type="button" onClick={() => { setStudyMode(mode); setShowModeSelector(false); }} className={`flex-1 py-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all active:scale-95 ${isSel ? 'bg-white text-slate-900 shadow-[0_8px_24px_rgba(0,0,0,0.4)]' : 'bg-white/10 border border-white/20 text-white hover:bg-white/15'}`}>
                      {icon}
                      <span className="font-black text-[10px] tracking-widest">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>


      {/* ========================================================================================= */}
      {/* 2. STUNNING PORTRAIT DEEP FOCUS INTERACTIVE SUB-PAGE (SLIDES BOTTOM TO UP) COMPLYING WITH IMAGE */}
      {/* ========================================================================================= */}
      <AnimatePresence>
        {isImmersiveOpen && (
          <motion.div
            initial={{ y: "100%", opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.9 }}
            transition={{ type: "spring", damping: 30, stiffness: 220 }}
            className="fixed inset-0 z-[1900] bg-slate-950 flex flex-col justify-between overflow-hidden text-white"
            id="immersive-study-page"
          >
            {/* Absolute Wallpaper with realistic theme styling */}
            <img 
              src={activeLandscape.url}
              alt="Immersive scenic landscape background"
              className="absolute inset-0 w-full h-full object-cover z-0 filter saturate-[1.1] brightness-[0.85]"
              referrerPolicy="no-referrer"
            />
            {/* Smooth dark theme blur overlay */}
            <div className={`absolute inset-0 bg-gradient-to-b ${activeLandscape.color} mix-blend-multiply pointer-events-none z-[1]`} />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[3px] pointer-events-none z-[2]" />

            {/* Content Layer (Ensure interactive items are z-10) */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between p-6 select-none">
              
              {showSummaryScreen ? (
                /* STUDY ENDS SCREEN - MATCHING image_2.png */
                <div className="relative z-10 w-full h-full flex flex-col justify-between p-6 select-none animate-fade-in text-white">
                  {/* Header Block */}
                  <div className="flex flex-col text-left pt-6 px-4">
                    <h1 className="text-[32px] font-black tracking-tight leading-none text-white drop-shadow">
                      Study Ends
                    </h1>
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300 mt-2.5 block">
                      {(() => {
                        const s = sessionStartTime || new Date(Date.now() - 25 * 60 * 1000);
                        const e = new Date();
                        const fmt = (d: Date) => {
                          let h = d.getHours();
                          const m = d.getMinutes();
                          const ap = h >= 12 ? 'PM' : 'AM';
                          h = h % 12;
                          h = h === 0 ? 12 : h;
                          const hStr = h < 10 ? `0${h}` : `${h}`;
                          const mStr = m < 10 ? `0${m}` : `${m}`;
                          return `${hStr}:${mStr} ${ap}`;
                        };
                        return `${fmt(s)} - ${fmt(e)}`;
                      })()}
                    </span>
                    
                    <div className="mt-10">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 block">
                        Slogan
                      </span>
                      <p className="text-[14px] font-bold text-slate-200 italic leading-snug mt-1.5 max-w-xs">
                        "Revision shapes perfection. Your TNPSC study plan is updated."
                      </p>
                    </div>
                  </div>

                  {/* Big Statistics Rows */}
                  <div className="grid grid-cols-2 gap-4 px-4 my-auto shrink-0 max-w-[340px] mx-auto w-full">
                    {/* Duration Stat Grid Column */}
                    <div className="bg-white/5 border border-white/10 rounded-[24px] p-5.5 flex flex-col items-center justify-center text-center backdrop-blur-xl">
                      <span 
                        className="font-black text-[36px] text-white leading-none tracking-tight tabular-nums"
                        style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                      >
                        {sessionDurationMinutes}m
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400 mt-1 uppercase tracking-widest block">
                        Duration
                      </span>
                    </div>

                    {/* Today Accumulated Stat Grid Column */}
                    <div className="bg-white/5 border border-white/10 rounded-[24px] p-5.5 flex flex-col items-center justify-center text-center backdrop-blur-xl">
                      <span 
                        className="font-black text-[36px] text-[#00c670] leading-none tracking-tight tabular-nums"
                        style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                      >
                        {((completedMinutes + sessionDurationMinutes) / 60).toFixed(1).replace('.0', '')}hr
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400 mt-1 uppercase tracking-widest block">
                        Today
                      </span>
                    </div>
                  </div>

                  {/* Improvement Feedback Section */}
                  <div className="px-4 text-left mb-6 w-full max-w-[340px] mx-auto">
                    <label className="text-[10px] text-slate-300 font-extrabold uppercase tracking-widest mb-2 block">
                      Need any improvement ?
                    </label>
                    <div className="bg-white/10 border border-white/15 rounded-full p-1 px-3 flex items-center justify-between shadow-xl backdrop-blur-xl">
                      <input 
                        type="text"
                        className="bg-transparent border-none text-white focus:outline-none focus:ring-0 text-[12px] font-bold flex-grow placeholder-white/35 h-9 px-2" 
                        placeholder="say something here......."
                        value={improvementText}
                        onChange={(e) => setImprovementText(e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (improvementText.trim()) {
                            alert(`Feedback saved: "${improvementText}"`);
                            setImprovementText("");
                          }
                        }}
                        className="w-8 h-8 rounded-full bg-[#00c670]/20 hover:bg-[#00c670]/30 flex items-center justify-center text-white active:scale-90 transition cursor-pointer select-none shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Large Green Done Button at Bottom */}
                  <div className="px-4 mb-4 shrink-0 w-full max-w-[340px] mx-auto">
                    <button
                      type="button"
                      onClick={() => {
                        let topicTag = "";
                        if (selectedTopic) {
                          topicTag = ` (${selectedTopic})`;
                        }
                        // Confirms & saves the study session
                        onSessionComplete(sessionDurationMinutes, selectedTheme + " Thinai" + topicTag);
                        
                        // Restore state
                        setTimeLeft(presetMinutes * 60);
                        setSessionStartTime(null);
                        setSessionDurationMinutes(0);
                        setShowSummaryScreen(false);
                        setIsImmersiveOpen(false);
                      }}
                      className="w-full text-center bg-[#00c670] hover:bg-[#01b567] text-slate-950 font-black uppercase tracking-widest text-xs py-3.5 rounded-[20px] cursor-pointer select-none transition-all duration-300 shadow-[0_8px_24px_rgba(0,198,112,0.3)] hover:scale-[1.01] active:scale-95 flex items-center justify-center"
                    >
                      <span>Done</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* ACTIVE IMMERSIVE STUDY TIMER */
                <div className="relative z-10 w-full h-full flex flex-col justify-between select-none">
                  
                  {/* TOP HEADER CONTROLS BAR (FADES OUT WHEN IDLE FOR 5 SECONDS) */}
                  <div 
                    className="flex items-center justify-between shrink-0 mt-2 z-10 transition-all duration-700"
                    style={{ opacity: isIdle ? 0 : 1, pointerEvents: isIdle ? 'none' : 'auto', transform: isIdle ? 'translateY(-10px)' : 'translateY(0)' }}
                  >
                    {/* Immersive minimizing back arrow */}
                    <button
                      type="button"
                      onClick={handleMinimizeImmersive}
                      className="w-[46px] h-[46px] rounded-[14px] bg-gradient-to-b from-[#817257] via-[#4c402a] to-[#2c2212] border border-[#a68d5e]/50 shadow-[0_4px_20px_rgba(0,0,0,0.65),inset_0_1.5px_3px_rgba(255,255,255,0.22)] flex items-center justify-center text-[#ffebd5] hover:brightness-110 hover:scale-[1.03] transition-all active:scale-95 cursor-pointer"
                      title="Keep Focus Running & Go Back"
                    >
                      <ChevronLeft className="w-5 h-5 text-white stroke-[4]" />
                    </button>

                    {/* Displaying App Logo or Brand Name */}
                    <div className="px-3.5 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                      <span>{activeLandscape.englishMeaning} ({activeLandscape.tamilName})</span>
                    </div>

                    {/* + Add Plan glass button */}
                    <button
                      type="button"
                      onClick={() => setShowQuickAddModal(true)}
                      className="h-[38px] bg-gradient-to-b from-[#5c7242]/50 to-[#2a3c18]/70 border border-[#91ab6e]/50 shadow-[0_4px_16px_rgba(0,0,0,0.45)] backdrop-blur-md px-4 rounded-[14px] text-[13px] font-extrabold text-white flex items-center gap-1.5 leading-none hover:brightness-110 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
                      title="Create plan on the fly"
                    >
                      <Plus className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                      <span>Add Plan</span>
                    </button>
                  </div>

                  {/* MIDDLE-TOP TOPIC CARD SELECTOR (FADES OUT WHEN IDLE) */}
                  <div 
                    className="w-full max-w-[340px] mx-auto mt-6 relative shrink-0 transition-all duration-700"
                    style={{ opacity: isIdle ? 0 : 1, pointerEvents: isIdle ? 'none' : 'auto', transform: isIdle ? 'translateY(-10px)' : 'translateY(0)' }}
                  >
                    <div 
                      onClick={() => setShowTopicSelector(!showTopicSelector)}
                      className="w-full px-3.5 py-3.5 bg-gradient-to-b from-white/12 via-white/6 to-transparent backdrop-blur-xl border border-white/15 rounded-[15px] flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)] cursor-pointer hover:bg-white/15 transition-all active:scale-[0.99] select-none"
                      title="Choose what topic to study right now"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 text-left">
                        {/* Glossy icon outline */}
                        <div className="w-[38px] h-[38px] rounded-[10px] bg-gradient-to-b from-white/12 to-transparent border border-white/25 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.2)] flex items-center justify-center text-white/50 pointer-events-none shrink-0">
                          <BookOpen className="w-4.5 h-4.5 text-white/70" />
                        </div>
                        {/* Clean labels ordered bottom-to-up */}
                        <div className="min-w-0 leading-tight">
                          <h3 className="font-semibold text-[14px] text-white tracking-wide truncate max-w-[210px] drop-shadow-sm">
                            {selectedTopic ? selectedTopic : "Choose a topic to study"}
                          </h3>
                          <span className="text-[11px] text-white/70 font-semibold block mt-[3px] drop-shadow-sm uppercase tracking-wide">
                            {selectedTopic ? "Active Focus Target" : "Syllabus Pending (Bottom-to-Up)"}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-white/85 shrink-0 transition-transform duration-300 ${showTopicSelector ? 'rotate-90' : 'rotate-0'}`} />
                    </div>

                  </div>

                  {/* DYNAMIC CIRCULAR DIAL CLOCK CONTAINER (ALWAYS REMAINING IN SCREEN SAVER IDLE MODE!) */}
                  <div className="flex-1 flex flex-col items-center justify-center my-6 relative z-10 transition-transform duration-700">
                    {/* Concentric high-contrast radial outline glass frame */}
                    <div 
                      className="w-60 h-60 md:w-68 md:h-68 rounded-full flex flex-col items-center justify-center relative select-none animate-fade-in border border-white/10 transition-effects-all"
                      id="circular-countdown-analog-frame"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.4) 100%)',
                        boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.15) inset, 0 8px 32px 0 rgba(0, 0, 0, 0.65), 0 0 0 8px rgba(0, 0, 0, 0.25)',
                        filter: 'drop-shadow(0px 24px 64px rgba(0, 0, 0, 0.85))'
                      }}
                    >
                      {/* Glassy inner overlay */}
                      <div className="absolute inset-[10px] rounded-full bg-emerald-950/15 backdrop-blur-md shadow-[inset_0_4px_16px_rgba(0,0,0,0.7)] border border-white/5 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.1) 0%,transparent 75%)]" />
                      </div>

                      <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
                      
                      {isTimerRunning && !isPaused && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-[4px] rounded-full border-2 border-transparent border-t-emerald-400 border-r-emerald-500/20 opacity-90 pointer-events-none"
                        />
                      )}

                      {/* STOPWATCH NUMBERS */}
                      <div className="relative z-10 flex flex-col items-center mt-[-3px]">
                        <span 
                          className="font-bold tracking-[0.05em] text-center select-none text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] text-[45px] md:text-[50px] leading-tight tabular-nums"
                          style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif' }}
                        >
                          {formatTimer()}
                        </span>

                        <div className="text-[9px] uppercase text-emerald-300 font-extrabold tracking-[0.16em] mt-2.5 block bg-black/60 px-3 py-1 rounded-full border border-white/12 shadow-[0_2px_8px_rgba(0,0,0,0.4)] leading-none select-none">
                          {studyMode === 'Pomodoro' ? '🍅 POMODORO' : studyMode === 'Infinite' ? '⚡ FLOW' : `🎯 FOCUS: ${presetMinutes}M`}
                        </div>
                      </div>

                      {isPaused && (
                        <span className="absolute bottom-9.5 font-[800] uppercase text-[9px] tracking-widest text-amber-300 px-2 bg-amber-950/90 border border-amber-500/40 rounded-md shadow-md animate-pulse">
                          PAUSED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* BOTTOM CONTROL CAPSULE — swipe LEFT to stop (FADES OUT WHEN IDLE) */}
                  <div
                    className="w-full max-w-[328px] mx-auto shrink-0 mb-6 transition-all duration-700 relative"
                    style={{ opacity: isIdle ? 0 : 1, pointerEvents: isIdle ? 'none' : 'auto', transform: isIdle ? 'translateY(10px)' : 'translateY(0)' }}
                  >
                    {/* Swipe hint label above capsule */}
                    <p className="text-center text-white/25 text-[9px] font-semibold tracking-widest uppercase mb-2 select-none">
                      ← swipe left to stop
                    </p>

                    {/* Red STOP zone revealed behind capsule as user swipes left */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[72px] rounded-[22px] bg-rose-600 flex items-center justify-start pl-5 z-0 pointer-events-none"
                      style={{ opacity: Math.min(1, Math.abs(capsuleDragOffset) / 60) }}
                    >
                      <div className="flex items-center gap-2 text-white">
                        <Square className="w-4 h-4 fill-white stroke-0" />
                        <span className="text-[12px] font-black uppercase tracking-wider">End Session</span>
                      </div>
                    </div>

                    {/* Swipeable capsule */}
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: -180, right: 0 }}
                      dragElastic={0.04}
                      dragMomentum={false}
                      onDrag={(_e, info) => setCapsuleDragOffset(info.offset.x)}
                      onDragEnd={(_e, info) => {
                        if (info.offset.x < -80) triggerStopPopup();
                        setCapsuleDragOffset(0);
                      }}
                      className="relative w-full h-[72px] px-5 bg-black/40 border border-white/15 rounded-[22px] flex items-center justify-between z-10 cursor-grab active:cursor-grabbing select-none"
                      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                      id="immersive-controls-capsule"
                    >
                      {/* Play / Resume — centre-left */}
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => {
                          if (!isTimerRunning) handleStartTimer();
                          else if (isPaused) setIsPaused(false);
                        }}
                        className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-xl bg-[#00c670] hover:bg-[#00d87a] ${isTimerRunning && !isPaused ? 'ring-4 ring-emerald-400/30' : ''}`}
                        title="Play / Resume"
                      >
                        <Play className="w-6 h-6 text-white fill-white stroke-[2] translate-x-[1px]" />
                      </button>

                      {/* Pause — right */}
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={handlePauseToggle}
                        disabled={!isTimerRunning}
                        className={`w-12 h-12 rounded-[14px] border flex items-center justify-center active:scale-[0.93] transition-all cursor-pointer ${!isTimerRunning ? 'opacity-35 cursor-not-allowed bg-white/5 border-white/5' : 'bg-white/10 hover:bg-white/20 border-white/20'}`}
                        title="Pause"
                      >
                        <Pause className="w-5 h-5 text-white fill-white/90" />
                      </button>
                    </motion.div>
                  </div>
                </div>
              )}

            </div>

            {/* CUSTOM SAVE CONFIRMATION POPUP MODAL (image_4.png) */}
            <AnimatePresence>
              {showSaveModal && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-md z-[2500] flex items-center justify-center p-6 animate-fade-in">
                  <motion.div
                    initial={{ scale: 0.95, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 15 }}
                    className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-[310px] p-5 shadow-2xl relative flex flex-col items-center select-none text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Top right close sign */}
                    <button
                      type="button"
                      onClick={() => setShowSaveModal(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Question centered */}
                    <h4 className="text-white font-extrabold text-[15.5px] mt-4 mb-2">
                      Are you sure you want save ?
                    </h4>
                    <p className="text-slate-400 text-[11px] font-semibold leading-tight px-2 mb-5">
                      This will freeze study seconds, calculate your elapsed focus minutes, and prepare a summary report.
                    </p>

                    {/* Buttons Row with Yes in Green */}
                    <div className="flex items-center gap-3 w-full mb-5">
                      <button
                        type="button"
                        onClick={() => {
                          // Confirms and prepares study summary screen!
                          let elapsedMins = 0;
                          if (studyMode === 'Infinite') {
                            elapsedMins = Math.max(Math.floor(timeLeft / 60), 1);
                          } else {
                            const totalSecs = (studyMode === 'Pomodoro' ? 25 : presetMinutes) * 60;
                            const elapsedSecs = totalSecs - timeLeft;
                            elapsedMins = Math.max(Math.floor(elapsedSecs / 60), 1);
                          }
                          setSessionDurationMinutes(elapsedMins);
                          setShowSaveModal(false);
                          setShowSummaryScreen(true);
                        }}
                        className="flex-1 bg-[#00c670] hover:brightness-110 text-slate-950 font-black tracking-wide text-[12px] uppercase py-2.5 rounded-xl transition cursor-pointer shadow-md active:scale-95"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSaveModal(false)}
                        className="flex-1 bg-white hover:bg-slate-100 text-slate-900 font-extrabold tracking-wide text-[12px] uppercase py-2.5 rounded-xl transition cursor-pointer shadow-md active:scale-95"
                      >
                        No
                      </button>
                    </div>

                    {/* Swipe Stop element */}
                    <div className="w-full flex flex-col gap-1.5 mt-1 border-t border-white/10 pt-4.5">
                      <span className="text-[8.5px] uppercase tracking-widest font-extrabold text-[#76f0b4]/70">
                        OR Drag Slider to stop focus:
                      </span>
                      <div className="w-full h-11 bg-white/5 border border-white/10 rounded-full relative overflow-hidden flex items-center justify-end pr-4 pl-1">
                        <motion.div 
                          drag="x"
                          dragConstraints={{ left: 0, right: 190 }}
                          dragElastic={0.08}
                          dragMomentum={false}
                          onDragEnd={(event, info) => {
                            const slideLength = Math.max(info.offset.x, info.delta.x);
                            if (slideLength >= 75) {
                              // Triggered swipe confirmation stop!
                              let elapsedMins = 0;
                              if (studyMode === 'Infinite') {
                                elapsedMins = Math.max(Math.floor(timeLeft / 60), 1);
                              } else {
                                const totalSecs = (studyMode === 'Pomodoro' ? 25 : presetMinutes) * 60;
                                const elapsedSecs = totalSecs - timeLeft;
                                elapsedMins = Math.max(Math.floor(elapsedSecs / 60), 1);
                              }
                              setSessionDurationMinutes(elapsedMins);
                              setShowSaveModal(false);
                              setShowSummaryScreen(true);
                            }
                          }}
                          onClick={() => {
                            // Backup tap shortcut helper
                            let elapsedMins = 0;
                            if (studyMode === 'Infinite') {
                              elapsedMins = Math.max(Math.floor(timeLeft / 60), 1);
                            } else {
                              const totalSecs = (studyMode === 'Pomodoro' ? 25 : presetMinutes) * 60;
                              const elapsedSecs = totalSecs - timeLeft;
                              elapsedMins = Math.max(Math.floor(elapsedSecs / 60), 1);
                            }
                            setSessionDurationMinutes(elapsedMins);
                            setShowSaveModal(false);
                            setShowSummaryScreen(true);
                          }}
                          className="absolute left-1 top-1 bottom-1 w-9 bg-emerald-500 rounded-full flex items-center justify-center cursor-ew-resize shadow-md hover:brightness-105 active:scale-95 transition-all"
                        >
                          <ChevronRight className="w-4 h-4 text-slate-950 stroke-[3.2]" />
                        </motion.div>
                        <span className="text-[9.5px] uppercase font-black tracking-widest text-[#76f0b4] opacity-45 pointer-events-none select-none">
                          Swipe stops →
                        </span>
                      </div>
                    </div>

                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* QUICK NEW STUDY TASK INPUT MODAL DIALOG */}
            <AnimatePresence>
              {showQuickAddModal && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-[2100] flex items-center justify-center p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900 border border-white/15 w-full max-w-sm rounded-2xl p-5 shadow-2xl text-left space-y-4"
                  >
                    <div className="flex items-center gap-2 text-[#00c670]">
                      <Sparkles className="w-5 h-5" />
                      <h4 className="font-extrabold text-[15px] text-white">Create Quick Study Plan</h4>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium">
                      Enter a topic category or specific task unit to load onto your workspace and record stats with.
                    </p>
                    <form onSubmit={handleQuickAddPlanSubmit} className="space-y-3.5">
                      <input
                        autoFocus
                        type="text"
                        required
                        value={quickTaskTitle}
                        onChange={(e) => setQuickTaskTitle(e.target.value)}
                        placeholder="e.g. Fundamental Rights Article 14 to 18"
                        className="w-full text-xs p-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                      <div className="flex items-center justify-end gap-2 text-xs font-black uppercase pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setQuickTaskTitle("");
                            setShowQuickAddModal(false);
                          }}
                          className="px-3 py-2 text-slate-450 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg active:scale-95 transition-transform"
                        >
                          Create & Focus
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

      {/* TOPIC SELECTOR DRAWER — rendered via portal so it escapes overflow:hidden + transform stacking context of immersive view */}
      {createPortal(
        <AnimatePresence>
          {showTopicSelector && (
            <>
              {/* Dim backdrop */}
              <motion.div
                key="topic-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9000]"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
                onClick={() => setShowTopicSelector(false)}
              />

              {/* Glassy bottom sheet — slides up smoothly from below viewport */}
              <motion.div
                key="topic-drawer"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 280, damping: 30, mass: 0.85 }}
                className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto rounded-t-[28px] z-[9010] flex flex-col"
                style={{
                  maxHeight: '52vh',
                  background: 'rgba(8, 18, 16, 0.60)',
                  backdropFilter: 'blur(36px) saturate(1.8)',
                  WebkitBackdropFilter: 'blur(36px) saturate(1.8)',
                  borderTop: '1px solid rgba(255,255,255,0.14)',
                  boxShadow: '0 -24px 64px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                {/* Drag handle */}
                <div className="w-10 h-1 bg-white/25 rounded-full mx-auto mt-3 mb-1 shrink-0" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-3 pb-3 border-b border-white/10 shrink-0">
                  <div>
                    <span className="text-[9px] font-black uppercase text-emerald-300/70 tracking-widest block">Available Topics</span>
                    <h3 className="text-white font-extrabold text-[16px] tracking-tight mt-0.5">Select Topic</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTopicSelector(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Topic list */}
                <div className="overflow-y-auto flex-1 px-6 pb-6">
                  {topicList.filter(tp => tp !== selectedTopic).map((tp, idx, arr) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setSelectedTopic(tp); setShowTopicSelector(false); }}
                      className={`w-full text-left py-4 text-[14px] font-bold text-white/90 hover:text-white active:bg-white/5 transition-colors ${idx < arr.length - 1 ? 'border-b border-white/10' : ''}`}
                    >
                      {tp}
                    </button>
                  ))}
                  {topicList.filter(tp => tp !== selectedTopic).length === 0 && (
                    <p className="text-white/30 text-center text-xs py-8">All topics selected</p>
                  )}
                  {selectedTopic && (
                    <button
                      type="button"
                      onClick={() => { setSelectedTopic(null); setShowTopicSelector(false); }}
                      className="w-full text-center pt-4 pb-1 text-[11px] font-black uppercase text-rose-300/80 border-t border-white/10 mt-2"
                    >
                      Clear selected topic
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
