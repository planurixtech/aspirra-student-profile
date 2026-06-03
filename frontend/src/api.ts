const STORAGE_KEY = 'aspirra_state';

const DEFAULT_STATE = {
  profile: {
    name: "Sangeetha",
    avatarLetter: "S",
    group: "TNPSC Group 1 - 2026",
    isVerified: true,
    email: "",
    phone: ""
  },
  targetHours: 4,
  completedMinutes: 60,
  weeklyMinutes: { Mon: 96, Tue: 48, Wed: 192, Thu: 24, Fri: 120, Sat: 216, Sun: 72 } as Record<string, number>,
  tasks: [
    { id: "task-1", title: "Historical Theory", time: "09 : 00 AM", completed: false },
    { id: "task-2", title: "Geography Templates", time: "10 : 00 AM", completed: true }
  ]
};

function readDb() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? { ...DEFAULT_STATE, ...JSON.parse(s) } : { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function writeDb(state: typeof DEFAULT_STATE) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function calcWeeklyLogs(state: typeof DEFAULT_STATE) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const targetMinutes = state.targetHours * 60;
  return days.map(day => ({
    day,
    percentage: targetMinutes > 0
      ? Math.min(Math.round(((state.weeklyMinutes[day] || 0) / targetMinutes) * 100), 100)
      : 0
  }));
}

export function getState() {
  const db = readDb();
  return {
    profile: db.profile,
    targetHours: db.targetHours,
    completedMinutes: db.completedMinutes,
    tasks: db.tasks,
    weeklyLogs: calcWeeklyLogs(db)
  };
}

export function saveTasks(tasks: any[]) {
  const db = readDb();
  writeDb({ ...db, tasks });
}

export function saveProfile(profile: any) {
  const db = readDb();
  writeDb({ ...db, profile });
}

export function updateTargetHours(targetHours: number) {
  const db = readDb();
  const updated = { ...db, targetHours };
  writeDb(updated);
  return calcWeeklyLogs(updated);
}

export function logStudySession(minutes: number) {
  const db = readDb();
  const completedMinutes = db.completedMinutes + minutes;
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = dayNames[new Date().getDay()];
  const weeklyMinutes = { ...db.weeklyMinutes, [today]: (db.weeklyMinutes[today] || 0) + minutes };
  const updated = { ...db, completedMinutes, weeklyMinutes };
  writeDb(updated);
  return { completedMinutes, weeklyLogs: calcWeeklyLogs(updated) };
}

export function resetAppState() {
  writeDb({ ...DEFAULT_STATE });
  return { ...DEFAULT_STATE, weeklyLogs: calcWeeklyLogs(DEFAULT_STATE) };
}
