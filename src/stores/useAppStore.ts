// Re-export the combined store hook
export { useAppStore, initializeStores, resetStores } from './index'

// Re-export individual stores for convenience
export {
  useCoursesStore,
  useLearnersStore,
  useOrganizationsStore,
  useLearnerProgressStore,
  useCertificatesStore,
  useAuthStore,
  useUIStore
} from './index'

// Re-export types
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
  RootStore
} from '@/types/store'
