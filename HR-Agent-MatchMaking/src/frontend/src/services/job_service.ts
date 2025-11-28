// @ts-ignore: process.env is injected by CRA
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface JobListItem {
  job_id: string;
  job_title: string;
  company?: string | null;
  description?: string | null;
  location?: string | null;
  country?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  employment_type?: string | null;
  url?: string | null;
  posted_date?: string | null;
  source: string;
}

export interface JobListResponse {
  total: number;
  page: number;
  page_size: number;
  items: JobListItem[];
}

export const jobService = {
  async listJobs(
    q: string | null = null,
    source: string | null = null,
    page: number = 1,
    pageSize: number = 20
  ): Promise<JobListResponse> {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (source && source !== 'all') params.append('source', source);
    params.append('page', String(page));
    params.append('page_size', String(pageSize));

    const response = await fetch(`${API_BASE_URL}/api/jobs/list?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to list jobs: ${response.statusText}`);
    }
    return response.json();
  },
};

export default jobService;
