// frontend/src/services/api.ts
// Central API base URL (mirror ItemsService pattern)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Types
export interface Job {
  id?: string;
  title: string;
  job_number: string;
  description: string;
  location: string;
  department: string;
  status: 'draft' | 'published' | 'closed';
  priority: 'low' | 'medium' | 'high';
  employment_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote_allowed: boolean;
  required_skills: string[];
  preferred_skills: string[];
  tags: string[];
  salary_min?: number;
  salary_max?: number;
  experience_required: string;
  created_at?: string;
  updated_at?: string;
}

export interface Candidate {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  current_title: string;
  current_company: string;
  location: string;
  linkedin_url: string;
  portfolio_url: string;
  years_experience?: number;
  skills: string[];
  emails: string[];
  phones: string[];
  source: string;
  tags: string[];
  notes: string;
  created_at?: string;
  updated_at?: string;
}

// API Error handling
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  // Use the same key as the auth flow: access_token
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Attempt to parse validation or error details
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // ignore JSON parse errors
      }
      // Extract detail field if present (FastAPI validation errors)
      const detail = errorData.detail;
      const message = detail
        ? (typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2))
        : `HTTP ${response.status}: ${response.statusText}`;
      throw new ApiError(response.status, message);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error.message}`);
  }
}

// Job API functions
export const jobApi = {
  // Get all jobs
  async getJobs(params?: {
    skip?: number;
    limit?: number;
    status?: string[];
    department?: string;
    location?: string;
    q?: string;
  }): Promise<{ jobs: Job[]; total: number; page: number; per_page: number }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      if (params.skip) searchParams.append('skip', params.skip.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.status) params.status.forEach(s => searchParams.append('status', s));
      if (params.department) searchParams.append('department', params.department);
      if (params.location) searchParams.append('location', params.location);
      if (params.q) searchParams.append('q', params.q);
    }

    const query = searchParams.toString();
    return apiRequest<{ jobs: Job[]; total: number; page: number; per_page: number }>(
      `/core-data/jobs${query ? `?${query}` : ''}`
    );
  },

  // Get job by ID
  async getJob(id: string): Promise<Job> {
    return apiRequest<Job>(`/core-data/jobs/${id}`);
  },

  // Create new job
  async createJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job> {
    return apiRequest<Job>('/core-data/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  },

  // Update job
  async updateJob(id: string, job: Partial<Job>): Promise<Job> {
    return apiRequest<Job>(`/core-data/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(job),
    });
  },

  // Delete job
  async deleteJob(id: string): Promise<void> {
    return apiRequest<void>(`/core-data/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  // Get published jobs (for public job board)
  async getPublishedJobs(skip = 0, limit = 100): Promise<Job[]> {
    return apiRequest<Job[]>(`/jobs/published?skip=${skip}&limit=${limit}`);
  },
};

// Candidate API functions
export const candidateApi = {
  // Get all candidates
  async getCandidates(params?: {
    skip?: number;
    limit?: number;
    source?: string;
    skills?: string[];
    location?: string;
    q?: string;
  }): Promise<{ candidates: Candidate[]; total: number; page: number; per_page: number }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      if (params.skip) searchParams.append('skip', params.skip.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.source) searchParams.append('source', params.source);
      if (params.skills) params.skills.forEach(s => searchParams.append('skills', s));
      if (params.location) searchParams.append('location', params.location);
      if (params.q) searchParams.append('q', params.q);
    }

    const query = searchParams.toString();
    return apiRequest<{ candidates: Candidate[]; total: number; page: number; per_page: number }>(
      `/core-data/candidates${query ? `?${query}` : ''}`
    );
  },

  // Get candidate by ID
  async getCandidate(id: string): Promise<Candidate> {
    return apiRequest<Candidate>(`/core-data/candidates/${id}`);
  },

  // Create new candidate
  async createCandidate(candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>): Promise<Candidate> {
    return apiRequest<Candidate>('/core-data/candidates', {
      method: 'POST',
      body: JSON.stringify(candidate),
    });
  },

  // Update candidate
  async updateCandidate(id: string, candidate: Partial<Candidate>): Promise<Candidate> {
    return apiRequest<Candidate>(`/core-data/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(candidate),
    });
  },

  // Delete candidate
  async deleteCandidate(id: string): Promise<void> {
    return apiRequest<void>(`/core-data/candidates/${id}`, {
      method: 'DELETE',
    });
  },
};

// Export ApiError for error handling
export { ApiError };