import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, ChevronLeft, Check, Clock, Timer, Target, Infinity as InfinityIcon } from 'lucide-react';
import { FocusTheme, StudyModeType } from '../types';

// ─── Landscape data ────────────────────────────────────────────────────────────
const LANDSCAPE: Record<FocusTheme, { url: string; era: string; subtitle: string }> = {
  Kurinji:  { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",  era: "UNION",      subtitle: "Mountains & Hills"     },
  Mullai:   { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop",  era: "WAITING",    subtitle: "Forests & Pastoral"    },
  Marutham: { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop",  era: "QUARRELING", subtitle: "Agricultural Plains"   },
  Neythal:  { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",  era: "LONGING",    subtitle: "Coastal & Seashore"   },
  Palai:    { url: "https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?q=80&w=800&auto=format&fit=crop",  era: "SEPARATION", subtitle: "Desert & Wasteland"   },
};
const THEME_DISPLAY: Record<FocusTheme, { label: string; icon: string }> = {
  Kurinji:  { label: 'Mountain',  icon: '🏔️' },
  Mullai:   { label: 'Forest',    icon: '🌲' },
  Marutham: { label: 'Riverside', icon: '🌾' },
  Neythal:  { label: 'Coastal',   icon: '🌊' },
  Palai:    { label: 'Desert',    icon: '🏜️' },
};
const THEMES_ORDER: FocusTheme[] = ['Kurinji', 'Mullai', 'Marutham', 'Neythal', 'Palai'];

// ─── Mode data ─────────────────────────────────────────────────────────────────
const MODE_DISPLAY: Record<StudyModeType, { label: string; Icon: React.FC<{ className?: string }> }> = {
  Pomodoro: { label: 'POMODORO', Icon: ({ className }) => <Timer className={className} /> },
  Focus:    { label: 'GOAL',     Icon: ({ className }) => <Target className={className} /> },
  Infinite: { label: 'INFINITE', Icon: ({ className }) => <InfinityIcon className={className} /> },
};
const MODES_ORDER: StudyModeType[] = ['Pomodoro', 'Focus', 'Infinite'];

// ─── Ruler constants ───────────────────────────────────────────────────────────
const PX_PER_MIN  = 4;
const MAX_MINUTES = 120;
const EXTRA_TICKS = 80;
const TOTAL_TICKS = EXTRA_TICKS + MAX_MINUTES + 1 + EXTRA_TICKS;

// ══════════════════════════════════════════════════════════════════════════════
// Theme Selector full-screen overlay
// ══════════════════════════════════════════════════════════════════════════════
function ThemeSelector({
  selectedTheme,
  onSelect,
  onClose,
}: {
  selectedTheme: FocusTheme;
  onSelect: (t: FocusTheme) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto"
      style={{ background: '#0b1e1d' }}
    >
      {/* Header bar */}
      <div className="flex items-center px-4 pt-10 pb-3 shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <span className="flex-1 text-center text-white font-bold text-[15px] tracking-wide pr-9">
          Select Theme
        </span>
      </div>

      {/* Landscape cards */}
      <div className="flex flex-col gap-3 px-4 pb-6">
        {THEMES_ORDER.map(theme => {
          const info      = LANDSCAPE[theme];
          const isSelected = selectedTheme === theme;
          return (
            <button
              key={theme}
              onClick={() => onSelect(theme)}
              className="relative overflow-hidden rounded-2xl active:scale-[0.97] transition-transform text-left w-full"
              style={{ height: 96 }}
            >
              {/* Background image */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:    `url('${info.url}')`,
                  backgroundSize:     'cover',
                  backgroundPosition: 'center',
                }}
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 100%)' }}
              />
              {/* Content */}
              <div className="absolute inset-0 flex items-center px-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-black text-[17px] tracking-[0.08em]">
                      {theme.toUpperCase()}
                    </span>
                    <span
                      className="text-[9.5px] font-bold px-1.5 py-[2px] rounded"
                      style={{
                        background: 'rgba(13,85,84,0.55)',
                        border:     '1px solid rgba(14,195,140,0.35)',
                        color:      '#95efde',
                      }}
                    >
                      {info.era}
                    </span>
                  </div>
                  <span className="text-white/65 text-[12px] font-medium mt-0.5 block">
                    {info.subtitle}
                  </span>
                </div>
                {isSelected && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-3"
                    style={{ background: '#22c55e' }}
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Mode Selector overlay (bottom-center sheet)
// ══════════════════════════════════════════════════════════════════════════════
function ModeSelector({
  studyMode,
  onSelect,
  onClose,
}: {
  studyMode: StudyModeType;
  onSelect: (m: StudyModeType) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      style={{ backdropFilter: 'blur(22px)', background: 'rgba(10,24,24,0.78)' }}
    >
      {/* Back button + title */}
      <div className="flex items-center px-5 pt-12 pb-5">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2 pr-9">
          <Clock className="w-4 h-4 text-white/70" strokeWidth={2} />
          <span className="text-white font-semibold text-[15px]">Select Mode</span>
        </div>
      </div>

      {/* Three mode cards */}
      <div className="flex gap-3 px-5">
        {MODES_ORDER.map(mode => {
          const { label, Icon } = MODE_DISPLAY[mode];
          const isSelected      = studyMode === mode;
          return (
            <button
              key={mode}
              onClick={() => onSelect(mode)}
              className="flex-1 flex flex-col items-center justify-center gap-2.5 py-5 rounded-2xl active:scale-95 transition-transform"
              style={{
                background: isSelected ? '#ffffff' : 'rgba(255,255,255,0.08)',
                border:     isSelected ? 'none' : '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <Icon
                className="w-7 h-7"
                // @ts-ignore
                style={{ color: isSelected ? '#0d5554' : 'rgba(255,255,255,0.75)', strokeWidth: 1.8 }}
              />
              <span
                className="font-black text-[11px] tracking-[0.10em]"
                style={{ color: isSelected ? '#0d5554' : 'rgba(255,255,255,0.70)' }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main FocusHeaderCard
// ══════════════════════════════════════════════════════════════════════════════
interface FocusHeaderCardProps {
  sessionMinutes: number;
  onSessionMinutesChange: (m: number) => void;
  selectedTheme: FocusTheme;
  setSelectedTheme: (t: FocusTheme) => void;
  studyMode: StudyModeType;
  setStudyMode: (m: StudyModeType) => void;
  onStartSession: () => void;
  timerIsActive: boolean;
}

export default function FocusHeaderCard({
  sessionMinutes,
  onSessionMinutesChange,
  selectedTheme,
  setSelectedTheme,
  studyMode,
  setStudyMode,
  onStartSession,
  timerIsActive,
}: FocusHeaderCardProps) {
  const [showThemes, setShowThemes] = useState(false);
  const [showModes,  setShowModes]  = useState(false);

  const rulerRef    = useRef<HTMLDivElement>(null);
  const [wrapW, setWrapW] = useState(320);

  const dragging   = useRef(false);
  const dragX      = useRef(0);
  const dragMins   = useRef(0);

  useEffect(() => {
    const el = rulerRef.current;
    if (!el) return;
    const sync = () => setWrapW(el.offsetWidth);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    dragX.current    = e.clientX;
    dragMins.current = sessionMinutes;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [sessionMinutes]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const delta   = dragX.current - e.clientX;
    const newMins = Math.max(0, Math.min(MAX_MINUTES,
      dragMins.current + Math.round(delta / PX_PER_MIN)
    ));
    onSessionMinutesChange(newMins);
  }, [onSessionMinutesChange]);

  const onPointerUp = useCallback(() => { dragging.current = false; }, []);

  // Ruler translateX: puts the tick for `sessionMinutes` at the centre of the wrapper
  const rulerX     = wrapW / 2 - (EXTRA_TICKS + sessionMinutes) * PX_PER_MIN;
  const bgUrl      = LANDSCAPE[selectedTheme].url;
  const themeMeta  = THEME_DISPLAY[selectedTheme];
  const modeLabel  = MODE_DISPLAY[studyMode].label;

  return (
    <>
      {/* ── Card ───────────────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden rounded-[18px] mt-3.5 select-none"
        style={{
          backgroundImage:    `url('${bgUrl}')`,
          backgroundSize:     'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.44) 0%, rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.64) 100%)',
          }}
        />

        <div className="relative z-10 px-4 pt-3.5 pb-3.5 flex flex-col gap-[5px]">

          {/* 1 · Mode label */}
          <p
            className="text-center tracking-[0.22em] uppercase font-extrabold leading-none"
            style={{
              fontSize:   13,
              color:      '#fef08a',
              textShadow: '0 1px 6px rgba(0,0,0,0.55)',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
            }}
          >
            {studyMode === 'Focus' ? 'Focus' : studyMode === 'Pomodoro' ? 'Pomodoro' : 'Infinite'}
          </p>

          {/* 2 · Time display — large number, tiny "min" */}
          <div
            className="flex items-baseline justify-center leading-none"
            style={{ gap: 5 }}
          >
            <span
              style={{
                fontFamily:  '"Plus Jakarta Sans", sans-serif',
                fontWeight:  800,
                fontSize:    72,
                color:       '#ffffff',
                textShadow:  '0 2px 16px rgba(0,0,0,0.45)',
                lineHeight:  1,
              }}
            >
              {sessionMinutes}
            </span>
            {/* "min" intentionally tiny */}
            <span
              style={{
                fontFamily:  '"Plus Jakarta Sans", sans-serif',
                fontWeight:  600,
                fontSize:    14,
                color:       'rgba(255,255,255,0.82)',
                textShadow:  '0 1px 6px rgba(0,0,0,0.35)',
                lineHeight:  1,
                paddingBottom: 10,   /* aligns near the bottom of the number */
              }}
            >
              min
            </span>
          </div>

          {/* 3 · Tick-mark ruler ─────────────────────────────────────────── */}
          <div
            ref={rulerRef}
            className="relative w-full cursor-ew-resize touch-none"
            style={{ height: 38, marginTop: 4, marginBottom: 2 }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* Fixed centre marker */}
            <div
              className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none rounded-full"
              style={{ width: 2, background: 'rgba(255,255,255,0.97)' }}
            />

            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute top-0 h-full"
                style={{
                  width:       TOTAL_TICKS * PX_PER_MIN,
                  transform:   `translateX(${rulerX}px)`,
                  willChange:  'transform',
                }}
              >
                {Array.from({ length: TOTAL_TICKS }, (_, idx) => {
                  const minVal  = idx - EXTRA_TICKS;
                  const inRange = minVal >= 0 && minVal <= MAX_MINUTES;
                  const isMajor = inRange && minVal % 15 === 0;
                  const isMed   = inRange && minVal % 5  === 0;
                  const h       = isMajor ? 30 : isMed ? 20 : inRange ? 11 : 6;
                  const op      = isMajor ? 0.95 : isMed ? 0.62 : inRange ? 0.36 : 0.11;
                  const w       = isMajor ? 2 : 1;
                  return (
                    <div
                      key={idx}
                      style={{
                        position:        'absolute',
                        left:            idx * PX_PER_MIN,
                        top:             '50%',
                        transform:       'translateY(-50%)',
                        width:           w,
                        height:          h,
                        backgroundColor: `rgba(255,255,255,${op})`,
                        borderRadius:    1,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Edge fade masks */}
            <div
              className="absolute inset-y-0 left-0 w-14 pointer-events-none z-10"
              style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent)' }}
            />
            <div
              className="absolute inset-y-0 right-0 w-14 pointer-events-none z-10"
              style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.3), transparent)' }}
            />
          </div>

          {/* 4 · Theme + Mode buttons ───────────────────────────────────── */}
          <div className="flex gap-2">
            {/* Forest / Theme */}
            <button
              onClick={() => setShowThemes(true)}
              className="flex-1 flex items-center justify-between px-3 py-[9px] rounded-[12px] active:scale-95 transition-transform"
              style={{
                background:     'rgba(0,0,0,0.42)',
                border:         '1px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span className="flex items-center gap-[6px] text-white font-semibold text-[13px]">
                <span className="text-[14px]">{themeMeta.icon}</span>
                <span>{themeMeta.label}</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/65 shrink-0" />
            </button>

            {/* Study Mode */}
            <button
              onClick={() => setShowModes(true)}
              className="flex-1 flex items-center justify-between px-3 py-[9px] rounded-[12px] active:scale-95 transition-transform"
              style={{
                background:     'rgba(0,0,0,0.42)',
                border:         '1px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span className="flex items-center gap-[6px] text-white font-semibold text-[13px]">
                <span className="text-[14px]">⏱</span>
                <span>Study Mode</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/65 shrink-0" />
            </button>
          </div>

          {/* 5 · Start Session ──────────────────────────────────────────── */}
          <button
            onClick={onStartSession}
            className="w-full py-[13px] rounded-[13px] font-bold text-[15px] text-white active:scale-[0.975] transition-all"
            style={{
              background:    timerIsActive ? '#ef4444' : '#22c55e',
              boxShadow:     timerIsActive
                ? '0 4px 18px rgba(239,68,68,0.40)'
                : '0 4px 18px rgba(34,197,94,0.40)',
              letterSpacing: '0.025em',
              fontFamily:    '"Plus Jakarta Sans", sans-serif',
            }}
          >
            {timerIsActive ? 'Stop Session' : 'Start Session'}
          </button>

        </div>
      </div>

      {/* ── Portals ─────────────────────────────────────────────────────── */}
      {showThemes && createPortal(
        <ThemeSelector
          selectedTheme={selectedTheme}
          onSelect={t => { setSelectedTheme(t); setShowThemes(false); }}
          onClose={() => setShowThemes(false)}
        />,
        document.body
      )}
      {showModes && createPortal(
        <ModeSelector
          studyMode={studyMode}
          onSelect={m => { setStudyMode(m); setShowModes(false); }}
          onClose={() => setShowModes(false)}
        />,
        document.body
      )}
    </>
  );
}
