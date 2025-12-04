/**
 * MatchResults Component - Enhanced with Animations
 * 
 * Display job matches with animated cards and filtering
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiRefreshCw, FiExternalLink, FiMapPin, FiBriefcase } from 'react-icons/fi';

export interface JobMatch {
  job_id: string;
  job_title: string;
  company: string;
  location: string;
  country: string;
  source: string;
  salary_min?: number;
  salary_max?: number;
  employment_type: string;
  posted_date: string;
  match_score: number;
  url?: string;
}

export interface MatchResultsProps {
  matches: JobMatch[];
  loading: boolean;
  onRefresh: () => void;
  sourceFilter?: string;
  onSourceFilterChange?: (source: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4 },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
  hover: {
    y: -8,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  },
};

const scoreVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: { type: 'spring', stiffness: 100, delay: 0.2 },
  },
};

export const MatchResults: React.FC<MatchResultsProps> = ({
  matches,
  loading,
  onRefresh,
  sourceFilter = 'all',
  onSourceFilterChange,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sources = ['all', ...new Set(matches.map((m) => m.source))];
  const filteredMatches =
    sourceFilter === 'all'
      ? matches
      : matches.filter((m) => m.source === sourceFilter);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#48bb78';
    if (score >= 60) return '#ed8936';
    return '#f56565';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'rgba(72, 187, 120, 0.1)';
    if (score >= 60) return 'rgba(237, 137, 54, 0.1)';
    return 'rgba(245, 101, 101, 0.1)';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="card"
        style={{ background: 'linear-gradient(135deg, rgba(102,126,234,0.9) 0%, rgba(118,75,162,0.9) 100%)' }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>
              ✨ Your Top Matches
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)' }}>
              {filteredMatches.length} matching opportunities found
            </p>
          </div>
          <motion.button
            className="btn btn-primary"
            onClick={onRefresh}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Loading...' : 'Refresh'}
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <FiFilter style={{ color: 'var(--primary-color)' }} />
          <p style={{ color: 'var(--text-secondary)', marginRight: '1rem' }}>Filter by source:</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {sources.map((source) => (
              <motion.button
                key={source}
                onClick={() => onSourceFilterChange?.(source)}
                className={`badge ${sourceFilter === source ? 'badge-primary' : ''}`}
                style={{
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  border: sourceFilter === source ? '2px solid var(--primary-color)' : 'none',
                  background: sourceFilter === source ? 'var(--primary-light)' : 'var(--bg-secondary)',
                  color: sourceFilter === source ? 'var(--primary-color)' : 'var(--text-secondary)',
                  borderRadius: '1rem',
                  transition: 'all 0.3s ease',
                  textTransform: 'capitalize',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {source}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Match Cards */}
      {loading ? (
        <motion.div
          className="loading-spinner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="spinner" />
          <p className="loading-text">Finding your perfect matches...</p>
        </motion.div>
      ) : filteredMatches.length === 0 ? (
        <motion.div
          className="card"
          style={{ textAlign: 'center', padding: '3rem' }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            No matches found. Try refreshing or uploading a resume!
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.job_id}
                variants={cardVariants}
                exit="exit"
                whileHover="hover"
                onClick={() => setExpandedId(expandedId === match.job_id ? null : match.job_id)}
                className="card"
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {/* Match Score */}
                  <motion.div
                    variants={scoreVariants}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '70px',
                      height: '70px',
                      background: getScoreBg(match.match_score),
                      color: getScoreColor(match.match_score),
                      borderRadius: '0.75rem',
                      fontWeight: '700',
                      fontSize: '1.5rem',
                    }}
                  >
                    {Math.round(match.match_score)}%
                  </motion.div>

                  {/* Job Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          {match.job_title}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {match.company}
                        </p>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: 'var(--primary-light)',
                          color: 'var(--primary-color)',
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                        }}
                      >
                        {match.source}
                      </span>
                    </div>

                    {/* Job Meta */}
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiMapPin size={14} />
                        {match.location}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiBriefcase size={14} />
                        {match.employment_type}
                      </div>
                      {match.posted_date && (
                        <div>📅 {new Date(match.posted_date).toLocaleDateString()}</div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedId === match.job_id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}
                        >
                          {match.salary_min && match.salary_max && (
                            <p style={{ color: 'var(--success-color)', fontWeight: '600', marginBottom: '0.75rem' }}>
                              💰 ${match.salary_min.toLocaleString()} - ${match.salary_max.toLocaleString()}
                            </p>
                          )}
                          {match.url && (
                            <motion.a
                              href={match.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary"
                              style={{ display: 'inline-flex' }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FiExternalLink size={16} />
                              View on {match.source.charAt(0).toUpperCase() + match.source.slice(1)}
                            </motion.a>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};
