import React, { useEffect, useRef } from 'react';

const COLORS = ['#14b8a6', '#00f5ff', '#ff006e', '#ffe600', '#bf00ff', '#39ff14'];

export default function Confetti({ active, duration = 3500 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    particlesRef.current = [];

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: -20,
      size: Math.random() * 8 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speedX: (Math.random() - 0.5) * 5,
      speedY: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      opacity: 1,
    });

    for (let i = 0; i < 140; i++) particlesRef.current.push(createParticle());

    let lastTime = 0;
    let elapsed = 0;

    const animate = (ts) => {
      const dt = ts - lastTime;
      lastTime = ts;
      elapsed += dt;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (elapsed < duration / 2 && Math.random() > 0.65) {
        particlesRef.current.push(createParticle());
      }

      particlesRef.current = particlesRef.current.filter(p => p.y < canvas.height + 20);

      particlesRef.current.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;
        p.speedY += 0.06;
        p.opacity = Math.max(0, 1 - (p.y / canvas.height) * 0.6);
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (elapsed < duration || particlesRef.current.length > 0) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      particlesRef.current = [];
    };
  }, [active, duration]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
