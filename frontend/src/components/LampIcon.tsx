import React, { useState } from "react";
import { motion, useMotionValue } from "framer-motion";

interface LampIconProps {
  isOn: boolean;
  onToggle?: () => void;
  className?: string;
}

export function LampIcon({ isOn, onToggle, className = "" }: LampIconProps) {
  const pullY = useMotionValue(0);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      className={`relative flex flex-col items-center justify-start ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ minWidth: 220, minHeight: 185, height: 185 }}
    >
      {/* ═══ Scoped Keyframes ═══ */}
      <style>{`
        @keyframes beam-flicker {
          0%, 100% { opacity: 0.95; }
          50% { opacity: 1; }
          52% { opacity: 0.8; }
          54% { opacity: 1; }
        }
        @keyframes float-dust {
          0% { transform: translateY(0) translateX(0) scale(0.5); opacity: 0; }
          20% { opacity: 0.9; }
          80% { opacity: 0.9; }
          100% { transform: translateY(-50px) translateX(25px) scale(1.4); opacity: 0; }
        }
        @keyframes ambient-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
        }
      `}</style>

      {/* ═══════════ LIGHT BEAM SHINING ONTO THE FORM BELOW ═══════════ */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "92px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "650px",
          background: isOn 
            ? "linear-gradient(180deg, rgba(254, 240, 138, 0.2) 0%, rgba(253, 224, 71, 0.06) 35%, rgba(253, 224, 71, 0.01) 75%, transparent 100%)" 
            : "transparent",
          clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)",
          opacity: isOn ? 1 : 0,
          transition: "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: isOn ? "beam-flicker 5s infinite" : "none",
          transformOrigin: "top center",
          zIndex: 25,
        }}
      >
        {/* Inner bright core beam */}
        <div
          className="w-full h-full"
          style={{
            background: "linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, rgba(254, 240, 138, 0.08) 35%, transparent 80%)",
            clipPath: "polygon(46% 0, 54% 0, 88% 100%, 12% 100%)",
          }}
        />

        {/* Ambient dust sparkles in the beam */}
        {isOn && [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full pointer-events-none"
            style={{
              width: (i % 3 + 1.2) + "px",
              height: (i % 3 + 1.2) + "px",
              left: 15 + (i * 10) % 70 + "%",
              top: 5 + (i * 9) % 80 + "%",
              opacity: 0,
              boxShadow: "0 0 4px #fff",
              animation: `float-dust ${3.5 + (i % 3) * 1.5}s linear infinite`,
              animationDelay: `${i * 0.25}s`
            }}
          />
        ))}
      </div>

      {/* ═══════════ AMBIENT BACKGROUND GLOW ═══════════ */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "100px",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: isOn
            ? "radial-gradient(circle, rgba(253, 224, 71, 0.2) 0%, rgba(253, 224, 71, 0.03) 50%, transparent 70%)"
            : "radial-gradient(circle, rgba(253, 224, 71, 0) 0%, transparent 70%)",
          transition: "all 0.5s ease",
          animation: isOn ? "ambient-pulse 4s ease-in-out infinite" : "none",
          zIndex: 0,
        }}
      />

      {/* ═══════════ LAMP STRUCTURE ═══════════ */}
      <motion.div 
        className="relative z-10 flex flex-col items-center pt-1"
        style={{
          transformOrigin: "top center",
        }}
        animate={{
          rotate: dragging ? pullY.get() * 0.12 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        {/* Wire */}
        <div 
          className="w-1.5 bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 dark:from-black dark:via-gray-700 dark:to-black"
          style={{ height: "35px" }}
        />
        
        {/* Lamp Fixture Top */}
        <div className="w-8 h-2.5 bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 dark:from-gray-800 dark:via-gray-600 dark:to-gray-800 rounded-t-md border-b border-gray-900" />
        
        {/* Lampshade (Glossy Metallic/Matte Finish) */}
        <div 
          className="relative flex justify-center overflow-hidden"
          style={{
            width: "125px",
            height: "55px",
            background: "linear-gradient(to right, #1f2937 0%, #374151 20%, #111827 80%, #0f172a 100%)",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            borderBottom: isOn ? "2px solid rgba(254, 240, 138, 0.9)" : "2px solid rgba(0,0,0,0.5)",
            clipPath: "polygon(30% 0, 70% 0, 100% 100%, 0 100%)",
            boxShadow: isOn ? "inset 0px -15px 30px rgba(253, 224, 71, 0.35)" : "inset 0 -10px 20px rgba(0,0,0,0.5)",
            transition: "all 0.4s ease",
          }}
        >
          {/* Specular highlight on shade */}
          <div 
            className="absolute top-0 h-full opacity-30 pointer-events-none"
            style={{
              left: "20%",
              width: "30%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
              transform: "skewX(-20deg)"
            }}
          />
        </div>

        {/* Bulb */}
        <motion.div 
          animate={{
            scale: isOn ? [1.25, 1] : 1,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute"
          style={{
            top: "92px",
            width: "40px",
            height: "24px",
            background: isOn ? "#fff" : "#e2e8f0",
            borderRadius: "0 0 50% 50%",
            boxShadow: isOn 
              ? "0 4px 15px rgba(253,224,71,0.6), 0 8px 25px rgba(254,240,138,0.3), inset 0 -5px 15px #ffffff" 
              : "inset 0 -3px 8px rgba(0,0,0,0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            border: isOn ? "none" : "1px solid #94a3b8",
            borderTop: "none",
            zIndex: -1,
          }}
        />
      </motion.div>

      {/* ═══════════ PULL CHAIN ═══════════ */}
      <div
        className="absolute z-20"
        style={{
          top: "116px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 40,
          height: 90,
        }}
      >
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 35 }}
          dragElastic={0.4}
          dragSnapToOrigin={true}
          onDragStart={() => setDragging(true)}
          onDragEnd={(_e, info) => {
            setDragging(false);
            if (info.offset.y > 18 && onToggle) {
              onToggle();
            }
          }}
          style={{ y: pullY }}
          className="cursor-grab active:cursor-grabbing flex flex-col items-center"
        >
          {/* Chain */}
          <div
            style={{
              width: 3,
              height: 42,
              background: isOn ? "linear-gradient(to bottom, rgba(254,240,138,0.8), #9ca3af)" : "#6b7280",
              backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
              transition: "background 0.3s",
            }}
          />
          {/* Pull knob */}
          <div
            className="w-4.5 h-7 rounded-full shadow-lg border border-gray-400 dark:border-gray-600 flex items-end justify-center pb-1"
            style={{
              background: "linear-gradient(135deg, #f3f4f6 0%, #9ca3af 100%)",
              boxShadow: "0 4px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.5)",
              transform: dragging ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.2s",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 shadow-inner" />
          </div>
        </motion.div>
      </div>
      
      {/* ═══════════ HELPER TEXT ═══════════ */}
      <div 
        className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.2em] text-gray-400 dark:text-gray-500 pointer-events-none"
        style={{ opacity: hovered && !dragging && !isOn ? 1 : 0, transition: "opacity 0.3s" }}
      >
        PULL
      </div>
    </div>
  );
}
