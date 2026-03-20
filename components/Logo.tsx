import React from 'react';

export default function Logo({ className = "w-8 h-8", dark = false }: { className?: string, dark?: boolean }) {
  const stroke = dark ? "#18181b" : "#fafafa";
  const radar = dark ? "#f97316" : "#d9f99d"; // fallback to optic yellow 
  const radar_stroke = dark ? "#18181b" : "#d9f99d";
  
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M50 85 L25 60 L25 40 L75 40 L75 60 Z" fill="transparent" stroke={stroke} />
      <path d="M35 25 Q50 10 65 25" stroke={radar_stroke} />
      <path d="M25 15 Q50 -5 75 15" stroke={radar_stroke} opacity="0.5"/>
    </svg>
  );
}
