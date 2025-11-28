import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { MatchCard, JobMatch } from './MatchCard';

export interface MatchResultsProps {
  matches: JobMatch[];
  loading: boolean;
  onRefresh: () => void;
  sourceFilter?: string;
  onSourceFilterChange?: (source: string) => void;
}

export const MatchResults: React.FC<MatchResultsProps> = ({
  matches,
  loading,
  onRefresh,
  sourceFilter = 'all',
  onSourceFilterChange,
}) => {
  const sources = ['all', ...new Set(matches.map((m) => m.source))];

  return React.createElement('div', null, [
    // Header
    React.createElement(
      'div',
      {
        key: 'header',
        style: {
          marginBottom: '2rem',
        },
      },
      [
        React.createElement(
          'h1',
          {
            key: 'title',
            style: {
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: '#fff',
              textAlign: 'center',
            },
          },
          `✨ Your Top Matches (${matches.length})`
        ),
        // Filters
        React.createElement(Card, {
          key: 'filters',
          children: React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center',
              },
            },
            [
              React.createElement(
                'span',
                {
                  key: 'label',
                  style: { fontWeight: 600, color: '#2d3748' },
                },
                'Filter by source:'
              ),
              ...sources.map((source) =>
                React.createElement(Button, {
                  key: source,
                  onClick: () => onSourceFilterChange?.(source),
                  variant: sourceFilter === source ? 'primary' : 'outline',
                  size: 'small',
                  children: source === 'all' ? 'All Sources' : source,
                })
              ),
              React.createElement(Button, {
                key: 'refresh',
                onClick: onRefresh,
                variant: 'secondary',
                size: 'small',
                loading,
                children: '🔄 Refresh',
                style: { marginLeft: 'auto' },
              }),
            ]
          ),
        }),
      ]
    ),
    // Matches grid
    loading
      ? React.createElement(Card, {
          key: 'loading',
          children: React.createElement(
            'div',
            {
              style: {
                textAlign: 'center',
                padding: '3rem',
                color: '#718096',
              },
            },
            '⏳ Loading matches...'
          ),
        })
      : matches.length === 0
      ? React.createElement(Card, {
          key: 'empty',
          children: React.createElement(
            'div',
            {
              style: {
                textAlign: 'center',
                padding: '3rem',
              },
            },
            [
              React.createElement(
                'div',
                {
                  key: 'icon',
                  style: { fontSize: '4rem', marginBottom: '1rem' },
                },
                '🔍'
              ),
              React.createElement(
                'h2',
                {
                  key: 'title',
                  style: {
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: '#2d3748',
                    marginBottom: '0.5rem',
                  },
                },
                'No matches found'
              ),
              React.createElement(
                'p',
                {
                  key: 'desc',
                  style: { color: '#718096' },
                },
                'Upload a resume to get started with job matching.'
              ),
            ]
          ),
        })
      : React.createElement(
          'div',
          {
            key: 'matches',
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem',
            },
          },
          matches.map((match) =>
            React.createElement(MatchCard, {
              key: match.job_id,
              match,
            })
          )
        ),
  ]);
};
