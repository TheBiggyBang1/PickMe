import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard, JobStats } from './components/Dashboard';
import { FileUpload } from './components/FileUpload';
import { MatchResults } from './components/MatchResults';
import { Toast } from './components/Toast';
import { TechFilter } from './components/TechFilter';
import { JobsList } from './components/JobsList';
import { JobMatch } from './components/MatchCard';

type ViewType = 'dashboard' | 'upload' | 'search' | 'matches';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<Resume | null>(null);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searchKeywords, setSearchKeywords] = useState<string | null>(null);

  useEffect(() => {
    loadJobStats();
  }, []);

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
      setToast({ message: 'Resume uploaded successfully!', type: 'success' });
      
      // Automatically fetch matches
      const matchData = await AppService.getMatches(uploaded.resume_id);
  setMatches(matchData.top_matches || []);
      setCurrentView('matches');
    } catch (e: any) {
      setToast({ message: e.message || 'Upload failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshJobs() {
    setLoading(true);
    try {
      // Trigger job refresh from all APIs
      await AppService.triggerJobRefresh();
      setToast({ message: '🔄 Job refresh started! This may take 30-60 seconds...', type: 'info' });
      
      // Wait a moment, then reload stats
      setTimeout(async () => {
        await loadJobStats();
        setToast({ message: '✅ Jobs refreshed successfully!', type: 'success' });
      }, 5000);
    } catch (e: any) {
      setToast({ message: 'Failed to trigger job refresh', type: 'error' });
      setLoading(false);
    }
  }

  async function handleRefreshMatches() {
    if (!resume) return;
    setLoading(true);
    try {
      const matchData = await AppService.getMatches(resume.resume_id, 50, sourceFilter);
  setMatches(matchData.top_matches || []);
      setToast({ message: 'Matches updated!', type: 'success' });
    } catch (e: any) {
      setToast({ message: 'Failed to refresh matches', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleTechSearch(keywords: string) {
    setLoading(true);
    try {
      // Trigger job refresh with tech-specific keywords
      await AppService.triggerJobRefresh(keywords);
      setToast({ message: '🔄 Fetching jobs with your tech preferences...', type: 'info' });
      setSearchKeywords(keywords);
      
      // Wait and reload stats
      setTimeout(async () => {
        await loadJobStats();
        setToast({ message: '✅ Jobs refreshed successfully!', type: 'success' });
      }, 5000);
    } catch (e: any) {
      setToast({ message: 'Failed to search jobs', type: 'error' });
      setLoading(false);
    }
  }

  function renderView() {
    switch (currentView) {
      case 'dashboard':
        return React.createElement(Dashboard, {
          stats,
          loading,
          onRefreshJobs: handleRefreshJobs,
          onNavigate: (view: string) => setCurrentView(view as ViewType),
        });
      case 'upload':
        return React.createElement(
          'div',
          null,
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
              'Upload Your Resume'
            ),
            React.createElement(
              'p',
              {
                key: 'desc',
                style: {
                  fontSize: '1.1rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  textAlign: 'center',
                  marginBottom: '2rem',
                },
              },
              'Upload your resume to find the best matching jobs'
            ),
            React.createElement(FileUpload, {
              key: 'upload',
              onUpload: handleFileUpload,
              loading,
            }),
            resume &&
              React.createElement(
                'div',
                {
                  key: 'success',
                  style: {
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'rgba(72, 187, 120, 0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    textAlign: 'center',
                    fontWeight: 600,
                  },
                },
                `✅ Uploaded: ${resume.filename}`
              ),
          ]
        );
      case 'matches':
        return React.createElement(MatchResults, {
          matches,
          loading,
          onRefresh: handleRefreshMatches,
          sourceFilter,
          onSourceFilterChange: setSourceFilter,
        });
      case 'search':
        return React.createElement('div', null, [
          React.createElement(TechFilter, {
            key: 'techfilter',
            onSearch: (keywords: string) => handleTechSearch(keywords),
            loading,
          }),
          React.createElement('div', { key: 'spacer', style: { height: '1rem' } }),
          React.createElement(JobsList, { key: 'jobs', q: searchKeywords, source: sourceFilter }),
        ]);
      default:
        return null;
    }
  }

  return React.createElement(
    'div',
    null,
    [
      React.createElement(Layout, {
        key: 'layout',
        currentView,
        onNavigate: (view: string) => setCurrentView(view as ViewType),
        children: renderView(),
      }),
      toast &&
        React.createElement(Toast, {
          key: 'toast',
          message: toast.message,
          type: toast.type,
          onClose: () => setToast(null),
        }),
    ]
  );
};
/**
 * Main App Component for HR-Agent Frontend
 * 
 * This is a React + TypeScript application that provides:
 * - Resume upload interface with drag-and-drop support
 * - Real-time job matching with semantic similarity scoring
 * - Interactive filtering by job source (Reed, USAJobs, JSearch, etc.)
 * - Detailed match cards with salary, location, and company info
 * - Dashboard with job statistics and API health monitoring
 * 
 * Architecture:
 * - API Backend: FastAPI at http://localhost:8000
 * - State Management: React hooks (useState for local state)
 * - File Upload: multipart/form-data with progress tracking
 * - Matching: POST to /api/match/match-resume/{id} with top_k and source_filter
 * - Real-time Updates: Polling /api/jobs/stats for dashboard metrics
 * 
 * Components Structure:
 * - App (this file): Main container with routing and state
 * - FileUpload: Drag-and-drop resume upload with validation
 * - MatchResults: Grid display of top job matches
 * - MatchCard: Individual job card with score visualization
 * - Dashboard: Statistics dashboard with charts
 * 
 * Note: Keep as .ts for TypeScript-only logic. Convert to .tsx when adding JSX markup.
 */

export interface Resume {
  resume_id: string;
  filename: string;
  status: string;
  skills_extracted: {
    technical: string[];
    soft: string[];
    certifications: string[];
  };
}

export interface Match {
  job_id: string;
  job_title: string;
  company: string;
  location: string;
  match_score: number;
  source: string;
  url: string;
  salary_min?: number;
  salary_max?: number;
  employment_type?: string;
}

export interface AppState {
  currentResume: Resume | null;
  matches: Match[];
  loading: boolean;
  error: string | null;
  activeView: 'upload' | 'results' | 'dashboard';
}

// API Service placeholder
export const AppService = {
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

  async triggerJobRefresh(keywords: string = 'software engineer', locations?: string[]): Promise<any> {
    const response = await fetch('http://localhost:8000/api/jobs/trigger-refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keywords,
        locations: locations || ['United States', 'United Kingdom', 'Canada', 'Remote'],
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to trigger job refresh');
    }
    
    return response.json();
  },
};
// Import placeholders - These will be used when converting to App.tsx
// import './App.css';
// import FileUpload from './components/FileUpload';
// import MatchResults from './components/MatchResults';
// import Dashboard from './components/Dashboard';
// import resumeService from './services/resume_service';
// import matchService from './services/match_service';

/**
 * App Component Logic
 * 
 * This file contains the TypeScript logic for the main App component.
 * To convert to a React component:
 * 1. Rename this file to App.tsx
 * 2. Uncomment the imports above
 * 3. Import React and useState: import React, { useState } from 'react';
 * 4. Uncomment the component implementation below
 */

// State management interfaces
interface AppResume {
  resume_id: string;
  filename: string;
  status: string;
  skills_extracted: {
    technical: string[];
    soft: string[];
    certifications: string[];
  };
}

interface AppMatch {
  job_id: string;
  job_title: string;
  company: string;
  location: string;
  match_score: number;
  source: string;
  url: string;
}

// TODO: Convert to React component when ready
// Uncomment the code below and rename file to App.tsx
/*
// App component handlers
const AppHandlers = {
  async handleFileUpload(
    file: File,
    setCurrentResume: (resume: AppResume) => void,
    setMatches: (matches: AppMatch[]) => void,
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void,
    setActiveView: (view: 'upload' | 'results' | 'dashboard') => void
  ): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const resume = await resumeService.uploadResume(file);
      setCurrentResume(resume as AppResume);
      
      const matchResults = await matchService.getMatches(resume.resume_id, 50, 'all');
      setMatches(matchResults.top_matches);
      setActiveView('results');
    } catch (err: any) {
      setError(err.message || 'Failed to upload resume');
    } finally {
      setLoading(false);
    }
  },

  async handleRefresh(
    currentResume: AppResume | null,
    setMatches: (matches: AppMatch[]) => void,
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
  ): Promise<void> {
    if (!currentResume) return;

    setLoading(true);
    try {
      const matchResults = await matchService.getMatches(currentResume.resume_id, 50, 'all');
      setMatches(matchResults.top_matches);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh matches');
    } finally {
      setLoading(false);
    }
  }
};

const App: React.FC = () => {
  const [currentResume, setCurrentResume] = useState<AppResume | null>(null);
  const [matches, setMatches] = useState<AppMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'upload' | 'results' | 'dashboard'>('upload');

  const handleFileUpload = (file: File) => {
    AppHandlers.handleFileUpload(
      file, 
      setCurrentResume, 
      setMatches, 
      setLoading, 
      setError, 
      setActiveView
    );
  };

  const handleRefresh = () => {
    AppHandlers.handleRefresh(currentResume, setMatches, setLoading, setError);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 HR-Agent</h1>
        <p>AI-Powered Resume-to-Job Matching</p>
        
        <nav className="app-nav">
          <button 
            className={activeView === 'upload' ? 'active' : ''} 
            onClick={() => setActiveView('upload')}
          >
            Upload Resume
          </button>
          <button 
            className={activeView === 'results' ? 'active' : ''} 
            onClick={() => setActiveView('results')}
            disabled={!currentResume}
          >
            View Matches
          </button>
          <button 
            className={activeView === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard
          </button>
        </nav>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {activeView === 'upload' && (
          <div className="upload-view">
            <FileUpload onUpload={handleFileUpload} loading={loading} />
            
            {currentResume && (
              <div className="resume-info">
                <h3>✅ Resume Uploaded</h3>
                <p><strong>File:</strong> {currentResume.filename}</p>
                <p><strong>Status:</strong> {currentResume.status}</p>
                <p><strong>Skills Detected:</strong> {currentResume.skills_extracted.technical.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'results' && (
          <div className="results-view">
            <MatchResults 
              matches={matches} 
              loading={loading}
              onRefresh={handleRefresh}
            />
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="dashboard-view">
            <Dashboard />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by Sentence-BERT • 8 Global Job APIs • Built with ❤️ at ESPRIT</p>
      </footer>
    </div>
  );
};

export default App;
*/