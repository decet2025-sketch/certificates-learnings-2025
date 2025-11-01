import {
  CourseApi,
  LearnerApi,
  OrganizationApi,
  AdminLearnerListResponse,
  ActivityLogListResponse,
  ActivityLog,
} from '@/types/api';
import {
  handleApiErrorWithToast,
  withErrorToast,
} from '@/lib/error-toast-handler';

const ADMIN_ROUTER_URL =
  'https://cloud.appwrite.io/v1/functions/admin_router/executions';
const APPWRITE_PROJECT_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
  '68cf04e30030d4b38d19';
const APPWRITE_API_KEY =
  process.env.NEXT_PUBLIC_APPWRITE_API_KEY ||
  'standard_433c1d266b99746da7293cecabc52ca95bb22210e821cfd4292da0a8eadb137d36963b60dd3ecf89f7cf0461a67046c676ceacb273c60dbc1a19da1bc9042cc82e7653cb167498d8504c6abbda8634393289c3335a0cb72eb8d7972249a0b22a10f9195b0d43243116b54f34f7a15ad837a900922e23bcba34c80c5c09635142';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.apiToken || userData.token || '';
    }
  }
  return '';
};

const executeAdminRouter = async <T>(
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
  const response = await fetch(ADMIN_ROUTER_URL, {
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
    // This is a response body error format: {"ok":false,"status":500,"error":{"code":"INTERNAL_ERROR","message":"Internal server error"}}
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

export const adminApi = {
  // Courses
  createCourse: async (courseData: {
    course_url: string;
    name: string;
    certificate_template_html: string;
  }): Promise<CourseApi> => {
    const result = await executeAdminRouter<{
      data: { course: CourseApi };
    }>('CREATE_COURSE', courseData);
    return result.data.course;
  },
  listCourses: async (
    limit: number = 10,
    offset: number = 0,
    search?: string
  ): Promise<{
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
  }> => {
    const payload: Record<string, unknown> = { limit, offset };
    if (search) {
      payload.search = search;
    }

    const result = await executeAdminRouter<{
      data: {
        courses: CourseApi[];
      };
      pagination: {
        total: number;
        limit: number;
        offset: number;
        has_more: boolean;
      };
    }>('LIST_COURSES', payload);

    // Transform the new API response format to match the expected interface
    return {
      courses: result.data.courses,
      count: result.pagination.total,
      limit: result.pagination.limit,
      offset: result.pagination.offset,
      pagination: result.pagination,
    };
  },
  editCourse: async (courseData: {
    course_id: string;
    name?: string;
    certificate_template_html?: string;
  }): Promise<CourseApi> => {
    const result = await executeAdminRouter<{
      data: { course: CourseApi };
    }>('EDIT_COURSE', courseData);
    return result.data.course;
  },
  deleteCourse: async (
    course_id: string
  ): Promise<{ success: boolean }> => {
    const result = await executeAdminRouter<{
      data: { success: boolean };
    }>('DELETE_COURSE', { course_id });
    return result.data;
  },

  // Organizations
  addOrganization: async (orgData: {
    website: string;
    name: string;
    sop_email: string;
    sop_password: string;
  }): Promise<OrganizationApi> => {
    const result = await executeAdminRouter<{
      data: { organization: OrganizationApi };
    }>('ADD_ORGANIZATION', orgData);
    return result.data.organization;
  },
  listOrganizations: async (
    limit: number = 10,
    offset: number = 0,
    search?: string
  ): Promise<{
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
  }> => {
    const payload: Record<string, unknown> = { limit, offset };
    if (search) {
      payload.search = search;
    }

    const result = await executeAdminRouter<{
      data: {
        organizations: OrganizationApi[];
      };
      pagination: {
        total: number;
        limit: number;
        offset: number;
        has_more: boolean;
      };
    }>('LIST_ORGANIZATIONS', payload);

    // Transform the new API response format to match the expected interface
    return {
      organizations: result.data.organizations,
      count: result.pagination.total,
      limit: result.pagination.limit,
      offset: result.pagination.offset,
      pagination: result.pagination,
    };
  },
  editOrganization: async (orgData: {
    organization_id: string;
    name?: string;
    website?: string;
    sop_email?: string;
  }): Promise<OrganizationApi> => {
    const result = await executeAdminRouter<{
      data: { organization: OrganizationApi };
    }>('EDIT_ORGANIZATION', orgData);
    return result.data.organization;
  },
  deleteOrganization: async (
    website: string
  ): Promise<{ success: boolean }> => {
    const result = await executeAdminRouter<{
      data: { success: boolean };
    }>('DELETE_ORGANIZATION', { website });
    return result.data;
  },

  resetSopPassword: async (
    organization_website: string,
    new_password: string,
    sop_email: string
  ): Promise<{ success: boolean }> => {
    const result = await executeAdminRouter<{
      data: { success: boolean };
    }>('RESET_SOP_PASSWORD', { organization_website, new_password, sop_email });
    return result.data;
  },

  // Learners
  uploadLearnersCSV: async (
    course_id: string,
    csv_data: string
  ): Promise<{ learners: LearnerApi[] }> => {
    const result = await executeAdminRouter<{
      data: { learners: LearnerApi[] };
    }>('UPLOAD_LEARNERS_CSV_DIRECT', { course_id, csv_data });
    return result.data;
  },
  listLearners: async (
    course_id?: string,
    organization_website?: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ learners: LearnerApi[] }> => {
    const payload: Record<string, unknown> = { limit, offset };
    if (course_id) payload.course_id = course_id;
    if (organization_website)
      payload.organization_website = organization_website;
    const result = await executeAdminRouter<{
      data: { learners: LearnerApi[] };
    }>('LIST_LEARNERS', payload);
    return result.data;
  },

  // Certificates - Save/Preview API
  saveAndPreviewCertificate: async (payload: {
    course_id: string;
    certificate_template_html: string;
    learner_name: string;
    learner_email: string;
    organization_website: string;
  }): Promise<{ preview_html: string }> => {
    const result = await executeAdminRouter<{
      data: { preview_html: string };
    }>('SAVE_AND_PREVIEW_CERTIFICATE', payload);
    return result.data;
  },

  // SOP User Management
  createSopUser: async (userData: {
    email: string;
    password: string;
  }): Promise<{
    user_id: string;
    email: string;
    name: string;
    role: string;
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
  }> => {
    const result = await executeAdminRouter<{
      data: {
        user_id: string;
        email: string;
        name: string;
        role: string;
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
      };
    }>('CREATE_SOP_USER', userData);
    return result.data;
  },

  // Admin Learners API
  listAllLearners: async (
    limit: number = 10,
    offset: number = 0,
    search?: string,
    organization_website?: string
  ): Promise<AdminLearnerListResponse> => {
    const payload: Record<string, unknown> = {
      limit,
      offset,
    };

    if (search) {
      payload.search = search;
    }

    if (organization_website) {
      payload.organization_website = organization_website;
    }

    const result = await executeAdminRouter<{
      data: AdminLearnerListResponse;
    }>('LIST_ALL_LEARNERS', payload);
    return result.data;
  },

  // Activity Logs API
  listActivityLogs: async (
    limit: number = 10,
    offset: number = 0,
    activity_type?: string,
    status?: string,
    organization_website?: string
  ): Promise<ActivityLogListResponse> => {
    const payload: any = { limit, offset };

    if (activity_type) payload.activity_type = activity_type;
    if (status) payload.status = status;
    if (organization_website)
      payload.organization_website = organization_website;

    const result = await executeAdminRouter<{
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
    }>('LIST_ACTIVITY_LOGS', payload);

    // Transform the response to match the expected ActivityLogListResponse interface
    return {
      logs: result.data.logs,
      total: result.pagination.total,
      limit: result.pagination.limit,
      offset: result.pagination.offset,
    };
  },

  // Resend Certificate
  resendCertificate: async (
    learner_email: string,
    course_id: string
  ): Promise<{ success: boolean; message: string }> => {
    const result = await executeAdminRouter<{
      ok: boolean;
      status: number;
      data: {
        message: string;
        learner_email: string;
        course_id: string;
        webhook_event_id: string;
      };
    }>('RESEND_CERTIFICATE', { learner_email, course_id });

    // Transform the new response format to the expected format
    return {
      success: result.ok,
      message: result.data.message,
    };
  },

  // Download Certificate
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
    const result = await executeAdminRouter<{
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

  // Statistics
  getLearnerStatistics: async (): Promise<{
    total_learners: number;
    active_learners: number;
    total_enrollments: number;
    completion_rate: number;
  }> => {
    const result = await executeAdminRouter<{
      data: {
        total_learners: number;
        active_learners: number;
        total_enrollments: number;
        completion_rate: number;
      };
    }>('LEARNER_STATISTICS', {});
    return result.data;
  },

  getOrganizationStatistics: async (): Promise<{
    total_organizations: number;
    active_organizations: number;
    poc_contacts: number;
    total_learners: number;
  }> => {
    const result = await executeAdminRouter<{
      data: {
        total_organizations: number;
        active_organizations: number;
        poc_contacts: number;
        total_learners: number;
      };
    }>('ORGANIZATION_STATISTICS', {});
    return result.data;
  },

  getCourseStatistics: async (): Promise<{
    total_courses: number;
    total_learners: number;
    avg_completion: number;
    certificate_templates: number;
  }> => {
    const result = await executeAdminRouter<{
      data: {
        total_courses: number;
        total_learners: number;
        avg_completion: number;
        certificate_templates: number;
      };
    }>('COURSE_STATISTICS', {});
    return result.data;
  },

  // Update Learner
  updateLearner: async (learnerData: {
    learner_email: string;
    organization_website: string;
    new_website: string;
    name: string;
    email: string;
  }): Promise<{ success: boolean; message: string }> => {
    const result = await executeAdminRouter<{
      ok: boolean;
      status: number;
      data: {
        updated_count: number;
      };
    }>('UPDATE_LEARNER', learnerData);

    return {
      success: result.ok && result.data.updated_count > 0,
      message: result.data.updated_count > 0
        ? 'Learner updated successfully'
        : 'No changes were made to the learner',
    };
  },

  // Delete Learner
  deleteLearner: async (learnerData: {
    learner_email: string;
    organization_website: string;
  }): Promise<{ success: boolean; message: string }> => {
    const result = await executeAdminRouter<{
      ok: boolean;
      status: number;
      data: {
        deleted_count: number;
        message: string;
      };
    }>('DELETE_LEARNER', learnerData);

    return {
      success: result.ok && result.data.deleted_count > 0,
      message: result.data.message,
    };
  },

  // CSV Validation
  validateCsvOrganizationConflicts: async (course_id: string, csv_data: string): Promise<{
    conflicts: Array<{
      email: string;
      csv_organization_website: string;
      existing_organization_website: string;
      row_number: number;
      name: string;
    }>;
    conflict_count: number;
    conflict_emails: string[];
    has_conflicts: boolean;
  }> => {
    const result = await executeAdminRouter<{
      data: {
        conflicts: Array<{
          email: string;
          csv_organization_website: string;
          existing_organization_website: string;
          row_number: number;
          name: string;
        }>;
        conflict_count: number;
        conflict_emails: string[];
        has_conflicts: boolean;
      };
    }>('VALIDATE_CSV_ORGANIZATION_CONFLICTS', { course_id, csv_data });
    return result.data;
  },
};

// Legacy API functions for backward compatibility
export const courseApi = {
  listCourses: async (
    limit: number = 10,
    offset: number = 0,
    search?: string
  ) => {
    try {
      const result = await adminApi.listCourses(
        limit,
        offset,
        search
      );
      return { ok: true, data: result };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to fetch courses',
        },
      };
    }
  },
  createCourse: async (courseData: {
    course_url: string;
    name: string;
    certificate_template_html: string;
  }) => {
    try {
      const result = await adminApi.createCourse(courseData);
      return { ok: true, data: result };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to create course',
        },
      };
    }
  },
  editCourse: async (courseData: {
    course_id: string;
    name?: string;
    certificate_template_html?: string;
  }) => {
    try {
      const result = await adminApi.editCourse(courseData);
      return { ok: true, data: result };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to edit course',
        },
      };
    }
  },
  deleteCourse: async (courseId: string) => {
    try {
      const result = await adminApi.deleteCourse(courseId);
      return { ok: true, data: result };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to delete course',
        },
      };
    }
  },
};

