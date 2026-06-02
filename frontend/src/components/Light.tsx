import React from 'react';

interface LightProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function Light({ className = '', style = {}, children }: LightProps) {
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.20)',
        borderRadius: '10px',
        ...style
      }}
    >
      {/* Absolute faint inner light reflections */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none" />
      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
