// Mock data services for V2 features

export interface SopLearner {
  id: string;
  name: string;
  email: string;
  courses: {
    id: string;
    name: string;
    progress: number;
    status: 'completed' | 'in-progress' | 'not-started';
    certificateGenerated: boolean;
    certificateUrl?: string;
    completionDate?: string;
  }[];
  totalCourses: number;
  completedCourses: number;
  activeEnrollments: number;
  certificatesGenerated: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  activityType:
    | 'certificate-generated'
    | 'learner-enrolled'
    | 'organization-added'
    | 'organization-updated'
    | 'course-created'
    | 'bulk-upload';
  actor: string;
  target: string;
  details: string;
  status: 'success' | 'failed';
  errorReason?: string;
  organizationName?: string;
  courseName?: string;
  learnerName?: string;
}

export interface OrganizationWithPassword {
  id: string;
  name: string;
  website: string;
  sopEmail: string;
  sopPassword: string;
  status: 'active' | 'inactive' | 'pending';
  totalLearners: number;
  totalCourses: number;
}

// Mock SOP Learners data (organization-scoped)
export const mockSopLearners: SopLearner[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@techcorp.com',
    courses: [
      {
        id: 'c1',
        name: 'Advanced React Development',
        progress: 100,
        status: 'completed',
        certificateGenerated: true,
        certificateUrl: '/certificates/john-doe-react.pdf',
        completionDate: '2024-01-15',
      },
      {
        id: 'c2',
        name: 'JavaScript Fundamentals',
        progress: 85,
        status: 'in-progress',
        certificateGenerated: false,
      },
    ],
    totalCourses: 2,
    completedCourses: 1,
    activeEnrollments: 1,
    certificatesGenerated: 1,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@techcorp.com',
    courses: [
      {
        id: 'c1',
        name: 'Advanced React Development',
        progress: 65,
        status: 'in-progress',
        certificateGenerated: false,
      },
    ],
    totalCourses: 1,
    completedCourses: 0,
    activeEnrollments: 1,
    certificatesGenerated: 0,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@techcorp.com',
    courses: [
      {
        id: 'c3',
        name: 'Python for Data Science',
        progress: 0,
        status: 'not-started',
        certificateGenerated: false,
      },
    ],
    totalCourses: 1,
    completedCourses: 0,
    activeEnrollments: 0,
    certificatesGenerated: 0,
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@techcorp.com',
    courses: [
      {
        id: 'c1',
        name: 'Advanced React Development',
        progress: 100,
        status: 'completed',
        certificateGenerated: true,
        certificateUrl: '/certificates/sarah-wilson-react.pdf',
        completionDate: '2024-01-20',
      },
      {
        id: 'c2',
        name: 'JavaScript Fundamentals',
        progress: 100,
        status: 'completed',
        certificateGenerated: true,
        certificateUrl: '/certificates/sarah-wilson-js.pdf',
        completionDate: '2024-02-01',
      },
      {
        id: 'c3',
        name: 'Python for Data Science',
        progress: 100,
        status: 'completed',
        certificateGenerated: true,
        certificateUrl: '/certificates/sarah-wilson-python.pdf',
        completionDate: '2024-02-15',
      },
    ],
    totalCourses: 3,
    completedCourses: 3,
    activeEnrollments: 0,
    certificatesGenerated: 3,
  },
];

