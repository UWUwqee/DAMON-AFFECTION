import React, { useEffect, useRef } from 'react';

export const OceanOfMyHeartAnimation: React.FC = () => {
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

    // Bubbles
    interface Bubble {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      wobble: number;
      wobbleSpeed: number;
      alpha: number;
    }

    interface Sparkle {
      x: number;
      y: number;
      size: number;
      alpha: number;
      decay: number;
    }

    const bubbles: Bubble[] = Array.from({ length: 42 }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * 200,
      radius: Math.random() * 12 + 4,
      speedY: Math.random() * 1.5 + 0.8,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.04 + 0.02,
      alpha: Math.random() * 0.45 + 0.25
    }));

    const sparkles: Sparkle[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      alpha: Math.random() * 0.8 + 0.2,
      decay: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1)
    }));

    // Interactive pop bubble on click
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      bubbles.forEach((b) => {
        const dist = Math.hypot(b.x - clickX, b.y - clickY);
        if (dist < b.radius + 15) {
          // Pop bubble: reset to bottom with burst
          b.y = height + 40;
          b.x = Math.random() * width;
        }
      });
    };
    canvas.addEventListener('click', handleCanvasClick);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw bioluminescent sparkles
      sparkles.forEach((s) => {
        s.alpha += s.decay;
        if (s.alpha > 0.9) {
          s.alpha = 0.9;
          s.decay = -Math.abs(s.decay);
        } else if (s.alpha < 0.1) {
          s.alpha = 0.1;
          s.decay = Math.abs(s.decay);
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(94, 234, 212, ${s.alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#2dd4bf';
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Draw rising bubbles
      bubbles.forEach((b) => {
        b.wobble += b.wobbleSpeed;
        b.x += Math.sin(b.wobble) * 0.8;
        b.y -= b.speedY;

        if (b.y < -30) {
          b.y = height + 30;
          b.x = Math.random() * width;
        }

        // Outer bubble ring
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(204, 251, 241, ${b.alpha * 0.9})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Bubble highlight reflection
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.8})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Serene Blue, Turquoise & Soft Teal Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#041a24] via-[#082e38] to-[#0d3b45]" />

      {/* Underwater Sunlight Rays Drifting */}
      <div className="absolute -top-12 left-1/4 w-32 h-[800px] bg-gradient-to-b from-teal-300/15 via-cyan-400/5 to-transparent rotate-[20deg] blur-2xl transform origin-top animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute -top-12 left-1/2 w-48 h-[900px] bg-gradient-to-b from-cyan-200/18 via-teal-300/5 to-transparent rotate-[12deg] blur-2xl transform origin-top animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute -top-12 right-1/4 w-36 h-[750px] bg-gradient-to-b from-emerald-200/12 via-teal-400/5 to-transparent rotate-[8deg] blur-2xl transform origin-top animate-pulse" style={{ animationDuration: '7s' }} />

      {/* Gentle Wave SVGs at the Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-36 overflow-hidden opacity-25">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-[200%] h-full text-teal-400 fill-current animate-wave-slow">
          <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z" />
        </svg>
      </div>

      {/* Canvas for Bubbles & Sea Sparkles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-auto cursor-pointer" title="Click bubbles to pop them!" />

      <style>{`
        @keyframes wave-slow {
          0% { transform: translateX(0); }
          50% { transform: translateX(-25%); }
          100% { transform: translateX(0); }
        }
        .animate-wave-slow {
          animation: wave-slow 18s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
