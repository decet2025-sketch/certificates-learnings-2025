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
  BookOpen,
  Upload,
  Users,
  Search,
  MoreHorizontal,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  FileText,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AddCourseModal } from '@/components/AddCourseModal';
import { UploadLearnersModal } from '@/components/UploadLearnersModal';
import { CertificateTemplateModal } from '@/components/CertificateTemplateModal';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
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
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCoursesStore } from '@/stores/coursesStore';
import { useAuthStore } from '@/stores/authStore';
import { adminApi } from '@/lib/api/admin-api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { handleApiErrorWithToast } from '@/lib/error-toast-handler';

export default function CoursesPage() {
  const {
    courses,
    isLoading,
    error,
    pagination,
    searchTerm,
    setSearchTerm,
    setPagination,
    fetchCourses,
    refreshCourses,
    deleteCourse,
  } = useCoursesStore();
  const { user } = useAuthStore();

  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateModalMode, setTemplateModalMode] = useState<
    'preview' | 'edit'
  >('preview');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  const [stats, setStats] = useState({
    total_courses: 0,
    total_learners: 0,
    avg_completion: 0,
    certificate_templates: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Use courses directly since all filtering is now handled by the API
  const filteredCourses = courses;

  const hasActiveFilters = searchTerm.length > 0;

  // Fetch statistics
  const fetchStatistics = async () => {
    setIsLoadingStats(true);
    try {
      const statistics = await adminApi.getCourseStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Failed to fetch course statistics:', error);
      handleApiErrorWithToast(
        error,
        'Failed to load course statistics'
      );
      // Set default stats to prevent UI breaking
      setStats({
        total_courses: 0,
        total_learners: 0,
        avg_completion: 0,
        certificate_templates: 0,
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    // Fetch fresh data on mount
    fetchCourses(1, searchTerm, 10);
    fetchStatistics();
    setIsInitialMount(false);
  }, []); // Only run on mount

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
      },
      500 // Always use 500ms delay for search
    );

    return () => clearTimeout(timeoutId);
  }, [searchTerm]); // Only depend on searchTerm

  // Handle pagination and search changes - single effect for all data fetching
  useEffect(() => {
    console.log('Courses useEffect triggered:', {
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
      'Courses: Fetching courses for page:',
      pagination.currentPage
    );
    fetchCourses(
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

  const handlePageChange = (page: number) => {
    console.log(
      'Courses: Page change requested:',
      page,
      'Current page:',
      pagination.currentPage
    );
    setPagination({ currentPage: page });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleTemplateAction = (
    course: any,
    mode: 'preview' | 'edit'
  ) => {
    setSelectedCourse(course);
    setTemplateModalMode(mode);
    setTemplateModalOpen(true);
  };

  const handleTemplateModalClose = () => {
    setTemplateModalOpen(false);
    setSelectedCourse(null);
  };

  const handleTemplateModeChange = (mode: 'preview' | 'edit') => {
    setTemplateModalMode(mode);
  };

  const handleDeleteCourse = (course: any) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (courseToDelete) {
      await deleteCourse(courseToDelete.courseId);
      setDeleteModalOpen(false);
      setCourseToDelete(null);
    }
  };

  const downloadSampleCSV = () => {
    // CSV content with headers from sample_learners.csv
    const csvContent = 'name,email,organization_website\n';

    // Create blob and download
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_learners.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Courses
            </h1>
            <p className="text-muted-foreground">
              Manage your courses and certificate templates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={downloadSampleCSV}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Learners CSV Template</span>
            </Button>
            <AddCourseModal>
              <Button
                className="flex items-center space-x-2"
                data-testid="add-course-button"
              >
                <Plus className="h-4 w-4" />
                <span>Add Course</span>
              </Button>
            </AddCourseModal>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={refreshCourses}
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
          {pagination.totalItems} course
          {pagination.totalItems !== 1 ? 's' : ''} found
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : stats?.total_courses || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All courses
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
                Across all courses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Completion
              </CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats
                  ? '...'
                  : `${Math.round(stats?.avg_completion || 0)}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                Completion rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Certificate Templates
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats
                  ? '...'
                  : stats?.certificate_templates || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                With templates
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
            {!isLoading && filteredCourses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title={
                  hasActiveFilters
                    ? 'No courses found'
                    : 'No courses yet'
                }
                description={
                  hasActiveFilters
                    ? "Try adjusting your search filters to find what you're looking for."
                    : 'Get started by creating your first course and setting up certificate templates.'
                }
                action={
                  !hasActiveFilters
                    ? {
                        label: 'Create First Course',
                        onClick: () => {
                          // Trigger the Add Course modal
                          const addButton = document.querySelector(
                            '[data-testid="add-course-button"]'
                          ) as HTMLButtonElement;
                          addButton?.click();
                        },
                      }
                    : undefined
                }
              />
            ) : (
              /* Courses Table */
              <Card>
                <CardHeader>
                  <CardTitle>Course Management</CardTitle>
                  <CardDescription>
                    Manage your courses and certificate templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <LoadingSpinner
                        size="md"
                        text="Loading courses..."
                      />
                    </div>
                  ) : (
                    <TableComponent>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20 px-4 py-3">
                            Course URL
                          </TableHead>
                          <TableHead className="min-w-[300px] px-4 py-3">
                            Course Name
                          </TableHead>
                          <TableHead className="w-32 text-center px-4 py-3">
                            Certificate Template
                          </TableHead>
                          <TableHead className="w-20 text-center px-4 py-3">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCourses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell className="font-mono text-sm px-4 py-4">
                              {course.courseUrl ? (
                                <a
                                  href={course.courseUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline truncate block max-w-[200px]"
                                  title={course.courseUrl}
                                >
                                  {course.courseUrl}
                                </a>
                              ) : (
                                <span className="text-gray-400 italic">
                                  No URL
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="space-y-1">
                                <div className="font-medium text-base">
                                  {course.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Status:{' '}
                                  <Badge variant="outline">
                                    {course.status}
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center px-4 py-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleTemplateAction(
                                    course,
                                    'preview'
                                  )
                                }
                                className="w-full flex items-center space-x-2"
                              >
                                <Eye className="h-4 w-4" />
                                <span>Preview/Edit</span>
                              </Button>
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
                                    Course Actions
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <UploadLearnersModal
                                    courseId={course.courseId}
                                  >
                                    <DropdownMenuItem
                                      onSelect={(e) =>
                                        e.preventDefault()
                                      }
                                    >
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload Learners
                                    </DropdownMenuItem>
                                  </UploadLearnersModal>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleTemplateAction(
                                        course,
                                        'preview'
                                      )
                                    }
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview/Edit Template
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteCourse(course)
                                    }
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Course
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </TableComponent>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pagination Controls */}
            {filteredCourses.length > 0 && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing{' '}
                  {(pagination.currentPage - 1) *
                    pagination.itemsPerPage +
                    1}{' '}
                  to{' '}
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}{' '}
                  of {pagination.totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(pagination.currentPage - 1)
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
                              isCurrentPage ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
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
                      handlePageChange(pagination.currentPage + 1)
                    }
                    disabled={!pagination.hasMore}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {selectedCourse && (
          <CertificateTemplateModal
            isOpen={templateModalOpen}
            onClose={handleTemplateModalClose}
            courseId={selectedCourse.courseId}
            courseName={selectedCourse.name}
            currentTemplate={selectedCourse.certificateTemplate || ''}
            mode={templateModalMode}
            onModeChange={handleTemplateModeChange}
          />
        )}

        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title={'Delete Course'}
          description={
            'Are you sure you want to delete this course? This will also delete all associated learners and progress data.'
          }
          itemName={selectedCourse?.name || ''}
        />
      </div>
    </DashboardLayout>
  );
}
