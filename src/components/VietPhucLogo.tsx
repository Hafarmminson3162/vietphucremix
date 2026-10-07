import React from 'react';

interface VietPhucLogoProps {
  className?: string;
  height?: number | string;
}

export const VietPhucLogo: React.FC<VietPhucLogoProps> = ({
  className = "h-10 sm:h-12 w-auto",
  height
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 530 130" 
      className={className}
      style={height ? { height } : undefined}
      aria-label="Việt phục Logo"
      role="img"
    >
      <defs>
        {/* Nón Lá Straw Weave Gradient */}
        <linearGradient id="vpLogoStrawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E9C378" />
          <stop offset="40%" stopColor="#D4A148" />
          <stop offset="80%" stopColor="#BF862E" />
          <stop offset="100%" stopColor="#A8711E" />
        </linearGradient>

        <filter id="vpLogoHatShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000" floodOpacity="0.22" />
        </filter>
      </defs>

      <style>{`
        .vp-logo-text {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 800;
          fill: #1C3F34;
          font-size: 88px;
        }
      `}</style>

      {/* Main Logo Container */}
      <g>
        {/* Word: Việt */}
        <text x="12" y="98" className="vp-logo-text">V</text>
        <text x="88" y="98" className="vp-logo-text">i</text>
        <text x="124" y="98" className="vp-logo-text">e</text>
        <text x="178" y="98" className="vp-logo-text">t</text>

        {/* Dấu nặng dưới chữ ệ */}
        <circle cx="150" cy="116" r="6.2" fill="#1C3F34" />

        {/* NÓN LÁ TRÊN ĐẦU CHỮ ệ */}
        <g transform="translate(150, 40)" filter="url(#vpLogoHatShadow)">
          {/* Thân chóp nón */}
          <path 
            d="M 0 -34 L 24 2 Q 0 7 -24 2 Z" 
            fill="url(#vpLogoStrawGrad)" 
          />

          {/* Vành nang tre đan nan ngang (concentric rings) */}
          <path d="M -6 -23 Q 0 -21 6 -23" fill="none" stroke="#8C5317" strokeWidth="0.9" opacity="0.8" />
          <path d="M -12 -14 Q 0 -11 12 -14" fill="none" stroke="#8C5317" strokeWidth="0.95" opacity="0.85" />
          <path d="M -18 -5 Q 0 -1 18 -5" fill="none" stroke="#8C5317" strokeWidth="1.0" opacity="0.9" />

          {/* Nan sườn nón tỏa ra từ đỉnh chóp (radial ribs) */}
          <line x1="0" y1="-34" x2="-18" y2="2" stroke="#8C5317" strokeWidth="0.8" opacity="0.6" />
          <line x1="0" y1="-34" x2="-10" y2="4" stroke="#8C5317" strokeWidth="0.8" opacity="0.6" />
          <line x1="0" y1="-34" x2="-3" y2="5" stroke="#8C5317" strokeWidth="0.8" opacity="0.6" />
          <line x1="0" y1="-34" x2="3" y2="5" stroke="#8C5317" strokeWidth="0.8" opacity="0.6" />
          <line x1="0" y1="-34" x2="10" y2="4" stroke="#8C5317" strokeWidth="0.8" opacity="0.6" />
          <line x1="0" y1="-34" x2="18" y2="2" stroke="#8C5317" strokeWidth="0.8" opacity="0.6" />

          {/* Vành nón màu đỏ thắm truyền thống */}
          <path 
            d="M -24.5 2 Q 0 7.5 24.5 2" 
            fill="none" 
            stroke="#9E2A2B" 
            strokeWidth="3.6" 
            strokeLinecap="round" 
          />
        </g>

        {/* Word: phục */}
        <text x="256" y="98" className="vp-logo-text">p</text>
        <text x="322" y="98" className="vp-logo-text">h</text>
        <text x="388" y="98" className="vp-logo-text">u</text>
        <text x="452" y="98" className="vp-logo-text">c</text>

        {/* Dấu nặng dưới chữ ụ */}
        <circle cx="417" cy="116" r="6.2" fill="#1C3F34" />
      </g>
    </svg>
  );
};
