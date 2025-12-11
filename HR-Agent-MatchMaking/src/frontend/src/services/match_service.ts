/**
 * Match Service - API integration for job matching operations
 * 
 * Handles:
 * - Resume-to-job semantic matching
 * - Filtering by job source
 * - Top-K result retrieval
 */

// @ts-ignore: process.env is injected by CRA
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface MatchReport {
  match_score: number;
  score_breakdown: {
    semantic_fit: string;
    technical_alignment: string;
    candidate_readiness: string;
  };
  matched_skills: string[];
  missing_skills: string[];
  transferable_skills: string[];
  recommendations: string[];
}

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
  report?: MatchReport;
  url: string | null;
  description?: string;
}

export interface MatchResponse {
  resume_id: string;
  total_matches: number;
  matches_by_source: Record<string, number>;
  top_matches: JobMatch[];
  generated_at: string;
}

export interface JobStats {
  total_jobs_indexed: number;
  jobs_by_source: Record<string, number>;
  last_sync: string | null;
  next_sync: string | null;
  api_health: Record<string, string>;
}

export const matchService = {
  /**
   * Get job matches for a resume
   * @param resumeId - MongoDB resume document ID
   * @param topK - Number of top matches to return (default: 50)
   * @param sourceFilter - Filter by job source ('all', 'reed', 'usajobs', etc.)
   * @param diversity - Include diverse job types to avoid over-concentration (default: true)
   * @returns Promise<MatchResponse>
   */
  async getMatches(
    resumeId: string,
    topK: number = 50,
    sourceFilter: string = 'all',
    diversity: boolean = true
  ): Promise<MatchResponse> {
    const url = `${API_BASE_URL}/api/match/match-resume/${resumeId}?top_k=${topK}&source_filter=${sourceFilter}&diversity=${diversity}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch matches' }));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get job statistics from all sources
   * @returns Promise<JobStats>
   */
  async getJobStats(): Promise<JobStats> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/stats`);

    if (!response.ok) {
      throw new Error(`Failed to fetch job statistics: ${response.statusText}`);
    }

    const data = await response.json();

    // Normalize response to support older UI components expecting
    // `total_jobs` and `by_source` fields while preserving original keys.
    const normalized = {
      ...data,
      total_jobs: (data as any).total_jobs_indexed ?? (data as any).total_jobs ?? 0,
      by_source: (data as any).jobs_by_source ?? (data as any).by_source ?? {},
      last_sync: (data as any).last_sync ?? null,
      next_sync: (data as any).next_sync ?? null,
      api_health: (data as any).api_health ?? {},
    };

    return normalized as unknown as JobStats;
  },

  /**
   * Trigger manual job refresh from all APIs
   * @param keywords - Search keywords (default: "python developer")
   * @param locations - Array of locations to search
   * @returns Promise with refresh status
   */
  async triggerJobRefresh(
    keywords: string = 'python developer',
    locations: string[] = ['USA', 'UK', 'Germany', 'Remote']
  ): Promise<{ status: string; message: string; estimated_duration_seconds: number }> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/trigger-refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keywords, locations }),
    });

    if (!response.ok) {
      throw new Error(`Failed to trigger job refresh: ${response.statusText}`);
    }

    return response.json();
  },
};

export default matchService;
