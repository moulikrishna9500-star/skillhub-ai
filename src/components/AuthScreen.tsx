import React, { useState } from 'react';
import { Logo } from './Logo';
import { Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Sparkles, Clock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

const generateInitialsAvatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=3525cd&color=fff&size=160&bold=true`;

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [signupCooldownUntil, setSignupCooldownUntil] = useState<number | null>(null);

  const getFriendlyAuthError = (message?: string | null) => {
    const normalized = (message ?? '').toLowerCase();

    if (normalized.includes('email rate limit exceeded') || normalized.includes('rate limit') || normalized.includes('too many')) {
      return 'Too many email requests for this account. Please wait a few minutes and try again, or use a different email address.';
    }

    if (normalized.includes('user already registered') || normalized.includes('already registered')) {
      return 'An account already exists for this email. Please sign in instead.';
    }

    if (normalized.includes('invalid login credentials') || normalized.includes('invalid credentials')) {
      return 'Incorrect email or password. Please check your details and try again.';
    }

    return message ?? 'Something went wrong. Please try again.';
  };

  // Map supabase profile row → UserProfile
  const rowToProfile = (row: Record<string, any>, email: string): UserProfile => ({
    id: row.id,
    email,
    phone: row.phone ?? '',
    name: row.name ?? 'Member',
    avatar: row.avatar || generateInitialsAvatar(row.name ?? 'Member'),
    headline: row.badge ?? 'Community Member & Skill Swapper',
    location: '',
    timezone: row.timezone ?? 'UTC',
    rating: Number(row.rating) || 0,
    reviewsCount: Number(row.reviews_count) || 0,
    teaches: Array.isArray(row.skills_teach) ? row.skills_teach : [],
    wantsToLearn: Array.isArray(row.skills_learn) ? row.skills_learn : [],
    availabilityHours: 2,
    bio: row.bio ?? '',
    hoursBanked: row.hours_taught ?? 0,
    swapsCompleted: row.total_sessions ?? 0,
    isOnline: true,
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMessage(null);
    const email = loginEmail.trim();
    if (!email) { setErrorMessage('Please enter your email address.'); return; }
    if (!loginPassword) { setErrorMessage('Please enter your password.'); return; }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: loginPassword });

      if (error || !data.user) {
        setErrorMessage(getFriendlyAuthError(error?.message));
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      onLogin(rowToProfile(profile ?? {}, email));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const now = Date.now();
    if (signupCooldownUntil && now < signupCooldownUntil) {
      const waitSeconds = Math.ceil((signupCooldownUntil - now) / 1000);
      setErrorMessage(`Please wait ${waitSeconds} seconds before creating another account with this email.`);
      return;
    }

    setErrorMessage(null);
    const name = signupName.trim();
    const email = signupEmail.trim();

    if (!name) { setErrorMessage('Please enter your full name.'); return; }
    if (!email || !email.includes('@')) { setErrorMessage('Please provide a valid email address.'); return; }
    if (signupPassword.length < 6) { setErrorMessage('Password must be at least 6 characters.'); return; }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({ email, password: signupPassword });

      if (error || !data.user) {
        const friendlyMessage = getFriendlyAuthError(error?.message);
        if (friendlyMessage.toLowerCase().includes('wait a few minutes') || friendlyMessage.toLowerCase().includes('please wait')) {
          setSignupCooldownUntil(Date.now() + 60000);
        }
        setErrorMessage(friendlyMessage);
        return;
      }

      const userId = data.user.id;
      const avatar = generateInitialsAvatar(name);

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        name,
        email,
        phone: signupPhone.trim() || null,
        avatar,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        skills_teach: [],
        skills_learn: [],
        bio: '',
      }, { onConflict: 'id' });

      if (profileError) {
        setErrorMessage(getFriendlyAuthError(profileError.message));
        return;
      }

      onLogin({
        id: userId,
        email,
        phone: signupPhone.trim() || '',
        name,
        avatar,
        headline: 'Community Member & Skill Swapper',
        location: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        rating: 0,
        reviewsCount: 0,
        teaches: [],
        wantsToLearn: [],
        availabilityHours: 2,
        bio: '',
        hoursBanked: 0,
        swapsCompleted: 0,
        isOnline: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col justify-between text-[#131b2e]">
      {/* Header */}
      <header className="w-full bg-white border-b border-[#e2e8f0] py-4 px-6 sm:px-10 flex items-center justify-between">
        <Logo size="md" text="SkillHub AI" />
        <div className="flex items-center gap-2 text-xs font-semibold text-[#00714d] bg-[#6cf8bb]/20 px-3 py-1 rounded-full border border-[#6cf8bb]/40">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00a86b]" />
          100% Free Peer Barter
        </div>
      </header>

      {/* Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-6 sm:p-8">

          {/* Tabs */}
          <div className="flex p-1 bg-[#f1f5f9] rounded-xl mb-6">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setErrorMessage(null); }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === m ? 'bg-white text-[#131b2e] shadow-xs' : 'text-[#777587] hover:text-[#131b2e]'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[#131b2e] tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Join SkillHub AI'}
            </h1>
            <p className="text-xs sm:text-sm text-[#777587] mt-1">
              {mode === 'login'
                ? 'Sign in to access your swaps, mentors, and time bank balance.'
                : 'Trade your knowledge 1:1 with peers across the globe.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#777587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-email-input"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#131b2e] focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#777587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password-input"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#131b2e] focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-all"
                  />
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777587] hover:text-[#131b2e] cursor-pointer"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}>
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button id="login-submit-btn" type="submit" disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#3525cd] hover:bg-[#2b1cb5] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-70">
                {isLoading ? <span>Signing In...</span> : <><span>Sign In to SkillHub</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4" noValidate>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#777587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-name-input"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#131b2e] focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#777587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-email-input"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#131b2e] focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-all"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1.5">
                  Phone Number <span className="font-normal text-[#777587] normal-case">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#777587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-phone-input"
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    autoComplete="tel"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#131b2e] focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1.5">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#777587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-password-input"
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#e2e8f0] rounded-xl text-sm text-[#131b2e] focus:outline-none focus:border-[#3525cd] focus:ring-1 focus:ring-[#3525cd] transition-all"
                  />
                  <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777587] hover:text-[#131b2e] cursor-pointer"
                    aria-label={showSignupPassword ? 'Hide password' : 'Show password'}>
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button id="signup-submit-btn" type="submit" disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#006c49] hover:bg-[#005a3c] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-70">
                {isLoading ? <span>Creating Account...</span> : <><span>Create Account & Continue</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#f1f5f9] text-center">
            <p className="text-[11px] text-[#777587]">
              By continuing, you agree to exchange knowledge in a fair 1:1 time credit model.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Banner */}
      <footer className="bg-white border-t border-[#e2e8f0] py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs text-[#464555]">
          <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#00a86b]" /><span>Zero Subscription Fees</span></div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#3525cd]" /><span>1 Hour Taught = 1 Hour Learned</span></div>
          <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#3525cd]" /><span>AI Powered Skill Matching</span></div>
        </div>
      </footer>
    </div>
  );
};
