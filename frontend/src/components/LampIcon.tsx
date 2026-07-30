import React from "react";
import { motion, useMotionValue } from "framer-motion";

interface LampIconProps {
  isOn: boolean;
  onToggle?: () => void;
  className?: string;
}

export function LampIcon({ isOn, onToggle, className = "" }: LampIconProps) {
  const pullY = useMotionValue(0);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 150"
      className={className}
      style={{
        overflow: "visible",
      }}
    >
      <defs>
        {/* Crisp modern LED glow */}
        <filter id="led-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur1" />
          <feGaussianBlur stdDeviation="8" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* Cool modern light beam (icy blue/white) */}
        <linearGradient id="light-beam" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
        </linearGradient>
        
        {/* Clip path to hide the top of the cord when it slides down */}
        <clipPath id="cord-clip">
          <rect x="0" y="34.5" width="100" height="200" />
        </clipPath>
      </defs>

      {/* Light Beam (Casts down from the modern LED arm, covering the card) */}
      {isOn && (
        <path
          d="M 22 36 L 55 36 L 550 800 L -450 800 Z"
          fill="url(#light-beam)"
          style={{ transition: "opacity 0.4s ease-in-out" }}
        />
      )}

      {/* Minimalist Desk Base */}
      <ellipse cx="65" cy="145" rx="22" ry="4" fill="#0f172a" />
      <path d="M 43 145 L 87 145 L 87 147 A 22 4 0 0 1 43 147 Z" fill="#1e293b" />

      {/* Vertical Stand (Sleek dark metal rod) */}
      <rect x="62.5" y="30" width="5" height="115" rx="1.5" fill="#1e293b" />
      <rect x="61.5" y="30" width="2" height="115" rx="1" fill="#334155" opacity="0.5" />
      
      {/* Articulation Hinge */}
      <circle cx="65" cy="32" r="7" fill="#334155" />
      <circle cx="65" cy="32" r="3" fill="#0f172a" />

      {/* Horizontal LED Arm (Overhangs to the left) */}
      <rect x="15" y="29.5" width="55" height="5" rx="2.5" fill="#0f172a" />
      <rect x="15" y="29.5" width="55" height="1" fill="#334155" opacity="0.4" />
      
      {/* Exposed LED Strip under the arm */}
      <rect 
        x="22" y="33.5" width="33" height="1.5" rx="0.5" 
        fill={isOn ? "#ffffff" : "#334155"} 
        filter={isOn ? "url(#led-glow)" : "none"} 
        style={{ transition: "all 0.4s ease-in-out" }}
      />

      {/* Sleek Modern Pull Cord */}
      <g clipPath="url(#cord-clip)">
        {/* The draggable grip and cord */}
        <motion.g
          drag="y"
          dragConstraints={{ top: 0, bottom: 60 }}
          dragElastic={0.4}
          dragSnapToOrigin={true}
          onDragEnd={(e, info) => {
            if (info.offset.y > 25 && onToggle) {
              onToggle();
            }
          }}
          style={{ y: pullY }}
          className="cursor-grab active:cursor-grabbing"
        >
          {/* Invisible hit box to make it easy to grab with mouse/touch */}
          <rect x="15" y="35" width="25" height="80" fill="transparent" />

          {/* VERY long cord that translates down, clipped at the top */}
          <line 
            x1="28" y1="-100" 
            x2="28" y2="85" 
            stroke="#64748b" 
            strokeWidth="1" 
          />

          {/* Aluminum cylindrical grip */}
          <rect 
            x="26.5" y="85" width="3" height="22" rx="1.5" 
            fill="#94a3b8" 
          />
          {/* Grip details (knurling) */}
          <line x1="26.5" y1="88" x2="29.5" y2="88" stroke="#475569" strokeWidth="0.5" />
          <line x1="26.5" y1="91" x2="29.5" y2="91" stroke="#475569" strokeWidth="0.5" />
          <line x1="26.5" y1="94" x2="29.5" y2="94" stroke="#475569" strokeWidth="0.5" />
          <line x1="26.5" y1="97" x2="29.5" y2="97" stroke="#475569" strokeWidth="0.5" />
        </motion.g>
      </g>
    </svg>
  );
}
