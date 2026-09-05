import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  text?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  text = 'SkillHub AI',
  className = '',
}) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 42 : 32;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SkillHub interlocking dual arrows logo */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:rotate-12"
      >
        {/* Top Blue/Indigo Curved Arrow */}
        <path
          d="M 32 48 C 24 38, 25 24, 38 16 C 52 8, 70 12, 76 28 L 84 20 M 76 28 L 76 12 M 76 28 L 60 28"
          stroke="#3525cd"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bottom Emerald Green Curved Arrow */}
        <path
          d="M 68 52 C 76 62, 75 76, 62 84 C 48 92, 30 88, 24 72 L 16 80 M 24 72 L 24 88 M 24 72 L 40 72"
          stroke="#00a86b"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <span
          className={`font-semibold tracking-tight text-[#131b2e] ${
            size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg'
          }`}
        >
          {text}
        </span>
      )}
    </div>
  );
};
