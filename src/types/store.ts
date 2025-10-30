// Core entity types
export interface Course {
  id: string;
  name: string;
  courseId: string;
  courseUrl: string | null;
  certificateTemplate?: File | string;
  status: 'active' | 'inactive' | 'draft';
  totalLearners: number;
  completedLearners: number;
}

export interface Learner {
  id: string;
  name: string;
  email: string;
  organization: string;
  organizationId: string;
  status: 'active' | 'inactive' | 'suspended';
  totalCourses: number;
  completedCourses: number;
}

export interface Organization {
  id: string;
  name: string;
  website: string;
  sopEmail: string;
  status: 'active' | 'inactive' | 'pending';
  totalLearners: number;
  totalCourses: number;
  password: string
}

export interface LearnerProgress {
  id: string;
  learnerId: string;
  courseId: string;
  learnerName: string;
  email: string;
  organization: string;
  course: string;
  enrollmentDate: string;
  completionStatus:
    | 'completed'
    | 'in-progress'
    | 'not-started'
    | 'blocked';
  certificateStatus: 'issued' | 'pending' | 'not-eligible';
  progress: number;
  certificateId?: string;
  completionDate?: string;
}

export interface Certificate {
  id: string;
  learnerId: string;
  courseId: string;
  learnerName: string;
  courseName: string;
  organizationName: string;
  issuedDate: string;
  status: 'issued' | 'pending' | 'revoked';
  downloadUrl?: string;
  certificateId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sop';
  organizationId?: string;
  organizationWebsite?: string;
  lastLogin: string;
}

// UI State types
export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  loading: boolean;
  notifications: Notification[];
  modals: {
    addCourse: boolean;
    addOrganization: boolean;
    uploadLearners: boolean;
    certificatePreview: boolean;
  };
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
  };
  filters: {
    search: string;
    organization: string;
    course: string;
    completionStatus: string[];
    certificateStatus: string[];
    dateRange: {
      startDate: string;
      endDate: string;
    } | null;
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Store state interfaces
export interface CoursesState {
  courses: Course[];
  selectedCourse: Course | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    hasMore: boolean;
  };
  searchTerm: string;
}

export interface LearnersState {
  learners: Learner[];
  adminLearners: any[]; // AdminLearner[] from API
  selectedLearner: Learner | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    hasMore: boolean;
  };
  searchTerm: string;
  selectedOrganization: string;
}

export interface OrganizationsState {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    hasMore: boolean;
  };
  searchTerm: string;
  lastFetchParams: {
    page: number;
    search: string;
    itemsPerPage: number;
  } | null;
}

export interface LearnerProgressState {
  learnerProgress: LearnerProgress[];
  selectedProgress: LearnerProgress | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  filteredCount: number;
}

export interface CertificatesState {
  certificates: Certificate[];
  selectedCertificate: Certificate | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Action types
export interface CoursesActions {
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  setSelectedCourse: (course: Course | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (
    pagination: Partial<CoursesState['pagination']>
  ) => void;
  setSearchTerm: (searchTerm: string) => void;
  fetchCourses: (
    page?: number,
    search?: string,
    itemsPerPage?: number
  ) => Promise<void>;
  refreshCourses: () => void;
  createCourse: (courseData: Omit<Course, 'id'>) => Promise<void>;
}

export interface LearnersActions {
  setLearners: (learners: Learner[]) => void;
  setAdminLearners: (learners: any[]) => void;
  addLearner: (learner: Learner) => void;
  updateLearner: (id: string, updates: Partial<Learner>) => void;
  deleteLearner: (id: string) => void;
  setSelectedLearner: (learner: Learner | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (
    pagination: Partial<LearnersState['pagination']>
  ) => void;
  setSearchTerm: (searchTerm: string) => void;
  setSelectedOrganization: (organization: string) => void;
  fetchLearners: () => Promise<void>;
  fetchAdminLearners: (
    page?: number,
    search?: string,
    organization?: string,
    itemsPerPage?: number
  ) => Promise<void>;
  refreshLearners: () => void;
  createLearner: (learnerData: Omit<Learner, 'id'>) => Promise<void>;
  uploadLearners: (file: File, courseId: string) => Promise<void>;
}

export interface OrganizationsActions {
  setOrganizations: (organizations: Organization[]) => void;
  addOrganization: (organization: Organization) => void;
  updateOrganization: (
    id: string,
    updates: Partial<Organization>
  ) => void;
  deleteOrganization: (website: string) => Promise<void>;
  setSelectedOrganization: (
    organization: Organization | null
  ) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (
    pagination: Partial<OrganizationsState['pagination']>
  ) => void;
  setSearchTerm: (searchTerm: string) => void;
  fetchOrganizations: (
    page?: number,
    search?: string,
    itemsPerPage?: number
  ) => Promise<void>;
  refreshOrganizations: () => void;
  createOrganization: (
    organizationData: Omit<Organization, 'id'> & {
      sopPassword?: string;
    }
  ) => Promise<void>;
  editOrganization: (
    organizationId: string,
    organizationData: {
      name?: string;
      website?: string;
      sopEmail?: string;
    }
  ) => Promise<void>;
  resetSopPassword: (
    organizationWebsite: string,
    newPassword: string,
    sopEmail: string
  ) => Promise<void>;
}

export interface LearnerProgressActions {
  setLearnerProgress: (progress: LearnerProgress[]) => void;
  addLearnerProgress: (progress: LearnerProgress) => void;
  updateLearnerProgress: (
    id: string,
    updates: Partial<LearnerProgress>
  ) => void;
  deleteLearnerProgress: (id: string) => void;
  setSelectedProgress: (progress: LearnerProgress | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchLearnerProgress: () => Promise<void>;
  filterLearnerProgress: (
    filters: Partial<UIState['filters']>
  ) => void;
}

export interface CertificatesActions {
  setCertificates: (certificates: Certificate[]) => void;
  addCertificate: (certificate: Certificate) => void;
  updateCertificate: (
    id: string,
    updates: Partial<Certificate>
  ) => void;
  deleteCertificate: (id: string) => void;
  setSelectedCertificate: (certificate: Certificate | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchCertificates: () => Promise<void>;
  generateCertificate: (
    learnerId: string,
    courseId: string
  ) => Promise<void>;
  downloadCertificate: (certificateId: string) => Promise<void>;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export interface UIActions {
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLoading: (loading: boolean) => void;
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  setModalOpen: (
    modal: keyof UIState['modals'],
    open: boolean
  ) => void;
  setPagination: (pagination: Partial<UIState['pagination']>) => void;
}

// Combined store types
export type CoursesStore = CoursesState & CoursesActions;
export type LearnersStore = LearnersState & LearnersActions;
export type OrganizationsStore = OrganizationsState &
  OrganizationsActions;
export type LearnerProgressStore = LearnerProgressState &
  LearnerProgressActions;
export type CertificatesStore = CertificatesState &
  CertificatesActions;
export type AuthStore = AuthState & AuthActions;
export type UIStore = UIState & UIActions;

// Root store type
export interface RootStore {
  courses: CoursesStore;
  learners: LearnersStore;
  organizations: OrganizationsStore;
  learnerProgress: LearnerProgressStore;
  certificates: CertificatesStore;
  auth: AuthStore;
  ui: UIStore;
}
