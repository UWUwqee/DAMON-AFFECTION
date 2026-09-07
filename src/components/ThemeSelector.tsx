import React from 'react';
import { ThemeId } from '../types';
import { THEMES } from '../data/themes';
import { Flower2, Sparkles, Flame, Leaf, Waves, Check, Volume2 } from 'lucide-react';
import { romanticAudio } from '../audio/romanticAudio';

interface Props {
  selectedTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
}

export const ThemeSelector: React.FC<Props> = ({ selectedTheme, onSelectTheme }) => {
  const getThemeIcon = (id: ThemeId) => {
    switch (id) {
      case 'blooming-heart':
        return <Flower2 className="w-4 h-4 text-rose-500" />;
      case 'starlit-promise':
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
      case 'warmth-of-us':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'seasons-of-love':
        return <Leaf className="w-4 h-4 text-amber-600" />;
      case 'ocean-of-my-heart':
        return <Waves className="w-4 h-4 text-teal-400" />;
    }
  };

  const playPreviewAudio = (e: React.MouseEvent, themeId: ThemeId) => {
    e.stopPropagation();
    romanticAudio.playTheme(themeId);
  };

  const themeList = Object.values(THEMES);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 font-sans-clean">
          <span>Choose Mood & Theme</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {themeList.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          return (
            <div
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`group relative text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                isSelected
                  ? 'border-rose-500 bg-white/90 dark:bg-neutral-900/90 shadow-lg shadow-rose-500/10 ring-2 ring-rose-500/30'
                  : 'border-neutral-200 dark:border-neutral-800/80 bg-white/50 dark:bg-neutral-900/40 hover:border-rose-300 dark:hover:border-neutral-700 hover:bg-white/70'
              }`}
            >
              {/* Subtle top gradient swatch bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5 opacity-80"
                style={{ backgroundColor: theme.accentColor }}
              />

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shadow-inner">
                    {getThemeIcon(theme.id)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 font-sans-clean">
                      {theme.name}
                    </h4>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-sans-clean block">
                      {theme.tagline}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => playPreviewAudio(e, theme.id)}
                    title="Play Kalapastangan by fitterkarma"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full text-neutral-400 hover:text-rose-500 transition-opacity"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
