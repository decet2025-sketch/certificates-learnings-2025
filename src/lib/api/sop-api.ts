import { LearnerApi, ActivityLog } from '@/types/api';

const SOP_ROUTER_URL =
  'https://cloud.appwrite.io/v1/functions/sop_router/executions';
const APPWRITE_PROJECT_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
  '68cf04e30030d4b38d19';
const APPWRITE_API_KEY =
  process.env.NEXT_PUBLIC_APPWRITE_API_KEY ||
  'standard_433c1d266b99746da7293cecabc52ca95bb22210e821cfd4292da0a8eadb137d36963b60dd3ecf89f7cf0461a67046c676ceacb273c60dbc1a19da1bc9042cc82e7653cb167498d8504c6abbda8634393289c3335a0cb72eb8d7972249a0b22a10f9195b0d43243116b54f34f7a15ad837a900922e23bcba34c80c5c09635142';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    // Try to get token from user object first, then fallback to direct token
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.token || userData.apiToken || '';
    }
    // Fallback to direct token storage
    return localStorage.getItem('token') || '';
  }
  return '';
};

const executeSopRouter = async <T>(
  action: string,
  payload: Record<string, unknown>
): Promise<T> => {
  const jwtToken = getAuthToken();
  if (!jwtToken) {
    throw new Error('Authentication token not found. Please log in.');
  }

  const requestBody = {
    action,
    payload,
    jwt_token: jwtToken,
  };

  // Make direct fetch call to Appwrite
  const response = await fetch(SOP_ROUTER_URL, {
    method: 'POST',
    headers: {
      'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      'X-Appwrite-Key': APPWRITE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      body: JSON.stringify(requestBody),
    }),
  });

  if (!response.ok) {
    // Handle 401 errors specifically for authentication
    if (response.status === 401) {
      const error = new Error(
        'Authentication token expired or invalid'
      );
      (error as any).code = 'AUTHENTICATION_ERROR';
      (error as any).statusCode = 401;
      throw error;
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Check if the response has an error
  if (data.status === 'failed') {
    throw new Error(data.errors || 'Function execution failed');
  }

  // Check if responseBody exists and is not empty
  if (!data.responseBody) {
    throw new Error('Empty response from server');
  }

  // Parse the nested response body
  let parsedData;
  try {
    parsedData = JSON.parse(data.responseBody);
  } catch (parseError) {
    throw new Error(
      `Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
    );
  }

  // Check if the parsed response body contains an error
  if (
    parsedData &&
    typeof parsedData === 'object' &&
    parsedData.ok === false
  ) {
    // This is a response body error format: {"ok":false,"status":409,"error":{"code":"COURSE_EXISTS","message":"..."}}
    const errorMessage =
      parsedData.error?.message || 'An error occurred';
    const errorCode = parsedData.error?.code || 'API_ERROR';
    const statusCode = parsedData.status || 500;

    const error = new Error(errorMessage);
    (error as any).code = errorCode;
    (error as any).statusCode = statusCode;
    (error as any).responseBody = parsedData;
    throw error;
  }

  return parsedData;
};

// SOP-specific types
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

export interface LearnerStatisticsResponse {
  total_learners: number;
  active_learners: number;
  active_enrollments: number;
  completed_courses: number;
  certificates_generated: number;
  organization_website: string;
}

export interface SopActivityLogListResponse {
  logs: ActivityLog[];
  organization_website: string;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export const sopApi = {
  // List learners for a specific organization
  listOrganizationLearners: async (
    organization_website: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<SopLearnerListResponse> => {
    const result = await executeSopRouter<{
      ok: boolean;
      status: number;
      data: SopLearnerListResponse;
    }>('LIST_ORG_LEARNERS', { organization_website, limit, offset });
    return result.data;
  },

  // Download certificate for a specific learner
  downloadCertificate: async (
    learner_email: string,
    course_id: string
  ): Promise<{
    download_url: string;
    filename: string;
    learner_name: string;
    learner_email: string;
    course_id: string;
    organization_website: string;
  }> => {
    const result = await executeSopRouter<{
      data: {
        download_url: string;
        filename: string;
        learner_name: string;
        learner_email: string;
        course_id: string;
        organization_website: string;
      };
    }>('DOWNLOAD_CERTIFICATE', { learner_email, course_id });
    return result.data;
  },

  // Resend certificate email to learner
  resendCertificate: async (
    learner_email: string,
    course_id: string
  ): Promise<CertificateResendResponse> => {
    const result = await executeSopRouter<{
      ok: boolean;
      status: number;
      data: CertificateResendResponse;
    }>('RESEND_CERTIFICATE', { learner_email, course_id });
    return result.data;
  },

  // Get learner statistics for the organization
  getLearnerStatistics:
    async (): Promise<LearnerStatisticsResponse> => {
      const result = await executeSopRouter<{
        data: LearnerStatisticsResponse;
      }>('LEARNER_STATISTICS', {});
      return result.data;
    },

  // List activity logs for the organization
  listActivityLogs: async (
    limit: number = 50,
    offset: number = 0
  ): Promise<SopActivityLogListResponse> => {
    const result = await executeSopRouter<{
      ok: boolean;
      status: number;
      data: {
        logs: ActivityLog[];
        organization_website: string;
      };
      pagination: {
        total: number;
        limit: number;
        offset: number;
        has_more: boolean;
      };
    }>('LIST_ACTIVITY_LOGS', { limit, offset });

    // Combine data and pagination into the expected response format
    return {
      logs: result.data.logs,
      organization_website: result.data.organization_website,
      pagination: result.pagination,
    };
  },
};

// Legacy API functions for backward compatibility
export const sopLearnerApi = {
  listOrganizationLearners: async (
    organization_website: string,
    limit: number = 10,
    offset: number = 0
  ) => {
    try {
      const result = await sopApi.listOrganizationLearners(
        organization_website,
        limit,
        offset
      );
      return { ok: true, data: result };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to fetch organization learners',
        },
      };
    }
  },
};

export const sopCertificateApi = {
  downloadCertificate: async (
    learner_email: string,
    course_id: string
  ) => {
    try {
      const result = await sopApi.downloadCertificate(
        learner_email,
        course_id
      );
      return { ok: true, data: result };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to download certificate',
        },
      };
    }
  },
  resendCertificate: async (
    learner_email: string,
    course_id: string
  ) => {
    try {
      const result = await sopApi.resendCertificate(
        learner_email,
        course_id
      );
      return { ok: true, data: result };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to resend certificate',
        },
      };
    }
  },
};

export const handleSopApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
