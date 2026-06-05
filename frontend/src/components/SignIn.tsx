import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, CheckCircle } from 'lucide-react';
import { login, register } from '../api';


interface Props {
  onAuthSuccess?: () => void;
}

export default function SignIn({ onAuthSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign-up state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(loginEmail, loginPassword);
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('authUser', JSON.stringify({ fullName: data.user.fullName, email: data.user.email }));
      setLoading(false);
      onAuthSuccess?.();
    } catch {
      setError('Invalid email or password.');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await register(signupName, signupEmail, signupPassword);
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('authUser', JSON.stringify({ fullName: data.user.fullName, email: data.user.email }));
      setSuccess(`Welcome, ${data.user.fullName}!`);
      setLoading(false);
      setTimeout(() => onAuthSuccess?.(), 900);
    } catch {
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0d3b35]">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#125652]/40 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#27BCB3]/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo / App name */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">Aspirra</h1>
          <p className="text-[#95efde] text-sm mt-1 font-medium">Your TNPSC Study Companion</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-7 shadow-2xl">

          {/* Tab switcher */}
          <div className="flex bg-white/10 rounded-2xl p-1 mb-6 gap-1">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-[#125652] text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                mode === 'signup'
                  ? 'bg-[#125652] text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl px-4 py-3 mb-4">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-emerald-300 text-sm font-semibold">{success}</span>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 mb-4">
              <span className="text-red-300 text-sm font-semibold">{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#27BCB3]/60 transition"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#27BCB3]/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full py-3 rounded-xl bg-[#125652] hover:bg-[#0e4440] text-white font-bold text-sm transition active:scale-[0.98] disabled:opacity-60 shadow-lg"
              >
                {loading ? 'Signing in…' : 'Log In'}
              </button>

              <p className="text-center text-white/50 text-xs mt-1">
                No account?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-[#95efde] font-semibold hover:underline">
                  Sign up free
                </button>
              </p>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              {/* Full Name */}
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={signupName}
                  onChange={e => setSignupName(e.target.value)}
                  required
                  minLength={2}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#27BCB3]/60 transition"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={signupEmail}
                  onChange={e => setSignupEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#27BCB3]/60 transition"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min 6 chars)"
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#27BCB3]/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full py-3 rounded-xl bg-[#125652] hover:bg-[#0e4440] text-white font-bold text-sm transition active:scale-[0.98] disabled:opacity-60 shadow-lg"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>

              <p className="text-center text-white/50 text-xs mt-1">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="text-[#95efde] font-semibold hover:underline">
                  Log in
                </button>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-white/25 text-xs mt-6">
          Your data is stored securely on this device.
        </p>
      </div>
    </div>
  );
}
