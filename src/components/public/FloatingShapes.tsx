"use client";

import { motion } from "framer-motion";

const SHAPES: Array<{
  top: string;
  left?: string;
  right?: string;
  size: number;
  delay: number;
  duration: number;
  colorA: string;
  colorB: string;
  rotate: number;
}> = [
  { top: "8%", left: "6%", size: 140, delay: 0, duration: 9, colorA: "rgba(139,107,255,0.35)", colorB: "rgba(139,107,255,0.05)", rotate: -12 },
  { top: "18%", right: "10%", size: 100, delay: 1.2, duration: 11, colorA: "rgba(255,176,32,0.3)", colorB: "rgba(255,176,32,0.04)", rotate: 18 },
  { top: "58%", left: "3%", size: 90, delay: 0.6, duration: 10, colorA: "rgba(180,120,255,0.3)", colorB: "rgba(180,120,255,0.04)", rotate: 8 },
  { top: "68%", right: "14%", size: 130, delay: 1.8, duration: 12, colorA: "rgba(139,107,255,0.25)", colorB: "rgba(139,107,255,0.03)", rotate: -20 },
];

export function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {SHAPES.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 40, rotate: s.rotate - 10 }}
          animate={{ opacity: 1, y: [0, -18, 0], rotate: s.rotate }}
          transition={{
            opacity: { duration: 1, delay: s.delay },
            y: { duration: s.duration, repeat: Infinity, ease: "easeInOut", delay: s.delay },
            rotate: { duration: 1, delay: s.delay },
          }}
          className="absolute rounded-[2rem] border border-white/10 backdrop-blur-3xl"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            width: s.size,
            height: s.size,
            background: `linear-gradient(135deg, ${s.colorA}, ${s.colorB})`,
          }}
        />
      ))}
    </div>
  );
}
