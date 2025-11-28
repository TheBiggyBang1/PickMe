/**
 * JobRefreshModal Component
 * 
 * Modal for customizing job refresh parameters.
 */

import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';

export interface JobRefreshModalProps {
  onClose: () => void;
  onRefresh: (keywords: string, locations: string[]) => void;
  loading: boolean;
}

export const JobRefreshModal: React.FC<JobRefreshModalProps> = ({
  onClose,
  onRefresh,
  loading,
}) => {
  const [keywords, setKeywords] = useState('software engineer python developer data scientist machine learning');
  const [locations, setLocations] = useState('United States, United Kingdom, Canada, Remote');

  function handleSubmit() {
    const locationArray = locations.split(',').map((l) => l.trim()).filter(Boolean);
    onRefresh(keywords, locationArray);
  }

  return React.createElement(
    'div',
    {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      },
      onClick: onClose,
    },
    React.createElement(Card, {
      style: { maxWidth: 500, width: '90%' },
      children: React.createElement(
        'div',
        {
          onClick: (e: any) => e.stopPropagation(),
        },
        [
          React.createElement(
            'h2',
            {
              key: 'title',
              style: {
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '1.5rem',
                color: '#2d3748',
              },
            },
            '🔄 Refresh Job Listings'
          ),
          React.createElement(
            'div',
            {
              key: 'form',
              style: { marginBottom: '1.5rem' },
            },
            [
              React.createElement(
                'label',
                {
                  key: 'keywords-label',
                  style: {
                    display: 'block',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#2d3748',
                  },
                },
                'Job Keywords'
              ),
              React.createElement('input', {
                key: 'keywords-input',
                type: 'text',
                value: keywords,
                onChange: (e: any) => setKeywords(e.target.value),
                placeholder: 'e.g., software engineer, data scientist',
                style: {
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  marginBottom: '1rem',
                },
              }),
              React.createElement(
                'label',
                {
                  key: 'locations-label',
                  style: {
                    display: 'block',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: '#2d3748',
                  },
                },
                'Locations (comma-separated)'
              ),
              React.createElement('input', {
                key: 'locations-input',
                type: 'text',
                value: locations,
                onChange: (e: any) => setLocations(e.target.value),
                placeholder: 'e.g., United States, United Kingdom, Remote',
                style: {
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                },
              }),
              React.createElement(
                'p',
                {
                  key: 'info',
                  style: {
                    fontSize: '0.875rem',
                    color: '#718096',
                    marginTop: '0.5rem',
                  },
                },
                '⏱️ This will fetch fresh jobs from 8 different APIs. It may take 30-60 seconds.'
              ),
            ]
          ),
          React.createElement(
            'div',
            {
              key: 'actions',
              style: {
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
              },
            },
            [
              React.createElement(Button, {
                key: 'cancel',
                onClick: onClose,
                variant: 'outline',
                children: 'Cancel',
              }),
              React.createElement(Button, {
                key: 'refresh',
                onClick: handleSubmit,
                variant: 'primary',
                loading,
                children: 'Start Refresh',
              }),
            ]
          ),
        ]
      ),
    })
  );
};

export default JobRefreshModal;
