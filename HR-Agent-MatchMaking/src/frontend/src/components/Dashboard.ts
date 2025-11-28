/**
 * Dashboard Component
 * 
 * Main dashboard showing job stats, quick actions, and system status.
 * 
 * Usage:
 * <Dashboard stats={jobStats} onRefreshJobs={handleRefresh} />
 * 
 * Note: This is a TypeScript placeholder. Convert to Dashboard.tsx for React implementation.
 */

import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

export interface JobStats {
  total_jobs: number;
  by_source: Record<string, number>;
  last_sync: string;
}

export interface DashboardProps {
  stats: JobStats | null;
  loading: boolean;
  onRefreshJobs: () => void;
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  loading,
  onRefreshJobs,
  onNavigate,
}) => {
  const statCards = [
    {
      title: 'Total Jobs',
      value: stats?.total_jobs || 0,
      icon: '💼',
      color: '#667eea',
    },
    {
      title: 'Active Sources',
      value: stats?.by_source ? Object.keys(stats.by_source).length : 0,
      icon: '🌐',
      color: '#48bb78',
    },
    {
      title: 'Last Sync',
      value: stats?.last_sync
        ? new Date(stats.last_sync).toLocaleTimeString()
        : 'Never',
      icon: '🔄',
      color: '#ed8936',
    },
  ];

  return React.createElement(
    'div',
    null,
    [
      // Title
      React.createElement(
        'h1',
        {
          key: 'title',
          style: {
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '2rem',
            color: '#fff',
            textAlign: 'center',
          },
        },
        'Welcome to HR Agent'
      ),
      // Stat Cards Grid
      React.createElement(
        'div',
        {
          key: 'stats-grid',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          },
        },
        statCards.map((stat, idx) =>
          React.createElement(Card, {
            key: idx,
            hover: true,
            children: [
              React.createElement(
                'div',
                {
                  key: 'icon',
                  style: {
                    fontSize: '3rem',
                    marginBottom: '1rem',
                  },
                },
                stat.icon
              ),
              React.createElement(
                'div',
                {
                  key: 'title',
                  style: {
                    fontSize: '0.95rem',
                    color: '#718096',
                    marginBottom: '0.5rem',
                  },
                },
                stat.title
              ),
              React.createElement(
                'div',
                {
                  key: 'value',
                  style: {
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: stat.color,
                  },
                },
                typeof stat.value === 'number'
                  ? stat.value.toLocaleString()
                  : stat.value
              ),
            ],
          })
        )
      ),
      // Quick Actions
      React.createElement(Card, {
        key: 'quick-actions',
        children: [
          React.createElement(
            'h2',
            {
              key: 'actions-title',
              style: {
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
                color: '#2d3748',
              },
            },
            'Quick Actions'
          ),
          React.createElement(
            'div',
            {
              key: 'actions-grid',
              style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              },
            },
            [
              React.createElement(Button, {
                key: 'upload',
                onClick: () => onNavigate('upload'),
                variant: 'primary',
                size: 'large',
                style: { width: '100%' },
                children: '📄 Upload Resume',
              }),
              React.createElement(Button, {
                key: 'search',
                onClick: () => onNavigate('search'),
                variant: 'secondary',
                size: 'large',
                style: { width: '100%' },
                children: '🔍 Search Jobs',
              }),
              React.createElement(Button, {
                key: 'matches',
                onClick: () => onNavigate('matches'),
                variant: 'secondary',
                size: 'large',
                style: { width: '100%' },
                children: '✨ View Matches',
              }),
              React.createElement(Button, {
                key: 'refresh',
                onClick: onRefreshJobs,
                variant: 'outline',
                size: 'large',
                loading,
                style: { width: '100%' },
                children: '🔄 Refresh Jobs',
              }),
            ]
          ),
        ],
      }),
      // Job Sources
      stats &&
        stats.by_source &&
        React.createElement(Card, {
          key: 'sources',
          style: { marginTop: '2rem' },
          children: [
            React.createElement(
              'h2',
              {
                key: 'sources-title',
                style: {
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  marginBottom: '1.5rem',
                  color: '#2d3748',
                },
              },
              'Jobs by Source'
            ),
            React.createElement(
              'div',
              {
                key: 'sources-list',
                style: {
                  display: 'grid',
                  gap: '0.75rem',
                },
              },
              stats.by_source ? Object.entries(stats.by_source).map(([source, count]) =>
                React.createElement(
                  'div',
                  {
                    key: source,
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: 'rgba(102, 126, 234, 0.05)',
                      borderRadius: '8px',
                    },
                  },
                  [
                    React.createElement(
                      'span',
                      {
                        key: 'name',
                        style: {
                          fontWeight: 600,
                          color: '#2d3748',
                        },
                      },
                      source
                    ),
                    React.createElement(
                      'span',
                      {
                        key: 'count',
                        style: {
                          padding: '0.25rem 0.75rem',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                        },
                      },
                      count.toLocaleString()
                    ),
                  ]
                )
              ) : []
            ),
          ],
        }),
    ]
  );
};

export default Dashboard;
