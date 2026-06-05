const BASE = `${import.meta.env.VITE_API_URL ?? ''}/api`;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

type Profile = { name: string; avatarLetter: string; group: string; isVerified: boolean };
type Task = { id: string; title: string; time: string; completed: boolean };
type WeeklyLog = { day: string; percentage: number };

export async function getState() {
  return apiFetch<{
    profile: Profile;
    targetHours: number;
    completedMinutes: number;
    tasks: Task[];
    weeklyLogs: WeeklyLog[];
  }>('/state');
}

export async function saveTasks(tasks: any[]) {
  await apiFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify({ tasks }),
  });
}

export async function saveProfile(profile: any) {
  await apiFetch('/profile', {
    method: 'POST',
    body: JSON.stringify({
      name: profile.name,
      avatarLetter: profile.avatarLetter,
      group: profile.group,
      isVerified: profile.isVerified,
    }),
  });
}

export async function updateTargetHours(targetHours: number) {
  const data = await apiFetch<{ weeklyLogs: WeeklyLog[] }>('/target-hours', {
    method: 'POST',
    body: JSON.stringify({ targetHours }),
  });
  return data.weeklyLogs;
}

export async function logStudySession(minutes: number) {
  const data = await apiFetch<{ completedMinutes: number; weeklyLogs: WeeklyLog[] }>('/study-session', {
    method: 'POST',
    body: JSON.stringify({ minutes }),
  });
  return { completedMinutes: data.completedMinutes, weeklyLogs: data.weeklyLogs };
}

export async function resetAppState() {
  return apiFetch<{
    profile: Profile;
    targetHours: number;
    completedMinutes: number;
    tasks: Task[];
    weeklyLogs: WeeklyLog[];
  }>('/reset', { method: 'POST' });
}

type AuthResponse = { accessToken: string; user: { fullName: string; email: string } };

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(fullName: string, email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password }),
  });
}
