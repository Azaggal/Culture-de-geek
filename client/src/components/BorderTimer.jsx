
import React, { useState, useEffect } from 'react';

export const BorderTimer = ({ children, visible, progress, color = "#3b82f6", isFullscreen }) => {
  const [vraimentVisible, setVraimentVisible] = useState(false);
  const strokeWidth = 8;
  const radius = isFullscreen ? 0 : 24;

  useEffect(() => {
    let timer;
    if (visible) {
      timer = setTimeout(() => { setVraimentVisible(true); }, 500); 
    } else {
      setVraimentVisible(false);
    }
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <div className={`flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.20,0.64,1)]
      ${isFullscreen ? "fixed inset-0 w-screen h-screen bg-slate-900 z-[100]" : "relative z-40"}`}
    >
      <svg 
        className="absolute pointer-events-none overflow-visible" 
        style={{ 
          top: strokeWidth / 2, 
          left: strokeWidth / 2, 
          width: `calc(100% - ${strokeWidth}px)`, 
          height: `calc(100% - ${strokeWidth}px)`, 
          zIndex: 50, 
          opacity: vraimentVisible ? 1 : 0, 
          transition: 'opacity 0.2s' 
        }}
      >
        <rect 
          x="0" y="0" width="100%" height="100%" 
          style={{ transition: 'rx 0.5s ease-in-out' }} 
          rx={radius} fill="none" stroke="rgba(226, 232, 240, 0.2)" strokeWidth={strokeWidth} 
        />
        
        <rect 
          x="0" y="0" width="100%" height="100%" 
          style={{ 
            transition: 'rx 0.5s ease-in-out, stroke 0.5s ease-in-out',
            opacity: progress > 0 ? 1 : 0 
          }} 
          rx={radius} fill="none" stroke={color} strokeWidth={strokeWidth} 
          pathLength="1" 
          strokeDasharray="1" 
          strokeDashoffset={1 - progress} 
          strokeLinecap="round" 
        />
      </svg>
      
      <div className="relative z-10 w-full h-full flex items-center justify-center"> 
         {children}
      </div>
    </div>
  );
};
