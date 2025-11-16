import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Learner, LearnersStore } from '@/types/store';
import {
  learnerApi,
  handleApiError,
  adminApi,
} from '@/lib/api/admin-api';
import {
  LearnerApi,
  AdminLearner,
  AdminLearnerListResponse,
} from '@/types/api';

// Helper function to transform API learner to store learner
const transformApiLearnerToStore = (
  apiLearner: LearnerApi
): Learner => {
  return {
    id: apiLearner.id,
    name: apiLearner.name,
    email: apiLearner.email,
    organization: apiLearner.organization_website, // Using website as organization name
    organizationId: apiLearner.organization_website, // Using website as ID
    status: 'active', // Default status since API doesn't provide this
    totalCourses: 1, // Default to 1 since learners are course-specific
    completedCourses: apiLearner.completion_at ? 1 : 0,
  };
};

export const useLearnersStore = create<LearnersStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        learners: [],
        adminLearners: [],
        selectedLearner: null,
        isLoading: false,
        error: null,
        totalCount: 0,
        pagination: {
          currentPage: 1,
          itemsPerPage: 10, // Force 10 items per page
          totalItems: 0,
          hasMore: false,
        },
        searchTerm: '',
        selectedOrganization: 'All',
        enrollmentStatus: 'all',
        organizationWebsite: '',
        lastFetchParams: null,

        // Actions
        setLearners: (learners) => {
          set(
            { learners, totalCount: learners.length },
            false,
            'setLearners'
          );
        },

        setAdminLearners: (learners) => {
          set({ adminLearners: learners }, false, 'setAdminLearners');
        },

        setPagination: (pagination) => {
          const currentPagination = get().pagination;
          const newPagination = {
            ...currentPagination,
            ...pagination,
          };

          set({ pagination: newPagination }, false, 'setPagination');

          // If itemsPerPage changed, reset to page 1 and refetch
          if (
            pagination.itemsPerPage &&
            pagination.itemsPerPage !== currentPagination.itemsPerPage
          ) {
            set(
              { pagination: { ...newPagination, currentPage: 1 } },
              false,
              'resetPageForNewSize'
            );
            // Refetch with new page size
            get().fetchAdminLearners(
              1,
              get().searchTerm,
              get().selectedOrganization,
              pagination.itemsPerPage,
              'all',
              ''
            );
          }
        },

        setSearchTerm: (searchTerm) => {
          set({ searchTerm }, false, 'setSearchTerm');
        },

        setSelectedOrganization: (organization) => {
          set(
            { selectedOrganization: organization },
            false,
            'setSelectedOrganization'
          );
        },

        setEnrollmentStatus: (status) => {
          set(
            { enrollmentStatus: status },
            false,
            'setEnrollmentStatus'
          );
        },

        setOrganizationWebsite: (website) => {
          set(
            { organizationWebsite: website },
            false,
            'setOrganizationWebsite'
          );
        },

        refreshLearners: () => {
          const { pagination, searchTerm, selectedOrganization, enrollmentStatus, organizationWebsite } =
            get();
          get().fetchAdminLearners(
            pagination.currentPage,
            searchTerm,
            selectedOrganization,
            pagination.itemsPerPage,
            enrollmentStatus,
            organizationWebsite
          );
        },

        addLearner: (learner) => {
          const { learners } = get();
          set(
            {
              learners: [...learners, learner],
              totalCount: learners.length + 1,
            },
            false,
            'addLearner'
          );
        },

        updateLearner: (id, updates) => {
          const { learners } = get();
          const updatedLearners = learners.map((learner) =>
            learner.id === id ? { ...learner, ...updates } : learner
          );
          set({ learners: updatedLearners }, false, 'updateLearner');
        },

        deleteLocalLearner: (id) => {
          const { learners } = get();
          const filteredLearners = learners.filter(
            (learner) => learner.id !== id
          );
          set(
            {
              learners: filteredLearners,
              totalCount: filteredLearners.length,
            },
            false,
            'deleteLocalLearner'
          );
        },

        setSelectedLearner: (learner) => {
          set(
            { selectedLearner: learner },
            false,
            'setSelectedLearner'
          );
        },

        setLoading: (loading) => {
          set({ isLoading: loading }, false, 'setLoading');
        },

        setError: (error) => {
          set({ error }, false, 'setError');
        },

        fetchLearners: async () => {
          const { pagination } = get();
          set(
            { isLoading: true, error: null },
            false,
            'fetchLearners/start'
          );

          try {
            // Use pagination settings instead of hardcoded values
            const response = await learnerApi.listLearners(
              undefined,
              undefined,
              pagination.itemsPerPage,
              (pagination.currentPage - 1) * pagination.itemsPerPage
            );

            if (!response.ok) {
              throw new Error(
                response.error?.message || 'Failed to fetch learners'
              );
            }

            const apiLearners = response.data?.learners || [];
            const learners = apiLearners.map(
              transformApiLearnerToStore
            );

            set(
              {
                learners,
                totalCount: learners.length,
                isLoading: false,
              },
              false,
              'fetchLearners/success'
            );
          } catch (error) {
            const errorMessage = handleApiError(error);
            set(
              {
                error: errorMessage,
                isLoading: false,
              },
              false,
              'fetchLearners/error'
            );
          }
        },

        fetchAdminLearners: async (
          page = 1,
          search = '',
          organization = 'All',
          itemsPerPage?: number,
          enrollmentStatus?: string,
          organizationWebsite?: string
        ) => {
          const currentState = get();
          const { pagination } = get();
          const limit = itemsPerPage || pagination.itemsPerPage;

          const currentParams = {
            page,
            search,
            organization,
            limit,
            enrollmentStatus,
            organizationWebsite,
          };

          // Prevent multiple simultaneous calls
          if (currentState.isLoading) {
            console.log('API call already in progress, skipping...', currentParams);
            return;
          }

          // Prevent duplicate calls with same parameters
          if (
            currentState.lastFetchParams &&
            JSON.stringify(currentState.lastFetchParams) ===
              JSON.stringify(currentParams)
          ) {
            console.log('Duplicate API call prevented', currentParams);
            return;
          }

          set(
            {
              isLoading: true,
              error: null,
              adminLearners: [],
              lastFetchParams: currentParams,
            },
            false,
            'fetchAdminLearners/start'
          );

          try {
            const offset = (page - 1) * limit;

            const organizationFilter =
              organization === 'All' ? undefined : organization;

            console.log('Fetching learners with:', {
              limit,
              offset,
              search: search || undefined,
              organization: organizationFilter,
              enrollment_status: enrollmentStatus,
              organization_website: organizationWebsite,
              currentPagination: pagination,
              itemsPerPageParam: itemsPerPage,
              pageParam: page,
            });

            const response = await adminApi.listAllLearners(
              limit,
              offset,
              search || undefined,
              organizationFilter,
              enrollmentStatus,
              organizationWebsite
            );

            console.log('API Response:', {
              learnersCount: response.learners.length,
              pagination: response.pagination,
              totalLearners: response.summary?.total_learners,
            });

            // Ensure we only show the requested number of items
            const limitedLearners = response.learners.slice(
              0,
              pagination.itemsPerPage
            );

            set(
              {
                adminLearners: limitedLearners,
                pagination: {
                  ...pagination,
                  currentPage: page,
                  totalItems: response.pagination.total,
                  hasMore: response.pagination.has_more,
                },
                isLoading: false,
              },
              false,
              'fetchAdminLearners/success'
            );
          } catch (error) {
            const errorMessage = handleApiError(error);
            set(
              {
                error: errorMessage,
                isLoading: false,
              },
              false,
              'fetchAdminLearners/error'
            );
          }
        },

        createLearner: async (learnerData) => {
          set(
            { isLoading: true, error: null },
            false,
            'createLearner/start'
          );

          try {
            // Note: Individual learner creation might not be supported by the API
            // This would typically be done through CSV upload
            throw new Error(
              'Individual learner creation not supported. Use CSV upload instead.'
            );
          } catch (error) {
            const errorMessage = handleApiError(error);
            set(
              {
                error: errorMessage,
                isLoading: false,
              },
              false,
              'createLearner/error'
            );
          }
        },

        uploadLearners: async (file, courseId) => {
          set(
            { isLoading: true, error: null },
            false,
            'uploadLearners/start'
          );

          try {
            // Read the CSV file content
            const csvData = await file.text();

            // Import the admin API
            const { adminApi } = await import('@/lib/api/admin-api');

            // Call the upload learners API with CSV data directly
            await adminApi.uploadLearnersCSV(courseId, csvData);

            // Refresh the learners list with proper pagination
            const { pagination, searchTerm, selectedOrganization } =
              get();
            await get().fetchAdminLearners(
              pagination.currentPage,
              searchTerm,
              selectedOrganization,
              pagination.itemsPerPage,
              'all',
              ''
            );

            set(
              {
                isLoading: false,
                error: null,
              },
              false,
              'uploadLearners/success'
            );
          } catch (error) {
            const errorMessage = handleApiError(error);
            set(
              {
                error: errorMessage,
                isLoading: false,
              },
              false,
              'uploadLearners/error'
            );
            throw error;
          }
        },

        deleteLearner: async (learnerEmail: string, organizationWebsite: string) => {
          set(
            { isLoading: true, error: null },
            false,
            'deleteLearner/start'
          );

          try {
            // Import the admin API
            const { adminApi } = await import('@/lib/api/admin-api');

            // Call the delete learner API
            const result = await adminApi.deleteLearner({
              learner_email: learnerEmail,
              organization_website: organizationWebsite,
            });

            if (!result.success) {
              throw new Error(result.message || 'Failed to delete learner');
            }

            // Refresh the learners list with proper pagination
            const { pagination, searchTerm, selectedOrganization } =
              get();
            await get().fetchAdminLearners(
              pagination.currentPage,
              searchTerm,
              selectedOrganization,
              pagination.itemsPerPage,
              'all',
              ''
            );

            set(
              {
                isLoading: false,
                error: null,
              },
              false,
              'deleteLearner/success'
            );

            return result;
          } catch (error) {
            const errorMessage = handleApiError(error);
            set(
              {
                error: errorMessage,
                isLoading: false,
              },
              false,
              'deleteLearner/error'
            );
            throw error;
          }
        },
      }),
      {
        name: 'learners-storage',
        partialize: (state) => ({
          // Only persist essential user preferences, not API data or filters
          // Don't persist: searchTerm, selectedOrganization (filters should reset on page refresh)
          // Don't persist: learners, adminLearners, pagination, totalCount, selectedLearner, lastFetchParams
          // These should be fresh on each page load
        }),
      }
    ),
    {
      name: 'learners-store',
    }
  )
);
