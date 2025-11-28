/**
 * Button Component
 * 
 * Reusable button component with multiple variants.
 */

import React, { CSSProperties, ReactNode } from 'react';

export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style = {},
}) => {
  const sizeStyles: Record<string, CSSProperties> = {
    small: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    medium: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    large: { padding: '1rem 2rem', fontSize: '1.125rem' },
  };

  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      border: 'none',
    },
    secondary: {
      background: 'rgba(102, 126, 234, 0.1)',
      color: '#667eea',
      border: 'none',
    },
    outline: {
      background: 'transparent',
      color: '#667eea',
      border: '2px solid #667eea',
    },
    danger: {
      background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
      color: '#fff',
      border: 'none',
    },
  };

  const baseStyle: CSSProperties = {
    ...sizeStyles[size],
    ...variantStyles[variant],
    borderRadius: '12px',
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    opacity: disabled || loading ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    ...style,
  };

  return React.createElement(
    'button',
    {
      style: baseStyle,
      onClick: disabled || loading ? undefined : onClick,
      disabled: disabled || loading,
      onMouseEnter: disabled || loading
        ? undefined
        : (e: any) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          },
      onMouseLeave: disabled || loading
        ? undefined
        : (e: any) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          },
    },
    loading
      ? [
          React.createElement('span', { key: 'spinner', style: { animation: 'spin 1s linear infinite' } }, '⏳'),
          React.createElement('span', { key: 'text' }, 'Loading...'),
        ]
      : children
  );
};

export default Button;
