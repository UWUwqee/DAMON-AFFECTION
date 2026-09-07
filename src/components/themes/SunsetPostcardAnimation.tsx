import React, { useEffect, useRef } from 'react';

export const SunsetPostcardAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const clouds = Array.from({ length: 8 }, (_, index) => ({
      x: Math.random() * width,
      y: height * (0.18 + Math.random() * 0.34),
      width: 90 + Math.random() * 130,
      speed: 0.08 + Math.random() * 0.16,
      alpha: 0.12 + Math.random() * 0.18,
      offset: index
    }));

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      clouds.forEach((cloud) => {
        cloud.x += cloud.speed;
        if (cloud.x - cloud.width > width) cloud.x = -cloud.width * 1.5;
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y + Math.sin(Date.now() * 0.0003 + cloud.offset) * 4, cloud.width, 18, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 237, 213, ${cloud.alpha})`;
        ctx.fill();
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
      <div className="absolute inset-0 bg-gradient-to-b from-[#32152f] via-[#b84c55] to-[#f4a261]" />
      <div className="absolute left-1/2 top-[30%] -translate-x-1/2 w-56 h-56 rounded-full bg-amber-200/80 blur-[2px] shadow-[0_0_100px_rgba(255,214,120,0.7)] animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#39201f] via-[#693b38]/70 to-transparent" />
      <div className="absolute bottom-[18%] left-[8%] w-28 h-20 border-t-2 border-black/25 rounded-[50%] rotate-6" />
      <div className="absolute bottom-[21%] right-[12%] w-20 h-14 border-t-2 border-black/25 rounded-[50%] -rotate-6" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
