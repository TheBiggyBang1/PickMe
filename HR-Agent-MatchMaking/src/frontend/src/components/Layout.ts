/**
 * Layout Component
 * 
 * Main layout wrapper with navigation, header, and content area.
 * Inspired by modern design patterns with clean, minimal aesthetics.
 */

import React, { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'upload', label: 'Upload Resume', icon: '📄' },
    { id: 'search', label: 'Job Search', icon: '🔍' },
    { id: 'matches', label: 'My Matches', icon: '✨' },
  ];

  return React.createElement(
    'div',
    {
      style: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      },
    },
    [
      // Header
      React.createElement(
        'header',
        {
          key: 'header',
          style: {
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px 0 rgba(102,126,234,0.15)',
            borderRadius: '0 0 32px 32px',
            border: '1px solid rgba(255,255,255,0.18)',
            padding: '1.5rem 2.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          },
        },
        React.createElement(
          'div',
          {
            style: {
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
          },
          [
            // Logo
            React.createElement(
              'div',
              {
                key: 'logo',
                style: {
                  fontSize: '2rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  letterSpacing: '-1px',
                },
              },
              '🚀 PickMe'
            ),
            // Navigation
            React.createElement(
              'nav',
              {
                key: 'nav',
                style: {
                  display: 'flex',
                  gap: '0.75rem',
                },
              },
              navItems.map((item) =>
                React.createElement(
                  'button',
                  {
                    key: item.id,
                    onClick: () => onNavigate(item.id),
                    style: {
                      padding: '0.85rem 2rem',
                      border: 'none',
                      borderRadius: '16px',
                      background: currentView === item.id
                        ? 'rgba(255,255,255,0.95)'
                        : 'rgba(255,255,255,0.12)',
                      color: currentView === item.id ? '#667eea' : '#ffffff',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s cubic-bezier(.4,2,.3,1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      boxShadow: currentView === item.id ? '0 4px 16px rgba(255,255,255,0.25)' : 'none',
                    },
                    onMouseEnter: (e: any) => {
                      if (currentView !== item.id) {
                        e.target.style.background = 'rgba(255,255,255,0.22)';
                      }
                    },
                    onMouseLeave: (e: any) => {
                      if (currentView !== item.id) {
                        e.target.style.background = 'rgba(255,255,255,0.12)';
                      }
                    },
                  },
                  [
                    React.createElement('span', { key: 'icon', style: { fontSize: '1.25rem' } }, item.icon),
                    React.createElement('span', { key: 'label', style: { fontWeight: 700 } }, item.label),
                  ]
                )
              )
            ),
          ]
        )
      ),
      // Main Content
      React.createElement(
        'main',
        {
          key: 'main',
          style: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2.5rem 2rem',
            position: 'relative',
          },
        },
        children
      ),
    ]
  );
};

export default Layout;
