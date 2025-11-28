/**
 * Toast Component
 * 
 * Notification toast for success/error messages.
 */

import React, { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const colors = {
    success: { bg: '#48bb78', icon: '✅' },
    error: { bg: '#f56565', icon: '❌' },
    info: { bg: '#4299e1', icon: 'ℹ️' },
  };

  const { bg, icon } = colors[type];

  return React.createElement(
    'div',
    {
      style: {
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        background: bg,
        color: '#fff',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        zIndex: 1000,
        animation: 'slideIn 0.3s ease',
        minWidth: '300px',
      },
    },
    [
      React.createElement('span', { key: 'icon', style: { fontSize: '1.25rem' } }, icon),
      React.createElement(
        'span',
        { key: 'message', style: { flex: 1, fontWeight: 600 } },
        message
      ),
      React.createElement(
        'button',
        {
          key: 'close',
          onClick: onClose,
          style: {
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1.25rem',
            padding: 0,
          },
        },
        '×'
      ),
    ]
  );
};

export default Toast;
