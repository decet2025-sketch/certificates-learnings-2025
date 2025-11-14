import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { sopApi } from '@/lib/api/sop-api';
import { SopLearner, SopLearnerListResponse } from '@/types/api';
import { handleApiErrorWithToast } from '@/lib/error-toast-handler';
import { handleApiError } from '@/lib/api/admin-api';

interface SopLearnersStore {
  // State
  learners: SopLearner[];
  isLoading: boolean;
  isStatisticsLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    hasMore: boolean;
  };
  searchTerm: string;
  summary: {
    total_learners: number;
    active_learners: number;
    total_enrollments: number;
    completion_rate: number;
  };
  lastFetchParams: {
    page: number;
    searchTerm: string;
    organizationWebsite: string;
    itemsPerPage: number;
  } | null;

  // Actions
  setLearners: (learners: SopLearner[]) => void;
  setPagination: (
    pagination: Partial<SopLearnersStore['pagination']>
  ) => void;
  setSearchTerm: (searchTerm: string) => void;
  setSummary: (summary: SopLearnersStore['summary']) => void;
  setLoading: (loading: boolean) => void;
  setStatisticsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API calls
  fetchSopLearners: (
    organizationWebsite: string,
    page?: number,
    searchTerm?: string,
    itemsPerPage?: number
  ) => Promise<void>;
  fetchStatistics: (organizationWebsite: string) => Promise<void>;
  refreshLearners: (organizationWebsite: string) => Promise<void>;
}

