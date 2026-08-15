"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
  size: number;
  color: string;
  shape: "rect" | "circle";
};

const DEFAULT_COLORS = ["#8b6bff", "#b478ff", "#ffb020", "#34d399", "#60a5fa"];

export function Confetti({
  trigger,
  particleCount = 140,
  colors = DEFAULT_COLORS,
  duration = 2600,
}: {
  trigger: boolean;
  particleCount?: number;
  colors?: string[];
  duration?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -14 - 4,
      rotation: Math.random() * 360,
      vr: (Math.random() - 0.5) * 16,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));

    const start = performance.now();
    const gravity = 0.35;
    const drag = 0.985;

    const tick = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particlesRef.current) {
        p.vx *= drag;
        p.vy = p.vy * drag + gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - elapsed / duration);
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (elapsed < duration) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [trigger, particleCount, colors, duration]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ width: "100vw", height: "100vh" }}
      aria-hidden="true"
    />
  );
}

export function useConfetti(activeMs = 3000) {
  const [burstKey, setBurstKey] = useState(0);
  const [active, setActive] = useState(false);

  const celebrate = useCallback(() => {
    setBurstKey((k) => k + 1);
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => setActive(false), activeMs);
    return () => clearTimeout(timeout);
  }, [active, burstKey, activeMs]);

  return { celebrate, confettiElement: <Confetti key={burstKey} trigger={active} /> };
}