// Mock Activity Logs data (SOP-scoped)
export const mockSopActivityLogs: ActivityLog[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    activityType: 'certificate-generated',
    actor: 'System',
    target: 'Sarah Wilson',
    details:
      'Certificate generated for Sarah Wilson - Advanced React Development',
    status: 'success',
    organizationName: 'TechCorp Inc',
    courseName: 'Advanced React Development',
    learnerName: 'Sarah Wilson',
  },
  {
    id: '2',
    timestamp: new Date(
      Date.now() - 2 * 60 * 60 * 1000
    ).toISOString(), // 2 hours ago
    activityType: 'learner-enrolled',
    actor: 'System',
    target: 'John Doe',
    details: 'John Doe enrolled in JavaScript Fundamentals',
    status: 'success',
    organizationName: 'TechCorp Inc',
    courseName: 'JavaScript Fundamentals',
    learnerName: 'John Doe',
  },
  {
    id: '3',
    timestamp: new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString(), // 1 day ago
    activityType: 'certificate-generated',
    actor: 'System',
    target: 'Sarah Wilson',
    details:
      'Certificate generated for Sarah Wilson - JavaScript Fundamentals',
    status: 'success',
    organizationName: 'TechCorp Inc',
    courseName: 'JavaScript Fundamentals',
    learnerName: 'Sarah Wilson',
  },
  {
    id: '4',
    timestamp: new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000
    ).toISOString(), // 2 days ago
    activityType: 'learner-enrolled',
    actor: 'System',
    target: 'Mike Johnson',
    details: 'Mike Johnson enrolled in Python for Data Science',
    status: 'success',
    organizationName: 'TechCorp Inc',
    courseName: 'Python for Data Science',
    learnerName: 'Mike Johnson',
  },
  {
    id: '5',
    timestamp: new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString(), // 3 days ago
    activityType: 'certificate-generated',
    actor: 'System',
    target: 'Jane Smith',
    details:
      'Certificate generation failed for Jane Smith - Advanced React Development',
    status: 'failed',
    errorReason: 'Template not found',
    organizationName: 'TechCorp Inc',
    courseName: 'Advanced React Development',
    learnerName: 'Jane Smith',
  },
  {
    id: '6',
    timestamp: new Date(
      Date.now() - 4 * 24 * 60 * 60 * 1000
    ).toISOString(), // 4 days ago
    activityType: 'learner-enrolled',
    actor: 'System',
    target: 'Sarah Wilson',
    details: 'Sarah Wilson enrolled in Advanced React Development',
    status: 'success',
    organizationName: 'TechCorp Inc',
    courseName: 'Advanced React Development',
    learnerName: 'Sarah Wilson',
  },
  {
    id: '7',
    timestamp: new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString(), // 7 days ago
    activityType: 'certificate-generated',
    actor: 'System',
    target: 'John Doe',
    details:
      'Certificate generated for John Doe - JavaScript Fundamentals',
    status: 'success',
    organizationName: 'TechCorp Inc',
    courseName: 'JavaScript Fundamentals',
    learnerName: 'John Doe',
  },
  {
    id: '8',
    timestamp: new Date(
      Date.now() - 10 * 24 * 60 * 60 * 1000
    ).toISOString(), // 10 days ago
    activityType: 'learner-enrolled',
    actor: 'System',
    target: 'David Brown',
    details: 'David Brown enrolled in Advanced React Development',
    status: 'success',
    organizationName: 'TechCorp Inc',
    courseName: 'Advanced React Development',
    learnerName: 'David Brown',
  },
];

