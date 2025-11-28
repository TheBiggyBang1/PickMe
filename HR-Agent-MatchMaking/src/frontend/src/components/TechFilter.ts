/**
 * TechFilter Component
 * 
 * Technology-based job filter with categories and tech stacks.
 */

import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { JOB_CATEGORIES, TECH_STACKS } from '../utils/jobCategories';

export interface TechFilterProps {
  onSearch: (keywords: string) => void;
  loading: boolean;
}

export const TechFilter: React.FC<TechFilterProps> = ({ onSearch, loading }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

  function handleCategoryClick(category: string) {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  }

  function handleTechClick(tech: string) {
    if (selectedTechs.includes(tech)) {
      setSelectedTechs(selectedTechs.filter((t) => t !== tech));
    } else {
      setSelectedTechs([...selectedTechs, tech]);
    }
  }

  function handleSearch() {
    let keywords = '';
    if (selectedCategory) {
      const jobs = JOB_CATEGORIES[selectedCategory as keyof typeof JOB_CATEGORIES];
      keywords = jobs.join(' ');
    }
    if (selectedTechs.length > 0) {
      keywords += ' ' + selectedTechs.join(' ');
    }
    onSearch(keywords.trim() || 'software engineer');
  }

  function handleClear() {
    setSelectedCategory(null);
    setSelectedTechs([]);
  }

  return React.createElement('div', {
    style: {
      background: 'rgba(255,255,255,0.13)',
      borderRadius: '24px',
      boxShadow: '0 8px 32px 0 rgba(102,126,234,0.18)',
      backdropFilter: 'blur(18px)',
      border: '1px solid rgba(255,255,255,0.22)',
      padding: '2.5rem 2rem',
      maxWidth: '740px',
      margin: '0 auto',
      marginBottom: '2.5rem',
      color: '#fff',
      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    },
  }, [
    React.createElement(
      React.Fragment,
      null,
      [
        React.createElement(
          'h3',
          {
            key: 'title',
            style: {
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              color: '#2d3748',
            },
          },
          '🔍 Filter by Technology'
        ),
        // ...rest of children as before...
      ]
    )
  ]);
};

export default TechFilter;
