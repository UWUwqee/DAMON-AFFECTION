import React from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const GothicLogo: React.FC<Props> = ({
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg' || size === 'xl';

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Gothic Ornate Crest Badge */}
      <div className="relative flex items-center justify-center">
        {/* Subtle dark crimson glow halo */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-rose-900/60 via-red-800/40 to-amber-900/30 blur-sm group-hover:blur-md transition-all duration-300 opacity-80" />

        {/* Outer ornate gothic crest */}
        <div className={`relative ${
          isSmall ? 'w-8 h-8 rounded-xl' : isLarge ? 'w-13 h-13 rounded-2xl' : 'w-10 h-10 rounded-2xl'
        } bg-gradient-to-b from-neutral-900 via-neutral-950 to-stone-950 border border-rose-900/70 shadow-lg shadow-black/80 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 ring-1 ring-amber-500/20`}>
          
          {/* Gothic background watermark texture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.18)_0%,transparent_70%)] pointer-events-none" />

          {/* Ornate corner flourishes */}
          <div className="absolute top-0.5 left-0.5 text-[8px] text-amber-500/40 leading-none pointer-events-none">❖</div>
          <div className="absolute top-0.5 right-0.5 text-[8px] text-amber-500/40 leading-none pointer-events-none">❖</div>
          <div className="absolute bottom-0.5 left-0.5 text-[8px] text-amber-500/40 leading-none pointer-events-none">❖</div>
          <div className="absolute bottom-0.5 right-0.5 text-[8px] text-amber-500/40 leading-none pointer-events-none">❖</div>

          {/* Center Gothic Emblem: Monogram 'D' with Gothic Rose & Heart Filigree */}
          <div className="relative flex items-center justify-center">
            <span className={`font-gothic ${
              isSmall ? 'text-lg' : isLarge ? 'text-3xl' : 'text-2xl'
            } text-rose-500 group-hover:text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)] leading-none transition-colors`}>
              𝔇
            </span>
            <span className={`absolute -bottom-1 text-[10px] text-amber-400/80 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)] leading-none`}>
              ❦
            </span>
          </div>
        </div>
      </div>

      {/* Gothic Typography Branding */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className={`font-cinzel tracking-wider font-extrabold ${
            isSmall ? 'text-base' : isLarge ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
          } text-neutral-900 dark:text-neutral-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-tight drop-shadow-sm`}>
            Damon’s Affection
          </span>
          <span className="text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-serif">†</span>
        </div>

        {/* Subtitle removed as requested */}
      </div>
    </div>
  );
};