// Mock Admin Activity Logs data (all organizations)
export const mockAdminActivityLogs: ActivityLog[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    activityType: 'certificate-generated',
    actor: 'System',
    target: 'Sarah Wilson',
    details:
      'Certificate generated and sent to sop@techcorp.com for Sarah Wilson - Advanced React Development',
    status: 'success',
    organizationName: 'TechCorp Inc',
    courseName: 'Advanced React Development',
    learnerName: 'Sarah Wilson',
  },
  {
    id: '2',
    timestamp: new Date(
      Date.now() - 2 * 60 * 60 * 1000
    ).toISOString(), // 2 hours ago
    activityType: 'bulk-upload',
    actor: 'Admin User',
    target: 'JavaScript Fundamentals',
    details:
      '25 learners uploaded to JavaScript Fundamentals via CSV',
    status: 'success',
    courseName: 'JavaScript Fundamentals',
  },
  {
    id: '3',
    timestamp: new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString(), // 1 day ago
    activityType: 'organization-added',
    actor: 'Admin User',
    target: 'StartupCo',
    details: 'Organization StartupCo added with SOP startup@sop.com',
    status: 'success',
    organizationName: 'StartupCo',
  },
  {
    id: '4',
    timestamp: new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000
    ).toISOString(), // 2 days ago
    activityType: 'course-created',
    actor: 'Admin User',
    target: 'Python for Data Science',
    details: 'Course Python for Data Science created and activated',
    status: 'success',
    courseName: 'Python for Data Science',
  },
  {
    id: '5',
    timestamp: new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString(), // 3 days ago
    activityType: 'certificate-generated',
    actor: 'System',
    target: 'Jane Smith',
    details:
      'Certificate generation failed for Jane Smith - Advanced React Development',
    status: 'failed',
    errorReason: 'Template not found',
    organizationName: 'TechCorp Inc',
    courseName: 'Advanced React Development',
    learnerName: 'Jane Smith',
  },
  {
    id: '6',
    timestamp: new Date(
      Date.now() - 4 * 24 * 60 * 60 * 1000
    ).toISOString(), // 4 days ago
    activityType: 'organization-updated',
    actor: 'Admin User',
    target: 'TechCorp Inc',
    details:
      'Organization TechCorp Inc updated - SOP email changed to new-sop@techcorp.com',
    status: 'success',
    organizationName: 'TechCorp Inc',
  },
  {
    id: '7',
    timestamp: new Date(
      Date.now() - 5 * 24 * 60 * 60 * 1000
    ).toISOString(), // 5 days ago
    activityType: 'learner-enrolled',
    actor: 'System',
    target: 'John Doe',
    details: 'John Doe enrolled in Advanced React Development',
    status: 'success',
    organizationName: 'TechCorp Inc',
    courseName: 'Advanced React Development',
    learnerName: 'John Doe',
  },
  {
    id: '8',
    timestamp: new Date(
      Date.now() - 6 * 24 * 60 * 60 * 1000
    ).toISOString(), // 6 days ago
    activityType: 'bulk-upload',
    actor: 'Admin User',
    target: 'Advanced React Development',
    details:
      '15 learners uploaded to Advanced React Development via CSV',
    status: 'success',
    courseName: 'Advanced React Development',
  },
  {
    id: '9',
    timestamp: new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString(), // 7 days ago
    activityType: 'certificate-generated',
    actor: 'System',
    target: 'Mike Johnson',
    details:
      'Certificate generated and sent to sop@techcorp.com for Mike Johnson - JavaScript Fundamentals',
    status: 'success',
    organizationName: 'TechCorp Inc',
    courseName: 'JavaScript Fundamentals',
    learnerName: 'Mike Johnson',
  },
  {
    id: '10',
    timestamp: new Date(
      Date.now() - 10 * 24 * 60 * 60 * 1000
    ).toISOString(), // 10 days ago
    activityType: 'learner-enrolled',
    actor: 'System',
    target: 'David Brown',
    details: 'David Brown enrolled in Python for Data Science',
    status: 'success',
    organizationName: 'Acme Corp',
    courseName: 'Python for Data Science',
    learnerName: 'David Brown',
  },
  {
    id: '11',
    timestamp: new Date(
      Date.now() - 15 * 24 * 60 * 60 * 1000
    ).toISOString(), // 15 days ago
    activityType: 'organization-added',
    actor: 'Admin User',
    target: 'Acme Corp',
    details: 'Organization Acme Corp added with SOP admin@acme.com',
    status: 'success',
    organizationName: 'Acme Corp',
  },
  {
    id: '12',
    timestamp: new Date(
      Date.now() - 20 * 24 * 60 * 60 * 1000
    ).toISOString(), // 20 days ago
    activityType: 'course-created',
    actor: 'Admin User',
    target: 'Advanced React Development',
    details:
      'Course Advanced React Development created and activated',
    status: 'success',
    courseName: 'Advanced React Development',
  },
  {
    id: '13',
    timestamp: new Date(
      Date.now() - 25 * 24 * 60 * 60 * 1000
    ).toISOString(), // 25 days ago
    activityType: 'bulk-upload',
    actor: 'Admin User',
    target: 'Python for Data Science',
    details:
      '30 learners uploaded to Python for Data Science via CSV',
    status: 'success',
    courseName: 'Python for Data Science',
  },
  {
    id: '14',
    timestamp: new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString(), // 30 days ago
    activityType: 'certificate-generated',
    actor: 'System',
    target: 'Alice Johnson',
    details:
      'Certificate generated and sent to sop@startup.com for Alice Johnson - JavaScript Fundamentals',
    status: 'success',
    organizationName: 'StartupCo',
    courseName: 'JavaScript Fundamentals',
    learnerName: 'Alice Johnson',
  },
  {
    id: '15',
    timestamp: new Date(
      Date.now() - 35 * 24 * 60 * 60 * 1000
    ).toISOString(), // 35 days ago
    activityType: 'learner-enrolled',
    actor: 'System',
    target: 'Bob Wilson',
    details: 'Bob Wilson enrolled in Advanced React Development',
    status: 'success',
    organizationName: 'StartupCo',
    courseName: 'Advanced React Development',
    learnerName: 'Bob Wilson',
  },
];

