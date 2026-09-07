import React, { useEffect, useRef } from 'react';

export const StarlitPromiseAnimation: React.FC = () => {
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

    // Stars
    interface Star {
      x: number;
      y: number;
      radius: number;
      baseAlpha: number;
      alpha: number;
      twinkleSpeed: number;
      color: string;
    }

    interface ShootingStar {
      x: number;
      y: number;
      len: number;
      speed: number;
      angle: number;
      opacity: number;
      active: boolean;
    }

    interface FloatingOrb {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      alpha: number;
    }

    const starCount = Math.min(220, Math.floor((width * height) / 4500));
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.5,
      baseAlpha: Math.random() * 0.7 + 0.3,
      alpha: Math.random() * 0.7 + 0.3,
      twinkleSpeed: (Math.random() * 0.03 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
      color: Math.random() > 0.2 ? '#ffffff' : Math.random() > 0.5 ? '#93c5fd' : '#e0e7ff'
    }));

    // Constellation points
    const constellationIndices = [12, 28, 45, 62, 80, 105, 130];

    // Shooting stars
    const shootingStars: ShootingStar[] = [];
    const spawnShootingStar = () => {
      shootingStars.push({
        x: Math.random() * width * 0.8,
        y: Math.random() * height * 0.3,
        len: Math.random() * 120 + 80,
        speed: Math.random() * 12 + 15,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        opacity: 1,
        active: true
      });
    };

    let lastSpawn = Date.now();

    // Floating glowing orbs
    const orbs: FloatingOrb[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * 100,
      radius: Math.random() * 12 + 6,
      speedY: Math.random() * 0.4 + 0.2,
      alpha: Math.random() * 0.3 + 0.15
    }));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Twinkling Stars
      stars.forEach((s) => {
        s.alpha += s.twinkleSpeed;
        if (s.alpha > 1) {
          s.alpha = 1;
          s.twinkleSpeed = -Math.abs(s.twinkleSpeed);
        } else if (s.alpha < 0.2) {
          s.alpha = 0.2;
          s.twinkleSpeed = Math.abs(s.twinkleSpeed);
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.shadowBlur = s.radius > 1.4 ? 6 : 2;
        ctx.shadowColor = '#818cf8';
        ctx.fill();
      });

      // 2. Constellation Lines
      ctx.shadowBlur = 0;
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.22)';
      for (let i = 0; i < constellationIndices.length - 1; i++) {
        const p1 = stars[constellationIndices[i]];
        const p2 = stars[constellationIndices[i + 1]];
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // 3. Floating glowing orbs
      orbs.forEach((orb) => {
        orb.y -= orb.speedY;
        if (orb.y < -50) {
          orb.y = height + 50;
          orb.x = Math.random() * width;
        }

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          orb.radius
        );
        gradient.addColorStop(0, `rgba(165, 180, 252, ${orb.alpha * 1.5})`);
        gradient.addColorStop(0.5, `rgba(129, 140, 248, ${orb.alpha * 0.7})`);
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 1;
        ctx.fill();
      });

      // 4. Shooting Stars
      if (Date.now() - lastSpawn > 3800) {
        spawnShootingStar();
        lastSpawn = Date.now() + Math.random() * 2000;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        if (!ss.active) continue;

        const tailX = ss.x - Math.cos(ss.angle) * ss.len;
        const tailY = ss.y - Math.sin(ss.angle) * ss.len;

        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.8, `rgba(199, 210, 254, ${ss.opacity * 0.6})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${ss.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffffff';
        ctx.stroke();

        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.opacity -= 0.018;

        if (ss.opacity <= 0 || ss.x > width + 100 || ss.y > height + 100) {
          ss.active = false;
          shootingStars.splice(i, 1);
        }
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

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
      {/* Deep Midnight Blue to Indigo Night Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060814] via-[#0c122c] to-[#151c48]" />

      {/* Cosmic Nebula Cloud Effect */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] mix-blend-screen" />
      <div className="absolute bottom-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-blue-600/15 blur-[100px] mix-blend-screen" />

      {/* Moon glow subtle horizon */}
      <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-blue-200/10 blur-[90px]" />

      {/* Canvas with twinkling stars, constellations & shooting stars */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
