import React, { useState, useEffect, useRef } from 'react';
import { Eye } from 'lucide-react';
import SignIn from './components/SignIn';
import { getState, saveTasks, saveProfile, updateTargetHours, logStudySession, resetAppState } from './api';
import { AnimatePresence, motion } from 'motion/react';
import {
  INITIAL_PROFILE,
  INITIAL_WEEKLY_LOGS,
  INITIAL_TASKS,
  SYLLABUS_DATA,
  NEET_PG_SYLLABUS_DATA,
  SyllabusSubject,
  PRINTABLE_MATERIALS
} from './mockData';
import { UserProfile, WeeklyLog, TaskItem, FocusTheme, StudyModeType, FocusRecordItem } from './types';
import FrameComponent from './components/FrameComponent';
import UtilityBar from './components/UtilityBar';
import GroupComponent from './components/GroupComponent';
import GroupComponent1 from './components/GroupComponent1';
import GroupComponent2 from './components/GroupComponent2';
import GroupComponent3 from './components/GroupComponent3';
import ChooseExamSheet from './components/ChooseExamSheet';
import PyqDrawer from './components/PyqDrawer';
import SyllabusSettingsSheet from './components/SyllabusSettingsSheet';

// Lucide Icons for Secondary Screens
import { 
  Award, Sparkles, AlertCircle, RefreshCw, Smartphone, 
  Battery, Wifi, Radio, Lock, Compass, CheckCircle2, 
  BookOpen, Layers, Printer, Coffee, Check, Apple, Sparkle, ShieldCheck, HeartPulse,
  Calendar, Search, ChevronDown, ChevronUp, Plus, SlidersHorizontal, Trash2, X,
  Leaf, Globe, Building, Scale, DollarSign, Lightbulb, History, Building2, Landmark, Brain, Clock
} from 'lucide-react';

function buildProfileFromAuthUser(u: { fullName: string; email: string; phone?: string | null }): UserProfile {
  return {
    name: u.fullName,
    avatarLetter: u.fullName?.charAt(0).toUpperCase() || 'U',
    group: 'TNPSC Group 1 - 2026',
    isVerified: true,
    email: u.email,
    phone: u.phone || '',
  };
}

