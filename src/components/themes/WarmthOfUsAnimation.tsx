import React, { useEffect, useRef } from 'react';

export const WarmthOfUsAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Golden Embers and Sparkles
    interface Ember {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      alpha: number;
      decay: number;
      color: string;
      wobble: number;
    }

    const emberColors = [
      'rgba(251, 146, 60, ',  // orange-400
      'rgba(245, 158, 11, ',  // amber-500
      'rgba(252, 211, 77, ',  // amber-300
      'rgba(244, 63, 94, ',   // rose-500
      'rgba(254, 240, 138, '  // yellow-200
    ];

    const embers: Ember[] = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * 200,
      size: Math.random() * 3.5 + 1.2,
      speedY: Math.random() * 1.6 + 0.8,
      speedX: (Math.random() - 0.5) * 0.8,
      alpha: Math.random() * 0.8 + 0.2,
      decay: Math.random() * 0.003 + 0.001,
      color: emberColors[Math.floor(Math.random() * emberColors.length)],
      wobble: Math.random() * Math.PI * 2
    }));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      embers.forEach((e) => {
        e.y -= e.speedY;
        e.wobble += 0.04;
        e.x += Math.sin(e.wobble) * 0.7 + e.speedX;
        e.alpha -= e.decay;

        if (e.y < -20 || e.alpha <= 0.05) {
          e.y = height + Math.random() * 50;
          e.x = Math.random() * width;
          e.alpha = Math.random() * 0.85 + 0.25;
        }

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fillStyle = `${e.color}${e.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#f59e0b';
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Rich Amber, Deep Rose, and Warm Orange Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1c0b0b] via-[#2a0e14] to-[#1a0f05]" />

      {/* Gentle Heat-Wave Glow Radiating Outward */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-amber-600/20 via-rose-600/25 to-orange-500/20 blur-[110px] animate-pulse" style={{ animationDuration: '4s' }} />

      {/* Slow-beating Animated Heart at the Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 dark:opacity-25 heartbeat-container">
        <svg viewBox="0 0 24 24" className="w-80 h-80 fill-rose-600 text-rose-500 filter drop-shadow-[0_0_40px_rgba(244,63,94,0.6)]">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      {/* Radiant Ember Sparkles Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <style>{`
        .heartbeat-container {
          animation: romantic-heartbeat 2.2s ease-in-out infinite;
        }
        @keyframes romantic-heartbeat {
          0% { transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
          12% { transform: translate(-50%, -50%) scale(1.08); filter: brightness(1.2); }
          22% { transform: translate(-50%, -50%) scale(1.02); }
          32% { transform: translate(-50%, -50%) scale(1.12); filter: brightness(1.3); }
          50% { transform: translate(-50%, -50%) scale(1); filter: brightness(1); }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
};
