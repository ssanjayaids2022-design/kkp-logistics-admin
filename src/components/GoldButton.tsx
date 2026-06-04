import React from 'react';
import { Button, ButtonProps } from 'antd';

interface GoldButtonProps extends ButtonProps {
  glowing?: boolean;
}

export default function GoldButton({ glowing = true, style, ...props }: GoldButtonProps) {
  const goldPrimary = '#F4811F';
  const goldHover = '#FFC20E';

  return (
    <Button
      {...props}
      style={{
        background: goldPrimary,
        border: 'none',
        color: '#FFFFFF',
        fontWeight: 700,
        letterSpacing: '0.02em',
        boxShadow: glowing
          ? '0 4px 12px rgba(244, 129, 31, 0.3)'
          : '0 2px 6px rgba(244, 129, 31, 0.15)',
        transition: 'all 0.3s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = goldHover;
        el.style.boxShadow = '0 6px 16px rgba(244, 129, 31, 0.4)';
        el.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = goldPrimary;
        el.style.boxShadow = glowing
          ? '0 4px 12px rgba(244, 129, 31, 0.3)'
          : '0 2px 6px rgba(244, 129, 31, 0.15)';
        el.style.transform = 'translateY(0)';
      }}
    />
  );
}
