import React, { useState } from 'react';
import { 
  registerCreator, 
  loginCreator, 
  loginWithGoogle 
} from '../services/firebase';
import { CreatorUser } from '../types';
import { GothicLogo } from './GothicLogo';
import { Mail, Lock, User as UserIcon, AlertCircle, Sparkles, Heart, ArrowRight } from 'lucide-react';

interface Props {
  onSuccess: (user: CreatorUser) => void;
}

export const AuthScreen: React.FC<Props> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please provide both your email and password');
        }
        if (password.length < 6) {
          throw new Error('Password should be at least 6 characters');
        }
        const user = await registerCreator(email.trim(), password, displayName.trim() || undefined);
        onSuccess(user);
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please provide both your email and password');
        }
        const user = await loginCreator(email.trim(), password);
        onSuccess(user);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email. Please register.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Try signing in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      onSuccess(user);
    } catch (err: any) {
      console.error('Google auth error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in was closed before completing');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups.');
      } else {
        setError(err.message || 'Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d12] text-neutral-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-rose-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-950/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating background decorative hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <Heart className="absolute top-12 left-12 w-6 h-6 text-rose-500/20 animate-pulse" />
        <Heart className="absolute bottom-20 left-20 w-8 h-8 text-rose-500/15 animate-bounce duration-1000" />
        <Heart className="absolute top-24 right-16 w-5 h-5 text-rose-500/20 animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center">
            <GothicLogo size="lg" showSubtitle={false} />
          </div>
        </div>

        {/* Auth Card Container */}
        <div className="rounded-3xl bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 shadow-2xl p-5 sm:p-8">
          
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-neutral-950 border border-neutral-800/80 mb-6 font-sans-clean text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2.5 rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`py-2.5 rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40 font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Quick Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl border border-neutral-700 hover:border-neutral-600 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 hover:text-white font-medium text-xs font-sans-clean flex items-center justify-center gap-3 transition-all shadow-sm group mb-5 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Connect with Google Account</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-neutral-800 w-full" />
            <span className="bg-neutral-900 px-3 text-[10px] text-neutral-500 font-sans-clean uppercase tracking-widest absolute">
              or with email & password
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-2.5 text-rose-300 text-xs font-sans-clean">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 font-sans-clean">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5 font-cinzel tracking-wider">
                  Pen Name / Creator Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g., Damon"
                    className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-2xl border border-neutral-800 bg-neutral-950/80 text-base sm:text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 font-cinzel tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-2xl border border-neutral-800 bg-neutral-950/80 text-base sm:text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 font-cinzel tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 rounded-2xl border border-neutral-800 bg-neutral-950/80 text-base sm:text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 text-white text-xs font-semibold font-cinzel tracking-wider shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>{mode === 'register' ? 'Register & Enter Sanctuary' : 'Sign In & Enter'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