export default function App() {
  // --- CORE STATE ENGINE ---
  const storedAuthUser = (() => { try { const s = localStorage.getItem('authUser'); return s ? JSON.parse(s) : null; } catch { return null; } })();
  const [profile, setProfile] = useState<UserProfile>(storedAuthUser ? buildProfileFromAuthUser(storedAuthUser) : INITIAL_PROFILE);
  const [isChooseExamOpen, setIsChooseExamOpen] = useState(false);
  const [selectedPyqTopic, setSelectedPyqTopic] = useState<string | null>(null);
  const [weeklyLogs, setWeeklyLogs] = useState<WeeklyLog[]>(INITIAL_WEEKLY_LOGS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState<"Home" | "Syllabus" | "Print" | "Food" | "Auth">("Auth");
  const [activeGraphTab, setActiveGraphTab] = useState<"week" | "month" | "year">("week");

  // Syllabus Settings & Revision Mode states (persisted safely on client side)
  const [isSyllabusSettingsOpen, setIsSyllabusSettingsOpen] = useState(false);
  const [showRevisionGraph, setShowRevisionGraph] = useState(true);
  const [isRevisionMode, setIsRevisionMode] = useState<boolean>(false);
  const [revisedTopics, setRevisedTopics] = useState<Record<string, boolean>>({});
  const [syllabusToast, setSyllabusToast] = useState<string | null>(null);

  const selectSubTopic = (id: string, name: string) => {
    setSelectedSubTopicId(prev => prev === id ? null : id);
    setSelectedSubTopicName(prev => prev === name ? '' : name);
  };

  const getTopicRowClass = (id: string) =>
    `flex items-center justify-between p-1 rounded cursor-pointer transition select-none ${
      selectedSubTopicId === id ? 'bg-emerald-50/70 ring-1 ring-emerald-300/50' : 'hover:bg-slate-50'
    }`;

  const handleTopicMarkComplete = (id: string, currentChecked: boolean, setter?: (v: boolean) => void) => {
    setCompletingTopicId(id);
    setTimeout(() => {
      if (setter) {
        toggleTopic(id, currentChecked, setter);
      } else {
        if (isRevisionMode) {
          setRevisedTopics(prev => ({ ...prev, [id]: !prev[id] }));
        } else {
          setNeetPGChecked(prev => ({ ...prev, [id]: !prev[id] }));
        }
      }
      setCompletingTopicId(null);
      setSelectedSubTopicId(null);
      setSelectedSubTopicName('');
    }, 600);
  };

  const handleSyllabusAddTask = (time: string) => {
    handleAddTask(`Study ${selectedSubTopicName}`, time);
    setSelectedSubTopicId(null);
    setSelectedSubTopicName('');
    setActiveTab("Home");
    setTimeout(() => {
      const el = document.getElementById('today-plan-scheduler-container');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 250);
  };

  const triggerSyllabusToast = (msg: string) => {
    setSyllabusToast(msg);
    setTimeout(() => {
      setSyllabusToast(prev => prev === msg ? null : prev);
    }, 2800);
  };

  // Sync to localstorage
  useEffect(() => {
    localStorage.setItem("isRevisionMode", JSON.stringify(isRevisionMode));
  }, [isRevisionMode]);

  useEffect(() => {
    localStorage.setItem("revisedTopics", JSON.stringify(revisedTopics));
  }, [revisedTopics]);

  // Goals & Focused Session logs
  const [completedMinutes, setCompletedMinutes] = useState(60); // Starts at 1 hr done
  const [targetHours, setTargetHours] = useState(4); // 4-hour target standard
  const [selectedTheme, setSelectedTheme] = useState<FocusTheme>("Mullai");
  const [studyMode, setStudyMode] = useState<StudyModeType>("Focus");
  const [timerIsActive, setTimerIsActive] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [showMyFocus, setShowMyFocus] = useState(false);
  const [focusLogCount, setFocusLogCount] = useState(6); // Default 6 times
  const [showAllFocusRecords, setShowAllFocusRecords] = useState(false);
  const [focusRecords, setFocusRecords] = useState<FocusRecordItem[]>([
    { id: "fr-1", title: "Study", date: "16/05/2026", time: "10 : 20 AM", duration: "30 min", period: "today" },
    { id: "fr-2", title: "Break", date: "16/05/2026", time: "09 : 40 AM", duration: "5 min", period: "today" },
    { id: "fr-3", title: "Study", date: "16/05/2026", time: "09 : 20 AM", duration: "15 min", period: "today" },
    { id: "fr-4", title: "Study", date: "16/05/2026", time: "09 : 00 AM", duration: "20 min", period: "today" },
    { id: "fr-5", title: "Study", date: "16/05/2026", time: "10 : 20 AM", duration: "30 min", period: "week" },
    { id: "fr-6", title: "Break", date: "16/05/2026", time: "09 : 40 AM", duration: "5 min", period: "week" },
    { id: "fr-7", title: "Study", date: "16/05/2026", time: "09 : 20 AM", duration: "15 min", period: "week" },
    { id: "fr-8", title: "Study", date: "16/05/2026", time: "09 : 00 AM", duration: "20 min", period: "week" },
  ]);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<FocusRecordItem | null>(null);

  // Secondary Module 1: Syllabus Checklist Progress Tracker
  const [syllabusList, setSyllabusList] = useState<SyllabusSubject[]>(SYLLABUS_DATA);
  // NEET PG accordion expand/collapse and topic checked state
  const [neetPGExpanded, setNeetPGExpanded] = useState<Record<string, boolean>>({});
  const [neetPGChecked, setNeetPGChecked] = useState<Record<string, boolean>>({});
  const [groupIcon7checked, setGroupIcon7checked] = useState(false);
  const [groupIcon9checked, setGroupIcon9checked] = useState(false);
  const [groupIcon12checked, setGroupIcon12checked] = useState(true); // Default checked as shown in mockup
  const [groupIcon14checked, setGroupIcon14checked] = useState(false);
  const [groupIconJudicialChecked, setGroupIconJudicialChecked] = useState(false);
  const [syllabusSearchQuery, setSyllabusSearchQuery] = useState("");
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<string | null>(null);
  const [selectedSubTopicName, setSelectedSubTopicName] = useState<string>('');
  const [completingTopicId, setCompletingTopicId] = useState<string | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"All" | "Completed" | "Pending">("All");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<"Prelims" | "Mains">("Prelims");
  
  // Accordion Expand/Collapse States
  const [isScienceExpanded, setIsScienceExpanded] = useState(true);
  const [isGeographyExpanded, setIsGeographyExpanded] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isPolityExpanded, setIsPolityExpanded] = useState(false);
  const [isEconomyExpanded, setIsEconomyExpanded] = useState(false);
  const [isAptitudeExpanded, setIsAptitudeExpanded] = useState(false);
  const [isTamilNaduExpanded, setIsTamilNaduExpanded] = useState(false);

  // Checklist topic states for new subjects
  const [geoTopic1Checked, setGeoTopic1Checked] = useState(true);
  const [geoTopic2Checked, setGeoTopic2Checked] = useState(false);
  const [geoTopic3Checked, setGeoTopic3Checked] = useState(false);

  const [hisTopic1Checked, setHisTopic1Checked] = useState(true);
  const [hisTopic2Checked, setHisTopic2Checked] = useState(false);
  const [hisTopic3Checked, setHisTopic3Checked] = useState(false);

  const [polTopic1Checked, setPolTopic1Checked] = useState(true);
  const [polTopic2Checked, setPolTopic2Checked] = useState(true);
  const [polTopic3Checked, setPolTopic3Checked] = useState(false);

  const [ecoTopic1Checked, setEcoTopic1Checked] = useState(true);
  const [ecoTopic2Checked, setEcoTopic2Checked] = useState(false);
  const [ecoTopic3Checked, setEcoTopic3Checked] = useState(false);

  const [aptTopic1Checked, setAptTopic1Checked] = useState(true);
  const [aptTopic2Checked, setAptTopic2Checked] = useState(true);
  const [aptTopic3Checked, setAptTopic3Checked] = useState(false);

  const [tamTopic1Checked, setTamTopic1Checked] = useState(true);
  const [tamTopic2Checked, setTamTopic2Checked] = useState(false);
  const [tamTopic3Checked, setTamTopic3Checked] = useState(false);

  // Secondary Module 2: Print Notes Builder State
  const [selectedPrintIds, setSelectedPrintIds] = useState<string[]>(["p1", "p3"]);
  const [customNotesText, setCustomNotesText] = useState("");
  const [isNotesCompiled, setIsNotesCompiled] = useState(false);

  // Secondary Module 3: Nutrition Water Glass logger
  const [waterGlasses, setWaterGlasses] = useState(3); // 3 glasses logged today (750ml)
  const [foodCalories, setFoodCalories] = useState(450); // 450 kcal snack logged
  const [snacksList, setSnacksList] = useState<string[]>([
    "Walnuts & Almonds (Aptitude stamina)",
    "Fibre berries (Memory boost)"
  ]);
  const [tempSnack, setTempSnack] = useState("");

  // UI overlays & notification triggers
  const [celebrationOverlay, setCelebrationOverlay] = useState<{
    show: boolean;
    minutes: number;
    theme: string;
  } | null>(null);

  // Dynamic Syllabus Statistics
  const compScience = (groupIcon7checked ? 1 : 0) + (groupIcon9checked ? 1 : 0) + (groupIcon12checked ? 1 : 0) + (groupIcon14checked ? 1 : 0) + (groupIconJudicialChecked ? 1 : 0);
  const totalScience = 5;
  const pctScience = Math.round((compScience / totalScience) * 100);

  const compGeo = (geoTopic1Checked ? 1 : 0) + (geoTopic2Checked ? 1 : 0) + (geoTopic3Checked ? 1 : 0);
  const totalGeo = 3;
  const pctGeo = Math.round((compGeo / totalGeo) * 100);

  const compHis = (hisTopic1Checked ? 1 : 0) + (hisTopic2Checked ? 1 : 0) + (hisTopic3Checked ? 1 : 0);
  const totalHis = 3;
  const pctHis = Math.round((compHis / totalHis) * 100);

  const compPol = (polTopic1Checked ? 1 : 0) + (polTopic2Checked ? 1 : 0) + (polTopic3Checked ? 1 : 0);
  const totalPol = 3;
  const pctPol = Math.round((compPol / totalPol) * 100);

  const compEco = (ecoTopic1Checked ? 1 : 0) + (ecoTopic2Checked ? 1 : 0) + (ecoTopic3Checked ? 1 : 0);
  const totalEco = 3;
  const pctEco = Math.round((compEco / totalEco) * 100);

  const compTam = (tamTopic1Checked ? 1 : 0) + (tamTopic2Checked ? 1 : 0) + (tamTopic3Checked ? 1 : 0);
  const totalTam = 3;
  const pctTam = Math.round((compTam / totalTam) * 100);

  const compApt = (aptTopic1Checked ? 1 : 0) + (aptTopic2Checked ? 1 : 0) + (aptTopic3Checked ? 1 : 0);
  const totalApt = 3;
  const pctApt = Math.round((compApt / totalApt) * 100);

  const totalCompTopics = compScience + compGeo + compHis + compPol + compEco + compTam + compApt;
  const totalSyllabusTopics = totalScience + totalGeo + totalHis + totalPol + totalEco + totalTam + totalApt;
  const pctOverall = Math.round((totalCompTopics / totalSyllabusTopics) * 100);

  // Revision count calculations
  const revScience = (revisedTopics['groupIcon7']?1:0) + (revisedTopics['groupIcon9']?1:0) + (revisedTopics['groupIcon12']?1:0) + (revisedTopics['groupIcon14']?1:0) + (revisedTopics['groupIconJudicial']?1:0);
  const revGeo = (revisedTopics['geoTopic1']?1:0) + (revisedTopics['geoTopic2']?1:0) + (revisedTopics['geoTopic3']?1:0);
  const revHis = (revisedTopics['hisTopic1']?1:0) + (revisedTopics['hisTopic2']?1:0) + (revisedTopics['hisTopic3']?1:0);
  const revPol = (revisedTopics['polTopic1']?1:0) + (revisedTopics['polTopic2']?1:0) + (revisedTopics['polTopic3']?1:0);
  const revEco = (revisedTopics['ecoTopic1']?1:0) + (revisedTopics['ecoTopic2']?1:0) + (revisedTopics['ecoTopic3']?1:0);
  const revTam = (revisedTopics['tamTopic1']?1:0) + (revisedTopics['tamTopic2']?1:0) + (revisedTopics['tamTopic3']?1:0);
  const revApt = (revisedTopics['aptTopic1']?1:0) + (revisedTopics['aptTopic2']?1:0) + (revisedTopics['aptTopic3']?1:0);

  const totalRevisedTopics = revScience + revGeo + revHis + revPol + revEco + revTam + revApt;
  const pctRevisedOverall = Math.round((totalRevisedTopics / totalSyllabusTopics) * 100);

  // NEET PG computed statistics
  const isNeetPG = profile.group.startsWith("NEET PG");
  const neetPGTotalTopics = NEET_PG_SYLLABUS_DATA.reduce((acc, s) => acc + s.units.length, 0);
  const neetPGTotalComp = isRevisionMode
    ? NEET_PG_SYLLABUS_DATA.reduce((acc, s) => acc + s.units.filter(u => !!revisedTopics[u.id]).length, 0)
    : NEET_PG_SYLLABUS_DATA.reduce((acc, s) => acc + s.units.filter(u => !!neetPGChecked[u.id]).length, 0);
  const pctNeetPGOverall = neetPGTotalTopics > 0 ? Math.round((neetPGTotalComp / neetPGTotalTopics) * 100) : 0;

  // Checkbox helpers for Revision Mode
  const isTopicActive = (id: string, currentChecked: boolean) => {
    if (isRevisionMode) {
      return !!revisedTopics[id];
    }
    return currentChecked;
  };

  const toggleTopic = (id: string, currentChecked: boolean, setter: (val: boolean) => void) => {
    if (isRevisionMode) {
      setRevisedTopics(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    } else {
      setter(!currentChecked);
    }
  };

  const getSubjectByTopicId = (id: string): string => {
    if (id.startsWith('geo')) return 'Geography';
    if (id.startsWith('his')) return 'History';
    if (id.startsWith('pol')) return 'Polity';
    if (id.startsWith('eco')) return 'Economy';
    if (id.startsWith('tam')) return 'TamilNadu';
    if (id.startsWith('apt')) return 'Aptitude';
    return 'Science'; // groupIcon7, etc.
  };

  const SUBJECT_COLORS: Record<string, { text: string; bg: string; hoverBg: string; activeBg: string; ring: string }> = {
    Science: { text: 'text-[#108c5c]', bg: 'bg-[#108c5c]', hoverBg: 'hover:bg-emerald-100/50', activeBg: 'bg-[#108c5c] border-[#108c5c]', ring: 'ring-[#108c5c]/50' },
    Geography: { text: 'text-[#094a80]', bg: 'bg-[#094a80]', hoverBg: 'hover:bg-sky-100/50', activeBg: 'bg-[#094a80] border-[#094a80]', ring: 'ring-[#094a80]/50' },
    History: { text: 'text-[#ae6a1c]', bg: 'bg-[#ae6a1c]', hoverBg: 'hover:bg-orange-100/50', activeBg: 'bg-[#ae6a1c] border-[#ae6a1c]', ring: 'ring-[#ae6a1c]/50' },
    Polity: { text: 'text-[#077c51]', bg: 'bg-[#077c51]', hoverBg: 'hover:bg-emerald-100/50', activeBg: 'bg-[#077c51] border-[#077c51]', ring: 'ring-[#077c51]/50' },
    Economy: { text: 'text-[#5924ab]', bg: 'bg-[#5924ab]', hoverBg: 'hover:bg-[#f2eefb]', activeBg: 'bg-[#5924ab] border-[#5924ab]', ring: 'ring-[#5924ab]/50' },
    TamilNadu: { text: 'text-[#b8355a]', bg: 'bg-[#b8355a]', hoverBg: 'hover:bg-[#fbf0f3]', activeBg: 'bg-[#b8355a] border-[#b8355a]', ring: 'ring-[#b8355a]/50' },
    Aptitude: { text: 'text-[#cd6a05]', bg: 'bg-[#cd6a05]', hoverBg: 'hover:bg-[#faf0e6]', activeBg: 'bg-[#cd6a05] border-[#cd6a05]', ring: 'ring-[#cd6a05]/50' },
  };

  const getTopicBoxClass = (id: string, currentChecked: boolean) => {
    const isActive = isTopicActive(id, currentChecked);
    if (isActive) {
      const subject = getSubjectByTopicId(id);
      const colors = SUBJECT_COLORS[subject];
      if (isRevisionMode) {
        return `${colors.activeBg} text-white shadow-sm ring-1 ${colors.ring}`;
      }
      return `${colors.activeBg} text-white`;
    }
    return 'bg-white border-slate-300';
  };

  const getTopicTextClass = (id: string, currentChecked: boolean) => {
    const isActive = isTopicActive(id, currentChecked);
    if (isActive) {
      if (isRevisionMode) {
        const subject = getSubjectByTopicId(id);
        const colors = SUBJECT_COLORS[subject];
        return `${colors.text} font-extrabold italic bg-slate-50 px-1.5 py-0.5 rounded`;
      }
      return 'text-slate-450 line-through';
    }
    return 'text-slate-700 font-bold';
  };

  const getSubjectCountStr = (subjectName: string, comp: number, total: number, rev: number) => {
    if (isRevisionMode) {
      return `${rev} of ${total} topics revised`;
    }
    return `${comp} of ${total} topics completed`;
  };

  const getSubjectPct = (comp: number, total: number, rev: number) => {
    if (isRevisionMode) {
      return Math.round((rev / total) * 100) || 0;
    }
    return Math.round((comp / total) * 100) || 0;
  };

  const getHeaderCountStr = (ids: string[], currentValArray: boolean[]) => {
    if (isRevisionMode) {
      const activeCount = ids.reduce((acc, id) => {
        return acc + (revisedTopics[id] ? 1 : 0);
      }, 0);
      return `${activeCount}/${ids.length}`;
    } else {
      const activeCount = currentValArray.reduce((acc, val) => {
        return acc + (val ? 1 : 0);
      }, 0);
      return `${activeCount}/${ids.length}`;
    }
  };
  const topicToggleActions: Record<string, { checked: boolean; setter: (v: boolean) => void }> = {
    groupIcon7: { checked: groupIcon7checked, setter: setGroupIcon7checked },
    groupIcon9: { checked: groupIcon9checked, setter: setGroupIcon9checked },
    groupIcon12: { checked: groupIcon12checked, setter: setGroupIcon12checked },
    groupIcon14: { checked: groupIcon14checked, setter: setGroupIcon14checked },
    groupIconJudicial: { checked: groupIconJudicialChecked, setter: setGroupIconJudicialChecked },
    geoTopic1: { checked: geoTopic1Checked, setter: setGeoTopic1Checked },
    geoTopic2: { checked: geoTopic2Checked, setter: setGeoTopic2Checked },
    geoTopic3: { checked: geoTopic3Checked, setter: setGeoTopic3Checked },
    hisTopic1: { checked: hisTopic1Checked, setter: setHisTopic1Checked },
    hisTopic2: { checked: hisTopic2Checked, setter: setHisTopic2Checked },
    hisTopic3: { checked: hisTopic3Checked, setter: setHisTopic3Checked },
    polTopic1: { checked: polTopic1Checked, setter: setPolTopic1Checked },
    polTopic2: { checked: polTopic2Checked, setter: setPolTopic2Checked },
    polTopic3: { checked: polTopic3Checked, setter: setPolTopic3Checked },
    ecoTopic1: { checked: ecoTopic1Checked, setter: setEcoTopic1Checked },
    ecoTopic2: { checked: ecoTopic2Checked, setter: setEcoTopic2Checked },
    ecoTopic3: { checked: ecoTopic3Checked, setter: setEcoTopic3Checked },
    tamTopic1: { checked: tamTopic1Checked, setter: setTamTopic1Checked },
    tamTopic2: { checked: tamTopic2Checked, setter: setTamTopic2Checked },
    tamTopic3: { checked: tamTopic3Checked, setter: setTamTopic3Checked },
    aptTopic1: { checked: aptTopic1Checked, setter: setAptTopic1Checked },
    aptTopic2: { checked: aptTopic2Checked, setter: setAptTopic2Checked },
    aptTopic3: { checked: aptTopic3Checked, setter: setAptTopic3Checked },
  };

  const taskFormInputRef = useRef<HTMLInputElement | null>(null);


  // --- LOCAL STATE SYNCHRONIZATION ---

  useEffect(() => {
    getState().then(data => {
      if (data.profile) setProfile(data.profile);
      if (data.weeklyLogs) setWeeklyLogs(data.weeklyLogs);
      if (data.tasks) setTasks(data.tasks);
      if (typeof data.completedMinutes === 'number') setCompletedMinutes(data.completedMinutes);
      if (typeof data.targetHours === 'number') setTargetHours(data.targetHours);
    }).catch(() => {});
  }, []);

  const syncTasksToBackend = (updatedTasks: TaskItem[]) => {
    saveTasks(updatedTasks).catch(() => {});
  };

  // 1. Task Management
  const handleToggleTask = (id: string) => {
    setTasks(prev => {
      const next = prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      syncTasksToBackend(next);
      return next;
    });
  };

  const handleAddTask = (title: string, time: string) => {
    const isConflict = tasks.some(t => t.time.trim() === time.trim());
    const newId = `task-${Date.now()}`;
    const newTask: TaskItem = {
      id: newId,
      title,
      time: isConflict ? `${time} (Adj)` : time,
      completed: false
    };
    setTasks(prev => {
      const next = [...prev, newTask];
      syncTasksToBackend(next);
      return next;
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => {
      const next = prev.filter(t => t.id !== id);
      syncTasksToBackend(next);
      return next;
    });
  };

  // Profile Update Dispatcher
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile).catch(() => {});
  };

  // Target hours drag action updater
  const handleUpdateTargetHours = async (hours: number) => {
    setTargetHours(hours);
    const logs = await updateTargetHours(hours).catch(() => null);
    if (logs) setWeeklyLogs(logs);
  };

  // 2. Focused study completed callback
  const handleSessionComplete = async (minutes: number, _theme: string) => {
    setFocusLogCount(prev => prev + 1);
    const result = await logStudySession(minutes).catch(() => null);
    if (result) {
      setCompletedMinutes(result.completedMinutes);
      setWeeklyLogs(result.weeklyLogs);
    }
  };

  // 3. Quick Access Dispatcher
  const handleQuickActionDispatch = (action: "Home" | "Syllabus" | "Print" | "Food" | "Auth" | "AddTask") => {
    if (action === "AddTask") {
      // Pivot to focus input element
      setActiveTab("Home");
      setTimeout(() => {
        const inputField = document.querySelector('input[placeholder*="Add new Study Task"]');
        if (inputField) {
          (inputField as HTMLInputElement).focus();
          inputField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else {
      setActiveTab(action);
    }
  };

  // 4. Reset helper state
  const handleResetEnvironment = async () => {
    if (confirm("Would you like to reset all focusing logs, diet counters, and plan tasks?")) {
      const data = await resetAppState().catch(() => null);
      if (data) {
        setCompletedMinutes(data.completedMinutes);
        setTasks(data.tasks);
        setWeeklyLogs(data.weeklyLogs);
        setTargetHours(data.targetHours);
        setProfile(data.profile);
      }
      setWaterGlasses(3);
      setFoodCalories(400);
      setSnacksList(["Walnuts & Almonds (Aptitude stamina)"]);
      setIsNotesCompiled(false);
      setSelectedPrintIds(["p1", "p3"]);
    }
  };

  const handleSyllabusSettingsConfirm = (revisionMode: boolean, resetSyllabus: boolean) => {
    setIsRevisionMode(revisionMode);
    if (resetSyllabus) {
      setGroupIcon7checked(false);
      setGroupIcon9checked(false);
      setGroupIcon12checked(false);
      setGroupIcon14checked(false);
      setGroupIconJudicialChecked(false);

      setGeoTopic1Checked(false);
      setGeoTopic2Checked(false);
      setGeoTopic3Checked(false);

      setHisTopic1Checked(false);
      setHisTopic2Checked(false);
      setHisTopic3Checked(false);

      setPolTopic1Checked(false);
      setPolTopic2Checked(false);
      setPolTopic3Checked(false);

      setEcoTopic1Checked(false);
      setEcoTopic2Checked(false);
      setEcoTopic3Checked(false);

      setAptTopic1Checked(false);
      setAptTopic2Checked(false);
      setAptTopic3Checked(false);

      setTamTopic1Checked(false);
      setTamTopic2Checked(false);
      setTamTopic3Checked(false);

      setRevisedTopics({});
      setNeetPGChecked({});
    }
    setIsSyllabusSettingsOpen(false);
  };

  // Calculates active calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;

  return (
    <div 
      className="min-h-screen bg-[#dee6ee] text-slate-800 font-sans antialiased flex flex-col md:flex-row items-center justify-center p-0 md:p-6 lg:p-8" 
      id="focus-app-application-root"
    >
      {/* MAIN VIEW */}

      {/* SMARTPHONE DEVICE CONTAINER (Mimicking beautiful iOS display frame on desktop size) */}
      <div 
        className="w-full max-w-[430px] min-h-screen md:min-h-[810px] md:max-h-[850px] bg-[#eef3f9] md:rounded-[40px] md:shadow-2xl md:border-[10px] md:border-slate-900 overflow-hidden relative flex flex-col justify-between"
        id="smartphone-viewport-simulator"
      >
        

        {/* MAIN BODY WORKSPACE VIEW (Fits responsive vertical heights) */}
        <div className="flex-1 overflow-y-auto bg-[#eaf2fd] scrollbar-none relative flex flex-col">
          
          {/* VIEW RENDER DISPATCHER */}
    {activeTab === "Auth" && <SignIn onAuthSuccess={() => {
      try {
        const s = localStorage.getItem('authUser');
        if (s) setProfile(buildProfileFromAuthUser(JSON.parse(s)));
      } catch {}
      setActiveTab("Home");
    }} />}

          {/* VIEW: HOME PAGE */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${activeTab === "Home" ? "" : "hidden"}`}>
              
              {showAllFocusRecords ? (
                /* ALL FOCUS RECORD DETAIL SCREEN */
                <div className="flex-1 p-4 flex flex-col space-y-4 animate-fade-in text-slate-800" id="all-focus-record-view">
                  {/* Header Row: Back Button + Page name badge */}
                  <div className="flex items-center gap-3 animate-fade-in" id="all-focus-record-header">
                    <button 
                      onClick={() => setShowAllFocusRecords(false)}
                      className="w-10 h-10 rounded-full bg-[#d2e5e4] hover:bg-[#c2d5d4] text-[#125652] flex items-center justify-center transition active:scale-95 cursor-pointer shadow-sm shrink-0"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="bg-[#125652] text-white font-extrabold text-[13.5px] px-5 py-2.5 rounded-full shadow-md tracking-wide cursor-default">
                      All Focus record
                    </div>
                  </div>

                  {/* Today Section */}
                  <div className="w-full bg-white rounded-2xl overflow-hidden border border-[#beb0f3]/40 shadow-sm flex flex-col" id="today-record-section">
                    <div className="bg-[#125652] px-4.5 py-3 flex items-center justify-between text-white font-bold select-none text-[15px]">
                      <span>Today</span>
                    </div>

                    <div className="p-1 flex flex-col bg-white">
                      {focusRecords.filter(r => r.period === "today").length === 0 ? (
                        <div className="p-6 text-center text-slate-400 font-semibold text-xs">No records today.</div>
                      ) : (
                        focusRecords.filter(r => r.period === "today").map((record, index, arr) => (
                          <div 
                            key={record.id} 
                            className={`p-3.5 flex items-center justify-between ${index < arr.length - 1 ? 'border-b border-slate-100' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-slate-800 p-1 bg-slate-50 rounded-lg">
                                <BookOpen className="w-5 h-5 stroke-[2.2] text-[#125652]" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-extrabold text-slate-800 text-[14.5px] leading-tight">{record.title}</span>
                                <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-400 mt-1">
                                  <span>{record.date}</span>
                                  <span>{record.time}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-extrabold text-[#125652] text-[13px]">{record.duration}</span>
                              <button 
                                onClick={() => setDeleteConfirmItem(record)}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-rose-50 rounded-full transition-all active:scale-90 cursor-pointer"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* This Week Section */}
                  <div className="w-full bg-white rounded-2xl overflow-hidden border border-[#beb0f3]/40 shadow-sm flex flex-col" id="week-record-section">
                    <div className="bg-[#125652] px-4.5 py-3 flex items-center justify-between text-white font-bold select-none text-[15px]">
                      <span>This Week</span>
                      <Calendar className="w-4.5 h-4.5 opacity-90 stroke-[2.2]" />
                    </div>

                    <div className="p-1 flex flex-col bg-white">
                      {focusRecords.filter(r => r.period === "week").length === 0 ? (
                        <div className="p-6 text-center text-slate-400 font-semibold text-xs">No records this week.</div>
                      ) : (
                        focusRecords.filter(r => r.period === "week").map((record, index, arr) => (
                          <div 
                            key={record.id} 
                            className={`p-3.5 flex items-center justify-between ${index < arr.length - 1 ? 'border-b border-slate-100' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-slate-800 p-1 bg-slate-50 rounded-lg">
                                <BookOpen className="w-5 h-5 stroke-[2.2] text-[#125652]" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-extrabold text-slate-800 text-[14.5px] leading-tight">{record.title}</span>
                                <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-400 mt-1">
                                  <span>{record.date}</span>
                                  <span>{record.time}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-extrabold text-[#125652] text-[13px]">{record.duration}</span>
                              <button 
                                onClick={() => setDeleteConfirmItem(record)}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-rose-50 rounded-full transition-all active:scale-90 cursor-pointer"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : showMyFocus ? (
                /* MY FOCUS SCREEN (week.jpg) */
                <div className="flex-1 p-4 flex flex-col space-y-4 animate-fade-in text-slate-800">
                  {/* Header: Back button + Title pill */}
                  <div className="flex items-center gap-3 animate-fade-in" id="my-focus-header">
                    <button 
                      onClick={() => setShowMyFocus(false)}
                      className="w-10 h-10 rounded-full bg-[#d2e5e4] hover:bg-[#c2d5d4] text-[#125652] flex items-center justify-center transition active:scale-95 cursor-pointer shadow-sm shrink-0"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="bg-[#125652] text-white font-extrabold text-sm px-5 py-2.5 rounded-full shadow-md tracking-wide">
                      My Focus
                    </div>
                  </div>

                  {/* Section 1: Today Focus (Clickable to go to All Focus Record detail) */}
                  <div 
                    style={{ 
                      width: '100%', 
                      background: '#FFFFFF', 
                      borderRadius: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                      alignItems: 'flex-start',
                      border: '1.5px solid #beb0f3',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowAllFocusRecords(true)}
                    className="shadow-sm w-full p-4 xs:p-6 sm:p-7 md:p-8 hover:bg-slate-50 transition-colors"
                    id="today-focus-card"
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span 
                        style={{ 
                          color: '#000000', 
                          fontSize: '24px', 
                          fontFamily: 'Inter, sans-serif', 
                          textAlign: 'left', 
                          fontWeight: '700',
                          letterSpacing: '-0.5px'
                        }}
                      >
                        Today Focus
                      </span>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>

                    {/* Horizontal Pill Container with Fluid Sizing */}
                    <div className="flex flex-row gap-3 xs:gap-4 sm:gap-5 items-center w-full">
                      {/* Total Time dynamic pill */}
                      <div 
                        style={{ 
                          height: '92px', 
                          background: '#35d399', 
                          borderRadius: '16px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        className="flex-1 min-w-[100px] shadow-sm transition-all hover:scale-[1.02]"
                      >
                        <span
                          style={{
                            color: '#FFFFFF',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: '500',
                            letterSpacing: '-0.3px'
                          }}
                          className="text-[14px] xs:text-[16px] sm:text-[18px]"
                        >
                          Total Time
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span 
                            style={{ 
                              color: '#FFFFFF', 
                              fontSize: '26px', 
                              fontWeight: '700', 
                              fontFamily: 'Inter, sans-serif' 
                            }}
                          >
                            {Math.floor(completedMinutes / 60) > 0 
                              ? Math.floor(completedMinutes / 60) 
                              : "5"}
                          </span>
                          <span 
                            style={{ 
                              color: '#FFFFFF', 
                              fontSize: '16px', 
                              fontWeight: '500', 
                              fontFamily: 'Inter, sans-serif' 
                            }}
                          >
                            hrs
                          </span>
                        </div>
                      </div>

                      {/* Focus Log dynamic pill */}
                      <div 
                        style={{ 
                          height: '92px', 
                          background: '#35d399', 
                          borderRadius: '16px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        className="flex-1 min-w-[100px] shadow-sm transition-all hover:scale-[1.02]"
                      >
                        <span
                          style={{
                            color: '#FFFFFF',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: '500',
                            letterSpacing: '-0.3px'
                          }}
                          className="text-[14px] xs:text-[16px] sm:text-[18px]"
                        >
                          Focus Log
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span 
                            style={{ 
                              color: '#FFFFFF', 
                              fontSize: '26px', 
                              fontWeight: '700', 
                              fontFamily: 'Inter, sans-serif' 
                            }}
                          >
                            {focusLogCount}
                          </span>
                          <span 
                            style={{ 
                              color: '#FFFFFF', 
                              fontSize: '16px', 
                              fontWeight: '500', 
                              fontFamily: 'Inter, sans-serif' 
                            }}
                          >
                            times
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Interactive Focus Graphs (Week, Month, Year) */}
                  <div 
                    style={{ 
                      width: '100%', 
                      background: '#FFFFFF', 
                      borderRadius: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '24px',
                      border: '1.5px solid #beb0f3'
                    }}
                    className="shadow-sm w-full p-4 xs:p-6 sm:p-7 md:p-8"
                    id="weekly-focus-graph-card"
                  >
                    {/* Header: Dynamic Title group and dynamic Week/Month/Year pill */}
                    <div className="flex flex-row items-center justify-between gap-2 w-full" style={{ minWidth: 0 }}>
                      <div className="flex flex-col min-w-0">
                        <div className="flex flex-row items-baseline gap-2 flex-wrap">
                          <span 
                            style={{ 
                              color: '#000000', 
                              fontFamily: 'Inter, sans-serif', 
                              textAlign: 'left', 
                              fontWeight: '800',
                              letterSpacing: '-0.3px',
                              lineHeight: '1.2'
                            }}
                            className="text-[14px] xs:text-[17px] sm:text-[20px] font-extrabold whitespace-nowrap"
                          >
                            {activeGraphTab === "week" && "Weekly focus graph"}
                            {activeGraphTab === "month" && "Monthly focus graph"}
                            {activeGraphTab === "year" && "Yearly focus graph"}
                          </span>
                          <span 
                            style={{ 
                              color: '#000000', 
                              fontFamily: 'Inter, sans-serif', 
                              fontWeight: '600',
                              opacity: 0.75,
                              whiteSpace: 'nowrap'
                            }}
                            className="text-[9.5px] xs:text-[11px] sm:text-[12.5px] px-0.5 sm:px-1"
                          >
                            {activeGraphTab === "week" && "01/05 - 07/05"}
                            {activeGraphTab === "month" && "05- 2026"}
                            {activeGraphTab === "year" && "2026"}
                          </span>
                        </div>
                        {activeGraphTab === "week" && (
                          <span 
                            style={{ 
                              color: '#000000', 
                              fontFamily: 'Inter, sans-serif', 
                              textAlign: 'left', 
                              fontWeight: '500',
                              opacity: 0.6,
                              marginTop: '2.5px'
                            }}
                            className="text-[9px] xs:text-[10px] sm:text-[11px]"
                          >
                            last week data
                          </span>
                        )}
                      </div>

                      {/* Pill switch container */}
                      <div 
                        style={{ 
                          background: '#104e43', 
                          borderRadius: '30px', 
                          padding: '3px', 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '2px'
                        }}
                        className="flex-shrink-0 scale-[0.72] xs:scale-[0.88] sm:scale-100 origin-right select-none"
                      >
                        <div 
                          onClick={() => setActiveGraphTab("week")}
                          style={{ 
                            background: activeGraphTab === "week" ? '#FFFFFF' : 'transparent', 
                            color: activeGraphTab === "week" ? '#104e43' : '#FFFFFF', 
                            borderRadius: '20px', 
                            padding: '5px 12px', 
                            fontSize: '11px', 
                            fontWeight: activeGraphTab === "week" ? '700' : '600',
                            lineHeight: '1',
                            cursor: 'pointer',
                            opacity: activeGraphTab === "week" ? 1 : 0.9
                          }}
                        >
                          Week
                        </div>
                        <div 
                          onClick={() => setActiveGraphTab("month")}
                          style={{ 
                            background: activeGraphTab === "month" ? '#FFFFFF' : 'transparent', 
                            color: activeGraphTab === "month" ? '#104e43' : '#FFFFFF', 
                            borderRadius: '20px', 
                            padding: '5px 12px', 
                            fontSize: '11px', 
                            fontWeight: activeGraphTab === "month" ? '700' : '600',
                            lineHeight: '1',
                            cursor: 'pointer',
                            opacity: activeGraphTab === "month" ? 1 : 0.9
                          }}
                        >
                          Month
                        </div>
                        <div 
                          onClick={() => setActiveGraphTab("year")}
                          style={{ 
                            background: activeGraphTab === "year" ? '#FFFFFF' : 'transparent', 
                            color: activeGraphTab === "year" ? '#104e43' : '#FFFFFF', 
                            borderRadius: '20px', 
                            padding: '5px 12px', 
                            fontSize: '11px', 
                            fontWeight: activeGraphTab === "year" ? '700' : '600',
                            lineHeight: '1',
                            cursor: 'pointer',
                            opacity: activeGraphTab === "year" ? 1 : 0.9
                          }}
                        >
                          Year
                        </div>
                      </div>
                    </div>

                    {/* Chart area with columns and grid/ticks */}
                    <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', marginTop: '4px' }}>
                      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '145px', position: 'relative' }}>
                        
                        {/* Bars container standing on a clean baseline */}
                        <div 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'end', 
                            flex: 1, 
                            paddingRight: '40px', 
                            paddingLeft: '5px', 
                            height: '100%', 
                            borderBottom: '1.5px solid #dedede' 
                          }}
                        >
                          {(() => {
                            const addedMinutes = Math.max(0, completedMinutes - 60);

                            // Month Bar Configuration (matches exact aesthetic heights from Month screenshot)
                            const monthBars = [
                              { day: "1", height: 85 },
                              { day: "", height: 20 },
                              { day: "7", height: 28 },
                              { day: "14", height: 28 },
                              { day: "21", height: 28 },
                              { day: "28", height: 28 }
                            ];

                            // Year Bar Configuration (matches exact aesthetic heights from Year screenshot)
                            const yearBars = [
                              { label: "1", height: 18 },
                              { label: "2", height: 38 },
                              { label: "3", height: 42 },
                              { label: "4", height: 18 },
                              { label: "5", height: 18 },
                              { label: "6", height: 62 },
                              { label: "7", height: 35 },
                              { label: "8", height: 72 },
                              { label: "9", height: 10 },
                              { label: "10", height: 95 },
                              { label: "11", height: 88 },
                              { label: "12", height: 58 }
                            ];

                            // Week Bar Configuration
                            const AESTHETIC_DEFAULTS: { [key: string]: number } = {
                              Mon: 85,
                              Tue: 18,
                              Wed: 48,
                              Thu: 25,
                              Fri: 72,
                              Sat: 68,
                              Sun: 48
                            };
                            const weekdaysList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                            const todayStr = weekdaysList[new Date().getDay()];

                            let barsToRender: { id: string | number; label: string; heightPct: number }[] = [];

                            if (activeGraphTab === "week") {
                              const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                              barsToRender = weekDays.map((dayName) => {
                                const base = AESTHETIC_DEFAULTS[dayName];
                                let heightPct = base;
                                if (dayName === todayStr && addedMinutes > 0) {
                                  heightPct = Math.min(100, base + (addedMinutes / 60) * 100);
                                }
                                return {
                                  id: dayName,
                                  label: dayName,
                                  heightPct
                                };
                              });
                            } else if (activeGraphTab === "month") {
                              barsToRender = monthBars.map((bar, idx) => ({
                                id: idx,
                                label: bar.day,
                                heightPct: bar.height
                              }));
                            } else {
                              barsToRender = yearBars.map((bar, idx) => ({
                                id: idx,
                                label: bar.label,
                                heightPct: bar.height
                              }));
                            }

                            return barsToRender.map((bar) => {
                              return (
                                <div 
                                  key={bar.id} 
                                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'end' }}
                                  className={
                                    activeGraphTab === 'year' 
                                    ? "w-[8px] xs:w-[13px] sm:w-[18px]" 
                                    : activeGraphTab === 'month' 
                                    ? "w-[12px] xs:w-[17px] sm:w-[22px]" 
                                    : "w-[16px] xs:w-[22px] sm:w-[28px]"
                                  }
                                >
                                  <div 
                                    style={{ 
                                      width: '100%', 
                                      height: `${bar.heightPct}%`, 
                                      background: 'linear-gradient(to top, #0A8D65, #27BCB3)', 
                                      borderTopLeftRadius: activeGraphTab === 'year' ? '6px' : '10px', 
                                      borderTopRightRadius: activeGraphTab === 'year' ? '6px' : '10px',
                                      transition: 'height 0.4s ease-out'
                                    }} 
                                  />
                                </div>
                              );
                            });
                          })()}
                        </div>

                        {/* Y Axis Tick Labels on the extreme right */}
                        <div 
                          style={{ 
                            width: '35px', 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-end', 
                            position: 'absolute', 
                            right: '0', 
                            bottom: '0px', 
                            fontSize: '11px', 
                            fontFamily: 'Inter, sans-serif', 
                            color: '#000000', 
                            fontWeight: '600' 
                          }}
                        >
                          {activeGraphTab === 'week' && (
                            <>
                              <span>1hr</span>
                              <span>40m</span>
                              <span>20m</span>
                              <span>0m</span>
                            </>
                          )}
                          {activeGraphTab === 'month' && (
                            <>
                              <span>4hr</span>
                              <span>3hr</span>
                              <span>2hr</span>
                              <span>1hr</span>
                              <span>0m</span>
                            </>
                          )}
                          {activeGraphTab === 'year' && (
                            <>
                              <span>100hr</span>
                              <span>80hr</span>
                              <span>60hr</span>
                              <span>40hr</span>
                              <span>20hr</span>
                              <span>0hr</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Day Labels positioned exactly under columns */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingRight: '40px', paddingLeft: '5px', marginTop: '10px' }}>
                        {(() => {
                          const monthBars = [
                            { day: "1" },
                            { day: "" },
                            { day: "7" },
                            { day: "14" },
                            { day: "21" },
                            { day: "28" }
                          ];
                          const yearLabels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
                          const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

                          let labelsList: string[] = [];
                          if (activeGraphTab === 'week') labelsList = weekDays;
                          else if (activeGraphTab === 'month') labelsList = monthBars.map(b => b.day);
                          else labelsList = yearLabels;

                          return labelsList.map((label, idx) => (
                            <span 
                              key={idx} 
                              style={{ 
                                textAlign: 'center', 
                                fontSize: '11px', 
                                fontFamily: 'Inter, sans-serif', 
                                fontWeight: '600', 
                                color: '#000000' 
                              }}
                              className={
                                activeGraphTab === 'year' 
                                ? "w-[8px] xs:w-[13px] sm:w-[18px] text-[8.5px] xs:text-[10px]" 
                                : activeGraphTab === 'month' 
                                ? "w-[12px] xs:w-[17px] sm:w-[22px] text-[9.5px] xs:text-[11px]" 
                                : "w-[16px] xs:w-[22px] sm:w-[28px] text-[9.5px] xs:text-[11px]"
                              }
                            >
                              {label}
                            </span>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Dynamic Total focus duration */}
                  <div 
                    style={{ 
                      width: '100%', 
                      background: '#FFFFFF', 
                      borderRadius: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '18px',
                      border: '1.5px solid #beb0f3'
                    }}
                    className="shadow-sm w-full p-4 xs:p-6 sm:p-7 md:p-8"
                    id="total-focus-duration-card"
                  >
                    <span 
                      style={{ 
                        color: '#000000', 
                        fontSize: '20px', 
                        fontFamily: 'Inter, sans-serif', 
                        textAlign: 'left', 
                        fontWeight: '800',
                        letterSpacing: '-0.3px',
                        lineHeight: '1.2'
                      }}
                    >
                      Total focus duration
                    </span>
                    
                    <div className="flex flex-col gap-5 w-full">
                      {/* Deep Pine Green Banner for current period */}
                      <div 
                        style={{ 
                          background: '#0f4c46', 
                          borderRadius: '12px', 
                          padding: '12px 20px', 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          width: '100%'
                        }}
                      >
                        <span 
                          style={{ 
                            color: '#FFFFFF', 
                            fontSize: '15px', 
                            fontFamily: 'Inter, sans-serif', 
                            fontWeight: '600' 
                          }}
                        >
                          {activeGraphTab === "week" && "This Week"}
                          {activeGraphTab === "month" && "This Month"}
                          {activeGraphTab === "year" && "This Year"}
                        </span>
                        <span 
                          style={{ 
                            color: '#FFFFFF', 
                            fontSize: '15px', 
                            fontFamily: 'Inter, sans-serif', 
                            fontWeight: '600' 
                          }}
                        >
                          {(() => {
                            if (activeGraphTab === "week") {
                              const addedMinutes = Math.max(0, completedMinutes - 60);
                              const totalWeeklyMins = 630 + addedMinutes; // Starts at 10 hr 30m (630 mins)
                              const totalWeeklyHrs = Math.floor(totalWeeklyMins / 60);
                              const remainingWeeklyMins = totalWeeklyMins % 60;
                              return `${totalWeeklyHrs} hr ${remainingWeeklyMins}m`;
                            } else if (activeGraphTab === "month") {
                              return "10 hr 30m";
                            } else {
                              return "1104 hr 30m";
                            }
                          })()}
                        </span>
                      </div>

                      {/* Regular text row for last period */}
                      <div 
                        style={{ 
                          padding: '0px 20px', 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          width: '100%'
                        }}
                      >
                        <span 
                          style={{ 
                            color: '#000000', 
                            fontSize: '15px', 
                            fontFamily: 'Inter, sans-serif', 
                            fontWeight: '600' 
                          }}
                        >
                          {activeGraphTab === "week" && "Last Week"}
                          {activeGraphTab === "month" && "Last Month"}
                          {activeGraphTab === "year" && "Last Year"}
                        </span>
                        <span 
                          style={{ 
                            color: '#000000', 
                            fontSize: '15px', 
                            fontFamily: 'Inter, sans-serif', 
                            fontWeight: '600' 
                          }}
                        >
                          No data
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Focus Record */}
                  <div 
                    style={{ 
                      width: '100%', 
                      background: '#FFFFFF', 
                      borderRadius: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '18px',
                      border: '1.5px solid #beb0f3'
                    }}
                    className="shadow-sm w-full p-4 xs:p-6 sm:p-7 md:p-8"
                    id="focus-record-card"
                  >
                    <span 
                      style={{ 
                        color: '#000000', 
                        fontSize: '20px', 
                        fontFamily: 'Inter, sans-serif', 
                        textAlign: 'left', 
                        fontWeight: '800',
                        letterSpacing: '-0.3px',
                        lineHeight: '1.2'
                      }}
                    >
                      Focus Record
                    </span>
                    <div className="flex flex-row justify-between items-center w-full px-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span 
                        style={{ 
                          color: '#000000', 
                          fontSize: '15px', 
                          fontWeight: '600' 
                        }}
                      >
                        {activeGraphTab === "week" && "Focus Time : 10 hrs"}
                        {activeGraphTab === "month" && "Focus Time : 22 hrs"}
                        {activeGraphTab === "year" && "Focus Time : 112 hrs"}
                      </span>
                      <span 
                        style={{ 
                          color: '#000000', 
                          fontSize: '15px', 
                          fontWeight: '600' 
                        }}
                      >
                        {activeGraphTab === "week" && "100 min"}
                        {activeGraphTab === "month" && "200 min"}
                        {activeGraphTab === "year" && "2000 min"}
                      </span>
                    </div>
                  </div>

                </div>
              ) : (
                <>
                  {/* Profile header zone: solid styled emerald bg */}
                  <div
                    className="w-full bg-[#125652] px-4 pt-4 pb-4 text-white flex flex-col border-b border-[#0ec38c]/10 shrink-0"
                    style={{
                      borderBottomLeftRadius: '20px',
                      borderBottomRightRadius: '20px',
                      boxShadow: '0px 4px 15px rgba(0,0,0,0.1)'
                    }}
                    id="top-profile-curved-bar"
                  >
                    {/* 1. Profile information section */}
                    <FrameComponent
                      profile={profile}
                      onChangeProfile={handleUpdateProfile}
                      onLogout={() => {
                        setProfile(INITIAL_PROFILE);
                        setActiveTab("Auth");
                      }}
                    />

                    {/* 2. Daily Study Goal — embedded in header block */}
                    <GroupComponent
                      weeklyLogs={weeklyLogs}
                      completedMinutes={completedMinutes}
                      totalTasks={totalTasks}
                      completedTasks={completedTasks}
                      targetHours={targetHours}
                      onUpdateTargetHours={handleUpdateTargetHours}
                      onOpenAddTask={() => handleQuickActionDispatch("AddTask")}
                      onOpenGraph={() => setShowMyFocus(true)}
                    />
                  </div>

                  {/* Central interactive lists and components block */}
                  <div className="px-4 pb-6 flex-1 space-y-3.5">
                    {/* 3. Quick tools utility strip */}
                    <UtilityBar onSelectAction={handleQuickActionDispatch} />

                    {/* 5. Ambient Focus Study timer */}
                    <GroupComponent1
                      onSessionComplete={handleSessionComplete}
                      selectedTheme={selectedTheme}
                      setSelectedTheme={setSelectedTheme}
                      studyMode={studyMode}
                      setStudyMode={setStudyMode}
                      setTimerActiveState={setTimerIsActive}
                      tasks={tasks}
                      onAddTask={handleAddTask}
                      completedMinutes={completedMinutes}
                      syllabusTopics={[
                        { id: "groupIcon7", name: "General Science - Physics Core", completed: isTopicActive("groupIcon7", groupIcon7checked) },
                        { id: "groupIcon9", name: "General Science - Chemistry Core", completed: isTopicActive("groupIcon9", groupIcon9checked) },
                        { id: "groupIcon12", name: "General Science - Biology Core", completed: isTopicActive("groupIcon12", groupIcon12checked) },
                        { id: "groupIcon14", name: "General Science - Environment & Ecology", completed: isTopicActive("groupIcon14", groupIcon14checked) },
                        { id: "groupIconJudicial", name: "General Science - Scientific Temper", completed: isTopicActive("groupIconJudicial", groupIconJudicialChecked) },
                        { id: "geoTopic1", name: "Geography - Earth and Universe", completed: isTopicActive("geoTopic1", geoTopic1Checked) },
                        { id: "geoTopic2", name: "Geography - Monsoon & Rainfall", completed: isTopicActive("geoTopic2", geoTopic2Checked) },
                        { id: "geoTopic3", name: "Geography - Water Resources", completed: isTopicActive("geoTopic3", geoTopic3Checked) },
                        { id: "hisTopic1", name: "History - Indus Valley Civilization", completed: isTopicActive("hisTopic1", hisTopic1Checked) },
                        { id: "hisTopic2", name: "History - Golden Age of Guptas", completed: isTopicActive("hisTopic2", hisTopic2Checked) },
                        { id: "hisTopic3", name: "History - South Indian Dynasties", completed: isTopicActive("hisTopic3", hisTopic3Checked) },
                        { id: "polTopic1", name: "Indian Polity - Constitution of India", completed: isTopicActive("polTopic1", polTopic1Checked) },
                        { id: "polTopic2", name: "Indian Polity - Preamble & Citizenship", completed: isTopicActive("polTopic2", polTopic2Checked) },
                        { id: "polTopic3", name: "Indian Polity - Fundamental Rights & Duties", completed: isTopicActive("polTopic3", polTopic3Checked) },
                        { id: "ecoTopic1", name: "Economy - Nature of Indian Economy", completed: isTopicActive("ecoTopic1", ecoTopic1Checked) },
                        { id: "ecoTopic2", name: "Economy - Five Year Plan Models", completed: isTopicActive("ecoTopic2", ecoTopic2Checked) },
                        { id: "ecoTopic3", name: "Economy - Land Reforms & Agriculture", completed: isTopicActive("ecoTopic3", ecoTopic3Checked) },
                        { id: "tamTopic1", name: "Tamil Culture - Sangam Literature", completed: isTopicActive("tamTopic1", tamTopic1Checked) },
                        { id: "tamTopic2", name: "Tamil Culture - Archaeological Discoveries", completed: isTopicActive("tamTopic2", tamTopic2Checked) },
                        { id: "tamTopic3", name: "Tamil Culture - Thirukkural Philosophy", completed: isTopicActive("tamTopic3", tamTopic3Checked) },
                        { id: "aptTopic1", name: "Aptitude - Simplification & Percentage", completed: isTopicActive("aptTopic1", aptTopic1Checked) },
                        { id: "aptTopic2", name: "Aptitude - Highest Common Factor (HCF)", completed: isTopicActive("aptTopic2", aptTopic2Checked) },
                        { id: "aptTopic3", name: "Aptitude - Ratio and Proportion Style", completed: isTopicActive("aptTopic3", aptTopic3Checked) }
                      ]}
                    />

                    {/* 5. Today's Plan task scheduler list */}
                    <GroupComponent2 
                      tasks={tasks}
                      onToggleTask={handleToggleTask}
                      onAddTask={handleAddTask}
                      onDeleteTask={handleDeleteTask}
                    />
                  </div>
                </>
              )}

            </div>

          {/* VIEW: SYLLABUS DIRECTORY CHECKLISTS */}
          <div 
            className={`flex-1 w-full animate-fade-in transition-all overflow-y-auto space-y-4 pb-8 ${activeTab === "Syllabus" ? "" : "hidden"}`} 
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
              
              {/* SECTION 1: Dark Pine Green Header Card */}
              <div 
                className="w-full text-white p-4.5 space-y-4 shadow-md shrink-0 select-none text-left"
                style={{
                  backgroundColor: '#125652',
                  borderBottomLeftRadius: '20px',
                  borderBottomRightRadius: '20px',
                }}
              >
                {/* Brand & Change Domain Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-[20px] tracking-tight text-white leading-none">
                      {profile.group.startsWith("TNPSC") ? "TNPSC" : profile.group.startsWith("UPSC") ? "UPSC" : profile.group.startsWith("CSE") ? "CSE" : profile.group.startsWith("NEET PG") ? "NEET PG" : "Exam"}
                    </span>
                    <span className="text-[12.5px] font-semibold text-slate-100 opacity-90">
                      {profile.group.replace(/^(TNPSC|UPSC|CSE|NEET PG)[\s-]+/, '')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isRevisionMode && (
                      <button
                        onClick={() => setIsSyllabusSettingsOpen(true)}
                        className="px-3 py-1 text-[10.5px] font-extrabold text-white rounded-full border active:scale-95 transition-transform cursor-pointer flex items-center gap-1 leading-none shadow-sm bg-amber-600 border-amber-400 hover:bg-amber-700/80"
                        title="Click to adjust Revision and Syllabus settings"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-100 animate-ping shrink-0" />
                        <span>Revision</span>
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={() => setIsChooseExamOpen(true)}
                      className="px-3 py-1 text-[11px] font-bold text-white bg-white/10 hover:bg-white/20 rounded-full border border-white/20 active:scale-95 transition-transform cursor-pointer leading-none"
                    >
                      Change Domain
                    </button>
                  </div>
                </div>

                {/* Over all Completions card */}
                <div className="p-4 rounded-xl space-y-3.5" style={{ backgroundColor: '#2a6764' }}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[14px] font-bold text-white leading-none">Over all Completions</span>
                      <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>{isNeetPG ? "NEET PG Journey" : "Prelims Journey"}</span>
                      </div>
                    </div>
                    {/* Mastery Level */}
                    <div className="text-right">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-[28px] font-extrabold tracking-tight text-white leading-none">{isNeetPG ? pctNeetPGOverall : pctOverall}%</span>
                        <span className="text-[11px] font-medium text-white/80">Completed</span>
                      </div>
                      <span className="text-[11px] font-extrabold text-white/85 tracking-tight uppercase block mt-1">
                        {isNeetPG ? neetPGTotalComp : totalCompTopics} / {isNeetPG ? neetPGTotalTopics : totalSyllabusTopics} TOPICS
                      </span>
                    </div>
                  </div>

                  {/* Gradient Progress Bar */}
                  <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pctOverall}%`, background: 'linear-gradient(90deg, #33d0a9 0%, #3ed18e 100%)' }} />
                  </div>
                </div>
                {/* Countdown banner card */}
                <div className="flex items-center justify-between p-2.5 rounded-lg text-white" style={{ backgroundColor: '#2e7d6b' }}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4.5 h-4.5 opacity-95 text-white" />
                    <span className="text-xs font-bold tracking-tight">Countdown to success</span>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold text-[#1a5551] bg-[#e3f4ee] rounded-md shadow-sm">
                    45 Days Left
                  </span>
                </div>

                {/* Prelims & Mains Dual Panel Box */}
                <div className="grid grid-cols-2 gap-3 pb-1">
                  {/* PRELIMS CARD */}
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="p-1.5 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold text-white/60 tracking-wider block uppercase leading-none">PRELIMS</span>
                      <span className="text-xs font-bold text-white block mt-0.5">June 16</span>
                    </div>
                  </div>

                  {/* MAINS CARD */}
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="p-1.5 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold text-white/60 tracking-wider block uppercase leading-none">MAINS</span>
                      <span className="text-xs font-bold text-white block mt-0.5">Sept 20</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* SECTION 2: Search Row with Adjustments Icon */}
              <div className="px-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-white rounded-full px-3.5 py-2.5 shadow-sm border border-slate-200">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search topics.."
                      value={syllabusSearchQuery}
                      onChange={(e) => setSyllabusSearchQuery(e.target.value)}
                      className="w-full text-xs font-semibold placeholder-slate-400 text-slate-705 bg-transparent focus:outline-none"
                    />
                  </div>
                  <button 
                    type="button"
                    className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:text-slate-800 active:scale-95 transition-transform" 
                    onClick={() => setIsSyllabusSettingsOpen(true)}
                    title="Syllabus Settings & Revision Mode"
                  >
                    <SlidersHorizontal className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* SECTION 3: Filter Pills */}
              <div className="px-4">
                <div className="flex items-center gap-2.5">
                  {(["All", "Completed", "Pending"] as const).map((filterOpt) => {
                    const isSelected = selectedStatusFilter === filterOpt;
                    return (
                      <button
                        key={filterOpt}
                        onClick={() => setSelectedStatusFilter(filterOpt)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg tracking-tight select-none border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#e8f1ec] text-[#125652] border-[#a5d6c6] shadow-sm' 
                            : 'bg-[#f5fbfb] text-[#555] border-[#cbcbcb] hover:bg-slate-50'
                        }`}
                      >
                        {filterOpt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: Dual category Selector tabs (Prelims / Mains) */}
              <div className="px-4">
                <div className="grid grid-cols-2 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                  <button
                    onClick={() => setSelectedCategoryTab("Prelims")}
                    className={`py-2 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedCategoryTab === "Prelims"
                        ? 'bg-[#1c625e] text-white shadow-sm'
                        : 'text-slate-705 bg-transparent hover:text-slate-800'
                    }`}
                  >
                    {isNeetPG ? "Basic Sciences" : "Prelims"}
                  </button>
                  <button
                    onClick={() => setSelectedCategoryTab("Mains")}
                    className={`py-2 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedCategoryTab === "Mains"
                        ? 'bg-[#1c625e] text-white shadow-sm'
                        : 'text-slate-705 bg-transparent hover:text-slate-800'
                    }`}
                  >
                    {isNeetPG ? "Clinical" : "Mains"}
                  </button>
                </div>
              </div>

              {/* SECTION 5: Accordion List of Syllabus Cards */}
              <div className="px-4 space-y-3 pb-4">

                {/* ── NEET PG DYNAMIC SUBJECTS ─────────────────────────────── */}
                {isNeetPG && NEET_PG_SYLLABUS_DATA.filter(subj => {
                  const matchesTab = selectedCategoryTab === "Prelims" ? subj.code !== "PART-C" : subj.code === "PART-C";
                  const q = syllabusSearchQuery.toLowerCase();
                  const matchesSearch = !q || subj.title.toLowerCase().includes(q) || subj.units.some(u => u.name.toLowerCase().includes(q));
                  const allDone = subj.units.every(u => isRevisionMode ? !!revisedTopics[u.id] : !!neetPGChecked[u.id]);
                  const anyPending = subj.units.some(u => isRevisionMode ? !revisedTopics[u.id] : !neetPGChecked[u.id]);
                  const matchesFilter = selectedStatusFilter === "All" || (selectedStatusFilter === "Completed" && allDone) || (selectedStatusFilter === "Pending" && anyPending);
                  return matchesTab && matchesSearch && matchesFilter;
                }).map(subj => {
                  const STYLE: Record<string, { g: string; c: string }> = {
                    "neet-1":  { g: "linear-gradient(135deg,rgba(88,28,135,.93) 0%,rgba(124,58,237,.8) 100%)",  c: "#7c3aed" },
                    "neet-2":  { g: "linear-gradient(135deg,rgba(3,105,161,.93) 0%,rgba(14,165,233,.8) 100%)",  c: "#0369a1" },
                    "neet-3":  { g: "linear-gradient(135deg,rgba(79,70,229,.93) 0%,rgba(99,102,241,.8) 100%)",  c: "#4f46e5" },
                    "neet-4":  { g: "linear-gradient(135deg,rgba(15,118,110,.93) 0%,rgba(20,184,166,.8) 100%)", c: "#0f766e" },
                    "neet-5":  { g: "linear-gradient(135deg,rgba(185,28,28,.93) 0%,rgba(220,38,38,.8) 100%)",   c: "#b91c1c" },
                    "neet-6":  { g: "linear-gradient(135deg,rgba(180,83,9,.93) 0%,rgba(217,119,6,.8) 100%)",    c: "#b45309" },
                    "neet-7":  { g: "linear-gradient(135deg,rgba(30,41,59,.93) 0%,rgba(71,85,105,.8) 100%)",    c: "#334155" },
                    "neet-8":  { g: "linear-gradient(135deg,rgba(5,102,64,.93) 0%,rgba(16,140,92,.8) 100%)",    c: "#056640" },
                    "neet-9":  { g: "linear-gradient(135deg,rgba(5,122,85,.95) 0%,rgba(16,185,129,.85) 100%)",  c: "#057a55" },
                    "neet-10": { g: "linear-gradient(135deg,rgba(124,45,18,.93) 0%,rgba(194,65,12,.8) 100%)",   c: "#7c2d12" },
                    "neet-11": { g: "linear-gradient(135deg,rgba(15,76,70,.93) 0%,rgba(219,39,119,.8) 100%)",  c: "#9d174d" },
                    "neet-12": { g: "linear-gradient(135deg,rgba(194,65,12,.93) 0%,rgba(234,88,12,.8) 100%)",   c: "#c2410c" },
                    "neet-13": { g: "linear-gradient(135deg,rgba(8,145,178,.93) 0%,rgba(6,182,212,.8) 100%)",   c: "#0891b2" },
                    "neet-14": { g: "linear-gradient(135deg,rgba(29,78,216,.93) 0%,rgba(59,130,246,.8) 100%)",  c: "#1d4ed8" },
                    "neet-15": { g: "linear-gradient(135deg,rgba(55,65,81,.93) 0%,rgba(107,114,128,.8) 100%)",  c: "#374151" },
                    "neet-16": { g: "linear-gradient(135deg,rgba(190,18,60,.93) 0%,rgba(244,63,94,.8) 100%)",   c: "#be123c" },
                    "neet-17": { g: "linear-gradient(135deg,rgba(109,40,217,.93) 0%,rgba(139,92,246,.8) 100%)", c: "#6d28d9" },
                    "neet-18": { g: "linear-gradient(135deg,rgba(15,76,70,.93) 0%,rgba(19,107,100,.8) 100%)",   c: "#0f4c46" },
                    "neet-19": { g: "linear-gradient(135deg,rgba(29,78,216,.93) 0%,rgba(71,85,105,.8) 100%)",   c: "#1d4ed8" },
                  };
                  const ICONS: Record<string, React.ReactNode> = {
                    "neet-1":  <Brain className="w-6 h-6 stroke-[2.2]" style={{color:"#7c3aed"}} />,
                    "neet-2":  <HeartPulse className="w-6 h-6 stroke-[2.2]" style={{color:"#0369a1"}} />,
                    "neet-3":  <Sparkles className="w-6 h-6 stroke-[2.2]" style={{color:"#4f46e5"}} />,
                    "neet-4":  <ShieldCheck className="w-6 h-6 stroke-[2.2]" style={{color:"#0f766e"}} />,
                    "neet-5":  <Layers className="w-6 h-6 stroke-[2.2]" style={{color:"#b91c1c"}} />,
                    "neet-6":  <Sparkle className="w-6 h-6 stroke-[2.2]" style={{color:"#b45309"}} />,
                    "neet-7":  <Scale className="w-6 h-6 stroke-[2.2]" style={{color:"#334155"}} />,
                    "neet-8":  <Building2 className="w-6 h-6 stroke-[2.2]" style={{color:"#056640"}} />,
                    "neet-9":  <HeartPulse className="w-6 h-6 stroke-[2.2]" style={{color:"#057a55"}} />,
                    "neet-10": <Compass className="w-6 h-6 stroke-[2.2]" style={{color:"#7c2d12"}} />,
                    "neet-11": <Apple className="w-6 h-6 stroke-[2.2]" style={{color:"#9d174d"}} />,
                    "neet-12": <Award className="w-6 h-6 stroke-[2.2]" style={{color:"#c2410c"}} />,
                    "neet-13": <Compass className="w-6 h-6 stroke-[2.2]" style={{color:"#0891b2"}} />,
                    "neet-14": <Eye className="w-6 h-6 stroke-[2.2]" style={{color:"#1d4ed8"}} />,
                    "neet-15": <Landmark className="w-6 h-6 stroke-[2.2]" style={{color:"#374151"}} />,
                    "neet-16": <Leaf className="w-6 h-6 stroke-[2.2]" style={{color:"#be123c"}} />,
                    "neet-17": <Brain className="w-6 h-6 stroke-[2.2]" style={{color:"#6d28d9"}} />,
                    "neet-18": <Clock className="w-6 h-6 stroke-[2.2]" style={{color:"#0f4c46"}} />,
                    "neet-19": <Lightbulb className="w-6 h-6 stroke-[2.2]" style={{color:"#1d4ed8"}} />,
                  };
                  const style = STYLE[subj.id] || { g: "linear-gradient(135deg,#125652 0%,#1c8070 100%)", c: "#125652" };
                  const icon  = ICONS[subj.id] || <BookOpen className="w-6 h-6 stroke-[2.2]" style={{color:"#125652"}} />;
                  const compCount = subj.units.filter(u => isRevisionMode ? !!revisedTopics[u.id] : !!neetPGChecked[u.id]).length;
                  const pct = subj.units.length > 0 ? Math.round((compCount / subj.units.length) * 100) : 0;
                  const isExpanded = !!neetPGExpanded[subj.id];
                  return (
                    <div key={subj.id} className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
                      {/* Card Header */}
                      <div
                        onClick={() => setNeetPGExpanded(prev => ({ ...prev, [subj.id]: !prev[subj.id] }))}
                        className="relative p-5 cursor-pointer flex items-center justify-between select-none overflow-hidden"
                        style={{ backgroundImage: style.g, color: '#ffffff' }}
                      >
                        <div className="flex items-center gap-3.5 relative z-10">
                          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-black/5">
                            {icon}
                          </div>
                          <div className="text-left">
                            <h4 className="text-[14.5px] font-extrabold tracking-tight text-white leading-none">{subj.title}</h4>
                            <span className="text-[10px] text-white/95 font-bold block mt-1.5">
                              {isRevisionMode
                                ? `${subj.units.filter(u => !!revisedTopics[u.id]).length} of ${subj.units.length} topics revised`
                                : `${compCount} of ${subj.units.length} topics completed`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3.5 relative z-10">
                          <div className="w-11 h-11 rounded-full bg-white text-[12px] font-black flex items-center justify-center shadow-md shrink-0 select-none" style={{ color: style.c }}>
                            {pct}%
                          </div>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-white stroke-[3]" /> : <ChevronDown className="w-5 h-5 text-white stroke-[3]" />}
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full h-1 bg-slate-100 relative">
                        <div className="absolute top-0 left-0 h-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: style.c }} />
                      </div>
                      {/* Expanded topics list */}
                      {isExpanded && (
                        <div className="p-4 space-y-1 text-left">
                          {subj.units.map(unit => {
                            const checked = isRevisionMode ? !!revisedTopics[unit.id] : !!neetPGChecked[unit.id];
                            return (
                              <div
                                key={unit.id}
                                onClick={() => selectSubTopic(unit.id, unit.name)}
                                className={getTopicRowClass(unit.id)}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div
                                    className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition"
                                    style={checked ? { backgroundColor: style.c, borderColor: style.c } : {}}
                                  >
                                    {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${
                                    checked
                                      ? isRevisionMode
                                        ? 'font-extrabold italic'
                                        : 'text-slate-400 line-through font-semibold'
                                      : 'text-slate-700 font-bold'
                                  }`} style={checked && isRevisionMode ? { color: style.c } : {}}>
                                    {unit.name}
                                  </span>
                                  {completingTopicId === unit.id && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <div className="flex items-center shrink-0">
                                  <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); setSelectedPyqTopic(unit.name); }}
                                    className="p-1.5 -mr-1 rounded hover:bg-slate-100 transition cursor-pointer"
                                    style={{ color: style.c }}
                                  >
                                    <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {/* Action buttons */}
                          {subj.units.some(u => u.id === selectedSubTopicId) && (
                          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 mt-2">
                            <button
                              onClick={() => handleSyllabusAddTask("9:00 AM")}
                              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 text-slate-600" />
                              <span>Add Task</span>
                            </button>
                            <button
                              onClick={() => selectedSubTopicId && handleTopicMarkComplete(selectedSubTopicId, false)}
                              className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white rounded-lg active:scale-95 transition-transform cursor-pointer ${
                                isRevisionMode ? 'bg-[#d35400] hover:bg-[#b33e00]' : 'bg-[#2c8926] hover:bg-[#236b1d]'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                              <span>{isRevisionMode ? "Mark as Revised" : "Mark Completed"}</span>
                            </button>
                          </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* ── END NEET PG DYNAMIC SUBJECTS ─────────────────────────── */}

                {/* TNPSC / UPSC / CSE static subject cards — hidden when NEET PG is active */}
                {!isNeetPG && <>

                {/* SUBJECT CARD 1: GENERAL SCIENCE (10 QS) (Interactive Extended Card) */}
                <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
                  {/* Card Header (Leaf gradient design over high-contrast Unsplash image) */}
                  <div 
                    onClick={() => setIsScienceExpanded(!isScienceExpanded)}
                    className="relative p-5 cursor-pointer flex items-center justify-between select-none overflow-hidden"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, rgba(16, 140, 92, 0.94) 0%, rgba(53, 175, 118, 0.8) 100%), url("https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: '#ffffff'
                    }}
                  >
                    <div className="flex items-center gap-3.5 relative z-10">
                      {/* Leaf badge icon in a solid rounded-xl white box */}
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-black/5">
                        <Leaf className="w-6 h-6 stroke-[2.2] text-[#108c5c] fill-[#108c5c]/10" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-[14.5px] font-extrabold tracking-tight text-white leading-none">General Science (10 qs)</h4>
                        <span className="text-[10px] text-white/95 font-bold block mt-1.5">{getSubjectCountStr("Science", compScience, totalScience, revScience)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="w-11 h-11 rounded-full bg-white text-[#108c5c] text-[12px] font-black flex items-center justify-center shadow-md shrink-0 select-none">
                        {getSubjectPct(compScience, totalScience, revScience)}%
                      </div>
                      {isScienceExpanded ? (
                        <ChevronUp className="w-5 h-5 text-white stroke-[3]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white stroke-[3]" />
                      )}
                    </div>
                  </div>

                  {/* Subject Progress Bar inside Card */}
                  <div className="w-full h-1 bg-slate-100 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#108c5c] transition-all duration-300" 
                      style={{ width: `${getSubjectPct(compScience, totalScience, revScience)}%` }} 
                    />
                  </div>

                  {/* List Body with precise hierarchy */}
                  {isScienceExpanded && (
                    <div className="p-4 space-y-4 text-left">
                      
                      {/* Tree Track Visual Lines */}
                      <div className="flex gap-4">
                        
                        {/* Timeline tree lines left-side */}
                        <div className="flex flex-col items-center shrink-0 relative pt-1">
                          {/* Anchor Circle 1 */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isRevisionMode ? 'border-amber-500' : 'border-[#125652]'} bg-white z-10 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRevisionMode ? 'bg-amber-500' : 'bg-[#125652]'}`} />
                          </div>
                          <div className="w-[1.5px] bg-slate-200 flex-1 my-1" />
                          
                          {/* Anchor Circle 2 */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isRevisionMode ? 'border-amber-500' : 'border-[#125652]'} bg-white z-10 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRevisionMode ? 'bg-amber-500' : 'bg-[#125652]'}`} />
                          </div>
                          <div className="w-[1.5px] bg-slate-200 flex-1 my-1" />

                          {/* Anchor Circle 3 */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isRevisionMode ? 'border-amber-500' : 'border-[#125652]'} bg-white z-10 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRevisionMode ? 'bg-amber-500' : 'bg-[#125652]'}`} />
                          </div>
                        </div>

                        {/* Hierarchical checklist content block */}
                        <div className="flex-1 space-y-4">
                          
                          {/* BLOCK A: Physics & Chemistry */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-[12.5px] text-slate-800 tracking-tight">Physics & Chemistry</h5>
                              <span className={`text-[11px] font-bold ${isRevisionMode ? 'text-amber-800 bg-amber-50' : 'text-[#108c5c] bg-[#e8fbf4]'} px-1.5 py-0.2 rounded`}>
                                {getHeaderCountStr(['groupIcon7', 'groupIcon9'], [groupIcon7checked, groupIcon9checked])}
                              </span>
                            </div>
                            
                            {/* Checkboxes for Physics & Chemistry */}
                            <div className="space-y-1.5 pl-1">
                              
                               {/* Checkbox A1: Scientific Laws & Mechanics */}
                               <div
                                 onClick={() => selectSubTopic("groupIcon7", "Scientific Laws & Mechanics")}
                                 className={getTopicRowClass("groupIcon7")}
                               >
                                 <div className="relative flex items-center gap-2 min-w-0">
                                   <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                     getTopicBoxClass("groupIcon7", groupIcon7checked)
                                   }`}>
                                     {isTopicActive("groupIcon7", groupIcon7checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                   </div>
                                   <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("groupIcon7", groupIcon7checked)}`}>
                                     Scientific Laws & Mechanics
                                   </span>
                                   {completingTopicId === "groupIcon7" && (
                                     <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                   )}
                                 </div>
                                 <button
                                   type="button"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setSelectedPyqTopic("Scientific Laws & Mechanics");
                                   }}
                                   className={`p-1.5 -mr-1 hover:bg-emerald-100/50 rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#108c5c]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                   title="View PMQs for Scientific Laws & Mechanics"
                                 >
                                   <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                 </button>
                               </div>

                               {/* Checkbox A2: Elements & Compounds */}
                               <div
                                 onClick={() => selectSubTopic("groupIcon9", "Elements, Acids, Bases & Salts")}
                                 className={getTopicRowClass("groupIcon9")}
                               >
                                 <div className="relative flex items-center gap-2 min-w-0">
                                   <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                     getTopicBoxClass("groupIcon9", groupIcon9checked)
                                   }`}>
                                     {isTopicActive("groupIcon9", groupIcon9checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                   </div>
                                   <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("groupIcon9", groupIcon9checked)}`}>
                                     Elements, Acids, Bases & Salts
                                   </span>
                                   {completingTopicId === "groupIcon9" && (
                                     <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                   )}
                                 </div>
                                 <button
                                   type="button"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setSelectedPyqTopic("Elements, Acids, Bases & Salts");
                                   }}
                                   className={`p-1.5 -mr-1 hover:bg-emerald-100/50 rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#108c5c]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                   title="View PMQs for Elements, Acids, Bases & Salts"
                                 >
                                   <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                 </button>
                               </div>

                            </div>
                          </div>

                          {/* BLOCK B: Biology & Physiology */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-[12.5px] text-slate-800 tracking-tight">Biology & Physiology</h5>
                              <span className={`text-[11px] font-bold ${isRevisionMode ? 'text-amber-800 bg-amber-50' : 'text-[#108c5c] bg-[#e8fbf4]'} px-1.5 py-0.2 rounded`}>
                                {getHeaderCountStr(['groupIcon12', 'groupIcon14'], [groupIcon12checked, groupIcon14checked])}
                              </span>
                            </div>
                            
                            {/* Checkboxes for Biology */}
                            <div className="space-y-1.5 pl-1">
                              
                               {/* Checkbox B1: Main Concepts of Life Science */}
                               <div
                                 onClick={() => selectSubTopic("groupIcon12", "Main Concepts of Life Science")}
                                 className={getTopicRowClass("groupIcon12")}
                               >
                                 <div className="relative flex items-center gap-2 min-w-0">
                                   <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                     getTopicBoxClass("groupIcon12", groupIcon12checked)
                                   }`}>
                                     {isTopicActive("groupIcon12", groupIcon12checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                   </div>
                                   <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("groupIcon12", groupIcon12checked)}`}>
                                     Main Concepts of Life Science
                                   </span>
                                   {completingTopicId === "groupIcon12" && (
                                     <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                   )}
                                 </div>
                                 <button
                                   type="button"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setSelectedPyqTopic("Main Concepts of Life Science");
                                   }}
                                   className={`p-1.5 -mr-1 hover:bg-emerald-100/50 rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#108c5c]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                   title="View PMQs for Main Concepts of Life Science"
                                 >
                                   <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                 </button>
                               </div>

                               {/* Checkbox B2: Nutrition & Health */}
                               <div
                                 onClick={() => selectSubTopic("groupIcon14", "Nutrition, Health & Hygiene")}
                                 className={getTopicRowClass("groupIcon14")}
                               >
                                 <div className="relative flex items-center gap-2 min-w-0">
                                   <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                     getTopicBoxClass("groupIcon14", groupIcon14checked)
                                   }`}>
                                     {isTopicActive("groupIcon14", groupIcon14checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                   </div>
                                   <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("groupIcon14", groupIcon14checked)}`}>
                                     Nutrition, Health & Hygiene
                                   </span>
                                   {completingTopicId === "groupIcon14" && (
                                     <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                   )}
                                 </div>
                                 <button
                                   type="button"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setSelectedPyqTopic("Nutrition, Health & Hygiene");
                                   }}
                                   className={`p-1.5 -mr-1 hover:bg-emerald-100/50 rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#108c5c]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                   title="View PMQs for Nutrition, Health & Hygiene"
                                 >
                                   <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                 </button>
                               </div>

                            </div>
                          </div>

                          {/* BLOCK C: Environmental Ecology */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-[12.5px] text-slate-800 tracking-tight">Environmental Ecology</h5>
                              <span className={`text-[11px] font-bold ${isRevisionMode ? 'text-amber-800 bg-amber-50' : 'text-[#108c5c] bg-[#e8fbf4]'} px-1.5 py-0.2 rounded`}>
                                {getHeaderCountStr(['groupIconJudicial'], [groupIconJudicialChecked])}
                              </span>
                            </div>

                            <div className="space-y-1.5 pl-1">
                              <div
                                onClick={() => selectSubTopic("groupIconJudicial", "Environment, Pollution & Human Diseases")}
                                className={getTopicRowClass("groupIconJudicial")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("groupIconJudicial", groupIconJudicialChecked)
                                  }`}>
                                    {isTopicActive("groupIconJudicial", groupIconJudicialChecked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("groupIconJudicial", groupIconJudicialChecked)}`}>
                                    Environment, Pollution & Human Diseases
                                  </span>
                                  {completingTopicId === "groupIconJudicial" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Environment, Pollution & Human Diseases");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-emerald-100/50 rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#108c5c]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Environment, Pollution & Human Diseases"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>

                          </div>

                        </div>
                      </div>

                      {/* Expand Action Buttons panel */}
                      {(['groupIcon7','groupIcon9','groupIcon12','groupIcon14','groupIconJudicial'] as string[]).includes(selectedSubTopicId ?? '') && (
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleSyllabusAddTask("9:00 AM")}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-805 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-600" />
                          <span>Add Task</span>
                        </button>
                        <button
                          onClick={() => { const a = topicToggleActions[selectedSubTopicId!]; if (a) handleTopicMarkComplete(selectedSubTopicId!, a.checked, a.setter); }}
                          className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white ${isRevisionMode ? 'bg-[#d35400] hover:bg-[#b33e00]' : 'bg-[#2c8926] hover:bg-[#236b1d]'} rounded-lg active:scale-95 transition-transform cursor-pointer`}
                        >
                          <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                          <span>{isRevisionMode ? "Mark as Revised" : "Mark as Completed"}</span>
                        </button>
                      </div>
                      )}

                    </div>
                  )}
                </div>                {/* SUBJECT CARD 2: GEOGRAPHY OF INDIA (10 QS) */}
                <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
                  <div 
                    onClick={() => setIsGeographyExpanded(!isGeographyExpanded)}
                    className="p-5 flex items-center justify-between select-none relative overflow-hidden cursor-pointer"
                    style={{ 
                      backgroundImage: 'linear-gradient(135deg, rgba(9, 74, 128, 0.94) 0%, rgba(27, 115, 190, 0.8) 100%), url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: '#ffffff' 
                    }}
                  >
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-black/5">
                        <Globe className="w-6 h-6 stroke-[2.2] text-[#094a80] fill-[#094a80]/10" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-[14.5px] font-extrabold tracking-tight text-white leading-none">Geography of India (10 qs)</h4>
                        <span className="text-[10px] text-white/95 font-bold block mt-1.5">{getSubjectCountStr("Geography", compGeo, totalGeo, revGeo)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="w-11 h-11 rounded-full bg-white text-[#094a80] text-[12px] font-black flex items-center justify-center shadow-md shrink-0 select-none">
                        {getSubjectPct(compGeo, totalGeo, revGeo)}%
                      </div>
                      {isGeographyExpanded ? (
                        <ChevronUp className="w-5 h-5 text-white stroke-[3]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white stroke-[3]" />
                      )}
                    </div>
                  </div>
                  <div className="w-full h-1 bg-slate-100 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#094a80] transition-all duration-300" 
                      style={{ width: `${getSubjectPct(compGeo, totalGeo, revGeo)}%` }} 
                    />
                  </div>

                  {/* List Body with precise hierarchy */}
                  {isGeographyExpanded && (
                    <div className="p-4 space-y-4 text-left">
                      
                      {/* Tree Track Visual Lines */}
                      <div className="flex gap-4">
                        
                        {/* Timeline tree lines left-side */}
                        <div className="flex flex-col items-center shrink-0 relative pt-1">
                          {/* Anchor Circle 1 */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isRevisionMode ? 'border-amber-500' : 'border-[#094a80]'} bg-white z-10 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRevisionMode ? 'bg-amber-500' : 'bg-[#094a80]'}`} />
                          </div>
                          <div className="w-[1.5px] bg-slate-200 flex-1 my-1" />
                          
                          {/* Anchor Circle 2 */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isRevisionMode ? 'border-amber-500' : 'border-[#094a80]'} bg-white z-10 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRevisionMode ? 'bg-amber-500' : 'bg-[#094a80]'}`} />
                          </div>
                        </div>

                        {/* Hierarchical checklist content block */}
                        <div className="flex-1 space-y-4">
                          
                          {/* BLOCK A: Physical Features */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-[12.5px] text-slate-800 tracking-tight">Physical Features & Climate</h5>
                              <span className={`text-[11px] font-bold ${isRevisionMode ? 'text-amber-800 bg-amber-50' : 'text-[#094a80] bg-[#e6f0fa]'} px-1.5 py-0.2 rounded`}>
                                {getHeaderCountStr(['geoTopic1', 'geoTopic2'], [geoTopic1Checked, geoTopic2Checked])}
                              </span>
                            </div>
                            
                            <div className="space-y-1.5 pl-1">
                              {/* Checkbox A1 */}
                              <div
                                onClick={() => selectSubTopic("geoTopic1", "Location, Physical Features & Monsoon")}
                                className={getTopicRowClass("geoTopic1")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("geoTopic1", geoTopic1Checked)
                                  }`}>
                                    {isTopicActive("geoTopic1", geoTopic1Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("geoTopic1", geoTopic1Checked)}`}>
                                    Location, Physical Features & Monsoon
                                  </span>
                                  {completingTopicId === "geoTopic1" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Location, Physical Features & Monsoon");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-sky-100/50 rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#094a80]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Location, Physical Features & Monsoon"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>

                              {/* Checkbox A2 */}
                              <div
                                onClick={() => selectSubTopic("geoTopic2", "Water Resources, Rivers & Soil Types")}
                                className={getTopicRowClass("geoTopic2")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("geoTopic2", geoTopic2Checked)
                                  }`}>
                                    {isTopicActive("geoTopic2", geoTopic2Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("geoTopic2", geoTopic2Checked)}`}>
                                    Water Resources, Rivers & Soil Types
                                  </span>
                                  {completingTopicId === "geoTopic2" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Water Resources, Rivers & Soil Types");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-sky-100/50 rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#094a80]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Water Resources, Rivers & Soil Types"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* BLOCK B: Natural Resources */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-[12.5px] text-slate-800 tracking-tight">Forests & Wildlife</h5>
                              <span className={`text-[11px] font-bold ${isRevisionMode ? 'text-amber-800 bg-amber-50' : 'text-[#094a80] bg-[#e6f0fa]'} px-1.5 py-0.2 rounded`}>
                                {getHeaderCountStr(['geoTopic3'], [geoTopic3Checked])}
                              </span>
                            </div>

                            <div className="space-y-1.5 pl-1">
                              {/* Checkbox B1 */}
                              <div
                                onClick={() => selectSubTopic("geoTopic3", "Forests, Wildlife & Natural Vegetation")}
                                className={getTopicRowClass("geoTopic3")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("geoTopic3", geoTopic3Checked)
                                  }`}>
                                    {isTopicActive("geoTopic3", geoTopic3Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("geoTopic3", geoTopic3Checked)}`}>
                                    Forests, Wildlife & Natural Vegetation
                                  </span>
                                  {completingTopicId === "geoTopic3" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Forests, Wildlife & Natural Vegetation");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-sky-100/50 rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#094a80]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Forests, Wildlife & Natural Vegetation"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Expand Action Buttons panel */}
                      {(['geoTopic1','geoTopic2','geoTopic3'] as string[]).includes(selectedSubTopicId ?? '') && (
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleSyllabusAddTask("10:00 AM")}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-805 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-600" />
                          <span>Add Task</span>
                        </button>
                        <button
                          onClick={() => { const a = topicToggleActions[selectedSubTopicId!]; if (a) handleTopicMarkComplete(selectedSubTopicId!, a.checked, a.setter); }}
                          className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white ${isRevisionMode ? 'bg-[#d35400] hover:bg-[#b33e00]' : 'bg-[#094a80] hover:bg-[#07365e]'} rounded-lg active:scale-95 transition-transform cursor-pointer`}
                        >
                          <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                          <span>{isRevisionMode ? "Mark as Revised" : "Mark as Completed"}</span>
                        </button>
                      </div>
                      )}

                    </div>
                  )}
                </div>

                {/* SUBJECT CARD 3: HISTORY OF INDIA (25 QS) */}
                <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
                  <div 
                    onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                    className="p-5 flex items-center justify-between select-none relative overflow-hidden cursor-pointer"
                    style={{ 
                      backgroundImage: 'linear-gradient(135deg, rgba(174, 106, 28, 0.94) 0%, rgba(214, 143, 58, 0.8) 100%), url("https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: '#ffffff' 
                    }}
                  >
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-black/5">
                        <Clock className="w-6 h-6 stroke-[2.5] text-[#ae6a1c]" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-[14.5px] font-extrabold tracking-tight text-white leading-none">History of India (25 qs)</h4>
                        <span className="text-[10px] text-white/95 font-bold block mt-1.5">{getSubjectCountStr("History", compHis, totalHis, revHis)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="w-11 h-11 rounded-full bg-white text-[#ae6a1c] text-[12px] font-black flex items-center justify-center shadow-md shrink-0 select-none">
                        {getSubjectPct(compHis, totalHis, revHis)}%
                      </div>
                      {isHistoryExpanded ? (
                        <ChevronUp className="w-5 h-5 text-white stroke-[3]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white stroke-[3]" />
                      )}
                    </div>
                  </div>
                  <div className="w-full h-1 bg-slate-100 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#ae6a1c] transition-all duration-300" 
                      style={{ width: `${getSubjectPct(compHis, totalHis, revHis)}%` }} 
                    />
                  </div>

                  {/* List Body with precise hierarchy */}
                  {isHistoryExpanded && (
                    <div className="p-4 space-y-4 text-left">
                      
                      {/* Tree Track Visual Lines */}
                      <div className="flex gap-4">
                        
                        {/* Timeline tree lines left-side */}
                        <div className="flex flex-col items-center shrink-0 relative pt-1">
                          {/* Anchor Circle 1 */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isRevisionMode ? 'border-amber-500' : 'border-[#ae6a1c]'} bg-white z-10 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRevisionMode ? 'bg-amber-500' : 'bg-[#ae6a1c]'}`} />
                          </div>
                          <div className="w-[1.5px] bg-slate-200 flex-1 my-1" />
                          
                          {/* Anchor Circle 2 */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isRevisionMode ? 'border-amber-500' : 'border-[#ae6a1c]'} bg-white z-10 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRevisionMode ? 'bg-amber-500' : 'bg-[#ae6a1c]'}`} />
                          </div>
                        </div>

                        {/* Hierarchical checklist content block */}
                        <div className="flex-1 space-y-4">
                          
                          {/* BLOCK A: Ancient & Medieval */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-[12.5px] text-slate-800 tracking-tight">Ancient & Medieval Era</h5>
                              <span className={`text-[11px] font-bold ${isRevisionMode ? 'text-amber-800 bg-amber-50' : 'text-[#ae6a1c] bg-[#faf0e6]'} px-1.5 py-0.2 rounded`}>
                                {getHeaderCountStr(['hisTopic1', 'hisTopic2'], [hisTopic1Checked, hisTopic2Checked])}
                              </span>
                            </div>
                            
                            <div className="space-y-1.5 pl-1">
                              {/* Checkbox A1 */}
                              <div
                                onClick={() => selectSubTopic("hisTopic1", "Indus Valley Civilization & Vedic Age")}
                                className={getTopicRowClass("hisTopic1")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("hisTopic1", hisTopic1Checked)
                                  }`}>
                                    {isTopicActive("hisTopic1", hisTopic1Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("hisTopic1", hisTopic1Checked)}`}>
                                    Indus Valley Civilization & Vedic Age
                                  </span>
                                  {completingTopicId === "hisTopic1" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Indus Valley Civilization & Vedic Age");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-amber-100/50 rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#ae6a1c]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Indus Valley Civilization & Vedic Age"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>

                              {/* Checkbox A2 */}
                              <div
                                onClick={() => selectSubTopic("hisTopic2", "Guptas, Delhi Sultans, Mughals & Marathas")}
                                className={getTopicRowClass("hisTopic2")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("hisTopic2", hisTopic2Checked)
                                  }`}>
                                    {isTopicActive("hisTopic2", hisTopic2Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("hisTopic2", hisTopic2Checked)}`}>
                                    Guptas, Delhi Sultans, Mughals & Marathas
                                  </span>
                                  {completingTopicId === "hisTopic2" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Guptas, Delhi Sultans, Mughals & Marathas");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-amber-100/50 rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#ae6a1c]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Guptas, Delhi Sultans, Mughals & Marathas"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* BLOCK B: Modern India */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-[12.5px] text-slate-800 tracking-tight">Modern India & Reforms</h5>
                              <span className={`text-[11px] font-bold ${isRevisionMode ? 'text-amber-800 bg-amber-50' : 'text-[#ae6a1c] bg-[#faf0e6]'} px-1.5 py-0.2 rounded`}>
                                {getHeaderCountStr(['hisTopic3'], [hisTopic3Checked])}
                              </span>
                            </div>

                            <div className="space-y-1.5 pl-1">
                              {/* Checkbox B1 */}
                              <div
                                onClick={() => selectSubTopic("hisTopic3", "Indian National Movement & Social Reformers")}
                                className={getTopicRowClass("hisTopic3")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("hisTopic3", hisTopic3Checked)
                                  }`}>
                                    {isTopicActive("hisTopic3", hisTopic3Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("hisTopic3", hisTopic3Checked)}`}>
                                    Indian National Movement & Social Reformers
                                  </span>
                                  {completingTopicId === "hisTopic3" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Indian National Movement & Social Reformers");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-amber-100/50 rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#ae6a1c]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Indian National Movement & Social Reformers"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Expand Action Buttons panel */}
                      {(['hisTopic1','hisTopic2','hisTopic3'] as string[]).includes(selectedSubTopicId ?? '') && (
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleSyllabusAddTask("11:20 AM")}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-805 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-600" />
                          <span>Add Task</span>
                        </button>
                        <button
                          onClick={() => { const a = topicToggleActions[selectedSubTopicId!]; if (a) handleTopicMarkComplete(selectedSubTopicId!, a.checked, a.setter); }}
                          className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white ${isRevisionMode ? 'bg-[#d35400] hover:bg-[#b33e00]' : 'bg-[#ae6a1c] hover:bg-[#854d11]'} rounded-lg active:scale-95 transition-transform cursor-pointer`}
                        >
                          <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                          <span>{isRevisionMode ? "Mark as Revised" : "Mark as Completed"}</span>
                        </button>
                      </div>
                      )}

                    </div>
                  )}
                </div>

                {/* SUBJECT CARD 4: INDIAN POLITY (40 QS) */}
                <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
                  <div 
                    onClick={() => setIsPolityExpanded(!isPolityExpanded)}
                    className="p-5 flex items-center justify-between select-none relative overflow-hidden cursor-pointer"
                    style={{ 
                      backgroundImage: 'linear-gradient(135deg, rgba(7, 124, 81, 0.94) 0%, rgba(13, 184, 123, 0.8) 100%), url("https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: '#ffffff' 
                    }}
                  >
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-black/5">
                        <Building2 className="w-6 h-6 stroke-[2.2] text-[#077c51]" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-[14.5px] font-extrabold tracking-tight text-white leading-none">Indian Polity (40 qs)</h4>
                        <span className="text-[10px] text-white/95 font-bold block mt-1.5">{getSubjectCountStr("Polity", compPol, totalPol, revPol)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="w-11 h-11 rounded-full bg-white text-[#077c51] text-[12px] font-black flex items-center justify-center shadow-md shrink-0 select-none">
                        {getSubjectPct(compPol, totalPol, revPol)}%
                      </div>
                      {isPolityExpanded ? (
                        <ChevronUp className="w-5 h-5 text-white stroke-[3]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white stroke-[3]" />
                      )}
                    </div>
                  </div>
                  <div className="w-full h-1 bg-slate-100 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#077c51] transition-all duration-300" 
                      style={{ width: `${getSubjectPct(compPol, totalPol, revPol)}%` }} 
                    />
                  </div>

                  {/* List Body with precise hierarchy */}
                  {isPolityExpanded && (
                    <div className="p-4 space-y-4 text-left">
                      
                      {/* Tree Track Visual Lines */}
                      <div className="flex gap-4">
                        
                        {/* Timeline tree lines left-side */}
                        <div className="flex flex-col items-center shrink-0 relative pt-1">
                          {/* Anchor Circle 1 */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isRevisionMode ? 'border-amber-500' : 'border-[#077c51]'} bg-white z-10 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRevisionMode ? 'bg-amber-500' : 'bg-[#077c51]'}`} />
                          </div>
                          <div className="w-[1.5px] bg-slate-200 flex-1 my-1" />
                          
                          {/* Anchor Circle 2 */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isRevisionMode ? 'border-amber-500' : 'border-[#077c51]'} bg-white z-10 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRevisionMode ? 'bg-amber-500' : 'bg-[#077c51]'}`} />
                          </div>
                        </div>

                        {/* Hierarchical checklist content block */}
                        <div className="flex-1 space-y-4">
                          
                          {/* BLOCK A: Constitution */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-[12.5px] text-slate-800 tracking-tight">Constitution & Salient Features</h5>
                              <span className={`text-[11px] font-bold ${isRevisionMode ? 'text-amber-800 bg-amber-50' : 'text-[#077c51] bg-[#e6f5ef]'} px-1.5 py-0.2 rounded`}>
                                {getHeaderCountStr(['polTopic1', 'polTopic2'], [polTopic1Checked, polTopic2Checked])}
                              </span>
                            </div>
                            
                            <div className="space-y-1.5 pl-1">
                              {/* Checkbox A1 */}
                              <div
                                onClick={() => selectSubTopic("polTopic1", "Constitution of India, Preamble & Union")}
                                className={getTopicRowClass("polTopic1")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("polTopic1", polTopic1Checked)
                                  }`}>
                                    {isTopicActive("polTopic1", polTopic1Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("polTopic1", polTopic1Checked)}`}>
                                    Constitution of India, Preamble & Union
                                  </span>
                                  {completingTopicId === "polTopic1" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Constitution of India, Preamble & Union");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-[#e6f5ef] rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#077c51]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Constitution of India, Preamble & Union"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>

                              {/* Checkbox A2 */}
                              <div
                                onClick={() => selectSubTopic("polTopic2", "Citizenship, Fundamental Rights & Duties")}
                                className={getTopicRowClass("polTopic2")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("polTopic2", polTopic2Checked)
                                  }`}>
                                    {isTopicActive("polTopic2", polTopic2Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("polTopic2", polTopic2Checked)}`}>
                                    Citizenship, Fundamental Rights & Duties
                                  </span>
                                  {completingTopicId === "polTopic2" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Citizenship, Fundamental Rights & Duties");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-[#e6f5ef] rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#077c51]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Citizenship, Fundamental Rights & Duties"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* BLOCK B: Governance */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-[12.5px] text-slate-800 tracking-tight">Executive, State & Panchayats</h5>
                              <span className={`text-[11px] font-bold ${isRevisionMode ? 'text-amber-800 bg-amber-50' : 'text-[#077c51] bg-[#e6f5ef]'} px-1.5 py-0.2 rounded`}>
                                {getHeaderCountStr(['polTopic3'], [polTopic3Checked])}
                              </span>
                            </div>

                            <div className="space-y-1.5 pl-1">
                              {/* Checkbox B1 */}
                              <div
                                onClick={() => selectSubTopic("polTopic3", "Union Executive, Parliament, State & Panchayat Raj")}
                                className={getTopicRowClass("polTopic3")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("polTopic3", polTopic3Checked)
                                  }`}>
                                    {isTopicActive("polTopic3", polTopic3Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("polTopic3", polTopic3Checked)}`}>
                                    Union Executive, Parliament, State & Panchayat Raj
                                  </span>
                                  {completingTopicId === "polTopic3" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Union Executive, Parliament, State & Panchayat Raj");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-[#e6f5ef] rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#077c51]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Union Executive, Parliament, State & Panchayat Raj"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Expand Action Buttons panel */}
                      {(['polTopic1','polTopic2','polTopic3'] as string[]).includes(selectedSubTopicId ?? '') && (
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleSyllabusAddTask("2:00 PM")}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-805 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-600" />
                          <span>Add Task</span>
                        </button>
                        <button
                          onClick={() => { const a = topicToggleActions[selectedSubTopicId!]; if (a) handleTopicMarkComplete(selectedSubTopicId!, a.checked, a.setter); }}
                          className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white ${isRevisionMode ? 'bg-[#d35400] hover:bg-[#b33e00]' : 'bg-[#077c51] hover:bg-[#044c31]'} rounded-lg active:scale-95 transition-transform cursor-pointer`}
                        >
                          <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                          <span>{isRevisionMode ? "Mark as Revised" : "Mark as Completed"}</span>
                        </button>
                      </div>
                      )}

                    </div>
                  )}
                </div>

                {/* SUBJECT CARD 5: INDIAN ECONOMY (50 QS) */}
                <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
                  <div 
                    onClick={() => setIsEconomyExpanded(!isEconomyExpanded)}
                    className="p-5 flex items-center justify-between select-none relative overflow-hidden cursor-pointer"
                    style={{ 
                      backgroundImage: 'linear-gradient(135deg, rgba(89, 36, 171, 0.94) 0%, rgba(129, 81, 192, 0.8) 100%), url("https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: '#ffffff' 
                    }}
                  >
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-black/5">
                        <span className="font-extrabold text-[22px] leading-none mt-0.5 select-none font-sans text-[#5924ab]">₹</span>
                      </div>
                      <div className="text-left">
                        <h4 className="text-[14.5px] font-extrabold tracking-tight text-white leading-none">Indian Economy (50 qs)</h4>
                        <span className="text-[10px] text-white/95 font-bold block mt-1.5">{getSubjectCountStr("Economy", compEco, totalEco, revEco)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="w-11 h-11 rounded-full bg-white text-[#5924ab] text-[12px] font-black flex items-center justify-center shadow-md shrink-0 select-none">
                        {getSubjectPct(compEco, totalEco, revEco)}%
                      </div>
                      {isEconomyExpanded ? (
                        <ChevronUp className="w-5 h-5 text-white stroke-[3]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white stroke-[3]" />
                      )}
                    </div>
                  </div>
                  <div className="w-full h-1 bg-slate-100 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#5924ab] transition-all duration-300" 
                      style={{ width: `${getSubjectPct(compEco, totalEco, revEco)}%` }} 
                    />
                  </div>

                  {/* List Body with precise hierarchy */}
                  {isEconomyExpanded && (
                    <div className="p-4 space-y-4 text-left">
                      
                      {/* Tree Track Visual Lines */}
                      <div className="flex gap-4">
                        
                        {/* Timeline tree lines left-side */}
                        <div className="flex flex-col items-center shrink-0 relative pt-1">
                          {/* Anchor Circle 1 */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isRevisionMode ? 'border-amber-500' : 'border-[#5924ab]'} bg-white z-10 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRevisionMode ? 'bg-amber-500' : 'bg-[#5924ab]'}`} />
                          </div>
                          <div className="w-[1.5px] bg-slate-200 flex-1 my-1" />
                          
                          {/* Anchor Circle 2 */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isRevisionMode ? 'border-amber-500' : 'border-[#5924ab]'} bg-white z-10 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRevisionMode ? 'bg-amber-500' : 'bg-[#5924ab]'}`} />
                          </div>
                        </div>

                        {/* Hierarchical checklist content block */}
                        <div className="flex-1 space-y-4">
                          
                          {/* BLOCK A: Economic Planning */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-[12.5px] text-slate-800 tracking-tight">Economic Planning & Finance</h5>
                              <span className={`text-[11px] font-bold ${isRevisionMode ? 'text-amber-800 bg-amber-50' : 'text-[#5924ab] bg-[#f2eefb]'} px-1.5 py-0.2 rounded`}>
                                {getHeaderCountStr(['ecoTopic1', 'ecoTopic2'], [ecoTopic1Checked, ecoTopic2Checked])}
                              </span>
                            </div>
                            
                            <div className="space-y-1.5 pl-1">
                              {/* Checkbox A1 */}
                              <div
                                onClick={() => selectSubTopic("ecoTopic1", "Five Year Plans & NITI Aayog Functions")}
                                className={getTopicRowClass("ecoTopic1")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("ecoTopic1", ecoTopic1Checked)
                                  }`}>
                                    {isTopicActive("ecoTopic1", ecoTopic1Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("ecoTopic1", ecoTopic1Checked)}`}>
                                    Five Year Plans & NITI Aayog Functions
                                  </span>
                                  {completingTopicId === "ecoTopic1" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Five Year Plans & NITI Aayog Functions");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-[#f2eefb] rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#5924ab]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Five Year Plans & NITI Aayog Functions"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>

                              {/* Checkbox A2 */}
                              <div
                                onClick={() => selectSubTopic("ecoTopic2", "GST Structure, Public Finance & Direct/Indirect Taxes")}
                                className={getTopicRowClass("ecoTopic2")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("ecoTopic2", ecoTopic2Checked)
                                  }`}>
                                    {isTopicActive("ecoTopic2", ecoTopic2Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("ecoTopic2", ecoTopic2Checked)}`}>
                                    GST Structure, Public Finance & Direct/Indirect Taxes
                                  </span>
                                  {completingTopicId === "ecoTopic2" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("GST Structure, Public Finance & Direct/Indirect Taxes");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-[#f2eefb] rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#5924ab]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for GST Structure, Public Finance & Direct/Indirect Taxes"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* BLOCK B: Banking and Inflation */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-[12.5px] text-slate-800 tracking-tight">Banking & Monetary Policies</h5>
                              <span className={`text-[11px] font-bold ${isRevisionMode ? 'text-amber-800 bg-amber-50' : 'text-[#5924ab] bg-[#f2eefb]'} px-1.5 py-0.2 rounded`}>
                                {getHeaderCountStr(['ecoTopic3'], [ecoTopic3Checked])}
                              </span>
                            </div>

                            <div className="space-y-1.5 pl-1">
                              {/* Checkbox B1 */}
                              <div
                                onClick={() => selectSubTopic("ecoTopic3", "Inflation, RBI, Commercial Banks & Monetary Policy")}
                                className={getTopicRowClass("ecoTopic3")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("ecoTopic3", ecoTopic3Checked)
                                  }`}>
                                    {isTopicActive("ecoTopic3", ecoTopic3Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("ecoTopic3", ecoTopic3Checked)}`}>
                                    Inflation, RBI, Commercial Banks & Monetary Policy
                                  </span>
                                  {completingTopicId === "ecoTopic3" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Inflation, RBI, Commercial Banks & Monetary Policy");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-[#f2eefb] rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#5924ab]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Inflation, RBI, Commercial Banks & Monetary Policy"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Expand Action Buttons panel */}
                      {(['ecoTopic1','ecoTopic2','ecoTopic3'] as string[]).includes(selectedSubTopicId ?? '') && (
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleSyllabusAddTask("4:30 PM")}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-805 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-600" />
                          <span>Add Task</span>
                        </button>
                        <button
                          onClick={() => { const a = topicToggleActions[selectedSubTopicId!]; if (a) handleTopicMarkComplete(selectedSubTopicId!, a.checked, a.setter); }}
                          className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white ${isRevisionMode ? 'bg-[#d35400] hover:bg-[#b33e00]' : 'bg-[#5924ab] hover:bg-[#3d167a]'} rounded-lg active:scale-95 transition-transform cursor-pointer`}
                        >
                          <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                          <span>{isRevisionMode ? "Mark as Revised" : "Mark as Completed"}</span>
                        </button>
                      </div>
                      )}

                    </div>
                  )}
                </div>

                {/* SUBJECT CARD 6: HISTORY OF TAMIL NADU (40 QS) */}
                <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
                  <div 
                    onClick={() => setIsTamilNaduExpanded(!isTamilNaduExpanded)}
                    className="p-5 flex items-center justify-between select-none relative overflow-hidden cursor-pointer"
                    style={{ 
                      backgroundImage: 'linear-gradient(135deg, rgba(184, 53, 90, 0.94) 0%, rgba(229, 103, 137, 0.8) 100%), url("https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: '#ffffff' 
                    }}
                  >
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-black/5">
                        <Landmark className="w-6 h-6 stroke-[2.2] text-[#b8355a]" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-[14.5px] font-extrabold tracking-tight text-white leading-none">History of Tamil Nadu (40 qs)</h4>
                        <span className="text-[10px] text-white/95 font-bold block mt-1.5">{getSubjectCountStr("TamilNadu", compTam, totalTam, revTam)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="w-11 h-11 rounded-full bg-white text-[#b8355a] text-[12px] font-black flex items-center justify-center shadow-md shrink-0 select-none">
                        {getSubjectPct(compTam, totalTam, revTam)}%
                      </div>
                      {isTamilNaduExpanded ? (
                        <ChevronUp className="w-5 h-5 text-white stroke-[3]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white stroke-[3]" />
                      )}
                    </div>
                  </div>
                  <div className="w-full h-1 bg-slate-100 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#b8355a] transition-all duration-300" 
                      style={{ width: `${getSubjectPct(compTam, totalTam, revTam)}%` }} 
                    />
                  </div>

                  {/* List Body with precise hierarchy */}
                  {isTamilNaduExpanded && (
                    <div className="p-4 space-y-4 text-left">
                      
                      {/* Tree Track Visual Lines */}
                      <div className="flex gap-4">
                        
                        {/* Timeline tree lines left-side */}
                        <div className="flex flex-col items-center shrink-0 relative pt-1">
                          {/* Anchor Circle 1 */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isRevisionMode ? 'border-amber-500' : 'border-[#b8355a]'} bg-white z-10 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRevisionMode ? 'bg-amber-500' : 'bg-[#b8355a]'}`} />
                          </div>
                          <div className="w-[1.5px] bg-slate-200 flex-1 my-1" />
                          
                          {/* Anchor Circle 2 */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isRevisionMode ? 'border-amber-500' : 'border-[#b8355a]'} bg-white z-10 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRevisionMode ? 'bg-amber-500' : 'bg-[#b8355a]'}`} />
                          </div>
                        </div>

                        {/* Hierarchical checklist content block */}
                        <div className="flex-1 space-y-4">
                          
                          {/* BLOCK A: Tamil Culture & Kingdoms */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-[12.5px] text-slate-800 tracking-tight">Ancient Heritage & Dynasties</h5>
                              <span className={`text-[11px] font-bold ${isRevisionMode ? 'text-amber-800 bg-amber-50' : 'text-[#b8355a] bg-[#fbf0f3]'} px-1.5 py-0.2 rounded`}>
                                {getHeaderCountStr(['tamTopic1', 'tamTopic2'], [tamTopic1Checked, tamTopic2Checked])}
                              </span>
                            </div>
                            
                            <div className="space-y-1.5 pl-1">
                              {/* Checkbox A1 */}
                              <div
                                onClick={() => selectSubTopic("tamTopic1", "Sangam Age Literature & Early Tamil Society")}
                                className={getTopicRowClass("tamTopic1")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("tamTopic1", tamTopic1Checked)
                                  }`}>
                                    {isTopicActive("tamTopic1", tamTopic1Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("tamTopic1", tamTopic1Checked)}`}>
                                    Sangam Age Literature & Early Tamil Society
                                  </span>
                                  {completingTopicId === "tamTopic1" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Sangam Age Literature & Early Tamil Society");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-[#fbf0f3] rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#b8355a]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Sangam Age Literature & Early Tamil Society"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>

                              {/* Checkbox A2 */}
                              <div
                                onClick={() => selectSubTopic("tamTopic2", "Pallavas, Imperial Cholas & Pandyas Dynasties")}
                                className={getTopicRowClass("tamTopic2")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("tamTopic2", tamTopic2Checked)
                                  }`}>
                                    {isTopicActive("tamTopic2", tamTopic2Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("tamTopic2", tamTopic2Checked)}`}>
                                    Pallavas, Imperial Cholas & Pandyas Dynasties
                                  </span>
                                  {completingTopicId === "tamTopic2" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Pallavas, Imperial Cholas & Pandyas Dynasties");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-[#fbf0f3] rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#b8355a]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Pallavas, Imperial Cholas & Pandyas Dynasties"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* BLOCK B: Modern Movements */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-[12.5px] text-slate-800 tracking-tight">Social Reform Movements</h5>
                              <span className={`text-[11px] font-bold ${isRevisionMode ? 'text-amber-800 bg-amber-50' : 'text-[#b8355a] bg-[#fbf0f3]'} px-1.5 py-0.2 rounded`}>
                                {getHeaderCountStr(['tamTopic3'], [tamTopic3Checked])}
                              </span>
                            </div>

                            <div className="space-y-1.5 pl-1">
                              {/* Checkbox B1 */}
                              <div
                                onClick={() => selectSubTopic("tamTopic3", "Self-Respect Movement, Justice Party & Dravidian Legacy")}
                                className={getTopicRowClass("tamTopic3")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("tamTopic3", tamTopic3Checked)
                                  }`}>
                                    {isTopicActive("tamTopic3", tamTopic3Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("tamTopic3", tamTopic3Checked)}`}>
                                    Self-Respect Movement, Justice Party & Dravidian Legacy
                                  </span>
                                  {completingTopicId === "tamTopic3" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Self-Respect Movement, Justice Party & Dravidian Legacy");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-[#fbf0f3] rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#b8355a]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Self-Respect Movement, Justice Party & Dravidian Legacy"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Expand Action Buttons panel */}
                      {(['tamTopic1','tamTopic2','tamTopic3'] as string[]).includes(selectedSubTopicId ?? '') && (
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleSyllabusAddTask("12:15 PM")}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-805 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-600" />
                          <span>Add Task</span>
                        </button>
                        <button
                          onClick={() => { const a = topicToggleActions[selectedSubTopicId!]; if (a) handleTopicMarkComplete(selectedSubTopicId!, a.checked, a.setter); }}
                          className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white ${isRevisionMode ? 'bg-[#d35400] hover:bg-[#b33e00]' : 'bg-[#b8355a] hover:bg-[#8d203f]'} rounded-lg active:scale-95 transition-transform cursor-pointer`}
                        >
                          <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                          <span>{isRevisionMode ? "Mark as Revised" : "Mark as Completed"}</span>
                        </button>
                      </div>
                      )}

                    </div>
                  )}
                </div>

                {/* SUBJECT CARD 7: APTITUDE (25 QS) */}
                <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
                  <div 
                    onClick={() => setIsAptitudeExpanded(!isAptitudeExpanded)}
                    className="p-5 flex items-center justify-between select-none relative overflow-hidden cursor-pointer"
                    style={{ 
                      backgroundImage: 'linear-gradient(135deg, rgba(205, 106, 5, 0.94) 0%, rgba(226, 135, 32, 0.8) 100%), url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80")',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      color: '#ffffff' 
                    }}
                  >
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-black/5">
                        <Brain className="w-6 h-6 stroke-[2.2] text-[#cd6a05]" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-[14.5px] font-extrabold tracking-tight text-white leading-none">Aptitude (25 qs)</h4>
                        <span className="text-[10px] text-white/95 font-bold block mt-1.5">{getSubjectCountStr("Aptitude", compApt, totalApt, revApt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="w-11 h-11 rounded-full bg-white text-[#cd6a05] text-[12px] font-black flex items-center justify-center shadow-md shrink-0 select-none">
                        {getSubjectPct(compApt, totalApt, revApt)}%
                      </div>
                      {isAptitudeExpanded ? (
                        <ChevronUp className="w-5 h-5 text-white stroke-[3]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white stroke-[3]" />
                      )}
                    </div>
                  </div>
                  <div className="w-full h-1 bg-slate-100 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#cd6a05] transition-all duration-300" 
                      style={{ width: `${getSubjectPct(compApt, totalApt, revApt)}%` }} 
                    />
                  </div>

                  {/* List Body with precise hierarchy */}
                  {isAptitudeExpanded && (
                    <div className="p-4 space-y-4 text-left">
                      
                      {/* Tree Track Visual Lines */}
                      <div className="flex gap-4">
                        
                        {/* Timeline tree lines left-side */}
                        <div className="flex flex-col items-center shrink-0 relative pt-1">
                          {/* Anchor Circle 1 */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isRevisionMode ? 'border-amber-500' : 'border-[#cd6a05]'} bg-white z-10 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRevisionMode ? 'bg-amber-500' : 'bg-[#cd6a05]'}`} />
                          </div>
                          <div className="w-[1.5px] bg-slate-200 flex-1 my-1" />
                          
                          {/* Anchor Circle 2 */}
                          <div className={`w-3.5 h-3.5 rounded-full border-2 ${isRevisionMode ? 'border-amber-500' : 'border-[#cd6a05]'} bg-white z-10 flex items-center justify-center`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isRevisionMode ? 'bg-amber-500' : 'bg-[#cd6a05]'}`} />
                          </div>
                        </div>

                        {/* Hierarchical checklist content block */}
                        <div className="flex-1 space-y-4">
                          
                          {/* BLOCK A: Arithmetic */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-[12.5px] text-slate-800 tracking-tight">Arithmetic & Simplification</h5>
                              <span className={`text-[11px] font-bold ${isRevisionMode ? 'text-amber-800 bg-amber-50' : 'text-[#cd6a05] bg-[#faf0e6]'} px-1.5 py-0.2 rounded`}>
                                {getHeaderCountStr(['aptTopic1', 'aptTopic2'], [aptTopic1Checked, aptTopic2Checked])}
                              </span>
                            </div>
                            
                            <div className="space-y-1.5 pl-1">
                              {/* Checkbox A1 */}
                              <div
                                onClick={() => selectSubTopic("aptTopic1", "Simplification, Percentage, LCM & HCF")}
                                className={getTopicRowClass("aptTopic1")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("aptTopic1", aptTopic1Checked)
                                  }`}>
                                    {isTopicActive("aptTopic1", aptTopic1Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("aptTopic1", aptTopic1Checked)}`}>
                                    Simplification, Percentage, LCM & HCF
                                  </span>
                                  {completingTopicId === "aptTopic1" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Simplification, Percentage, LCM & HCF");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-[#faf0e6] rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#cd6a05]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Simplification, Percentage, LCM & HCF"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>

                              {/* Checkbox A2 */}
                              <div
                                onClick={() => selectSubTopic("aptTopic2", "Simple Interest & Compound Interest Formulae")}
                                className={getTopicRowClass("aptTopic2")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("aptTopic2", aptTopic2Checked)
                                  }`}>
                                    {isTopicActive("aptTopic2", aptTopic2Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("aptTopic2", aptTopic2Checked)}`}>
                                    Simple Interest & Compound Interest Formulae
                                  </span>
                                  {completingTopicId === "aptTopic2" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Simple Interest & Compound Interest Formulae");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-[#faf0e6] rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#cd6a05]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Simple Interest & Compound Interest Formulae"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* BLOCK B: Logical Ability */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-extrabold text-[12.5px] text-slate-800 tracking-tight">Analytical & Logical Ability</h5>
                              <span className={`text-[11px] font-bold ${isRevisionMode ? 'text-amber-800 bg-amber-50' : 'text-[#cd6a05] bg-[#faf0e6]'} px-1.5 py-0.2 rounded`}>
                                {getHeaderCountStr(['aptTopic3'], [aptTopic3Checked])}
                              </span>
                            </div>

                            <div className="space-y-1.5 pl-1">
                              {/* Checkbox B1 */}
                              <div
                                onClick={() => selectSubTopic("aptTopic3", "Ratio, Proportion, Time and Work & Reasoning")}
                                className={getTopicRowClass("aptTopic3")}
                              >
                                <div className="relative flex items-center gap-2 min-w-0">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition ${
                                    getTopicBoxClass("aptTopic3", aptTopic3Checked)
                                  }`}>
                                    {isTopicActive("aptTopic3", aptTopic3Checked) && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] tracking-tight truncate leading-tight ${getTopicTextClass("aptTopic3", aptTopic3Checked)}`}>
                                    Ratio, Proportion, Time and Work & Reasoning
                                  </span>
                                  {completingTopicId === "aptTopic3" && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-slate-500 topic-completing pointer-events-none" />
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPyqTopic("Ratio, Proportion, Time and Work & Reasoning");
                                  }}
                                  className={`p-1.5 -mr-1 hover:bg-[#faf0e6] rounded ${isRevisionMode ? 'text-amber-600 hover:bg-amber-100/50' : 'text-[#cd6a05]'} hover:scale-110 active:scale-95 transition cursor-pointer select-none flex items-center justify-center shrink-0`}
                                  title="View PMQs for Ratio, Proportion, Time and Work & Reasoning"
                                >
                                  <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Expand Action Buttons panel */}
                      {(['aptTopic1','aptTopic2','aptTopic3'] as string[]).includes(selectedSubTopicId ?? '') && (
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleSyllabusAddTask("3:40 PM")}
                          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-805 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 active:scale-95 transition-transform cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-slate-600" />
                          <span>Add Task</span>
                        </button>
                        <button
                          onClick={() => { const a = topicToggleActions[selectedSubTopicId!]; if (a) handleTopicMarkComplete(selectedSubTopicId!, a.checked, a.setter); }}
                          className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white ${isRevisionMode ? 'bg-[#d35400] hover:bg-[#b33e00]' : 'bg-[#cd6a05] hover:bg-[#8c4600]'} rounded-lg active:scale-95 transition-transform cursor-pointer`}
                        >
                          <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                          <span>{isRevisionMode ? "Mark as Revised" : "Mark as Completed"}</span>
                        </button>
                      </div>
                      )}

                    </div>
                  )}
                </div>

                </>}
                {/* ── END TNPSC / UPSC / CSE static subject cards ─────────── */}

              </div>

            </div>

          {/* VIEW: PRINT — COMING SOON */}
          <div className={`flex-1 animate-fade-in transition-all ${activeTab === "Print" ? "" : "hidden"}`}>
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] px-8 py-12 gap-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#01b6eb] to-[#01abff] flex items-center justify-center shadow-xl">
                <Printer className="w-9 h-9 text-white stroke-[2]" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#01abff]">Coming Soon</span>
                <h2 className="text-[22px] font-extrabold text-slate-800 leading-tight">Print Module</h2>
                <p className="text-slate-500 text-[13px] font-semibold leading-relaxed max-w-[260px]">
                  Compile and print your study notes as PDF cards. This feature is under development.
                </p>
              </div>
              <div className="w-full max-w-[260px] bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#01abff]" />
                  <span className="text-[12px] font-bold text-slate-600">PDF chapter compilation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                  <span className="text-[12px] font-bold text-slate-400">Custom notes builder</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                  <span className="text-[12px] font-bold text-slate-400">One-tap printer queue</span>
                </div>
              </div>
            </div>
          </div>

          {/* VIEW: FOOD — COMING SOON */}
          <div className={`flex-1 animate-fade-in transition-all ${activeTab === "Food" ? "" : "hidden"}`}>
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] px-8 py-12 gap-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#fea500] to-[#ff7000] flex items-center justify-center shadow-xl">
                <Coffee className="w-9 h-9 text-white stroke-[2]" />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#fea500]">Coming Soon</span>
                <h2 className="text-[22px] font-extrabold text-slate-800 leading-tight">Food Module</h2>
                <p className="text-slate-500 text-[13px] font-semibold leading-relaxed max-w-[260px]">
                  Track hydration and brain nutrition to stay sharp during long study sessions.
                </p>
              </div>
              <div className="w-full max-w-[260px] bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#fea500]" />
                  <span className="text-[12px] font-bold text-slate-600">Daily hydration tracker</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                  <span className="text-[12px] font-bold text-slate-400">Study snack calorie log</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                  <span className="text-[12px] font-bold text-slate-400">Brain food recommendations</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 6. Curvaceous Bottom Tab Dock Navigation */}
        {activeTab !== "Auth" && (
          <GroupComponent3 activeTab={activeTab} onChangeTab={(tab) => {
            setActiveTab(tab);
            setShowMyFocus(false);
            setShowAllFocusRecords(false);
            setDeleteConfirmItem(null);
          }} />
        )}

        {/* DELETE CONFIRMATION OVERLAY (Matches mockup perfectly) */}
        {deleteConfirmItem && (
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-6 z-50 animate-fade-in"
            id="delete-focus-record-overlay"
          >
            <div 
              className="bg-[#5a5555] rounded-2xl shadow-2xl w-[320px] p-5.5 relative border border-white/10 text-white flex flex-col items-center animate-scale-in"
              id="delete-focus-record-card"
            >
              {/* Close Button X */}
              <button 
                onClick={() => setDeleteConfirmItem(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:scale-110 active:scale-95 cursor-pointer transition-transform"
                id="delete-modal-close"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>

              {/* Title prompt */}
              <div className="text-white text-center font-bold text-[16px] px-2 leading-relaxed mt-4.5 mb-6">
                Are you sure you want Delete &nbsp;{deleteConfirmItem.title} ?
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-center gap-6 w-full pb-1">
                {/* Yes Button: Teal Green */}
                <button
                  onClick={() => {
                    setFocusRecords(prev => prev.filter(r => r.id !== deleteConfirmItem.id));
                    setFocusLogCount(prev => Math.max(0, prev - 1));
                    setDeleteConfirmItem(null);
                  }}
                  className="px-7 py-2 bg-[#0c8e66] hover:bg-[#125652] text-white text-[13.5px] font-extrabold rounded-md shadow-md active:scale-95 transition-all cursor-pointer min-w-[80px] text-center"
                  id="delete-confirm-yes"
                >
                  Yes
                </button>

                {/* No Button: White with dark letters */}
                <button
                  onClick={() => setDeleteConfirmItem(null)}
                  className="px-7 py-2 bg-white text-slate-800 text-[13.5px] font-extrabold rounded-md shadow-md hover:bg-slate-50 active:scale-95 transition-all cursor-pointer border border-slate-200 min-w-[80px] text-center"
                  id="delete-confirm-no"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

      </div>



      {/* Interactive Choose Exam sliding bottom sheet */}
      <ChooseExamSheet
        isOpen={isChooseExamOpen}
        onClose={() => setIsChooseExamOpen(false)}
        currentGroup={profile.group}
        onSelectGroup={(groupName) => {
          setProfile((prev) => ({
            ...prev,
            group: groupName,
          }));
        }}
      />

      {/* Slide-over Right-to-Left Choose PYQ sheet */}
      <AnimatePresence>
        {selectedPyqTopic !== null && (
          <PyqDrawer
            isOpen={selectedPyqTopic !== null}
            onClose={() => setSelectedPyqTopic(null)}
            topicName={selectedPyqTopic}
          />
        )}
      </AnimatePresence>

      {/* Syllabus Settings Sheet (Bottom-up slides nicely) */}
      <AnimatePresence>
        {isSyllabusSettingsOpen && (
          <SyllabusSettingsSheet
            isOpen={isSyllabusSettingsOpen}
            onClose={() => setIsSyllabusSettingsOpen(false)}
            isRevisionMode={isRevisionMode}
            onConfirm={handleSyllabusSettingsConfirm}
          />
        )}
      </AnimatePresence>

      {/* Modern syllabus toast notifications (non-blocking) */}
      <AnimatePresence>
        {syllabusToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[2000] px-4.5 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white shadow-2xl text-center text-[12px] font-black tracking-wide flex items-center gap-2 max-w-[290px] select-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-ping" />
            <span>{syllabusToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
