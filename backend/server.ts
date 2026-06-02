import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'backend', 'study-db.json');

app.use(express.json());

// Initial database structure
const DEFAULT_STATE = {
  profile: {
    name: "Sangeetha",
    avatarLetter: "S",
    group: "TNPSC Group 1 - 2026",
    isVerified: true
  },
  targetHours: 4,
  completedMinutes: 60,
  weeklyMinutes: {
    "Mon": 96,
    "Tue": 48,
    "Wed": 192,
    "Thu": 24,
    "Fri": 120,
    "Sat": 216,
    "Sun": 72
  },
  tasks: [
    {
      id: "task-1",
      title: "Historical Theory",
      time: "09 : 00 AM",
      completed: false
    },
    {
      id: "task-2",
      title: "Geography Templates",
      time: "10 : 00 AM",
      completed: true
    }
  ]
};

// Ensure database file exists
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_STATE, null, 2), 'utf-8');
      return DEFAULT_STATE;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading study-db.json:', err);
    return DEFAULT_STATE;
  }
}

function writeDb(state: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing study-db.json:', err);
  }
}

// Helpers to compute weekly logs with actual percentages based on current target hours
function calculateWeeklyLogs(state: any) {
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const targetMinutes = state.targetHours * 60;
  
  return weekdays.map(day => {
    const minutes = state.weeklyMinutes[day] || 0;
    const percentage = targetMinutes > 0
      ? Math.min(Math.round((minutes / targetMinutes) * 100), 100)
      : 0;
    return { day, percentage };
  });
}

// REST API Endpoints
app.get('/api/state', (req, res) => {
  const db = readDb();
  const logs = calculateWeeklyLogs(db);
  res.json({
    profile: db.profile,
    targetHours: db.targetHours,
    completedMinutes: db.completedMinutes,
    tasks: db.tasks,
    weeklyLogs: logs
  });
});

app.post('/api/target-hours', (req, res) => {
  const { targetHours } = req.body;
  const db = readDb();
  if (typeof targetHours === 'number' && targetHours >= 1 && targetHours <= 24) {
    db.targetHours = targetHours;
    writeDb(db);
  }
  const logs = calculateWeeklyLogs(db);
  res.json({
    status: 'success',
    targetHours: db.targetHours,
    weeklyLogs: logs
  });
});

app.post('/api/study-session', (req, res) => {
  const { minutes } = req.body;
  const db = readDb();
  if (typeof minutes === 'number' && minutes > 0) {
    db.completedMinutes += minutes;
    
    // Increment logs on the current weekday
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDay = weekdayNames[new Date().getDay()];
    
    // Add minutes studied to current day structure
    db.weeklyMinutes[currentDay] = (db.weeklyMinutes[currentDay] || 0) + minutes;
    writeDb(db);
  }
  const logs = calculateWeeklyLogs(db);
  res.json({
    status: 'success',
    completedMinutes: db.completedMinutes,
    weeklyLogs: logs
  });
});

app.post('/api/profile', (req, res) => {
  const { name, avatarLetter, group } = req.body;
  const db = readDb();
  if (db.profile) {
    if (typeof name === 'string') db.profile.name = name;
    if (typeof avatarLetter === 'string') db.profile.avatarLetter = avatarLetter;
    if (typeof group === 'string') db.profile.group = group;
    writeDb(db);
  }
  res.json({ status: 'success', profile: db.profile });
});

app.post('/api/tasks', (req, res) => {
  const { tasks } = req.body;
  const db = readDb();
  if (Array.isArray(tasks)) {
    db.tasks = tasks;
    writeDb(db);
  }
  res.json({ status: 'success', tasks: db.tasks });
});

app.post('/api/reset', (req, res) => {
  writeDb(DEFAULT_STATE);
  const logs = calculateWeeklyLogs(DEFAULT_STATE);
  res.json({
    status: 'success',
    ...DEFAULT_STATE,
    weeklyLogs: logs
  });
});

// Configure Vite middleware in development or route file serving in production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(process.cwd(), 'frontend')
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Study Portal backend server running on http://localhost:${PORT}`);
  });
}

start();
