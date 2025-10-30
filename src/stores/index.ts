// Export all individual stores
export { useCoursesStore } from './coursesStore';
export { useLearnersStore } from './learnersStore';
export { useOrganizationsStore } from './organizationsStore';
export { useLearnerProgressStore } from './learnerProgressStore';
export { useCertificatesStore } from './certificatesStore';
export { useAuthStore } from './authStore';
export { useUIStore } from './uiStore';
export { useSopLearnersStore } from './sopLearnersStore';

// Export types
export type {
  Course,
  Learner,
  Organization,
  LearnerProgress,
  Certificate,
  User,
  UIState,
  Notification,
  CoursesStore,
  LearnersStore,
  OrganizationsStore,
  LearnerProgressStore,
  CertificatesStore,
  AuthStore,
  UIStore,
  RootStore,
} from '@/types/store';

// Combined store hook for easy access to all stores
import { useCoursesStore } from './coursesStore';
import { useLearnersStore } from './learnersStore';
import { useOrganizationsStore } from './organizationsStore';
import { useLearnerProgressStore } from './learnerProgressStore';
import { useCertificatesStore } from './certificatesStore';
import { useAuthStore } from './authStore';
import { useUIStore } from './uiStore';

export const useAppStore = () => {
  const courses = useCoursesStore();
  const learners = useLearnersStore();
  const organizations = useOrganizationsStore();
  const learnerProgress = useLearnerProgressStore();
  const certificates = useCertificatesStore();
  const auth = useAuthStore();
  const ui = useUIStore();

  return {
    courses,
    learners,
    organizations,
    learnerProgress,
    certificates,
    auth,
    ui,
  };
};

// Store initialization function
export const initializeStores = async () => {
  // Initialize stores with data
  const {
    courses,
    learners,
    organizations,
    learnerProgress,
    certificates,
    auth,
  } = useAppStore();

  try {
    // Fetch initial data
    await Promise.all([
      courses.fetchCourses(),
      learners.fetchLearners(),
      organizations.fetchOrganizations(),
      learnerProgress.fetchLearnerProgress(),
      certificates.fetchCertificates(),
      auth.checkAuth(),
    ]);
  } catch (error) {
    console.error('Failed to initialize stores:', error);
  }
};

// Store reset function
export const resetStores = () => {
  const {
    courses,
    learners,
    organizations,
    learnerProgress,
    certificates,
    auth,
    ui,
  } = useAppStore();

  // Reset all stores to initial state
  courses.setCourses([]);
  courses.setSelectedCourse(null);
  courses.setError(null);

  learners.setLearners([]);
  learners.setSelectedLearner(null);
  learners.setError(null);

  organizations.setOrganizations([]);
  organizations.setSelectedOrganization(null);
  organizations.setError(null);

  learnerProgress.setLearnerProgress([]);
  learnerProgress.setSelectedProgress(null);
  learnerProgress.setError(null);

  certificates.setCertificates([]);
  certificates.setSelectedCertificate(null);
  certificates.setError(null);

  auth.logout();

  ui.clearNotifications();
};
