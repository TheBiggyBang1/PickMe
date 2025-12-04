/**
 * Layout Component - Enhanced with Animations
 * 
 * Modern layout with Framer Motion animations and improved design
 */

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiUpload, FiSearch, FiStar } from 'react-icons/fi';

export interface LayoutProps {
  children: ReactNode;
  currentView: string;
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

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.95 },
};

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiBarChart2 },
    { id: 'upload', label: 'Upload Resume', icon: FiUpload },
    { id: 'search', label: 'Job Search', icon: FiSearch },
    { id: 'matches', label: 'My Matches', icon: FiStar },
  ];

  return (
    <motion.div
      className="app"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.header className="app-header" variants={itemVariants}>
        <motion.div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
          }}
        >
          {/* Logo */}
          <motion.div
            variants={itemVariants}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <motion.span
              style={{ fontSize: '2.5rem' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              🚀
            </motion.span>
            <div>
              <h1>PickMe</h1>
              <p>Find your perfect job with AI-powered matching</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="app-nav">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  className={`nav-button ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                  transition={{ delay: index * 0.05 }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </motion.div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        className="app-main"
        key={currentView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.main>
    </motion.div>
  );
};
