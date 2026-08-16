import React from 'react';

interface WolfLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  theme?: 'dark' | 'light';
}

export const WolfLogo: React.FC<WolfLogoProps> = ({
  size = 48,
  className = '',
  showText = true,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Wolf Emblem with Streetwear Black / Red / Dark Blue accents */}
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center rounded-full bg-zinc-950 p-[2px] shadow-lg shadow-black/30 hover:scale-105 transition-transform duration-300 group border border-zinc-800"
      >
        {/* Inner Circle */}
        <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center relative overflow-hidden">
          {/* Geometric Wolf Head Vector SVG */}
          <svg
            viewBox="0 0 100 100"
            className="w-[72%] h-[72%] text-white relative z-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
            fill="currentColor"
          >
            {/* Left Ear */}
            <polygon points="50,45 32,18 24,38" fill="#1e3a8a" />
            {/* Right Ear */}
            <polygon points="50,45 68,18 76,38" fill="#dc2626" />
            {/* Ear Inners */}
            <polygon points="32,24 28,36 40,42" fill="#3b82f6" opacity="0.9" />
            <polygon points="68,24 72,36 60,42" fill="#ef4444" opacity="0.9" />
            {/* Forehead */}
            <polygon points="50,30 35,45 65,45" fill="#ffffff" />
            {/* Left Cheek */}
            <polygon points="35,45 15,50 30,68" fill="#172554" />
            {/* Right Cheek */}
            <polygon points="65,45 85,50 70,68" fill="#991b1b" />
            {/* Center Bridge */}
            <polygon points="50,45 38,62 50,75 62,62" fill="#f4f4f5" />
            {/* Snout */}
            <polygon points="38,62 50,75 35,82" fill="#1e293b" />
            <polygon points="62,62 50,75 65,82" fill="#27272a" />
            {/* Nose */}
            <polygon points="44,75 56,75 50,86" fill="#09090b" />
            {/* Glowing Eyes: Left Dark Blue, Right Red */}
            <polygon points="36,52 44,55 38,58" fill="#60a5fa" />
            <polygon points="64,52 56,55 62,58" fill="#f87171" />
          </svg>
        </div>

        {/* Small Red/Dark Blue indicator dot */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-zinc-950" />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className={`text-lg sm:text-2xl font-black tracking-tighter font-heading ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              LESLIE
            </span>
            <span className="text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded bg-zinc-950 text-white tracking-widest uppercase border border-zinc-800">
              STORE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          </div>
          <span className="hidden sm:block text-[10px] sm:text-[11px] font-bold text-zinc-500 tracking-wider uppercase">
            Streetwear • El Roble, Puntarenas
          </span>
        </div>
      )}
    </div>
  );
};