export const useSopLearnersStore = create<SopLearnersStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        learners: [],
        isLoading: false,
        isStatisticsLoading: false,
        error: null,
        pagination: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 0,
          hasMore: false,
        },
        searchTerm: '',
        summary: {
          total_learners: 0,
          active_learners: 0,
          total_enrollments: 0,
          completion_rate: 0,
        },
        lastFetchParams: null,

        // Actions
        setLearners: (learners) => {
          set({ learners }, false, 'setLearners');
        },

        setPagination: (pagination) => {
          const currentPagination = get().pagination;
          const newPagination = {
            ...currentPagination,
            ...pagination,
          };
          set({ pagination: newPagination }, false, 'setPagination');
        },

        setSearchTerm: (searchTerm) => {
          set({ searchTerm }, false, 'setSearchTerm');
        },

        setSummary: (summary) => {
          set({ summary }, false, 'setSummary');
        },

        setLoading: (loading) => {
          set({ isLoading: loading }, false, 'setLoading');
        },

        setStatisticsLoading: (loading) => {
          set(
            { isStatisticsLoading: loading },
            false,
            'setStatisticsLoading'
          );
        },

        setError: (error) => {
          set({ error }, false, 'setError');
        },

        // API calls
        fetchSopLearners: async (
          organizationWebsite: string,
          page = 1,
          searchTerm = '',
          itemsPerPage = 10
        ) => {
          const currentState = get();
          const { pagination } = get();
          const limit = itemsPerPage || pagination.itemsPerPage;
          const currentParams = {
            page,
            searchTerm,
            organizationWebsite,
            itemsPerPage: limit,
          };

          // Prevent multiple simultaneous calls
          if (currentState.isLoading) {
            console.log(
              'API call already in progress, skipping...',
              currentParams
            );
            return;
          }

          // Prevent duplicate calls with same parameters
          if (
            currentState.lastFetchParams &&
            JSON.stringify(currentState.lastFetchParams) ===
              JSON.stringify(currentParams)
          ) {
            console.log(
              'Duplicate API call prevented',
              currentParams
            );
            return;
          }

          set(
            {
              isLoading: true,
              error: null,
              learners: [],
              lastFetchParams: currentParams,
            },
            false,
            'fetchSopLearners/start'
          );

          try {
            const offset = (page - 1) * limit;

            console.log('Fetching SOP learners with:', {
              organizationWebsite,
              limit,
              offset,
              searchTerm: searchTerm || undefined,
              currentPagination: pagination,
              itemsPerPageParam: itemsPerPage,
              pageParam: page,
            });

            const response: SopLearnerListResponse =
              await sopApi.listOrganizationLearners(
                organizationWebsite,
                limit,
                offset
              );

            console.log('SOP API Response:', {
              learnersCount: response.learners.length,
              pagination: response.pagination,
              totalLearners: response.summary?.total_learners,
            });

            // Filter learners based on search term if provided
            let filteredLearners = response.learners;
            if (searchTerm) {
              filteredLearners = response.learners.filter(
                (learner) =>
                  learner.learner_info.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  learner.learner_info.email
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  learner.courses.some((course) =>
                    course.course_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
              );
            }

            // Ensure we only show the requested number of items
            const limitedLearners = filteredLearners.slice(
              0,
              pagination.itemsPerPage
            );

            set(
              {
                learners: limitedLearners,
                // Only update summary on first page load, not on pagination
                summary:
                  page === 1 ? response.summary : get().summary,
                pagination: {
                  ...pagination,
                  currentPage: page,
                  totalItems: response.pagination.total,
                  hasMore: response.pagination.has_more,
                },
                isLoading: false,
                lastFetchParams: null, // Clear after successful fetch
              },
              false,
              'fetchSopLearners/success'
            );
          } catch (error) {
            const errorMessage = handleApiError(error);

            // Show error toast
            handleApiErrorWithToast(error, 'Failed to load learners');

            set(
              {
                error: errorMessage,
                isLoading: false,
                lastFetchParams: null, // Clear after error
                // Set default summary to prevent UI breaking
                summary: {
                  total_learners: 0,
                  active_learners: 0,
                  total_enrollments: 0,
                  completion_rate: 0,
                },
              },
              false,
              'fetchSopLearners/error'
            );
            throw error;
          }
        },

        fetchStatistics: async (organizationWebsite: string) => {
          const currentState = get();

          // Prevent multiple simultaneous calls
          if (currentState.isStatisticsLoading) {
            console.log(
              'Statistics API call already in progress, skipping...'
            );
            return;
          }

          set(
            { isStatisticsLoading: true },
            false,
            'fetchStatistics/start'
          );

          try {
            const response = await sopApi.getLearnerStatistics();

            set(
              {
                summary: {
                  total_learners: response.total_learners,
                  active_learners: response.active_learners,
                  total_enrollments: response.active_enrollments,
                  completion_rate:
                    response.active_enrollments > 0
                      ? Math.round(
                          (response.completed_courses /
                            response.active_enrollments) *
                            100
                        )
                      : 0,
                },
                isStatisticsLoading: false,
              },
              false,
              'fetchStatistics/success'
            );
          } catch (error) {
            console.error('Failed to fetch statistics:', error);
            handleApiErrorWithToast(
              error,
              'Failed to load statistics'
            );

            set(
              {
                isStatisticsLoading: false,
                // Set default summary to prevent UI breaking
                summary: {
                  total_learners: 0,
                  active_learners: 0,
                  total_enrollments: 0,
                  completion_rate: 0,
                },
              },
              false,
              'fetchStatistics/error'
            );
            throw error;
          }
        },

        refreshLearners: async (organizationWebsite: string) => {
          const { pagination, searchTerm } = get();
          await get().fetchSopLearners(
            organizationWebsite,
            pagination.currentPage,
            searchTerm,
            pagination.itemsPerPage
          );
        },
      }),
      {
        name: 'sop-learners-storage',
        partialize: (state) => ({
          // Only persist essential user preferences, not API data or filters
          // Don't persist: searchTerm (filter should reset on page refresh)
          // Don't persist: pagination itemsPerPage (should reset to default)
          // These should be fresh on each page load
        }),
      }
    ),
    {
      name: 'sop-learners-store',
    }
  )
);