export const organizationApi = {
  listOrganizations: async (
    limit: number = 10,
    offset: number = 0,
    search?: string
  ) => {
    try {
      const result = await adminApi.listOrganizations(
        limit,
        offset,
        search
      );
      return { ok: true, data: result };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to fetch organizations',
        },
      };
    }
  },
  addOrganization: async (organizationData: {
    website: string;
    name: string;
    sop_email: string;
    sop_password: string;
  }) => {
    try {
      const result = await adminApi.addOrganization(organizationData);
      return { ok: true, data: result };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to add organization',
        },
      };
    }
  },
  editOrganization: async (organizationData: {
    organization_id: string;
    name?: string;
    website?: string;
    sop_email?: string;
  }) => {
    try {
      const result =
        await adminApi.editOrganization(organizationData);
      return { ok: true, data: result };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to add organization',
        },
      };
    }
  },
  deleteOrganization: async (website: string) => {
    try {
      const result = await adminApi.deleteOrganization(website);
      return { ok: true, data: result };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to delete organization',
        },
      };
    }
  },
};

export const learnerApi = {
  listLearners: async (
    course_id?: string,
    organization_website?: string,
    limit: number = 10,
    offset: number = 0
  ) => {
    try {
      const result = await adminApi.listLearners(
        course_id,
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
              : 'Failed to fetch learners',
        },
      };
    }
  },
  uploadLearnersCSV: async (course_id: string, csv_data: string) => {
    try {
      const result = await adminApi.uploadLearnersCSV(
        course_id,
        csv_data
      );
      return { ok: true, data: result };
    } catch (error) {
      return {
        ok: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to upload learners',
        },
      };
    }
  },
  resendCertificate: async (
    learner_email: string,
    course_id: string
  ) => {
    try {
      const result = await adminApi.resendCertificate(
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

export const handleApiError = (error: unknown): string => {
  // Show toast for the error
  handleApiErrorWithToast(error, 'API Error');

  // Return a generic message for store state (UI won't show this due to toast)
  return 'An error occurred. Please check the notification.';
};

// Enhanced API wrapper that handles errors with toasts
export const apiCallWithToast = <T>(
  apiCall: () => Promise<T>,
  context?: string
): Promise<T | null> => {
  return withErrorToast(apiCall, context);
};
