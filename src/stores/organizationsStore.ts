import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Organization, OrganizationsStore } from '@/types/store';
import {
  organizationApi,
  handleApiError,
  adminApi,
} from '@/lib/api/admin-api';
import { OrganizationApi } from '@/types/api';

// Helper function to transform API organization to store organization
const transformApiOrganizationToStore = (
  apiOrg: OrganizationApi
): Organization => {
  return {
    id: apiOrg.id,
    name: apiOrg.name,
    website: apiOrg.website,
    sopEmail: apiOrg.sop_email,
    password: apiOrg.password,
    status: 'active', // Default status since API doesn't provide this
    totalLearners: 0, // Will be updated when learners are loaded
    totalCourses: 0, // Will be updated when courses are loaded
  };
};

// Helper function to transform store organization to API organization
const transformStoreOrganizationToApi = (
  storeOrg: Omit<Organization, 'id'> & { sopPassword?: string }
) => {
  return {
    website: storeOrg.website,
    name: storeOrg.name,
    sop_email: storeOrg.sopEmail,
    sop_password: storeOrg.sopPassword || '',
  };
};

export const useOrganizationsStore = create<OrganizationsStore>()(
  // @ts-ignore - Zustand devtools middleware typing issue
  devtools(
    persist(
      (set, get) => ({
        // State
        organizations: [],
        selectedOrganization: null,
        isLoading: false,
        error: null,
        totalCount: 0,
        pagination: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 0,
          hasMore: false,
        },
        searchTerm: '',
        lastFetchParams: null, // Track last fetch parameters to prevent duplicates

        // Actions
        setOrganizations: (organizations) => {
          set({ organizations, totalCount: organizations.length });
        },

        addOrganization: (organization) => {
          const { organizations } = get();
          set({
            organizations: [...organizations, organization],
            totalCount: organizations.length + 1,
          });
        },

        updateOrganization: (id, updates) => {
          const { organizations } = get();
          const updatedOrganizations = organizations.map((org) =>
            org.id === id ? { ...org, ...updates } : org
          );
          set({ organizations: updatedOrganizations });
        },

        deleteOrganization: async (website) => {
          set({ isLoading: true, error: null });

          try {
            const response =
              await organizationApi.deleteOrganization(website);

            if (!response.ok) {
              throw new Error(
                response.error?.message ||
                  'Failed to delete organization'
              );
            }

            // Remove the organization from local state
            const { organizations } = get();
            const filteredOrganizations = organizations.filter(
              (org) => org.website !== website
            );

            set({
              organizations: filteredOrganizations,
              totalCount: filteredOrganizations.length,
              isLoading: false,
            });
          } catch (error) {
            const errorMessage = handleApiError(error);
            set({
              error: errorMessage,
              isLoading: false,
            });
            throw error;
          }
        },

        setSelectedOrganization: (organization) => {
          set({ selectedOrganization: organization });
        },

        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        setError: (error) => {
          set({ error });
        },

        setPagination: (pagination) => {
          const currentPagination = get().pagination;
          const newPagination = {
            ...currentPagination,
            ...pagination,
          };

          set({ pagination: newPagination });

          // If itemsPerPage changed, reset to page 1 and refetch
          if (
            pagination.itemsPerPage &&
            pagination.itemsPerPage !== currentPagination.itemsPerPage
          ) {
            set({ pagination: { ...newPagination, currentPage: 1 } });
            // Refetch with new page size
            get().fetchOrganizations(
              1,
              get().searchTerm,
              pagination.itemsPerPage
            );
          }
        },

        setSearchTerm: (searchTerm) => {
          set({ searchTerm });
        },

        refreshOrganizations: () => {
          const { pagination, searchTerm } = get();
          get().fetchOrganizations(
            pagination.currentPage,
            searchTerm,
            pagination.itemsPerPage
          );
        },

        fetchOrganizations: async (
          page = 1,
          search = '',
          itemsPerPage?: number
        ) => {
          const currentState = get();
          const { pagination } = get();
          const limit = itemsPerPage || pagination.itemsPerPage;
          const currentParams = {
            page,
            search,
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

          set({
            isLoading: true,
            error: null,
            organizations: [],
            lastFetchParams: currentParams,
          });

          try {
            const offset = (page - 1) * limit;

            console.log('Fetching organizations with:', {
              limit,
              offset,
              search: search || undefined,
              currentPagination: pagination,
              itemsPerPageParam: itemsPerPage,
              pageParam: page,
            });

            const response = await adminApi.listOrganizations(
              limit,
              offset,
              search || undefined
            );

            console.log('API Response:', {
              organizationsCount: response.organizations.length,
              pagination: response.pagination,
              count: response.count,
              limit: response.limit,
              offset: response.offset,
            });

            const organizations = response.organizations.map(
              transformApiOrganizationToStore
            );

            // Use pagination object directly like courses store
            const totalItems =
              response.pagination?.total || response.count;
            const hasMore =
              response.pagination?.has_more ||
              response.offset + response.organizations.length <
                response.count;

            set({
              organizations,
              pagination: {
                ...pagination,
                currentPage: page,
                totalItems,
                hasMore,
              },
              isLoading: false,
              lastFetchParams: null, // Clear after successful fetch
            });
          } catch (error) {
            const errorMessage = handleApiError(error);
            set({
              error: errorMessage,
              isLoading: false,
              lastFetchParams: null, // Clear after error
            });
          }
        },

        createOrganization: async (organizationData) => {
          set({ isLoading: true, error: null });

          try {
            const apiOrgData =
              transformStoreOrganizationToApi(organizationData);
            const response =
              await organizationApi.addOrganization(apiOrgData);

            if (!response.ok) {
              throw new Error(
                response.error?.message ||
                  'Failed to create organization'
              );
            }

            const newApiOrganization = response.data!;
            const newOrganization = transformApiOrganizationToStore(
              newApiOrganization
            );

            const { organizations } = get();
            set({
              organizations: [...organizations, newOrganization],
              totalCount: organizations.length + 1,
              isLoading: false,
            });
          } catch (error) {
            const errorMessage = handleApiError(error);
            set({
              error: errorMessage,
              isLoading: false,
            });
          }
        },
        editOrganization: async (
          organizationId,
          organizationData
        ) => {
          set({ isLoading: true, error: null });

          try {
            const apiOrgData = {
              organization_id: organizationId,
              name: organizationData.name,
              website: organizationData.website,
              sop_email: organizationData.sopEmail,
            };
            const response =
              await organizationApi.editOrganization(apiOrgData);

            if (!response.ok) {
              throw new Error(
                response.error?.message ||
                  'Failed to edit organization'
              );
            }

            const updatedApiOrganization = response.data!;
            const updatedOrganization =
              transformApiOrganizationToStore(updatedApiOrganization);

            const { organizations } = get();
            const updatedOrganizations = organizations.map((org) =>
              org.id === organizationId ? updatedOrganization : org
            );

            set({
              organizations: updatedOrganizations,
              isLoading: false,
            });
          } catch (error) {
            const errorMessage = handleApiError(error);
            set({
              error: errorMessage,
              isLoading: false,
            });
            throw error;
          }
        },

        resetSopPassword: async (organizationWebsite, newPassword, sopEmail) => {
          set({ isLoading: true, error: null });

          try {
            await adminApi.resetSopPassword(
              organizationWebsite,
              newPassword,
              sopEmail
            );
            set({ isLoading: false });
          } catch (error) {
            const errorMessage = handleApiError(error);
            set({
              error: errorMessage,
              isLoading: false,
            });
            throw error;
          }
        },
      }),
      {
        name: 'organizations-storage',
        partialize: (state) => ({
          // Only persist user preferences, not API data or pagination
          searchTerm: state.searchTerm,
          // Don't persist: organizations, pagination, totalCount, selectedOrganization
          // These should be fresh on each page load
        }),
      }
    ),
    {
      name: 'organizations-store',
    }
  )
);
