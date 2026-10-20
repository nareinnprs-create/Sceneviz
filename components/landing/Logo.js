'use client';

export default function Logo({ className = 'h-7 w-auto', gradientId = 'sceneviz-mark' }) {
  const cyan = `${gradientId}-cyan`;
  const amber = `${gradientId}-amber`;
  return (
    <svg viewBox="100 40 300 340" className={className} role="img" aria-label="Sceneviz" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={cyan} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#67F4F2" />
          <stop offset=".55" stopColor="#16C5D0" />
          <stop offset="1" stopColor="#087F91" />
        </linearGradient>
        <linearGradient id={amber} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFE0A0" />
          <stop offset=".55" stopColor="#F2AE43" />
          <stop offset="1" stopColor="#B96B18" />
        </linearGradient>
      </defs>
      <g strokeLinejoin="round" style={{ filter: 'drop-shadow(0 1px 1.5px rgba(7, 93, 106, 0.45))' }}>
        <path d="M104 130 L358 48 L358 145 L196 204 L358 268 L358 368 L104 277 L104 213 L260 267 L260 228 L104 167 Z" fill={`url(#${cyan})`} stroke="#9AFBFA" strokeWidth="5" />
        <path d="M104 130 L196 204 L260 228 L260 267 L196 243 L104 277 L104 213 L172 190 Z" fill={`url(#${amber})`} stroke="#FFE0A0" strokeWidth="5" />
        <path d="M358 268 L260 228 L260 267 L358 309 Z" fill="#075D6A" />
      </g>
    </svg>
  );
}
