/**
 * Dashboard Component - Enhanced with Animations
 * 
 * Main dashboard with animated stat cards and quick actions
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  hover: {
    y: -8,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    transition: { duration: 0.3 },
  },
};

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  loading,
  onRefreshJobs,
  onNavigate,
}) => {
  const quickActions = [
    {
      title: 'Upload Resume',
      description: 'Upload your CV to get matched with relevant opportunities',
      icon: '📄',
      action: () => onNavigate('upload'),
      color: '#667eea',
      highlight: true,
    },
    {
      title: 'Find Jobs',
      description: 'Browse all available positions',
      icon: '🔍',
      action: () => onNavigate('search'),
      color: '#48bb78',
    },
    {
      title: 'View Matches',
      description: 'See your AI-powered matches',
      icon: '✨',
      action: () => onNavigate('matches'),
      color: '#f093fb',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Section */}
      <motion.div
        variants={cardVariants}
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(102,126,234,0.95) 0%, rgba(118,75,162,0.95) 100%)',
          marginBottom: '2rem',
          padding: '2.5rem',
        }}
      >
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '700' }}>
            Welcome to PickMe
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Find your perfect job match powered by AI. Simply upload your resume and our intelligent matching engine 
            will analyze it against thousands of opportunities to find the roles that best fit your skills and experience.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>
            💡 <strong>How it works:</strong> Upload your resume → AI analyzes your skills → Get personalized job matches with compatibility scores
          </p>
        </motion.div>
      </motion.div>

      {/* Prominent Upload Section */}
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(240, 244, 255, 0.99) 0%, rgba(230, 240, 255, 0.99) 100%)',
          border: '2px solid rgba(102, 126, 234, 0.3)',
          marginBottom: '2rem',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: '3.5rem' }}
          >
            📄
          </motion.div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
              Get Started Now
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Upload your resume to begin receiving AI-powered job recommendations tailored to your profile
            </p>
            <motion.button
              className="btn btn-primary"
              onClick={() => onNavigate('upload')}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
              }}
            >
              📤 Upload Your Resume
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      {stats && (
        <motion.div
          variants={cardVariants}
          className="card"
          style={{ marginBottom: '2rem' }}
        >
          <h3 className="card-title">📊 Database Status</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(102,126,234,0.05) 100%)',
                borderRadius: '1rem',
                textAlign: 'center',
                borderLeft: '4px solid #667eea',
              }}
            >
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Total Jobs
              </p>
              <motion.p
                style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                {(stats?.total_jobs || 0).toLocaleString()}
              </motion.p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(72,187,120,0.1) 0%, rgba(72,187,120,0.05) 100%)',
                borderRadius: '1rem',
                textAlign: 'center',
                borderLeft: '4px solid #48bb78',
              }}
            >
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Active Sources
              </p>
              <motion.p
                style={{ fontSize: '2rem', fontWeight: '700', color: '#48bb78' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.3 }}
              >
                {(stats?.by_source ? Object.keys(stats.by_source).length : 0)}
              </motion.p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(237,137,54,0.1) 0%, rgba(237,137,54,0.05) 100%)',
                borderRadius: '1rem',
                textAlign: 'center',
                borderLeft: '4px solid #ed8936',
              }}
            >
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Last Updated
              </p>
              <p style={{ fontSize: '1rem', fontWeight: '600', color: '#ed8936', marginTop: '0.5rem' }}>
                {stats?.last_sync ? new Date(stats.last_sync).toLocaleDateString() : 'Never'}
              </p>
            </motion.div>
          </div>

          <motion.button
            className="btn btn-secondary"
            onClick={onRefreshJobs}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ marginTop: '1.5rem' }}
          >
            <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Refreshing Jobs...' : 'Refresh Job Database'}
          </motion.button>
        </motion.div>
      )}

      {/* Features Section */}
      <motion.div variants={containerVariants}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: '600' }}>
          How It Works
        </h2>
        <motion.div
          className="grid grid-3"
          variants={containerVariants}
          style={{ marginBottom: '2rem' }}
        >
          {[
            {
              number: '1',
              title: 'Upload Resume',
              description: 'Submit your CV in PDF, DOCX, or TXT format. Our system will extract and analyze your skills.',
              icon: '📤',
            },
            {
              number: '2',
              title: 'AI Analysis',
              description: 'Our machine learning engine analyzes your profile against thousands of job descriptions.',
              icon: '🤖',
            },
            {
              number: '3',
              title: 'Get Matches',
              description: 'Receive personalized job recommendations ranked by compatibility score.',
              icon: '🎯',
            },
          ].map((step, idx) => (
            <motion.div
              key={step.number}
              variants={cardVariants}
              whileHover="hover"
              className="card"
              style={{
                position: 'relative',
                paddingTop: '2rem',
              }}
            >
              <motion.div
                style={{
                  position: 'absolute',
                  top: '-1rem',
                  left: '1rem',
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1.2rem',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 + 0.2 }}
              >
                {step.number}
              </motion.div>
              <motion.span style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'block' }}>
                {step.icon}
              </motion.span>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {step.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={containerVariants}>
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: '600' }}>
          Quick Actions
        </h2>
        <motion.div className="grid grid-3" variants={containerVariants}>
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              variants={cardVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className="card"
              style={{
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                background: 'var(--bg-primary)',
                boxShadow: action.highlight
                  ? '0 10px 30px rgba(102, 126, 234, 0.2), inset 0 1px 0 rgba(255,255,255,0.6)'
                  : 'var(--shadow-md)',
                borderTop: action.highlight ? '3px solid #667eea' : 'none',
              }}
            >
              <motion.span
                style={{ fontSize: action.highlight ? '3rem' : '2.5rem', marginBottom: '1rem', display: 'block' }}
                animate={action.highlight ? { scale: [1, 1.1, 1] } : {}}
                transition={action.highlight ? { duration: 2, repeat: Infinity } : {}}
              >
                {action.icon}
              </motion.span>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: action.highlight ? '1.25rem' : '1rem' }}>
                {action.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {action.description}
              </p>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
