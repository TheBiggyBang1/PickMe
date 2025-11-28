import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import jobService, { JobListItem } from '../services/job_service';

export interface JobsListProps {
  q?: string | null;
  source?: string | null;
}

export const JobsList: React.FC<JobsListProps> = ({ q = null, source = null }) => {
  const [items, setItems] = useState<JobListItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await jobService.listJobs(q || null, source || null, page, pageSize);
      setItems(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
  }, [q, source]);

  useEffect(() => {
    load();
  }, [page, q, source]);

  function renderItem(job: JobListItem) {
    return React.createElement('div', {
      key: job.job_id,
      style: {
        background: 'rgba(255,255,255,0.10)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px 0 rgba(102,126,234,0.15)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.18)',
        padding: '2rem 1.5rem',
        transition: 'transform 0.2s cubic-bezier(.4,2,.3,1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        marginBottom: '0.5rem',
      },
      onMouseEnter: (e: any) => { e.currentTarget.style.transform = 'scale(1.03)'; },
      onMouseLeave: (e: any) => { e.currentTarget.style.transform = 'scale(1.0)'; },
    }, [
      React.createElement('div', {
        key: 'gradient',
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.18,
          borderRadius: '20px',
        },
      }),
      React.createElement('h3', {
        key: 'title',
        style: {
          fontSize: '1.35rem',
          fontWeight: 800,
          color: '#fff',
          marginBottom: '0.5rem',
          position: 'relative',
          zIndex: 1,
          letterSpacing: '-0.5px',
        },
      }, job.job_title),
      React.createElement('div', {
        key: 'meta',
        style: {
          color: '#e0e0e0',
          fontSize: '1rem',
          marginBottom: '0.75rem',
          fontWeight: 500,
          position: 'relative',
          zIndex: 1,
        },
      }, `${job.company || 'Unknown company'} • ${job.location || job.country || 'Remote'} • ${job.source}`),
      job.description && React.createElement('p', {
        key: 'desc',
        style: {
          color: '#f3f3f3',
          fontSize: '1.05rem',
          lineHeight: 1.6,
          maxHeight: '5.5rem',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          marginBottom: '1rem',
        },
      }, job.description.replace(/<[^>]+>/g, '').slice(0, 350) + (job.description.length > 350 ? '…' : '')),
      job.url && React.createElement(Button, {
        key: 'btn',
        variant: 'primary',
        onClick: () => window.open(job.url!, '_blank'),
        style: {
          marginTop: '0.5rem',
          fontWeight: 700,
          fontSize: '1.05rem',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(102,126,234,0.12)',
        },
        children: 'Open Job →',
      }),
    ]);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return React.createElement('div', null, [
    React.createElement('div', {
      key: 'grid',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '2rem',
        margin: '2rem 0',
      },
    }, loading ? [
      React.createElement('div', { key: 'loading', style: { gridColumn: '1 / -1', textAlign: 'center', color: '#fff', padding: '2rem', fontSize: '1.2rem', fontWeight: 600 } }, 'Loading jobs…'),
    ] : items.map(renderItem)),
    React.createElement('div', {
      key: 'pager',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '2rem',
        padding: '0 1rem',
      },
    }, [
      React.createElement('div', { key: 'info', style: { color: '#fff', fontWeight: 500, fontSize: '1rem' } }, `Page ${page} of ${totalPages} • ${total} jobs`),
      React.createElement('div', { key: 'buttons', style: { display: 'flex', gap: '0.75rem' } }, [
        React.createElement(Button, { key: 'prev', variant: 'outline', disabled: page <= 1, onClick: () => setPage((p) => Math.max(1, p - 1)), children: '← Prev' }),
        React.createElement(Button, { key: 'next', variant: 'outline', disabled: page >= totalPages, onClick: () => setPage((p) => Math.min(totalPages, p + 1)), children: 'Next →' }),
      ]),
    ]),
  ]);
};

export default JobsList;
