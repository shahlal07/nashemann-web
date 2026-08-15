"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export function MouseGlow({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(50);
  const y = useMotionValue(30);
  const background = useMotionTemplate`radial-gradient(600px circle at ${x}% ${y}%, rgba(139,107,255,0.14), transparent 60%)`;

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(((e.clientX - rect.left) / rect.width) * 100);
    y.set(((e.clientY - rect.top) / rect.height) * 100);
  }

  return (
    <div ref={ref} onMouseMove={handleMove} className={className}>
      <motion.div className="pointer-events-none absolute inset-0" style={{ background }} />
      {children}
    </div>
  );
}
