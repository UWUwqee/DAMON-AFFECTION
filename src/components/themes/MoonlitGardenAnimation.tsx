import React, { useEffect, useRef } from 'react';

export const MoonlitGardenAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const fireflies = Array.from({ length: 55 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 1,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.008,
      drift: Math.random() * 0.5 + 0.15
    }));

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      fireflies.forEach((fly) => {
        fly.phase += fly.speed;
        fly.x += Math.sin(fly.phase * 1.7) * fly.drift;
        fly.y -= Math.cos(fly.phase) * 0.12;
        if (fly.x < -10) fly.x = width + 10;
        if (fly.x > width + 10) fly.x = -10;
        if (fly.y < -10) fly.y = height + 10;
        const alpha = 0.2 + (Math.sin(fly.phase) + 1) * 0.35;
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, fly.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(253, 224, 71, ${alpha})`;
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#facc15';
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      frame = requestAnimationFrame(animate);
    };
    window.addEventListener('resize', resize);
    let frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[#071b1b] via-[#102f2a] to-[#183d32]" />
      <div className="absolute top-10 right-[12%] w-40 h-40 rounded-full bg-yellow-100/20 blur-2xl animate-pulse" style={{ animationDuration: '5s' }} />
      <div className="absolute -bottom-24 left-0 right-0 h-64 bg-gradient-to-t from-emerald-950/80 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-emerald-950/60 [clip-path:polygon(0_100%,0_65%,8%_76%,18%_52%,28%_78%,38%_45%,48%_72%,60%_48%,72%_77%,84%_50%,100%_70%,100%_100%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
