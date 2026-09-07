import React, { useEffect, useRef } from 'react';

export const RosewaterRainAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const drops = Array.from({ length: 85 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 14 + 7,
      speed: Math.random() * 3 + 3,
      alpha: Math.random() * 0.35 + 0.15
    }));
    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      drops.forEach((drop) => {
        drop.y += drop.speed;
        drop.x += 0.35;
        if (drop.y > height + 20) {
          drop.y = -20;
          drop.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + 2, drop.y + drop.length);
        ctx.strokeStyle = `rgba(251, 113, 133, ${drop.alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
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
      <div className="absolute inset-0 bg-gradient-to-br from-[#210f1b] via-[#4a1f35] to-[#211b32]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-rose-500/15 blur-[120px] animate-pulse" style={{ animationDuration: '5s' }} />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#160d1d] to-transparent" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-12 right-12 w-20 h-20 rounded-full border border-rose-200/25 animate-ping" style={{ animationDuration: '4s' }} />
    </div>
  );
};
