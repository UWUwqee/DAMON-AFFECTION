import React, { useState } from 'react';
import { ThemeId } from '../types';
import { THEMES, SAMPLE_LETTERS } from '../data/themes';
import { romanticAudio } from '../audio/romanticAudio';
import { Sparkles, Heart, Play, Volume2, ArrowRight, CheckCircle2, ShieldCheck, Smartphone, Music } from 'lucide-react';

interface Props {
  onSelectThemeToCreate: (theme: ThemeId) => void;
}

export const ThemeGalleryView: React.FC<Props> = ({ onSelectThemeToCreate }) => {
  const [activeThemePreview, setActiveThemePreview] = useState<ThemeId>('blooming-heart');
  const [playingTheme, setPlayingTheme] = useState<ThemeId | null>(null);

  const toggleSoundtrack = (themeId: ThemeId) => {
    if (playingTheme === themeId) {
      romanticAudio.stop();
      setPlayingTheme(null);
    } else {
      romanticAudio.playTheme(themeId);
      setPlayingTheme(themeId);
    }
  };

  const themeList = Object.values(THEMES);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 space-y-16">
      
      {/* Hero Intro */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-semibold uppercase tracking-wider mb-3 font-sans-clean">
          <Sparkles className="w-3.5 h-3.5" />
          <span>5 Living Animated Moods</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-vibes text-neutral-900 dark:text-white leading-tight">
          Love Letters that Breathe with Emotion
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-sans-clean mt-3">
          Every love story has its own rhythm. Choose a theme where particles, typography, and music harmonize to bring your heartfelt words to life.
        </p>
      </div>

      {/* Gallery Showcase Cards */}
      <div className="space-y-8">
        {themeList.map((theme, idx) => {
          const sample = SAMPLE_LETTERS[theme.id];
          const isPlaying = playingTheme === theme.id;

          return (
            <div
              key={theme.id}
              className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                
                {/* Left Visual Description */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 font-sans-clean">
                        Theme 0{idx + 1}
                      </span>
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-medium text-white font-sans-clean"
                        style={{ backgroundColor: theme.accentColor }}
                      >
                        {theme.tagline}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-vibes text-neutral-900 dark:text-white">
                      {theme.name}
                    </h3>
                  </div>

                  {/* Audio Preview & Action */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      onClick={() => toggleSoundtrack(theme.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium font-sans-clean flex items-center gap-2 transition-all ${
                        isPlaying
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse-subtle'
                          : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isPlaying ? 'Pause Music' : 'Play Kalapastangan'}</span>
                    </button>

                    <button
                      onClick={() => onSelectThemeToCreate(theme.id)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-semibold font-sans-clean flex items-center gap-1.5 shadow-md shadow-rose-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all ml-auto"
                    >
                      <span>Create Letter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right Sample Quote & Styling Preview */}
                <div className={`lg:col-span-5 p-6 sm:p-8 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 relative overflow-hidden`}>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-sans-clean block mb-2">
                    Sample Excerpt Preview
                  </span>
                  <h4 className="text-lg font-cormorant italic text-neutral-900 dark:text-neutral-100 font-medium mb-3">
                    "{sample.title}"
                  </h4>
                  <p className={`text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 ${theme.fontFamily} line-clamp-4`}>
                    {sample.content}
                  </p>
                  <div className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 text-xs font-sans-clean text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
                    <span>From: {sample.senderName}</span>
                    <span className="italic font-cormorant">To: {sample.recipientName}</span>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* How It Works Section */}
      <div className="rounded-3xl p-8 sm:p-12 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-semibold uppercase tracking-wider mb-2 font-sans-clean">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>Simplicity & Emotion</span>
          </div>
          <h2 className="text-3xl font-vibes text-neutral-900 dark:text-white">
            How Affectionate Link Works
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-sans-clean mt-1">
            Expressing love shouldn't require tedious signups or complicated tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-sm font-sans-clean mb-3">
              1
            </div>
            <h4 className="font-semibold text-sm text-neutral-900 dark:text-white font-sans-clean mb-1">
              Select Your Mood
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans-clean leading-relaxed">
              Pick from 5 animated themes ranging from sweet blooming roses to deep ocean calm and cosmic starlight.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-sm font-sans-clean mb-3">
              2
            </div>
            <h4 className="font-semibold text-sm text-neutral-900 dark:text-white font-sans-clean mb-1">
              Write Your Letter
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans-clean leading-relaxed">
              Type your personal words or inspire yourself with starter presets and our AI Romantic Spark assistant.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-sm font-sans-clean mb-3">
              3
            </div>
            <h4 className="font-semibold text-sm text-neutral-900 dark:text-white font-sans-clean mb-1">
              Share Unique Link
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans-clean leading-relaxed">
              Get an instant link with QR code. Send via WhatsApp, SMS, or Telegram. No accounts or downloads required.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-sm font-sans-clean mb-3">
              4
            </div>
            <h4 className="font-semibold text-sm text-neutral-900 dark:text-white font-sans-clean mb-1">
              Approval Dashboard
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-sans-clean leading-relaxed">
              When they open your letter, they can approve with love and leave a sweet note back that appears in your dashboard!
            </p>
          </div>
        </div>

        {/* Guarantees */}
        <div className="mt-10 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-around gap-4 text-xs font-sans-clean text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Private & direct sharing</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-rose-500" />
            <span>Mobile-optimized for phones & tablets</span>
          </div>
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-indigo-400" />
            <span>Zero external audio lag</span>
          </div>
        </div>
      </div>
    </div>
  );
};
