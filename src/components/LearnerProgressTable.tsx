'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  MoreHorizontal,
  Eye,
  Download,
  Edit,
  Trash2,
  Users,
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Building2,
  Calendar,
} from 'lucide-react';
import { CertificatePreviewModal } from '@/components/CertificatePreviewModal';

interface LearnerProgress {
  id: string;
  name: string;
  email: string;
  organization: string;
  course: string;
  enrollmentDate: string;
  completionStatus: 'completed' | 'in-progress' | 'not-started';
  certificateStatus: 'issued' | 'pending' | 'not-eligible';
  progress: number;
  certificateId?: string;
  completionDate?: string;
}

// Mock data for demonstration
const MOCK_LEARNER_PROGRESS: LearnerProgress[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    organization: 'Acme Corp',
    course: 'Advanced React Development',
    enrollmentDate: '2024-01-15',
    completionStatus: 'completed',
    certificateStatus: 'issued',
    progress: 100,
    certificateId: 'CERT-2024-001',
    completionDate: '2024-02-20',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@techcorp.com',
    organization: 'TechCorp Inc',
    course: 'JavaScript Fundamentals',
    enrollmentDate: '2024-01-20',
    completionStatus: 'in-progress',
    certificateStatus: 'pending',
    progress: 65,
    certificateId: 'CERT-2024-002',
    completionDate: '2024-02-18',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@startup.io',
    organization: 'StartupCo',
    course: 'Python for Data Science',
    enrollmentDate: '2024-01-25',
    completionStatus: 'not-started',
    certificateStatus: 'not-eligible',
    progress: 0,
    certificateId: undefined,
    completionDate: undefined,
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@enterprise.com',
    organization: 'Enterprise Solutions',
    course: 'Advanced React Development',
    enrollmentDate: '2024-02-01',
    completionStatus: 'completed',
    certificateStatus: 'issued',
    progress: 100,
    certificateId: 'CERT-2024-003',
    completionDate: '2024-02-15',
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david.brown@techcorp.com',
    organization: 'TechCorp Inc',
    course: 'Node.js Backend Development',
    enrollmentDate: '2024-02-05',
    completionStatus: 'in-progress',
    certificateStatus: 'pending',
    progress: 45,
    certificateId: 'CERT-2024-004',
    completionDate: '2024-02-18',
  },
];

interface LearnerProgressTableProps {
  className?: string;
}

export function LearnerProgressTable({
  className,
}: LearnerProgressTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedLearner, setSelectedLearner] =
    useState<LearnerProgress | null>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] =
    useState(false);

  const filteredLearners = useMemo(() => {
    return MOCK_LEARNER_PROGRESS.filter((learner) => {
      // Search filter
      const matchesSearch =
        learner.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        learner.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        learner.organization
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        learner.course
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [searchTerm]);

  const paginatedLearners = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLearners.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredLearners, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(
    filteredLearners.length / itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      case 'not-started':
        return 'text-gray-600 bg-gray-50';
      case 'issued':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'not-eligible':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'not-started':
        return 'Not Started';
      case 'issued':
        return 'Issued';
      case 'pending':
        return 'Pending';
      case 'not-eligible':
        return 'Not Eligible';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'in-progress':
        return <Clock className="h-3 w-3" />;
      case 'not-started':
        return <AlertCircle className="h-3 w-3" />;
      case 'issued':
        return <Award className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'not-eligible':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const hasActiveFilters = searchTerm;

  const handleView = (learner: LearnerProgress) => {
    console.log('View learner:', learner);
    // TODO: Implement view functionality
  };

  const handleDownload = (learner: LearnerProgress) => {
    console.log('Download certificate for:', learner);
    // TODO: Implement download functionality
  };

  const handleEdit = (learner: LearnerProgress) => {
    console.log('Edit learner:', learner);
    // TODO: Implement edit functionality
  };

  const handleDelete = (learner: LearnerProgress) => {
    console.log('Delete learner:', learner);
    // TODO: Implement delete functionality
  };

  const handleCertificatePreview = (learner: LearnerProgress) => {
    setSelectedLearner(learner);
    setIsCertificateModalOpen(true);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4 lg:pb-6">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl lg:text-2xl">
          <Users className="h-5 w-5 sm:h-6 sm:w-6" />
          <span>Learner Progress</span>
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Track learner progress and certificate status across all
          courses
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {/* Search Controls */}
        <div className="mb-4 sm:mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search learners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm sm:text-base h-10 sm:h-11"
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4">
          <div className="text-xs sm:text-sm text-muted-foreground">
            {filteredLearners.length} learner
            {filteredLearners.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Table */}
        {filteredLearners.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Users className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm sm:text-base">
              No learners found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
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
                        Course
                      </TableHead>
                      <TableHead className="w-[120px]">
                        Enrollment Date
                      </TableHead>
                      <TableHead className="w-[100px]">
                        Progress
                      </TableHead>
                      <TableHead className="w-[120px]">
                        Completion Status
                      </TableHead>
                      <TableHead className="w-[120px]">
                        Certificate Status
                      </TableHead>
                      <TableHead className="w-[100px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLearners.map((learner) => (
                      <TableRow key={learner.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">
                              {learner.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {learner.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{learner.organization}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {learner.course}
                        </TableCell>
                        <TableCell>
                          {new Date(
                            learner.enrollmentDate
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${learner.progress}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {learner.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(learner.completionStatus)}`}
                          >
                            {getStatusIcon(learner.completionStatus)}
                            <span>
                              {getStatusText(
                                learner.completionStatus
                              )}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(learner.certificateStatus)}`}
                          >
                            {getStatusIcon(learner.certificateStatus)}
                            <span>
                              {getStatusText(
                                learner.certificateStatus
                              )}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleView(learner)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleCertificatePreview(learner)
                                }
                              >
                                <Award className="mr-2 h-4 w-4" />
                                View Certificate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDownload(learner)
                                }
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download Certificate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleEdit(learner)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(learner)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile/Tablet Cards */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
              {paginatedLearners.map((learner) => (
                <Card key={learner.id} className="p-3 sm:p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">
                          {learner.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {learner.email}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            Actions
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleView(learner)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleCertificatePreview(learner)
                            }
                          >
                            <Award className="mr-2 h-4 w-4" />
                            View Certificate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownload(learner)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Certificate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleEdit(learner)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(learner)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Course and Organization */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">
                          {learner.course}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">
                          {learner.organization}
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">
                          Progress
                        </span>
                        <span className="font-medium">
                          {learner.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${learner.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(learner.completionStatus)}`}
                      >
                        {getStatusIcon(learner.completionStatus)}
                        <span>
                          {getStatusText(learner.completionStatus)}
                        </span>
                      </span>
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(learner.certificateStatus)}`}
                      >
                        {getStatusIcon(learner.certificateStatus)}
                        <span>
                          {getStatusText(learner.certificateStatus)}
                        </span>
                      </span>
                    </div>

                    {/* Enrollment Date */}
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>
                        Enrolled:{' '}
                        {new Date(
                          learner.enrollmentDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Certificate Preview Modal */}
      {selectedLearner && (
        <CertificatePreviewModal
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          learner={selectedLearner}
        />
      )}
    </Card>
  );
}
