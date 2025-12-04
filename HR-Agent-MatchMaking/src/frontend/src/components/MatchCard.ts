/**
 * MatchCard Component
 * 
 * Individual job match card with score visualization and details.
 */

import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

export interface JobMatch {
  job_id: string;
  job_title: string;
  company: string | null;
  location: string | null;
  country: string | null;
  source: string;
  salary_min: number | null;
  salary_max: number | null;
  employment_type: string | null;
  posted_date: string | null;
  match_score: number;
  url: string | null;
  description?: string;
}

export interface MatchCardProps {
  match: JobMatch;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const scoreColor =
    match.match_score >= 80
      ? '#48bb78'
      : match.match_score >= 60
      ? '#ed8936'
      : '#f56565';

  const formatSalary = () => {
    if (match.salary_min && match.salary_max) {
      return `$${match.salary_min.toLocaleString()} - $${match.salary_max.toLocaleString()}`;
    } else if (match.salary_min) {
      return `From $${match.salary_min.toLocaleString()}`;
    } else if (match.salary_max) {
      return `Up to $${match.salary_max.toLocaleString()}`;
    }
    return 'Salary not specified';
  };

  return React.createElement('div', {
    style: {
      background: 'rgba(235, 235, 235, 0.87)',
      borderRadius: '24px',
      boxShadow: '0 8px 32px 0 rgba(102,126,234,0.18)',
      backdropFilter: 'blur(18px)',
      border: '1px solid rgba(255,255,255,0.22)',
      padding: '2.5rem 2rem',
      color: '#fff',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '1.5rem',
    },
  }, [
      // Header with score
      React.createElement(
        'div',
        {
          key: 'header',
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem',
          },
        },
        [
          React.createElement(
            'div',
            { key: 'title-section' },
            [
              React.createElement(
                'h3',
                {
                  key: 'title',
                  style: {
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#2d3748',
                    marginBottom: '0.25rem',
                  },
                },
                match.job_title
              ),
              React.createElement(
                'div',
                {
                  key: 'company',
                  style: {
                    fontSize: '0.95rem',
                    color: '#718096',
                  },
                },
                match.company || 'Company not specified'
              ),
            ]
          ),
          React.createElement(
            'div',
            {
              key: 'score',
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.75rem',
                background: `${scoreColor}15`,
                borderRadius: '12px',
                minWidth: '70px',
              },
            },
            [
              React.createElement(
                'div',
                {
                  key: 'score-value',
                  style: {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: scoreColor,
                  },
                },
                `${match.match_score}%`
              ),
              React.createElement(
                'div',
                {
                  key: 'score-label',
                  style: {
                    fontSize: '0.75rem',
                    color: '#718096',
                  },
                },
                'Match'
              ),
            ]
          ),
        ]
      ),
      // Details grid
      React.createElement(
        'div',
        {
          key: 'details',
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginBottom: '1rem',
          },
        },
        [
          React.createElement(
            'div',
            { key: 'location' },
            [
              React.createElement(
                'div',
                {
                  key: 'label',
                  style: { fontSize: '0.75rem', color: '#000000ff', marginBottom: '0.25rem' },
                },
                '📍 Location'
              ),
              React.createElement(
                'div',
                {
                  key: 'value',
                  style: { fontSize: '0.9rem', color: '#2d3748', fontWeight: 600 },
                },
                match.location || 'Remote'
              ),
            ]
          ),
          React.createElement(
            'div',
            { key: 'type' },
            [
              React.createElement(
                'div',
                {
                  key: 'label',
                  style: { fontSize: '0.75rem', color: '#a0aec0', marginBottom: '0.25rem' },
                },
                '💼 Type'
              ),
              React.createElement(
                'div',
                {
                  key: 'value',
                  style: { fontSize: '0.9rem', color: '#2d3748', fontWeight: 600 },
                },
                match.employment_type || 'Full-time'
              ),
            ]
          ),
          React.createElement(
            'div',
            { key: 'salary' },
            [
              React.createElement(
                'div',
                {
                  key: 'label',
                  style: { fontSize: '0.75rem', color: '#a0aec0', marginBottom: '0.25rem' },
                },
                '💰 Salary'
              ),
              React.createElement(
                'div',
                {
                  key: 'value',
                  style: { fontSize: '0.9rem', color: '#2d3748', fontWeight: 600 },
                },
                formatSalary()
              ),
            ]
          ),
          React.createElement(
            'div',
            { key: 'source' },
            [
              React.createElement(
                'div',
                {
                  key: 'label',
                  style: { fontSize: '0.75rem', color: '#a0aec0', marginBottom: '0.25rem' },
                },
                '🌐 Source'
              ),
              React.createElement(
                'div',
                {
                  key: 'value',
                  style: { fontSize: '0.9rem', color: '#2d3748', fontWeight: 600 },
                },
                match.source
              ),
            ]
          ),
        ]
      ),
      // Action button
      ...(match.url ? [
        React.createElement(Button, {
          key: 'apply-button',
          onClick: () => window.open(match.url!, '_blank'),
          variant: 'primary',
          style: { width: '100%' },
          children: 'View Job Details →',
        })
      ] : []),
    ]
  );
};

export default MatchCard;
