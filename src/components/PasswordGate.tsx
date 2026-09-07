import React, { useState } from 'react';
import { LetterData } from '../types';
import { Lock, KeyRound, Eye, EyeOff, Sparkles, Heart, AlertCircle, ArrowRight } from 'lucide-react';
import { romanticAudio } from '../audio/romanticAudio';
import { kalapastanganAudio } from '../audio/kalapastanganAudio';

interface Props {
  letter: LetterData;
  onUnlock: () => void;
}

export const PasswordGate: React.FC<Props> = ({ letter, onUnlock }) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleAttemptUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passwordInput.trim()) {
      setError('Please enter the secret password to unseal this letter.');
      return;
    }

    // Case-insensitive or exact match comparison
    const expected = (letter.password || '').trim();
    const entered = passwordInput.trim();

    if (expected.toLowerCase() === entered.toLowerCase()) {
      setError(null);
      setIsUnlocking(true);
      romanticAudio.playApprovalChime();
      romanticAudio.playTheme(letter.theme);
      kalapastanganAudio.play();
      setTimeout(() => {
        onUnlock();
      }, 700);
    } else {
      setError('That secret key didn’t match... try again, my love.');
    }
  };

  return (
    <div className="relative z-20 min-h-screen flex items-center justify-center p-4 select-none">
      {/* Gothic Ambient Vignette Background */}
      <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md -z-10" />

      {/* Main Locked Card */}
      <div className={`relative w-full max-w-md rounded-3xl bg-neutral-900/90 border border-rose-900/60 shadow-[0_15px_40px_rgba(0,0,0,0.8)] p-6 sm:p-8 text-neutral-100 overflow-hidden transition-all duration-500 ${
        isUnlocking ? 'scale-105 opacity-0 -translate-y-6 pointer-events-none' : 'scale-100'
      }`}>
        
        {/* Ornate corner gothic accents */}
        <div className="absolute top-2 left-2 text-rose-500/30 text-xs font-serif select-none pointer-events-none">❖</div>
        <div className="absolute top-2 right-2 text-rose-500/30 text-xs font-serif select-none pointer-events-none">❖</div>
        <div className="absolute bottom-2 left-2 text-rose-500/30 text-xs font-serif select-none pointer-events-none">❖</div>
        <div className="absolute bottom-2 right-2 text-rose-500/30 text-xs font-serif select-none pointer-events-none">❖</div>

        {/* Locked Crest Icon */}
        <div className="text-center mb-6 pt-2">
          <div className="relative w-16 h-16 mx-auto rounded-full bg-gradient-to-b from-rose-950/80 to-neutral-950 border-2 border-rose-600/60 shadow-lg shadow-rose-900/30 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-rose-500/15 animate-ping" style={{ animationDuration: '3s' }} />
            <Lock className="w-7 h-7 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
          </div>
        </div>

        {/* Password Hint (if provided by creator) */}
        {letter.passwordHint && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-left">
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-cinzel font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Hint from your love:</span>
            </div>
            <p className="text-xs font-cormorant italic text-sm text-neutral-200">
              "{letter.passwordHint}"
            </p>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleAttemptUnlock} className="space-y-4">
          <div>
            <label className="text-xs font-cinzel tracking-wider text-neutral-400 uppercase block mb-1.5">
              Secret Passcode
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter the secret word or date..."
                autoFocus
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-neutral-950/90 border border-neutral-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm font-sans-clean text-neutral-100 placeholder:text-neutral-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-1 rounded-lg transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-900/60 p-2.5 rounded-xl font-sans-clean animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Unlock Submit Button */}
          <button
            type="submit"
            disabled={isUnlocking}
            className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-cinzel font-semibold text-xs sm:text-sm tracking-wider shadow-lg shadow-rose-900/40 hover:shadow-rose-900/60 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Heart className="w-4 h-4 fill-white text-white" />
            <span>{isUnlocking ? 'Unsealing Heart...' : 'Unlock & Read Letter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
