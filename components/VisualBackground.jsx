'use client';

import { useEffect, useRef } from 'react';

export default function VisualBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.5 ? '139, 92, 246' : '236, 72, 153',
      });
    }

    const drawWave = (yOffset, amplitude, frequency, speed, color, alpha) => {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for (let x = 0; x <= canvas.width; x += 2) {
        const y = canvas.height - yOffset + 
          Math.sin(x * frequency + time * speed) * amplitude +
          Math.sin(x * frequency * 2 + time * speed * 1.5) * amplitude * 0.5;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fillStyle = `rgba(${color}, ${alpha})`;
      ctx.fill();
    };

    const animate = () => {
      time += 0.008;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.8
      );
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.03)');
      gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.02)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waves
      drawWave(80, 30, 0.003, 0.5, '139, 92, 246', 0.04);
      drawWave(60, 25, 0.004, 0.7, '236, 72, 153', 0.03);
      drawWave(100, 35, 0.002, 0.4, '59, 130, 246', 0.03);

      // Draw particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${p.color}, ${0.05 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      // Floating orbs
      const orbCount = 3;
      for (let i = 0; i < orbCount; i++) {
        const angle = time * 0.2 + (i * Math.PI * 2) / orbCount;
        const x = canvas.width / 2 + Math.cos(angle) * canvas.width * 0.3;
        const y = canvas.height / 2 + Math.sin(angle * 0.7) * canvas.height * 0.2;
        const radius = 150 + Math.sin(time + i) * 50;

        const orbGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const colors = [
          ['139, 92, 246', '236, 72, 153'],
          ['6, 182, 212', '59, 130, 246'],
          ['236, 72, 153', '139, 92, 246'],
        ];
        orbGradient.addColorStop(0, `rgba(${colors[i][0]}, 0.08)`);
        orbGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = orbGradient;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
