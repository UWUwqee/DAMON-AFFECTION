import React, { useEffect, useRef } from 'react';

export const BloomingHeartAnimation: React.FC = () => {
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

    // Petals & Hearts particles
    interface Petal {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      rotation: number;
      rotSpeed: number;
      opacity: number;
      color: string;
      isHeart: boolean;
      direction: 'up' | 'down';
    }

    const colors = [
      'rgba(244, 63, 94, ',   // rose-500
      'rgba(251, 113, 133, ', // rose-400
      'rgba(254, 205, 211, ', // rose-200
      'rgba(249, 168, 212, ', // pink-300
      'rgba(253, 186, 116, '  // orange-300 (warm peach)
    ];

    const petals: Petal[] = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 14 + 10,
      speedY: (Math.random() * 0.8 + 0.3) * (Math.random() > 0.4 ? 1 : -0.7),
      speedX: Math.sin(Math.random() * Math.PI) * 0.6,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      opacity: Math.random() * 0.5 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      isHeart: Math.random() > 0.35,
      direction: Math.random() > 0.4 ? 'down' : 'up'
    }));

    const drawHeart = (x: number, y: number, size: number, angle: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      // top left curve
      ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      // bottom left curve
      ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.15);
      // bottom right curve
      ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      // top right curve
      ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    const drawPetal = (x: number, y: number, size: number, angle: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.4, size * 0.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      petals.forEach((p) => {
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.01) * 0.8 + p.speedX;
        p.rotation += p.rotSpeed;

        if (p.speedY > 0 && p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        } else if (p.speedY < 0 && p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        const fillStyle = `${p.color}${p.opacity})`;
        if (p.isHeart) {
          drawHeart(p.x, p.y, p.size, p.rotation, fillStyle);
        } else {
          drawPetal(p.x, p.y, p.size, p.rotation, fillStyle);
        }
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
      {/* Soft Romantic Blush Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-rose-100 to-amber-100/60 dark:from-rose-950/70 dark:via-pink-950/50 dark:to-neutral-950 transition-colors duration-1000" />

      {/* Gentle Glowing Pulse Aura behind center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] md:w-[680px] h-[340px] md:h-[680px] rounded-full bg-gradient-to-tr from-rose-300/35 via-pink-300/25 to-amber-200/20 blur-3xl animate-pulse-subtle" />

      {/* Petals and Hearts Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Butterflies Fluttering Across Screen */}
      <div className="butterfly butterfly-1">
        <div className="wing wing-left" />
        <div className="butterfly-body" />
        <div className="wing wing-right" />
      </div>

      <div className="butterfly butterfly-2">
        <div className="wing wing-left" />
        <div className="butterfly-body" />
        <div className="wing wing-right" />
      </div>

      <div className="butterfly butterfly-3">
        <div className="wing wing-left" />
        <div className="butterfly-body" />
        <div className="wing wing-right" />
      </div>

      {/* Blooming Flowers in Corner Accents */}
      <div className="absolute top-6 left-6 w-16 h-16 opacity-70 animate-float-slow">
        <svg viewBox="0 0 100 100" className="w-full h-full text-rose-400 fill-current drop-shadow-sm">
          <circle cx="50" cy="35" r="14" opacity="0.85" />
          <circle cx="65" cy="50" r="14" opacity="0.85" />
          <circle cx="50" cy="65" r="14" opacity="0.85" />
          <circle cx="35" cy="50" r="14" opacity="0.85" />
          <circle cx="50" cy="50" r="9" className="text-amber-300 fill-current" />
        </svg>
      </div>

      <div className="absolute bottom-8 right-8 w-20 h-20 opacity-70 animate-float-slow" style={{ animationDelay: '2s' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full text-pink-400 fill-current drop-shadow-sm">
          <circle cx="50" cy="35" r="15" opacity="0.85" />
          <circle cx="65" cy="50" r="15" opacity="0.85" />
          <circle cx="50" cy="65" r="15" opacity="0.85" />
          <circle cx="35" cy="50" r="15" opacity="0.85" />
          <circle cx="50" cy="50" r="10" className="text-amber-200 fill-current" />
        </svg>
      </div>

      {/* CSS For Fluttering Butterflies */}
      <style>{`
        .butterfly {
          position: absolute;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .butterfly-1 {
          top: 25%;
          animation: fly-across-1 18s ease-in-out infinite;
        }
        .butterfly-2 {
          top: 60%;
          animation: fly-across-2 24s ease-in-out infinite 6s;
        }
        .butterfly-3 {
          top: 40%;
          animation: fly-across-3 20s ease-in-out infinite 12s;
        }
        .butterfly-body {
          width: 3px;
          height: 12px;
          background: #be123c;
          border-radius: 2px;
          z-index: 2;
        }
        .wing {
          width: 10px;
          height: 14px;
          background: linear-gradient(135deg, rgba(244,63,94,0.85), rgba(251,146,60,0.75));
          border-radius: 50% 50% 10% 50%;
        }
        .wing-left {
          transform-origin: right center;
          animation: flap-left 0.28s ease-in-out infinite alternate;
        }
        .wing-right {
          transform-origin: left center;
          border-radius: 50% 50% 50% 10%;
          animation: flap-right 0.28s ease-in-out infinite alternate;
        }

        @keyframes flap-left {
          0% { transform: rotateY(0deg) scaleX(1); }
          100% { transform: rotateY(70deg) scaleX(0.4); }
        }
        @keyframes flap-right {
          0% { transform: rotateY(0deg) scaleX(1); }
          100% { transform: rotateY(-70deg) scaleX(0.4); }
        }

        @keyframes fly-across-1 {
          0% { left: -40px; transform: translateY(0px) rotate(15deg); }
          25% { transform: translateY(-40px) rotate(-10deg); }
          50% { transform: translateY(20px) rotate(25deg); }
          75% { transform: translateY(-30px) rotate(5deg); }
          100% { left: calc(100% + 40px); transform: translateY(-10px) rotate(15deg); }
        }
        @keyframes fly-across-2 {
          0% { right: -40px; transform: translateY(0px) rotate(-15deg); }
          30% { transform: translateY(50px) rotate(10deg); }
          60% { transform: translateY(-30px) rotate(-20deg); }
          100% { right: calc(100% + 40px); transform: translateY(10px) rotate(-15deg); }
        }
        @keyframes fly-across-3 {
          0% { left: 10%; top: 90%; transform: translateY(0) rotate(-35deg); }
          50% { left: 50%; top: 30%; transform: translateY(-20px) rotate(10deg); }
          100% { left: 90%; top: 5%; transform: translateY(-10px) rotate(-20deg); }
        }
      `}</style>
    </div>
  );
};
