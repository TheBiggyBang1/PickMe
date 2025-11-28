/**
 * Resume Service - API integration for resume operations
 * 
 * Handles:
 * - Resume file upload (PDF/DOCX/TXT)
 * - Resume processing and skill extraction
 * - Resume retrieval
 */

// Use process.env.REACT_APP_API_URL for CRA; TypeScript will infer type
// @ts-ignore: process.env is injected by CRA
const API_BASE_URL: string = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface Resume {
  resume_id: string;
  filename: string;
  status: string;
  skills_extracted: {
    technical: string[];
    soft: string[];
    certifications: string[];
  };
  content?: string;
  created_at?: string;
}

export const resumeService = {
  /**
   * Upload a resume file to the backend
   * @param file - PDF, DOCX, or TXT file
   * @returns Promise<Resume> - Processed resume with extracted skills
   */
  async uploadResume(file: File): Promise<Resume> {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Please upload PDF, DOCX, or TXT.`);
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 10MB.`);
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/resume/upload-resume`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to upload resume' }));
      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get resume by ID
   * @param resumeId - MongoDB document ID
   * @returns Promise<Resume>
   */
  async getResume(resumeId: string): Promise<Resume> {
    const response = await fetch(`${API_BASE_URL}/api/resume/${resumeId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch resume: ${response.statusText}`);
    }

    return response.json();
  },
};

export default resumeService;
