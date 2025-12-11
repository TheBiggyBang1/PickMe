/**
 * App Component - Enhanced with Animations
 * 
 * Main React application with modern UI and Framer Motion animations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';
import { Dashboard, JobStats } from './components/Dashboard';
import { FileUpload } from './components/FileUpload';
import { MatchResults } from './components/MatchResults';
import { Toast } from './components/Toast';
import './App.css';

type ViewType = 'dashboard' | 'upload' | 'matches';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface Resume {
  resume_id: string;
  filename: string;
  status: string;
  skills_extracted?: {
    technical: string[];
    soft: string[];
    certifications: string[];
  };
}

interface JobMatch {
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

// API Service
const AppService = {
  async uploadResume(file: File): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('http://localhost:8000/api/resume/upload-resume', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload resume');
    }
    
    return response.json();
  },
  
  async getMatches(resumeId: string, topK: number = 50, sourceFilter: string = 'all'): Promise<any> {
    const url = `http://localhost:8000/api/match/match-resume/${resumeId}?top_k=${topK}&source_filter=${sourceFilter}`;
    
    const response = await fetch(url, { method: 'POST' });
    
    if (!response.ok) {
      throw new Error('Failed to fetch matches');
    }
    
    return response.json();
  },
  
  async getJobStats(): Promise<any> {
    const response = await fetch('http://localhost:8000/api/jobs/stats');
    
    if (!response.ok) {
      throw new Error('Failed to fetch job statistics');
    }
    
    return response.json();
  },

  async triggerJobRefresh(keywords: string = 'software engineer'): Promise<any> {
    const response = await fetch('http://localhost:8000/api/jobs/trigger-refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keywords,
        locations: ['United States', 'United Kingdom', 'Canada', 'Remote'],
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to trigger job refresh');
    }
    
    return response.json();
  },
};

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<Resume | null>(null);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [filteredJob,setFilteredJob]=useState(matches)

  useEffect(() => {
    loadJobStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadJobStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  useEffect(()=>{
    setFilteredJob(matches.filter(job=>job.source===sourceFilter ))
  },[sourceFilter])

  async function loadJobStats() {
    try {
      const data = await AppService.getJobStats();
      setStats(data);
    } catch (e: any) {
      console.error('Failed to load stats:', e);
    }
  }

  async function handleFileUpload(file: File) {
    setLoading(true);
    try {
      const uploaded = await AppService.uploadResume(file);
      setResume(uploaded);
      showToast('Resume uploaded successfully! 🎉', 'success');
      
      // Automatically fetch matches
      const matchData = await AppService.getMatches(uploaded.resume_id);
      setMatches(matchData.top_matches || []);
      setCurrentView('matches');
    } catch (e: any) {
      showToast(e.message || 'Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshJobs() {
    setLoading(true);
    try {
      await AppService.triggerJobRefresh();
      showToast('🔄 Job refresh started! Please wait...', 'info');
      
      // Wait and reload stats
      setTimeout(async () => {
        await loadJobStats();
        showToast('✅ Jobs refreshed successfully!', 'success');
      }, 5000);
    } catch (e: any) {
      showToast('Failed to trigger job refresh', 'error');
      setLoading(false);
    }
  }

  async function handleRefreshMatches() {
    if (!resume) return;
    setLoading(true);
    try {
      const matchData = await AppService.getMatches(resume.resume_id, 50, sourceFilter);
      setMatches(matchData.top_matches || []);
      showToast('Matches updated! ✨', 'success');
    } catch (e: any) {
      showToast('Failed to refresh matches', 'error');
    } finally {
      setLoading(false);
    }
  }

  function renderView() {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            stats={stats}
            loading={loading}
            onRefreshJobs={handleRefreshJobs}
            onNavigate={(view: string) => setCurrentView(view as ViewType)}
          />
        );
      case 'upload':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <FileUpload onUpload={handleFileUpload} loading={loading} />
            
            {resume && (
              <motion.div
                className="card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(72, 187, 120, 0.05) 100%)',
                  marginTop: '2rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>✅</span>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      Resume Uploaded
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {resume.filename}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      case 'matches':
        return (
          <MatchResults
            matches={sourceFilter!=='all'?filteredJob:matches}
            loading={loading}
            onRefresh={handleRefreshMatches}
            sourceFilter={sourceFilter}
            onSourceFilterChange={setSourceFilter}
          />
        );
      default:
        return null;
    }
  }

  return (
    <motion.div
      className="app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Layout
        currentView={currentView}
        onNavigate={(view: string) => setCurrentView(view as ViewType)}
      >
        <AnimatePresence mode="wait">
          <motion.div key={currentView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </Layout>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.3 }}
            className={`toast toast-${toast.type}`}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              zIndex: 1000,
            }}
          >
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default App;
