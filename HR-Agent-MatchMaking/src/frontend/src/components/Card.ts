/**
 * Card Component
 * 
 * Reusable card component with modern glassmorphism design.
 */

import React, { CSSProperties, ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style = {}, onClick, hover = false }) => {
  const baseStyle: CSSProperties = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  return React.createElement(
    'div',
    {
      style: baseStyle,
      onClick,
      onMouseEnter: hover
        ? (e: any) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
          }
        : undefined,
      onMouseLeave: hover
        ? (e: any) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
          }
        : undefined,
    },
    children
  );
};

export default Card;