// Mock Organizations with passwords
export const mockOrganizationsWithPasswords: OrganizationWithPassword[] =
  [
    {
      id: '1',
      name: 'TechCorp Inc',
      website: 'techcorp.com',
      sopEmail: 'sop@techcorp.com',
      sopPassword: 'TechCorp2024!',
      status: 'active',
      totalLearners: 4,
      totalCourses: 3,
    },
    {
      id: '2',
      name: 'StartupCo',
      website: 'startupco.io',
      sopEmail: 'sop@startupco.io',
      sopPassword: 'Startup2024!',
      status: 'active',
      totalLearners: 2,
      totalCourses: 2,
    },
    {
      id: '3',
      name: 'Acme Corp',
      website: 'acme.com',
      sopEmail: 'sop@acme.com',
      sopPassword: 'Acme2024!',
      status: 'active',
      totalLearners: 1,
      totalCourses: 1,
    },
    {
      id: '4',
      name: 'Enterprise Solutions',
      website: 'enterprise-solutions.com',
      sopEmail: 'sop@enterprise-solutions.com',
      sopPassword: 'Enterprise2024!',
      status: 'active',
      totalLearners: 3,
      totalCourses: 2,
    },
  ];

// Mock authentication service
export const mockAuthService = {
  async sopLogin(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: any; error?: string }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const organization = mockOrganizationsWithPasswords.find(
      (org) => org.sopEmail === email && org.sopPassword === password
    );

    if (organization) {
      return {
        success: true,
        user: {
          id: `sop-${organization.id}`,
          name: `SOP - ${organization.name}`,
          email: organization.sopEmail,
          role: 'sop',
          organizationId: organization.id,
          organizationWebsite: organization.website,
          lastLogin: new Date().toISOString(),
        },
      };
    }

    return {
      success: false,
      error: 'Invalid email or password',
    };
  },
};

// Mock data filtering functions
export const filterSopLearners = (
  learners: SopLearner[],
  filters: {
    search?: string;
    course?: string;
    status?: string;
  }
) => {
  return learners.filter((learner) => {
    const matchesSearch =
      !filters.search ||
      learner.name
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      learner.email
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      learner.courses.some((course) =>
        course.name
          .toLowerCase()
          .includes(filters.search!.toLowerCase())
      );

    const matchesCourse =
      !filters.course ||
      filters.course === 'All' ||
      learner.courses.some(
        (course) => course.name === filters.course
      );

    const matchesStatus =
      !filters.status ||
      filters.status === 'All' ||
      (filters.status === 'In Progress' &&
        learner.activeEnrollments > 0) ||
      (filters.status === 'Completed' &&
        learner.completedCourses > 0);

    return matchesSearch && matchesCourse && matchesStatus;
  });
};

export const filterActivityLogs = (
  logs: ActivityLog[],
  filters: {
    search?: string;
    activityType?: string;
    organization?: string;
    course?: string;
    dateRange?: string;
  }
) => {
  return logs.filter((log) => {
    const matchesSearch =
      !filters.search ||
      log.details
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      log.actor
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      log.target
        .toLowerCase()
        .includes(filters.search.toLowerCase()) ||
      (log.organizationName &&
        log.organizationName
          .toLowerCase()
          .includes(filters.search.toLowerCase())) ||
      (log.courseName &&
        log.courseName
          .toLowerCase()
          .includes(filters.search.toLowerCase())) ||
      (log.learnerName &&
        log.learnerName
          .toLowerCase()
          .includes(filters.search.toLowerCase()));

    const matchesActivityType =
      !filters.activityType ||
      filters.activityType === 'all' ||
      log.activityType === filters.activityType;

    const matchesOrganization =
      !filters.organization ||
      filters.organization === 'All' ||
      log.organizationName === filters.organization;

    const matchesCourse =
      !filters.course ||
      filters.course === 'All' ||
      log.courseName === filters.course;

    // Date filtering
    let matchesDateRange = true;
    if (filters.dateRange && filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange);
      const logDate = new Date(log.timestamp);
      const cutoffDate = new Date(
        Date.now() - days * 24 * 60 * 60 * 1000
      );
      matchesDateRange = logDate >= cutoffDate;
    }

    return (
      matchesSearch &&
      matchesActivityType &&
      matchesOrganization &&
      matchesCourse &&
      matchesDateRange
    );
  });
};
