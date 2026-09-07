import React from 'react';

export const PaperCranesAnimation: React.FC = () => {
  const cranes = Array.from({ length: 9 }, (_, index) => index);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#e8f4f8] via-[#c9e8ed] to-[#8dc6d2] dark:from-[#102b35] dark:via-[#164653] dark:to-[#1b5961]" />
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,white_0_1px,transparent_2px),radial-gradient(circle_at_70%_60%,white_0_1px,transparent_2px)] bg-[length:28px_28px]" />
      {cranes.map((crane) => (
        <div
          key={crane}
          className="absolute text-4xl sm:text-6xl text-white/60 animate-float-slow"
          style={{
            left: `${8 + ((crane * 23) % 88)}%`,
            top: `${12 + ((crane * 31) % 70)}%`,
            animationDelay: `${crane * -1.3}s`,
            animationDuration: `${9 + (crane % 4)}s`,
            transform: `rotate(${crane % 2 ? 8 : -8}deg)`
          }}
        >
          <span className="inline-block drop-shadow-[0_8px_8px_rgba(33,92,104,0.25)]">◇</span>
        </div>
      ))}
      <div className="absolute -left-20 top-1/4 w-[140%] h-px bg-white/50 rotate-[12deg] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute -left-20 top-2/3 w-[140%] h-px bg-white/40 -rotate-[8deg] animate-pulse" style={{ animationDuration: '6s' }} />
    </div>
  );
};
