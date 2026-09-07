import React, { useState } from 'react';
import { LetterData } from '../types';
import { THEMES } from '../data/themes';
import { Heart, Sparkles, Feather, Lock } from 'lucide-react';
import { romanticAudio } from '../audio/romanticAudio';
import { PasswordGate } from './PasswordGate';

interface Props {
  letter: LetterData;
  onOpen: () => void;
}

export const EnvelopeView: React.FC<Props> = ({ letter, onOpen }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!letter.hasPassword || !letter.password);
  const [showPasswordGate, setShowPasswordGate] = useState<boolean>(
    Boolean(letter.hasPassword && letter.password)
  );

  const themeConfig = THEMES[letter.theme] || THEMES['blooming-heart'];

  const handleOpenLetter = () => {
    // If it requires a password and is not yet unlocked, show password gate
    if (letter.hasPassword && letter.password && !isUnlocked) {
      setShowPasswordGate(true);
      return;
    }

    if (isOpening) return;
    setIsOpening(true);

    // Start theme music if enabled
    if (letter.musicEnabled) {
      romanticAudio.playTheme(letter.theme);
    }

    setTimeout(() => {
      onOpen();
    }, 1200);
  };

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);
    setShowPasswordGate(false);
    // Proceed to open the envelope automatically upon successful unlock
    if (isOpening) return;
    setIsOpening(true);

    if (letter.musicEnabled) {
      romanticAudio.playTheme(letter.theme);
    }

    setTimeout(() => {
      onOpen();
    }, 1000);
  };

  const getSealIcon = () => {
    if (letter.hasPassword && !isUnlocked) {
      return '🔒';
    }

    switch (letter.envelopeSeal) {
      case 'golden-rose':
        return '🌹';
      case 'celestial-star':
        return '✨';
      case 'ocean-pearl':
        return '🌊';
      case 'botanical-leaf':
        return '🌿';
      default:
        return '❤️';
    }
  };

  // If password gate is active, show the PasswordGate component
  if (showPasswordGate && letter.hasPassword && letter.password && !isUnlocked) {
    return (
      <PasswordGate
        letter={letter}
        onUnlock={handleUnlockSuccess}
      />
    );
  }

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 select-none">
      {/* Gentle Floating Greeting */}
      <div className="text-center mb-8 max-w-md animate-float-slow">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase bg-white/70 dark:bg-black/40 backdrop-blur-md shadow-sm mb-3">
          <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="font-cinzel">
            {letter.pages && letter.pages.length > 1
              ? `Multi-Page Love Letter (${letter.pages.length} Pages)`
              : 'Special Delivery for You'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-vibes text-neutral-800 dark:text-neutral-100 tracking-wide drop-shadow-sm">
          A Love Letter has Arrived
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1 font-cormorant italic text-base">
          Someone who treasures you has sealed their heart inside Damon’s Affection.
        </p>
      </div>

      {/* Romantic Envelope Container */}
      <div 
        onClick={handleOpenLetter}
        className={`group relative w-full max-w-[340px] sm:max-w-[400px] h-[230px] sm:h-[260px] cursor-pointer transition-all duration-700 transform ${
          isOpening ? 'scale-105 opacity-0 -translate-y-12 pointer-events-none' : 'hover:scale-[1.03]'
        }`}
      >
        {/* Glow Aura behind envelope */}
        <div 
          className="absolute inset-0 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-500"
          style={{ backgroundColor: themeConfig.accentColor }}
        />

        {/* Envelope Body */}
        <div className={`relative w-full h-full rounded-2xl shadow-2xl border border-white/40 dark:border-white/10 overflow-hidden flex flex-col justify-between p-6 ${themeConfig.envelopeColor} text-white`}>
          
          {/* Top Stamp & Date */}
          <div className="flex items-start justify-between">
            <div className="text-left">
              <span className="text-[11px] uppercase tracking-widest opacity-75 font-cinzel block">
                Deliver to
              </span>
              <span className="text-xl sm:text-2xl font-script tracking-wide text-white drop-shadow-md">
                {letter.recipientName || 'My Dearest One'}
              </span>
            </div>

            {/* Romantic Stamp */}
            <div className="w-12 h-14 border border-dashed border-white/50 rounded bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center p-1 text-center shadow-inner">
              <span className="text-lg">{getSealIcon()}</span>
              <span className="text-[8px] uppercase tracking-wider text-white/80 mt-0.5 font-cinzel">LOVE</span>
            </div>
          </div>

          {/* Center Callout */}
          <div className="text-center my-auto">
            <div className="inline-block px-4 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/25 text-xs text-white/95 font-cinzel shadow-sm group-hover:bg-black/45 transition-colors">
              {letter.hasPassword && !isUnlocked ? (
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>Passcode Protected • Tap to Unlock</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block animate-pulse">💌</span>
                  <span>Tap to unseal & read</span>
                </span>
              )}
            </div>
          </div>

          {/* Bottom Sender & Postmark */}
          <div className="flex items-end justify-between border-t border-white/20 pt-3 text-xs text-white/80">
            <div className="flex items-center gap-1.5">
              <Feather className="w-3.5 h-3.5 opacity-80" />
              <span className="font-cormorant italic text-sm">From: {letter.senderName || 'Someone who loves you'}</span>
            </div>
            <span className="text-[11px] font-cinzel opacity-80">{letter.date}</span>
          </div>

          {/* Wax Seal at Envelope Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-18 sm:h-18 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.4)] flex items-center justify-center bg-gradient-to-tr from-red-700 via-rose-600 to-rose-500 border-2 border-amber-300/40 transform transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
            <div className="w-12 h-12 rounded-full border border-amber-200/40 flex items-center justify-center text-amber-100 shadow-inner">
              <span className="text-2xl drop-shadow-md">{getSealIcon()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
