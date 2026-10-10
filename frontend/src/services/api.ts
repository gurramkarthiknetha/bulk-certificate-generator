import axios from 'axios';
import {
  CertificateListResponse,
  Certificate,
  DashboardStats,
  Job,
  JobCreateRequest,
  JobCreateResponse,
  JobListResponse,
  OrganizationSettings,
  TemplateListResponse,
} from '@/types';

// Detect API Base URL with fallback to current origin or standard backend port
const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1`
  : '/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const response = await axios.get(
        import.meta.env.VITE_API_BASE_URL
          ? `${import.meta.env.VITE_API_BASE_URL}/health`
          : '/health'
      );
      return response.data;
    } catch {
      return { status: 'unavailable', service: 'Bulk Certificate Generator' };
    }
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>('/dashboard/stats');
    return data;
  },

  // Templates
  getTemplates: async (): Promise<TemplateListResponse> => {
    const { data } = await apiClient.get<TemplateListResponse>('/templates');
    return data;
  },

  // Jobs
  createJob: async (
    payload: JobCreateRequest,
    idempotencyKey?: string
  ): Promise<JobCreateResponse> => {
    const key = idempotencyKey || `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const { data } = await apiClient.post<JobCreateResponse>(
      '/certificate-jobs',
      payload,
      {
        headers: {
          'Idempotency-Key': key,
        },
      }
    );
    return data;
  },

  listJobs: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
  }): Promise<JobListResponse> => {
    const { data } = await apiClient.get<JobListResponse>('/certificate-jobs', {
      params,
    });
    return data;
  },

  getJob: async (jobId: string): Promise<Job> => {
    const { data } = await apiClient.get<Job>(`/certificate-jobs/${jobId}`);
    return data;
  },

  listJobCertificates: async (
    jobId: string,
    params?: {
      page?: number;
      page_size?: number;
      status?: string;
      search?: string;
    }
  ): Promise<CertificateListResponse> => {
    const { data } = await apiClient.get<CertificateListResponse>(
      `/certificate-jobs/${jobId}/certificates`,
      { params }
    );
    return data;
  },

  // Certificates (Global)
  listAllCertificates: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    search?: string;
  }): Promise<CertificateListResponse> => {
    const { data } = await apiClient.get<CertificateListResponse>(
      '/certificates',
      { params }
    );
    return data;
  },

  // Downloads
  getDownloadUrl: (jobId: string, certificateId: string): string => {
    const base = import.meta.env.VITE_API_BASE_URL || '';
    return `${base}/api/v1/downloads/${jobId}/${certificateId}`;
  },

  getZipDownloadUrl: (jobId: string): string => {
    const base = import.meta.env.VITE_API_BASE_URL || '';
    return `${base}/api/v1/downloads/${jobId}/zip`;
  },

  // Settings
  getOrganizationSettings: async (): Promise<OrganizationSettings> => {
    const { data } = await apiClient.get<OrganizationSettings>('/settings/organization');
    return data;
  },

  updateOrganizationSettings: async (
    settings: OrganizationSettings
  ): Promise<OrganizationSettings> => {
    const { data } = await apiClient.put<OrganizationSettings>(
      '/settings/organization',
      settings
    );
    return data;
  },
};
