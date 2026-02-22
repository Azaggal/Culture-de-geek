
import React from 'react';

export const ScoreBadge = ({ points, theme, className = "" }) => {
  return (
    <div className={`flex items-center gap-2 bg-yellow-400 border-2 border-yellow-600 px-4 py-1 rounded-xl shadow-[0_5px_0_rgb(202,138,4)] transform -rotate-2 ${className}`}>
      <span className="text-yellow-900 font-black text-xl uppercase italic tracking-tighter">
        {points} PTS
      </span>
    </div>
  );
};
