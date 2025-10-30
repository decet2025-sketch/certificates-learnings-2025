'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  X,
  User,
  Mail,
  Building2,
  BookOpen,
  CheckCircle,
  Clock,
  MinusCircle,
  XCircle,
  Download,
  Award,
  Calendar,
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin-api';
import { sopApi } from '@/lib/api/sop-api';
import { handleApiErrorWithToast } from '@/lib/error-toast-handler';
import { useResendManager } from '@/hooks/useResendManager';

interface CourseEnrollment {
  id: string;
  name: string;
  status:
    | 'Completed'
    | 'In Progress'
    | 'Not Started'
    | 'Blocked'
    | 'completed'
    | 'in-progress'
    | 'not-started';
  progress: number;
  certificateStatus?: 'Issued' | 'Pending' | 'Not Applicable';
  certificateGenerated?: boolean;
  certificateUrl?: string;
  completionDate?: string;
}

interface BaseLearner {
  id: string;
  name: string;
  email: string;
  courses: CourseEnrollment[];
}

interface AdminLearner extends BaseLearner {
  organization: string;
  enrollmentDate: string;
}

interface SopLearner extends BaseLearner {
  totalCourses: number;
  completedCourses: number;
  activeEnrollments: number;
  certificatesGenerated: number;
}

type Learner = AdminLearner | SopLearner;

interface LearnerDetailSideCurtainProps {
  learner: Learner;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean; // Add prop to determine if this is admin context
}

export default function LearnerDetailSideCurtain({
  learner,
  isOpen,
  onClose,
  isAdmin = false,
}: LearnerDetailSideCurtainProps) {
  const [selectedCourse, setSelectedCourse] =
    useState<CourseEnrollment | null>(learner.courses[0] || null);
  const [mounted, setMounted] = useState(false);
  const { resendCertificate, isResending } = useResendManager();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in progress':
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'not started':
      case 'not-started':
        return <MinusCircle className="h-4 w-4 text-gray-500" />;
      case 'blocked':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case 'in progress':
      case 'in-progress':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            In Progress
          </Badge>
        );
      case 'not started':
      case 'not-started':
        return (
          <Badge className="bg-gray-100 text-gray-800">
            Not Started
          </Badge>
        );
      case 'blocked':
        return (
          <Badge className="bg-red-100 text-red-800">Blocked</Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        );
    }
  };

  const getCertificateStatusBadge = (course: CourseEnrollment) => {
    // Handle both certificateStatus (string) and certificateGenerated (boolean)
    if (course.certificateStatus) {
      switch (course.certificateStatus) {
        case 'Issued':
          return (
            <Badge className="bg-green-100 text-green-800">
              Issued
            </Badge>
          );
        case 'Pending':
          return (
            <Badge className="bg-yellow-100 text-yellow-800">
              Pending
            </Badge>
          );
        case 'Not Applicable':
          return (
            <Badge className="bg-gray-100 text-gray-800">N/A</Badge>
          );
        default:
          return (
            <Badge className="bg-gray-100 text-gray-800">
              {course.certificateStatus}
            </Badge>
          );
      }
    } else if (typeof course.certificateGenerated === 'boolean') {
      return course.certificateGenerated ? (
        <Badge className="bg-green-100 text-green-800">Issued</Badge>
      ) : (
        <Badge className="bg-yellow-100 text-yellow-800">
          Pending
        </Badge>
      );
    }

    return <Badge className="bg-gray-100 text-gray-800">N/A</Badge>;
  };

  const handleDownloadCertificate = async (
    course: CourseEnrollment
  ) => {
    try {
      // Call the appropriate API based on context
      const downloadData = isAdmin
        ? await adminApi.downloadCertificate(learner.email, course.id)
        : await sopApi.downloadCertificate(learner.email, course.id);

      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = downloadData.download_url;
      link.download = downloadData.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download certificate:', error);
      handleApiErrorWithToast(
        error,
        'Failed to download certificate'
      );
    }
  };

  const handleResendCertificate = async (
    course: CourseEnrollment
  ) => {
    await resendCertificate(learner.email, course.id, isAdmin);
  };

  if (!isOpen || !mounted) return null;

  const sideSheetContent = (
    <div
      className="fixed inset-0 z-50"
      style={{
        height: '100vh',
        width: '100vw',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        style={{
          height: '100vh',
          width: '100vw',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        onClick={onClose}
      />

      {/* Side Curtain */}
      <div
        className="fixed right-0 top-0 w-full max-w-md bg-white shadow-xl border-l z-10"
        style={{
          height: '100vh',
          top: 0,
        }}
      >
        <div className="flex h-full flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4 bg-white">
            <h2 className="text-lg font-semibold">Learner Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Learner Info */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {learner.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {learner.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {'organization' in learner && (
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {learner.organization}
                    </span>
                  </div>
                )}
                {'enrollmentDate' in learner && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Enrolled:{' '}
                      {new Date(
                        learner.enrollmentDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Course Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3">
                Select Course
              </h4>
              <Select
                value={selectedCourse?.id || ''}
                onValueChange={(courseId) => {
                  const course = learner.courses.find(
                    (c) => c.id === courseId
                  );
                  if (course) setSelectedCourse(course);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a course to view details">
                    {selectedCourse && (
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {selectedCourse.name}
                        </span>
                        <div className="flex items-center space-x-1 ml-auto">
                          {getStatusIcon(selectedCourse.status)}
                          {getStatusBadge(selectedCourse.status)}
                        </div>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {learner.courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {course.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {getStatusIcon(course.status)}
                          {getStatusBadge(course.status)}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Course Details */}
            {selectedCourse && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Course Progress
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{selectedCourse.progress}%</span>
                    </div>
                    <Progress
                      value={selectedCourse.progress}
                      className="h-2"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Certificate Status
                  </h4>
                  <div className="flex items-center justify-between">
                    {getCertificateStatusBadge(selectedCourse)}
                    {(selectedCourse.certificateStatus === 'Issued' ||
                      selectedCourse.certificateGenerated ===
                        true) && (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleResendCertificate(selectedCourse)
                          }
                          disabled={isResending(
                            learner.email,
                            selectedCourse.id
                          )}
                          className="flex items-center space-x-1"
                        >
                          <Mail className="h-4 w-4" />
                          <span>Resend</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleDownloadCertificate(selectedCourse)
                          }
                          className="flex items-center space-x-1"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {(selectedCourse.certificateStatus === 'Issued' ||
                  selectedCourse.certificateGenerated === true) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        Certificate is ready for download
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-3">Summary</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {learner.courses.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Courses
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      learner.courses.filter(
                        (c) => c.status === 'Completed'
                      ).length
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Completed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {
                      learner.courses.filter(
                        (c) =>
                          c.certificateStatus === 'Issued' ||
                          c.certificateGenerated === true
                      ).length
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Certificates
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {Math.round(
                      learner.courses.reduce(
                        (sum, c) => sum + c.progress,
                        0
                      ) / learner.courses.length
                    )}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg Progress
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(sideSheetContent, document.body);
}
