import React from 'react';

interface EcoCollectLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const EcoCollectLogo: React.FC<EcoCollectLogoProps> = ({
  className = 'w-10 h-10',
  size,
  showText = false,
}) => {
  return (
    <div className="inline-flex items-center gap-2.5">
      <svg
        viewBox="0 0 540 340"
        className={className}
        style={size ? { width: size, height: typeof size === 'number' ? size * 0.63 : size } : undefined}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="EcoCollect Logo"
      >
        <g id="ecocollect-infinity-logo">
          {/* Main outer figure-8 infinity crossing */}
          <path
            d="M 270,170 
               C 230,225 185,275 125,275 
               C 55,275 15,225 15,170 
               C 15,115 55,65 125,65 
               C 185,65 230,115 270,170 
               C 310,225 355,275 415,275 
               C 485,275 525,225 525,170 
               C 525,115 485,65 415,65 
               C 355,65 310,115 270,170 Z"
            stroke="#529E33"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Loop Left Lobe */}
          <path
            d="M 235,170 
               C 210,125 175,102 125,102 
               C 82,102 48,132 48,170 
               C 48,208 82,238 125,238 
               C 158,238 185,222 205,195"
            stroke="#529E33"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Loop Right Lobe */}
          <path
            d="M 305,170 
               C 330,215 365,238 415,238 
               C 458,238 492,208 492,170 
               C 492,132 458,102 415,102 
               C 382,102 355,118 335,145"
            stroke="#529E33"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Arrow 1: Top-Right of Center (pointing UP-RIGHT) */}
          <path
            d="M 282,65 L 338,90 L 290,120 Z"
            fill="#529E33"
          />

          {/* Arrow 2: Inside Right Lobe (pointing DOWN-LEFT) */}
          <path
            d="M 368,138 L 310,140 L 340,195 Z"
            fill="#529E33"
          />

          {/* Arrow 3: Bottom-Left of Center (pointing DOWN-LEFT) */}
          <path
            d="M 258,275 L 202,250 L 250,220 Z"
            fill="#529E33"
          />

          {/* Arrow 4: Inside Left Lobe (pointing UP-RIGHT) */}
          <path
            d="M 172,202 L 230,200 L 200,145 Z"
            fill="#529E33"
          />
        </g>
      </svg>

      {showText && (
        <span className="font-extrabold text-slate-900 tracking-tight font-heading text-lg sm:text-xl">
          EcoCollect
        </span>
      )}
    </div>
  );
};
