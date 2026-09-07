import React, { useEffect, useRef } from 'react';

export const HoneyedMorningAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const motes = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.45 + 0.15,
      phase: Math.random() * Math.PI * 2
    }));
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      motes.forEach((mote) => {
        mote.phase += 0.015;
        mote.y -= mote.speed;
        mote.x += Math.sin(mote.phase) * 0.35;
        if (mote.y < -10) {
          mote.y = height + 10;
          mote.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.42)';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#f59e0b';
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
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff7d6] via-[#f8d98b] to-[#d99a58] dark:from-[#34230e] dark:via-[#644016] dark:to-[#24140b]" />
      <div className="absolute -top-28 -right-20 w-[560px] h-[560px] rounded-full bg-yellow-200/35 dark:bg-amber-500/15 blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-amber-950/25 to-transparent" />
      <div className="absolute top-16 left-[12%] w-28 h-28 rounded-full border border-amber-900/15 dark:border-yellow-100/20 animate-spin" style={{ animationDuration: '28s' }} />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
