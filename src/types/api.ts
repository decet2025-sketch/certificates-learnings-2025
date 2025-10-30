// API Response types
export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Course API types
export interface CourseApi {
  id: string;
  course_id: string;
  name: string;
  certificate_template_html: string;
  course_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseListResponse {
  courses: CourseApi[];
  count: number;
  limit: number;
  offset: number;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// Organization API types
export interface OrganizationApi {
  id: string;
  website: string;
  name: string;
  sop_email: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationListResponse {
  organizations: OrganizationApi[];
  count: number;
  limit: number;
  offset: number;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// Learner API types
export interface LearnerApi {
  id: string;
  name: string;
  email: string;
  organization_website: string;
  course_id: string;
  graphy_enrollment_id?: string;
  enrolled_at?: string;
  completion_at?: string;
  certificate_generated_at?: string;
  certificate_sent_to_sop_at?: string;
  certificate_send_status?: 'pending' | 'sent' | 'failed';
  certificate_filename?: string;
}

export interface LearnerListResponse {
  learners: LearnerApi[];
}

// Admin Learner API types (from the API response)
export interface AdminLearnerInfo {
  name: string;
  email: string;
  organization_website: string;
}

export interface AdminOrganizationInfo {
  name: string;
  website: string;
  sop_email: string;
  created_at: string;
}

export interface AdminCourseInfo {
  course_id: string;
  course_name: string;
  enrollment_status: string;
  completion_percentage: number;
  completion_date: string | null;
  certificate_status: string;
  created_at: string | null;
}

export interface AdminLearner {
  learner_info: AdminLearnerInfo;
  organization_info: AdminOrganizationInfo;
  courses: AdminCourseInfo[];
}

export interface AdminLearnerListResponse {
  learners: AdminLearner[];
  summary: {
    total_learners: number;
    active_learners: number;
    total_enrollments: number;
    completion_rate: number;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// Activity Log API types
export interface ActivityLog {
  id: string;
  activity_type: string;
  actor: string;
  actor_email: string | null;
  actor_role: string;
  target: string;
  target_email: string | null;
  organization_website: string | null;
  course_id: string | null;
  details: string;
  status: string;
  error_message: string | null;
  metadata: string;
  timestamp: string;
}

export interface ActivityLogListResponse {
  logs: ActivityLog[];
  total: number;
  limit: number;
  offset: number;
}

// Certificate Preview types
export interface CertificatePreview {
  preview_html: string;
}

// Request payload types
export interface CreateCourseRequest {
  course_url: string;
  name: string;
  certificate_template_html: string;
}

export interface EditCourseRequest {
  course_id: string;
  name: string;
  certificate_template_html: string;
}

export interface CreateOrganizationRequest {
  website: string;
  name: string;
  sop_email: string;
  sop_password: string;
}

export interface EditOrganizationRequest {
  website: string;
  name: string;
  sop_email: string;
}

export interface UploadLearnersRequest {
  course_id: string;
  csv_file_id: string;
  uploader: string;
}

export interface CertificatePreviewRequest {
  course_id: string;
  learner_name: string;
  learner_email: string;
  organization_website: string;
}

// SOP-specific API types
export interface SopLearnerApi extends LearnerApi {
  certificate_file_id?: string;
  last_resend_attempt?: string;
}

// New SOP API response structure matching the LIST_ORG_LEARNERS response
export interface SopLearnerInfo {
  name: string;
  email: string;
  organization_website: string;
}

export interface SopOrganizationInfo {
  name: string;
  website: string;
  sop_email: string;
  created_at: string;
}

export interface SopCourseInfo {
  course_id: string;
  course_name: string;
  enrollment_status: string;
  completion_percentage: number;
  completion_date: string | null;
  certificate_status: string;
  created_at: string | null;
}

export interface SopLearner {
  learner_info: SopLearnerInfo;
  organization_info: SopOrganizationInfo;
  courses: SopCourseInfo[];
}

export interface SopLearnerListResponse {
  learners: SopLearner[];
  summary: {
    total_learners: number;
    active_learners: number;
    total_enrollments: number;
    completion_rate: number;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface CertificateDownloadResponse {
  download_url: string;
  certificate_id: string;
  learner_name: string;
  course_name: string;
}

export interface CertificateResendResponse {
  message: string;
  learner_email: string;
  course_id: string;
  webhook_event_id: string;
}

// SOP User creation (handled by admin router)
export interface CreateSopUserRequest {
  email: string;
  password: string;
}

export interface SopUserResponse {
  user_id: string;
  email: string;
  name: string;
  role: 'sop';
  token: string;
  message: string;
  organization: {
    id: string;
    website: string;
    name: string;
    sop_email: string;
    created_at: string;
    updated_at: string;
  };
}
