'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Plus,
  Building2,
  Users,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Globe,
  Mail,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AddOrganizationModal } from '@/components/AddOrganizationModal';
import { EditOrganizationModal } from '@/components/EditOrganizationModal';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useOrganizationsStore } from '@/stores/organizationsStore';
import { adminApi } from '@/lib/api/admin-api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { handleApiErrorWithToast } from '@/lib/error-toast-handler';

export default function OrganizationsPage() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [organizationForPasswordChange, setOrganizationForPasswordChange] = useState<any>(null);
  const [selectedOrganization, setSelectedOrganization] =
    useState<any>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [organizationToDelete, setOrganizationToDelete] =
    useState<any>(null);
  const [stats, setStats] = useState({
    total_organizations: 0,
    active_organizations: 0,
    poc_contacts: 0,
    total_learners: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  const {
    editOrganization,
    organizations,
    isLoading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    setPagination,
    fetchOrganizations,
    refreshOrganizations,
    deleteOrganization,
  } = useOrganizationsStore();

  // Use organizations directly since all filtering is now handled by the API
  const filteredOrganizations = organizations;

  const hasActiveFilters = searchTerm.length > 0;

  // Fetch statistics
  const fetchStatistics = async () => {
    setIsLoadingStats(true);
    try {
      const statistics = await adminApi.getOrganizationStatistics();
      setStats(statistics);
    } catch (error) {
      console.error(
        'Failed to fetch organization statistics:',
        error
      );
      handleApiErrorWithToast(
        error,
        'Failed to load organization statistics'
      );
      // Set default stats to prevent UI breaking
      setStats({
        total_organizations: 0,
        active_organizations: 0,
        poc_contacts: 0,
        total_learners: 0,
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    // Fetch fresh data on mount
    fetchOrganizations(1, searchTerm, 10);
    fetchStatistics();
    setIsInitialMount(false);
  }, []); // Only run on mount

  // Handle pagination, search changes - single effect for all data fetching
  useEffect(() => {
    console.log('Organizations useEffect triggered:', {
      currentPage: pagination.currentPage,
      searchTerm,
      hasSearched,
      shouldSkip:
        pagination.currentPage === 1 &&
        searchTerm === '' &&
        !hasSearched,
    });

    // Skip only on the very first mount to prevent double API calls
    if (isInitialMount) return;

    console.log(
      'Organizations: Fetching organizations for page:',
      pagination.currentPage
    );
    fetchOrganizations(
      pagination.currentPage,
      searchTerm,
      pagination.itemsPerPage
    );
  }, [
    pagination.currentPage,
    pagination.itemsPerPage,
    searchTerm,
    hasSearched,
  ]); // Include all dependencies

  // Handle search with debouncing - always reset to page 1
  useEffect(() => {
    // Skip if this is the initial mount (searchTerm is empty and we haven't searched yet)
    if (searchTerm === '' && !hasSearched) return;

    // Mark that user has interacted with search
    if (searchTerm !== '') {
      setHasSearched(true);
    } else {
      setHasSearched(false);
    }

    const timeoutId = setTimeout(
      () => {
        // Reset to page 1 when searching or clearing
        setPagination({ currentPage: 1 });
        fetchOrganizations(1, searchTerm, pagination.itemsPerPage);
      },
      500 // Always use 500ms delay for search
    );

    return () => clearTimeout(timeoutId);
  }, [searchTerm]); // Only depend on searchTerm

  // Handle pagination changes
  useEffect(() => {
    // Skip if this is the initial mount
    if (pagination.currentPage === 1 && searchTerm === '') return;

    fetchOrganizations(
      pagination.currentPage,
      searchTerm,
      pagination.itemsPerPage
    );
  }, [pagination.currentPage, pagination.itemsPerPage]); // Only depend on pagination

  const handleEditOrganization = (organization: any) => {
    setSelectedOrganization(organization);
    setEditModalOpen(true);
  };

  const handleDeleteOrganization = (organization: any) => {
    setOrganizationToDelete(organization);
    setDeleteModalOpen(true);
  };

  const handleOpenChangePasswordModal = (organization: any) => {
    setOrganizationForPasswordChange(organization);
    setChangePasswordModalOpen(true);
  };

  const togglePasswordVisibility = (organizationId: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(organizationId)) {
        newSet.delete(organizationId);
      } else {
        newSet.add(organizationId);
      }
      return newSet;
    });
  };

  const maskPassword = (password: string) => {
    return '•'.repeat(password.length);
  };

  const confirmDelete = async () => {
    if (organizationToDelete) {
      try {
        await deleteOrganization(organizationToDelete.website);
        setDeleteModalOpen(false);
        setOrganizationToDelete(null);
        // Refresh the organizations list to reflect the deletion
        refreshOrganizations();
      } catch (error) {
        // Error handling is done in the store, but we can add additional UI feedback here if needed
        console.error('Failed to delete organization:', error);
      }
    }
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedOrganization(null);
  };

  const handleEditSave = async (data: {
    name: string;
    sopEmail: string;
    website: string;
  }) => {
    if (selectedOrganization) {
      await editOrganization(selectedOrganization.id, data);
      setEditModalOpen(false);
      setSelectedOrganization(null);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({ currentPage: page });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Organizations
            </h1>
            <p className="text-muted-foreground">
              Manage organizations and their contact information.
            </p>
          </div>
          <AddOrganizationModal>
            <Button
              className="flex items-center space-x-2"
              data-testid="add-organization-button"
            >
              <Plus className="h-4 w-4" />
              <span>Add Organization</span>
            </Button>
          </AddOrganizationModal>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={refreshOrganizations}
                className="flex items-center space-x-2"
                disabled={isLoading}
              >
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {filteredOrganizations.length} organization
          {filteredOrganizations.length !== 1 ? 's' : ''} found
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Organizations
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats
                  ? '...'
                  : stats?.total_organizations || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All organizations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Organizations
              </CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats
                  ? '...'
                  : stats?.active_organizations || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                With websites
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                POC Contacts
              </CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats?.poc_contacts || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                With POC emails
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Learners
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats?.total_learners || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all orgs
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Error State - Now handled by toasts, keeping minimal UI for retry */}
        {error && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-yellow-800">
                <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium">
                  Data loading issue
                </span>
              </div>
              <p className="text-sm text-yellow-600 mt-1">
                Please check notifications for details
              </p>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {!error && (
          <>
            {/* Empty State */}
            {!isLoading && filteredOrganizations.length === 0 ? (
              <EmptyState
                icon={Building2}
                title={
                  hasActiveFilters
                    ? 'No organizations found'
                    : 'No organizations yet'
                }
                description={
                  hasActiveFilters
                    ? "Try adjusting your search filters to find what you're looking for."
                    : 'Get started by adding your first organization to manage learners and certificates.'
                }
                action={
                  !hasActiveFilters
                    ? {
                        label: 'Add First Organization',
                        onClick: () => {
                          // Trigger the Add Organization modal
                          const addButton = document.querySelector(
                            '[data-testid="add-organization-button"]'
                          ) as HTMLButtonElement;
                          addButton?.click();
                        },
                      }
                    : undefined
                }
              />
            ) : (
              /* Organizations Table */
              <Card>
                <CardHeader>
                  <CardTitle>Organization Management</CardTitle>
                  <CardDescription>
                    Manage organizations and their contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <LoadingSpinner
                        size="md"
                        text="Loading organizations..."
                      />
                    </div>
                  ) : (
                    <TableComponent>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px] px-4 py-3">
                            Organization
                          </TableHead>
                          <TableHead className="min-w-[200px] px-4 py-3">
                            Website
                          </TableHead>
                          <TableHead className="min-w-[200px] px-4 py-3">
                            POC Contact
                          </TableHead>
                          <TableHead className="min-w-[150px] px-4 py-3">
                            POC Password
                          </TableHead>
                          <TableHead className="w-20 text-center px-4 py-3">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrganizations.map((organization) => (
                          <TableRow key={organization.id}>
                            <TableCell className="px-4 py-4">
                              <div className="space-y-1">
                                <div className="font-medium text-base">
                                  {organization.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {organization.id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="flex items-center space-x-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {organization.website || 'No website'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {organization.sopEmail}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                                    {organization.password ? (
                                      visiblePasswords.has(organization.id)
                                        ? organization.password
                                        : maskPassword(organization.password)
                                    ) : 'No password set'}
                                  </div>
                                  {organization.password && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => togglePasswordVisibility(organization.id)}
                                      className="h-8 w-8 p-0">
                                      {visiblePasswords.has(organization.id) ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenChangePasswordModal(organization)}>
                                  Change Password
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-center px-4 py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuLabel>
                                    Organization Actions
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleEditOrganization(
                                        organization
                                      )
                                    }
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Organization
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteOrganization(
                                        organization
                                      )
                                    }
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Organization
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </TableComponent>
                  )}

                  {/* Pagination Controls */}
                  {filteredOrganizations.length > 0 && (
                    <div className="flex items-center justify-between px-2 py-4">
                      <div className="text-sm text-muted-foreground">
                        Showing{' '}
                        {(pagination.currentPage - 1) *
                          pagination.itemsPerPage +
                          1}{' '}
                        to{' '}
                        {Math.min(
                          pagination.currentPage *
                            pagination.itemsPerPage,
                          pagination.totalItems
                        )}{' '}
                        of {pagination.totalItems} results
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handlePageChange(
                              pagination.currentPage - 1
                            )
                          }
                          disabled={pagination.currentPage <= 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <div className="flex items-center space-x-1">
                          {Array.from(
                            {
                              length: Math.min(
                                5,
                                Math.ceil(
                                  pagination.totalItems /
                                    pagination.itemsPerPage
                                )
                              ),
                            },
                            (_, i) => {
                              const page = i + 1;
                              const isCurrentPage =
                                page === pagination.currentPage;
                              return (
                                <Button
                                  key={page}
                                  variant={
                                    isCurrentPage
                                      ? 'default'
                                      : 'outline'
                                  }
                                  size="sm"
                                  onClick={() =>
                                    handlePageChange(page)
                                  }
                                  className="w-8 h-8 p-0"
                                >
                                  {page}
                                </Button>
                              );
                            }
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handlePageChange(
                              pagination.currentPage + 1
                            )
                          }
                          disabled={!pagination.hasMore}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Modals */}
        {selectedOrganization && (
          <EditOrganizationModal
            isOpen={editModalOpen}
            onClose={handleEditModalClose}
            organization={selectedOrganization}
            onSave={handleEditSave}
          />
        )}

        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title={'Delete Organization'}
          description={
            'Are you sure you want to delete this organization? This will also delete all associated learners and progress data.'
          }
          itemName={organizationToDelete?.name || ''}
        />

        <ChangePasswordModal
          isOpen={changePasswordModalOpen}
          onClose={() => setChangePasswordModalOpen(false)}
          organization={organizationForPasswordChange}
        />
      </div>
    </DashboardLayout>
  );
}
