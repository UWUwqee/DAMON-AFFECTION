import React, { useEffect, useRef } from 'react';

export const SeasonsOfLoveAnimation: React.FC = () => {
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

    // Autumn Leaves
    interface Leaf {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      rotation: number;
      rotSpeed: number;
      swing: number;
      swingSpeed: number;
      color: string;
      leafType: 'maple' | 'oval' | 'birch';
    }

    const leafColors = [
      '#d97706', // amber-600
      '#b45309', // amber-700
      '#ea580c', // orange-600
      '#c2410c', // orange-700
      '#ca8a04', // yellow-600
      '#92400e'  // warm rust
    ];

    const leaves: Leaf[] = Array.from({ length: 38 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 16 + 12,
      speedY: Math.random() * 1.2 + 0.6,
      speedX: Math.random() * 0.8 + 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      swing: Math.random() * Math.PI * 2,
      swingSpeed: Math.random() * 0.03 + 0.015,
      color: leafColors[Math.floor(Math.random() * leafColors.length)],
      leafType: Math.random() > 0.6 ? 'maple' : Math.random() > 0.3 ? 'oval' : 'birch'
    }));

    const drawLeaf = (leaf: Leaf) => {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rotation);
      ctx.fillStyle = leaf.color;
      ctx.globalAlpha = 0.78;

      ctx.beginPath();
      const s = leaf.size;
      // Oval botanical leaf
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.5, 0, 0, s);
      ctx.quadraticCurveTo(-s * 0.5, 0, 0, -s);
      ctx.fill();

      // Stem line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.9);
      ctx.lineTo(0, s * 0.9);
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      leaves.forEach((l) => {
        l.swing += l.swingSpeed;
        l.x += Math.sin(l.swing) * 1.5 + l.speedX;
        l.y += l.speedY;
        l.rotation += l.rotSpeed;

        if (l.y > height + 40) {
          l.y = -40;
          l.x = Math.random() * width;
        }
        if (l.x > width + 40) {
          l.x = -40;
        }

        drawLeaf(l);
      });

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
      {/* Soft cream, warm beige & gentle earthy gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fbf8f3] via-[#f5ede0] to-[#e8dcc8] dark:from-[#1c1813] dark:via-[#261f18] dark:to-[#171410] transition-colors duration-1000" />

      {/* Gentle Sunlight Flare Drifting Across Page */}
      <div className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-300/25 via-yellow-200/15 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />

      {/* Slow Moving Cloud Shapes */}
      <div className="absolute top-1/3 -right-32 w-96 h-64 bg-amber-100/30 dark:bg-stone-800/15 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute bottom-1/4 -left-24 w-80 h-52 bg-orange-100/30 dark:bg-stone-800/15 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '3s' }} />

      {/* Falling Leaves Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Growing Vines SVG Frame Accent */}
      <div className="absolute top-0 left-0 w-48 h-48 opacity-40 dark:opacity-20 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-amber-800 dark:stroke-amber-400 stroke-[1.5]">
          <path d="M 0,0 Q 20,40 50,30 T 90,10" />
          <path d="M 0,0 Q 40,20 30,50 T 10,90" />
          {/* Leaves on vine */}
          <path d="M 28,34 C 35,28 42,32 38,40 C 32,42 26,38 28,34 Z" className="fill-amber-700/60" />
          <path d="M 50,30 C 58,26 62,34 56,38 C 50,38 46,32 50,30 Z" className="fill-amber-600/60" />
          <path d="M 32,52 C 26,58 34,64 38,58 C 38,52 34,48 32,52 Z" className="fill-orange-700/60" />
        </svg>
      </div>

      <div className="absolute bottom-0 right-0 w-48 h-48 opacity-40 dark:opacity-20 pointer-events-none rotate-180">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-amber-800 dark:stroke-amber-400 stroke-[1.5]">
          <path d="M 0,0 Q 20,40 50,30 T 90,10" />
          <path d="M 0,0 Q 40,20 30,50 T 10,90" />
          <path d="M 28,34 C 35,28 42,32 38,40 C 32,42 26,38 28,34 Z" className="fill-amber-700/60" />
          <path d="M 50,30 C 58,26 62,34 56,38 C 50,38 46,32 50,30 Z" className="fill-amber-600/60" />
        </svg>
      </div>
    </div>
  );
};
