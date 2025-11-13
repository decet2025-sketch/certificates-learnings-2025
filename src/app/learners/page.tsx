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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Search,
  MoreHorizontal,
  Plus,
  Building2,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Award,
  XCircle,
  MinusCircle,
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import LearnerDetailSideCurtain from '@/components/LearnerDetailSideCurtain';
import { EditLearnerModal } from '@/components/EditLearnerModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/lib/api';
import { AdminLearner, AdminLearnerListResponse } from '@/types/api';
import { useLearnersStore } from '@/stores/learnersStore';
import { adminApi } from '@/lib/api/admin-api';
import { LoadingCard } from '@/components/ui/loading-spinner';
import { handleApiErrorWithToast } from '@/lib/error-toast-handler';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CourseEnrollment {
  course_id: string;
  course_name: string;
  enrollment_status: string;
  completion_percentage: number;
  completion_date: string | null;
  certificate_status: string;
  created_at: string | null;
}

interface Learner {
  learner_info: {
    name: string;
    email: string;
    organization_website: string;
  };
  organization_info: {
    name: string;
    website: string;
    sop_email: string;
    created_at: string;
  };
  courses: CourseEnrollment[];
}

export default function LearnersPage() {
  const {
    adminLearners,
    isLoading,
    pagination,
    searchTerm,
    selectedOrganization,
    setSearchTerm,
    setSelectedOrganization,
    setPagination,
    fetchAdminLearners,
    refreshLearners,
    deleteLearner,
  } = useLearnersStore();

  const [summary, setSummary] = useState({
    total_learners: 0,
    active_learners: 0,
    total_enrollments: 0,
    completion_rate: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState<any>(null);
  const [isSideCurtainOpen, setIsSideCurtainOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [editingLearner, setEditingLearner] = useState<AdminLearner | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingLearner, setDeletingLearner] = useState<AdminLearner | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletedLearnerIds, setDeletedLearnerIds] = useState<Set<string>>(new Set());

  // Fetch statistics
  const fetchStatistics = async () => {
    setIsLoadingStats(true);
    try {
      const stats = await adminApi.getLearnerStatistics();
      setSummary(stats);
    } catch (error) {
      console.error('Failed to fetch learner statistics:', error);
      handleApiErrorWithToast(
        error,
        'Failed to load learner statistics'
      );
      // Set default stats to prevent UI breaking
      setSummary({
        total_learners: 0,
        active_learners: 0,
        total_enrollments: 0,
        completion_rate: 0,
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    // Fetch fresh data on mount
    fetchAdminLearners(1, searchTerm, selectedOrganization, 10);
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
        fetchAdminLearners(1, searchTerm, selectedOrganization, pagination.itemsPerPage);
      },
      500 // Always use 500ms delay for search
    );

    return () => clearTimeout(timeoutId);
  }, [searchTerm]); // Only depend on searchTerm

  // Handle pagination and organization changes - exclude search since it's handled by debouncing
  useEffect(() => {
    // Skip only on the very first mount to prevent double API calls
    if (isInitialMount) return;

    console.log(
      'Learners: Fetching learners for page:',
      pagination.currentPage,
      'organization:',
      selectedOrganization
    );
    fetchAdminLearners(
      pagination.currentPage,
      searchTerm,
      selectedOrganization,
      pagination.itemsPerPage
    );
  }, [
    pagination.currentPage,
    selectedOrganization,
    pagination.itemsPerPage,
  ]); // Exclude searchTerm to avoid conflicts with debouncing

  // Use adminLearners directly since all filtering is now handled by the API
  // Exclude deleted learners for optimistic UI updates
  const filteredLearners = adminLearners.filter(
    (learner) => !deletedLearnerIds.has(learner.learner_info.email)
  );

  const getStatusIcon = (
    completionPercentage: number,
    enrollmentStatus: string
  ) => {
    if (enrollmentStatus === 'blocked') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (completionPercentage === 100) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    if (completionPercentage > 0 && completionPercentage < 100) {
      return <Clock className="h-4 w-4 text-blue-500" />;
    }
    return <MinusCircle className="h-4 w-4 text-gray-500" />;
  };

  const getStatusBadge = (
    completionPercentage: number,
    enrollmentStatus: string
  ) => {
    if (enrollmentStatus === 'blocked') {
      return (
        <Badge className="bg-red-100 text-red-800">Blocked</Badge>
      );
    }
    if (completionPercentage === 100) {
      return (
        <Badge className="bg-green-100 text-green-800">
          Completed
        </Badge>
      );
    }
    if (completionPercentage > 0 && completionPercentage < 100) {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          In Progress
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>
    );
  };

  const getCertificateStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'issued':
        return (
          <Badge className="bg-green-100 text-green-800">
            Issued
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case 'not_applicable':
        return (
          <Badge className="bg-gray-100 text-gray-800">N/A</Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        );
    }
  };

  const handlePageChange = (page: number) => {
    console.log(
      'Learners: Page change requested:',
      page,
      'Current page:',
      pagination.currentPage
    );
    setPagination({ currentPage: page });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleOrganizationChange = (value: string) => {
    setSelectedOrganization(value);
    setPagination({ currentPage: 1 });
    // The useEffect will handle the API call
  };

  const handleLearnerClick = (learner: AdminLearner) => {
    // Transform AdminLearner to the format expected by LearnerDetailSideCurtain
    const transformedLearner = {
      id: learner.learner_info.email, // Use email as ID
      name: learner.learner_info.name,
      email: learner.learner_info.email,
      organization: learner.organization_info.name,
      enrollmentDate: learner.organization_info.created_at,
      courses: learner.courses.map((course) => ({
        id: course.course_id,
        name: course.course_name,
        status:
          course.completion_percentage === 100
            ? 'Completed'
            : course.completion_percentage > 0 &&
                course.completion_percentage < 100
              ? 'In Progress'
              : 'Not Started',
        progress: course.completion_percentage,
        certificateStatus:
          course.certificate_status === 'Issued'
            ? 'Issued'
            : course.certificate_status === 'Pending'
              ? 'Pending'
              : course.certificate_status === 'completed'
                ? 'Issued' // Map 'completed' to 'Issued' for display
                : 'Not Applicable',
        certificateGenerated:
          course.certificate_status === 'Issued' ||
          course.certificate_status === 'completed',
        completionDate: course.completion_date,
      })),
    };
    setSelectedLearner(transformedLearner as any);
    setIsSideCurtainOpen(true);
  };

  const closeSideCurtain = () => {
    setIsSideCurtainOpen(false);
    setSelectedLearner(null);
  };

  const handleEditLearner = (learner: AdminLearner) => {
    setEditingLearner(learner);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingLearner(null);
  };

  const handleDeleteLearner = (learner: AdminLearner) => {
    setDeletingLearner(learner);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteLearner = async () => {
    if (!deletingLearner) return;

    // Immediately remove from UI for optimistic update
    const learnerEmail = deletingLearner.learner_info.email;
    setDeletedLearnerIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(learnerEmail);
      return newSet;
    });

    // Close modal immediately
    setIsDeleteModalOpen(false);
    setDeletingLearner(null);

    try {
      const result = await deleteLearner(
        learnerEmail,
        deletingLearner.learner_info.organization_website
      );

      return result;
    } catch (error) {
      // Error is already handled by the store with toast
      console.error('Failed to delete learner:', error);
      // Roll back the optimistic update on error
      setDeletedLearnerIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(learnerEmail);
        return newSet;
      });
      // Keep modal closed but show error toast
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingLearner(null);
  };

  // Use summary data from API
  const totalLearners = summary?.total_learners || 0;
  const activeLearners = summary?.active_learners || 0;
  const totalEnrollments = summary?.total_enrollments || 0;
  const averageCompletion = summary?.completion_rate || 0;

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Learners
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage all learners across organizations and courses
            </p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search learners, courses, or organizations..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={refreshLearners}
                className="flex items-center space-x-2"
                disabled={isLoading}
              >
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Learners
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : totalLearners}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all organizations
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Learners
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : activeLearners}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently enrolled
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Enrollments
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : totalEnrollments}
              </div>
              <p className="text-xs text-muted-foreground">
                Sum of all course enrollments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? '...' : `${averageCompletion}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                Average completion percentage
              </p>
            </CardContent>
          </Card>
        </div> */}

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredLearners.length} learner
            {filteredLearners.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Learners Content */}
        <Card>
          <CardHeader>
            <CardTitle>Learner Management</CardTitle>
            <CardDescription>
              Consolidated view of all learners across organizations
              and courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoadingCard
              isLoading={isLoading}
              text="Loading learners..."
            >
              {filteredLearners.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No learners found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Desktop Table View */}
                  {
                    <div className="hidden lg:block">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[200px]">
                                Learner
                              </TableHead>
                              <TableHead className="w-[150px]">
                                Organization
                              </TableHead>
                              <TableHead className="w-[200px]">
                                Courses
                              </TableHead>
                              <TableHead className="w-[150px]">
                                Course Status
                              </TableHead>
                              <TableHead className="w-[150px]">
                                Certificate Status
                              </TableHead>
                              <TableHead className="w-[100px]">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredLearners.map(
                              (learner, index) => (
                                <TableRow
                                  key={`${learner.learner_info.email}-${index}`}
                                  className="hover:bg-gray-50"
                                >
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">
                                        {learner.learner_info.name}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {learner.learner_info.email}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Building2 className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">
                                        {
                                          learner.organization_info
                                            .name
                                        }
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      {learner.courses
                                        .slice(0, 5)
                                        .map(
                                          (
                                            course: CourseEnrollment,
                                            index: number
                                          ) => (
                                            <div
                                              key={course.course_id}
                                              className="flex items-center space-x-2"
                                            >
                                              <BookOpen className="h-3 w-3 text-muted-foreground" />
                                              <span className="text-xs text-muted-foreground">
                                                {course.course_name}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      {learner.courses.length > 5 && (
                                        <div className="text-xs text-muted-foreground">
                                          +
                                          {learner.courses.length - 5}{' '}
                                          more
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-2">
                                      {learner.courses
                                        .slice(0, 5)
                                        .map(
                                          (
                                            course: CourseEnrollment
                                          ) => (
                                            <div
                                              key={course.course_id}
                                              className="space-y-1"
                                            >
                                              <div className="flex items-center space-x-1">
                                                {getStatusIcon(
                                                  course.completion_percentage,
                                                  course.enrollment_status
                                                )}
                                                {getStatusBadge(
                                                  course.completion_percentage,
                                                  course.enrollment_status
                                                )}
                                              </div>
                                              {course.completion_percentage >
                                                0 &&
                                                course.completion_percentage <
                                                  100 && (
                                                  <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                      <span>
                                                        Progress
                                                      </span>
                                                      <span>
                                                        {
                                                          course.completion_percentage
                                                        }
                                                        %
                                                      </span>
                                                    </div>
                                                    <Progress
                                                      value={
                                                        course.completion_percentage
                                                      }
                                                      className="h-1.5"
                                                    />
                                                  </div>
                                                )}
                                            </div>
                                          )
                                        )}
                                      {learner.courses.length > 5 && (
                                        <div className="text-xs text-muted-foreground">
                                          +
                                          {learner.courses.length - 5}{' '}
                                          more
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      {learner.courses
                                        .slice(0, 5)
                                        .map(
                                          (
                                            course: CourseEnrollment
                                          ) => (
                                            <div
                                              key={course.course_id}
                                              className="flex items-center space-x-1"
                                            >
                                              {getCertificateStatusBadge(
                                                course.certificate_status
                                              )}
                                            </div>
                                          )
                                        )}
                                      {learner.courses.length > 5 && (
                                        <div className="text-xs text-muted-foreground">
                                          +
                                          {learner.courses.length - 5}{' '}
                                          more
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleLearnerClick(learner)
                                        }
                                        className="flex items-center space-x-1"
                                      >
                                        <Eye className="h-4 w-4" />
                                        <span>View</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleEditLearner(learner)
                                        }
                                        className="flex items-center space-x-1"
                                      >
                                        <Edit className="h-4 w-4" />
                                        <span>Edit</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteLearner(learner)
                                        }
                                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete</span>
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  }

                  {/* Mobile Table View (for smaller screens) */}
                  {
                    <div className="lg:hidden space-y-4">
                      {filteredLearners.map((learner, index) => (
                        <Card
                          key={`${learner.learner_info.email}-${index}`}
                          className="p-4"
                        >
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm sm:text-base truncate">
                                  {learner.learner_info.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                  {learner.learner_info.email}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleLearnerClick(learner)
                                  }
                                  className="flex items-center space-x-1"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>View</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleEditLearner(learner)
                                  }
                                  className="flex items-center space-x-1"
                                >
                                  <Edit className="h-4 w-4" />
                                  <span>Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteLearner(learner)
                                  }
                                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete</span>
                                </Button>
                              </div>
                            </div>

                            {/* Organization and Courses */}
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  {learner.organization_info.name}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs sm:text-sm text-muted-foreground">
                                  {learner.courses.length} courses
                                </span>
                              </div>
                            </div>

                            {/* Course Details */}
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-muted-foreground">
                                Courses ({learner.courses.length})
                              </div>
                              <div className="space-y-2">
                                {learner.courses
                                  .slice(0, 3)
                                  .map((course: CourseEnrollment) => (
                                    <div
                                      key={course.course_id}
                                      className="space-y-1"
                                    >
                                      <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center space-x-2">
                                          <BookOpen className="h-3 w-3 text-muted-foreground" />
                                          <span className="truncate">
                                            {course.course_name}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          {getStatusIcon(
                                            course.completion_percentage,
                                            course.enrollment_status
                                          )}
                                          {getStatusBadge(
                                            course.completion_percentage,
                                            course.enrollment_status
                                          )}
                                        </div>
                                      </div>
                                      {course.completion_percentage >
                                        0 &&
                                        course.completion_percentage <
                                          100 && (
                                          <div className="space-y-1">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                              <span>Progress</span>
                                              <span>
                                                {
                                                  course.completion_percentage
                                                }
                                                %
                                              </span>
                                            </div>
                                            <Progress
                                              value={
                                                course.completion_percentage
                                              }
                                              className="h-1.5"
                                            />
                                          </div>
                                        )}
                                    </div>
                                  ))}
                                {learner.courses.length > 3 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{learner.courses.length - 3} more
                                    courses
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Certificate Summary */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                Certificates
                              </span>
                              <div className="flex space-x-1">
                                {learner.courses
                                  .filter(
                                    (course: CourseEnrollment) =>
                                      course.certificate_status ===
                                      'issued'
                                  )
                                  .slice(0, 3)
                                  .map((course: CourseEnrollment) => (
                                    <Badge
                                      key={course.course_id}
                                      className="bg-green-100 text-green-800 text-xs"
                                    >
                                      {course.course_name}
                                    </Badge>
                                  ))}
                                {learner.courses.filter(
                                  (course: CourseEnrollment) =>
                                    course.certificate_status ===
                                    'issued'
                                ).length > 3 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    +
                                    {learner.courses.filter(
                                      (course: CourseEnrollment) =>
                                        course.certificate_status ===
                                        'issued'
                                    ).length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  }

                  {/* Pagination Controls */}
                  {filteredLearners.length > 0 && (
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
                </div>
              )}
            </LoadingCard>
          </CardContent>
        </Card>

        {/* Learner Detail Side Curtain */}
        {selectedLearner && (
          <LearnerDetailSideCurtain
            learner={selectedLearner}
            isOpen={isSideCurtainOpen}
            onClose={closeSideCurtain}
            isAdmin={true}
          />
        )}

        {/* Edit Learner Modal */}
        <EditLearnerModal
          learner={editingLearner}
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSuccess={refreshLearners}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Learner</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{' '}
                <span className="font-semibold">
                  {deletingLearner?.learner_info.name}
                </span>
                ? This action cannot be undone and will permanently remove
                the learner and all associated course enrollments.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={closeDeleteModal}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteLearner}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Learner'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
