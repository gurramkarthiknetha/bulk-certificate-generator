export type JobStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'COMPLETED_WITH_ERRORS'
  | 'FAILED';

export type CertificateStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export interface RecipientInput {
  name: string;
  email: string;
  [key: string]: any;
}

export interface JobCreateRequest {
  template_name: string;
  course_name: string;
  organization_name: string;
  recipients: RecipientInput[];
}

export interface JobCreateResponse {
  job_id: string;
  status: JobStatus;
  total_count: number;
}

export interface Job {
  job_id: string;
  status: JobStatus;
  template_name: string;
  course_name: string;
  organization_name: string;
  total_count: number;
  processed_count: number;
  success_count: number;
  failure_count: number;
  progress_percentage: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface JobListResponse {
  items: Job[];
  page: number;
  page_size: number;
  total: number;
}

export interface Certificate {
  id: string;
  job_id: string;
  recipient_name: string;
  recipient_email: string;
  status: CertificateStatus;
  storage_key: string | null;
  error_message: string | null;
  attempt_count: number;
  created_at: string;
  completed_at: string | null;
}

export interface CertificateListResponse {
  items: Certificate[];
  page: number;
  page_size: number;
  total: number;
}

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
}

export interface TemplateListResponse {
  templates: TemplateInfo[];
}

export interface DashboardStats {
  total_jobs: number;
  total_certificates: number;
  successful_certificates: number;
  failed_certificates: number;
  processing_certificates: number;
  pending_jobs: number;
  processing_jobs: number;
  completed_jobs: number;
  recent_jobs: Job[];
}

export interface OrganizationSettings {
  organization_name?: string;
  default_template?: string;
  default_signer_name?: string;
  default_signer_title?: string;
}
