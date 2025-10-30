// Export all API modules
export * from './admin-api'
export * from './sop-api'
export * from './test-api'

// Re-export types for convenience
export type {
  ApiResponse,
  CourseApi,
  CourseListResponse,
  OrganizationApi,
  OrganizationListResponse,
  LearnerApi,
  LearnerListResponse,
  CertificatePreview,
  CreateCourseRequest,
  EditCourseRequest,
  CreateOrganizationRequest,
  EditOrganizationRequest,
  UploadLearnersRequest,
  CertificatePreviewRequest,
  SopLearnerApi,
  SopLearnerListResponse,
  CertificateDownloadResponse,
  CertificateResendResponse,
  CreateSopUserRequest,
  SopUserResponse
} from '@/types/api'

// Main API object for easy access
import { adminApi } from './admin-api'
import { sopApi } from './sop-api'

export const api = {
  admin: adminApi,
  sop: sopApi
}
