'use client';

import { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  MinusCircle,
  XCircle,
  Download,
  Eye,
  Building2,
  RefreshCw,
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  // CheckCircle, // Commented out - statistics functionality disabled
  // Award, // Commented out - statistics functionality disabled
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import LearnerDetailSideCurtain from '@/components/LearnerDetailSideCurtain';
import { useSopLearnersStore } from '@/stores/sopLearnersStore';
import { SopLearner, SopCourseInfo } from '@/types/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function SopLearnersPage() {
  const { user } = useAuthStore();
  const {
    learners,
    isLoading,
    // isStatisticsLoading, // Commented out - statistics functionality disabled
    pagination,
    searchTerm,
    // summary, // Commented out - statistics functionality disabled
    setSearchTerm,
    setPagination,
    fetchSopLearners,
    // fetchStatistics, // Commented out - statistics functionality disabled
    refreshLearners,
  } = useSopLearnersStore();

  const [selectedLearner, setSelectedLearner] = useState<any>(null);
  const [isSideCurtainOpen, setIsSideCurtainOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    if (user?.organizationWebsite) {
      // Fetch statistics and learners data separately
      // fetchStatistics(user.organizationWebsite); // Commented out - statistics functionality disabled
      fetchSopLearners(user.organizationWebsite, 1, searchTerm, 10);
    }
  }, [user?.organizationWebsite]);

  // Handle search with debouncing - always reset to page 1
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        if (user?.organizationWebsite) {
          setPagination({ currentPage: 1 });
          fetchSopLearners(
            user.organizationWebsite,
            1,
            searchTerm,
            pagination.itemsPerPage
          );
        }
      },
      searchTerm ? 500 : 0
    );

    return () => clearTimeout(timeoutId);
  }, [searchTerm, user?.organizationWebsite]);

  // Handle pagination changes
  useEffect(() => {
    if (user?.organizationWebsite) {
      fetchSopLearners(
        user.organizationWebsite,
        pagination.currentPage,
        searchTerm,
        pagination.itemsPerPage
      );
    }
  }, [
    pagination.currentPage,
    pagination.itemsPerPage,
    user?.organizationWebsite,
  ]);

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
      case 'n/a':
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
    setPagination({ currentPage: page });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleLearnerClick = (learner: SopLearner) => {
    // Transform SopLearner to the format expected by LearnerDetailSideCurtain
    const transformedLearner = {
      id: learner.learner_info.email,
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
    setSelectedLearner(transformedLearner);
    setIsSideCurtainOpen(true);
  };

  const closeSideCurtain = () => {
    setIsSideCurtainOpen(false);
    setSelectedLearner(null);
  };

  const handleRefresh = async () => {
    if (user?.organizationWebsite) {
      // Refresh both statistics and learners data
      // await fetchStatistics(user.organizationWebsite); // Commented out - statistics functionality disabled
      await refreshLearners(user.organizationWebsite);
    }
  };

  // Use summary data from API
  // const totalLearners = summary?.total_learners || 0;
  // const activeLearners = summary?.active_learners || 0;
  // const totalEnrollments = summary?.total_enrollments || 0;
  // const averageCompletion = summary?.completion_rate || 0;

  // Hard-coded values to prevent UI breaking - commented out since UI is disabled
  // const totalLearners = 0;
  // const activeLearners = 0;
  // const totalEnrollments = 0;
  // const averageCompletion = 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Learners
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage learners for your organization
          </p>
        </div>
      </div>

      {/* Search Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search learners..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="flex items-center space-x-2"
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards - Commented out - statistics functionality disabled */}
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
              {isStatisticsLoading ? '...' : totalLearners}
            </div>
            <p className="text-xs text-muted-foreground">
              In your organization
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
              {isStatisticsLoading ? '...' : activeLearners}
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
              {isStatisticsLoading ? '...' : totalEnrollments}
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
              {isStatisticsLoading ? '...' : `${averageCompletion}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              Average completion percentage
            </p>
          </CardContent>
        </Card>
      </div> */}

      {/* Results Summary */}
      {/* <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {learners.length} learner
          {learners.length !== 1 ? 's' : ''} found
        </div>
      </div> */}

      {/* Learners Content */}
      <Card>
        <CardHeader>
          <CardTitle>Learner Management</CardTitle>
          <CardDescription>
            View and manage learners in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size="md" text="Loading learners..." />
            </div>
          ) : learners.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Users className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                No learners found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">
                          Learner
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
                      {learners.map((learner, index) => (
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
                            <div className="space-y-1">
                              {learner.courses
                                .slice(0, 5)
                                .map((course: SopCourseInfo) => (
                                  <div
                                    key={course.course_id}
                                    className="flex items-center space-x-2"
                                  >
                                    <BookOpen className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {course.course_name}
                                    </span>
                                  </div>
                                ))}
                              {learner.courses.length > 5 && (
                                <div className="text-xs text-muted-foreground">
                                  +{learner.courses.length - 5} more
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              {learner.courses
                                .slice(0, 5)
                                .map((course: SopCourseInfo) => (
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
                              {learner.courses.length > 5 && (
                                <div className="text-xs text-muted-foreground">
                                  +{learner.courses.length - 5} more
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {learner.courses
                                .slice(0, 5)
                                .map((course: SopCourseInfo) => (
                                  <div
                                    key={course.course_id}
                                    className="flex items-center space-x-1"
                                  >
                                    {getCertificateStatusBadge(
                                      course.certificate_status
                                    )}
                                  </div>
                                ))}
                              {learner.courses.length > 5 && (
                                <div className="text-xs text-muted-foreground">
                                  +{learner.courses.length - 5} more
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
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile Table View */}
              <div className="lg:hidden space-y-4">
                {learners.map((learner, index) => (
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
                        </div>
                      </div>

                      {/* Courses */}
                      <div className="space-y-2">
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
                        <div className="space-y-1">
                          {learner.courses
                            .slice(0, 3)
                            .map((course: SopCourseInfo) => (
                              <div
                                key={course.course_id}
                                className="flex items-center justify-between text-xs"
                              >
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
                              (course: SopCourseInfo) =>
                                course.certificate_status === 'issued'
                            )
                            .slice(0, 3)
                            .map((course: SopCourseInfo) => (
                              <Badge
                                key={course.course_id}
                                className="bg-green-100 text-green-800 text-xs"
                              >
                                {course.course_name}
                              </Badge>
                            ))}
                          {learner.courses.filter(
                            (course: SopCourseInfo) =>
                              course.certificate_status === 'issued'
                          ).length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                            >
                              +
                              {learner.courses.filter(
                                (course: SopCourseInfo) =>
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

              {/* Pagination Controls */}
              {learners.length > 0 && (
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learner Detail Side Curtain */}
      {selectedLearner && (
        <LearnerDetailSideCurtain
          learner={selectedLearner}
          isOpen={isSideCurtainOpen}
          onClose={closeSideCurtain}
          isAdmin={false}
        />
      )}
    </div>
  );
}
