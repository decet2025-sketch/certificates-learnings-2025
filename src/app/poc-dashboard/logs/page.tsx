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
  Search,
  X,
  Award,
  UserPlus,
  Building2,
  Edit,
  BookOpen,
  Upload,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { sopApi } from '@/lib/api/sop-api';
import { ActivityLog } from '@/types/api';
import { LoadingCard } from '@/components/ui/loading-spinner';
import { handleApiErrorWithToast } from '@/lib/error-toast-handler';

export default function PocLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivityType, setSelectedActivityType] =
    useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, selectedActivityType, selectedStatus]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await sopApi.listActivityLogs(
        itemsPerPage,
        offset
      );

      setLogs(response.logs);
      setTotalLogs(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      handleApiErrorWithToast(error, 'Failed to load activity logs');
      // Set empty state to prevent UI breaking
      setLogs([]);
      setTotalLogs(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter logs (client-side filtering for search only, as API handles other filters)
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActivityType =
      selectedActivityType === 'all' ||
      log.activity_type
        .toLowerCase()
        .includes(selectedActivityType.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' ||
      log.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesActivityType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(totalLogs / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const getActivityIcon = (activityType: string) => {
    switch (activityType.toLowerCase()) {
      case 'completion checked':
      case 'completion_checked':
        return <Award className="h-4 w-4 text-green-600" />;
      case 'learner enrolled':
      case 'learner_enrolled':
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'organization added':
      case 'organization_added':
        return <Building2 className="h-4 w-4 text-purple-600" />;
      case 'organization updated':
      case 'organization_updated':
        return <Edit className="h-4 w-4 text-orange-600" />;
      case 'organization deleted':
      case 'organization_deleted':
        return <Building2 className="h-4 w-4 text-red-600" />;
      case 'course created':
      case 'course_created':
        return <BookOpen className="h-4 w-4 text-indigo-600" />;
      case 'bulk upload':
      case 'bulk_upload':
        return <Upload className="h-4 w-4 text-cyan-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityTypeColor = (activityType: string) => {
    switch (activityType.toLowerCase()) {
      case 'completion checked':
      case 'completion_checked':
        return 'bg-green-100 text-green-800';
      case 'learner enrolled':
      case 'learner_enrolled':
        return 'bg-blue-100 text-blue-800';
      case 'organization added':
      case 'organization_added':
        return 'bg-purple-100 text-purple-800';
      case 'organization updated':
      case 'organization_updated':
        return 'bg-orange-100 text-orange-800';
      case 'organization deleted':
      case 'organization_deleted':
        return 'bg-red-100 text-red-800';
      case 'course created':
      case 'course_created':
        return 'bg-indigo-100 text-indigo-800';
      case 'bulk upload':
      case 'bulk_upload':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    return status.toLowerCase() === 'success' ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusColor = (status: string) => {
    return status.toLowerCase() === 'success'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedActivityType('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedActivityType !== 'all' ||
    selectedStatus !== 'all';

  const exportLogs = () => {
    // In real implementation, this would generate and download a CSV file
    console.log('Exporting logs to CSV...');
    const csvContent = [
      [
        'Timestamp',
        'Activity Type',
        'Actor',
        'Target',
        'Details',
        'Status',
      ],
      ...filteredLogs.map((log) => [
        formatTimestamp(log.timestamp),
        log.activity_type.replace('_', ' '),
        log.actor,
        log.target,
        log.details,
        log.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Activity Logs
        </h1>
        <p className="text-muted-foreground">
          Track enrollments and certificate generation for your
          organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                Recent activity for your organization
              </CardDescription>
            </div>

          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={selectedActivityType}
              onValueChange={setSelectedActivityType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="completion checked">
                  Completion Checked
                </SelectItem>
                <SelectItem value="learner enrolled">
                  Learner Enrolled
                </SelectItem>
                <SelectItem value="organization added">
                  Organization Added
                </SelectItem>
                <SelectItem value="organization updated">
                  Organization Updated
                </SelectItem>
                <SelectItem value="organization deleted">
                  Organization Deleted
                </SelectItem>
                <SelectItem value="course created">
                  Course Created
                </SelectItem>
                <SelectItem value="bulk upload">
                  Bulk Upload
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}

          {/* Table */}
          <LoadingCard
            isLoading={isLoading}
            text="Loading activity logs..."
          >
            {!isLoading && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Activity Type</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-gray-500"
                      >
                        No activity logs found for selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id} className="h-20">
                        <TableCell className="py-6">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <Badge
                            className={getActivityTypeColor(
                              log.activity_type
                            )}
                          >
                            {getActivityIcon(log.activity_type)}
                            <span className="ml-1 capitalize">
                              {log.activity_type.replace('_', ' ')}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6">
                          <span className="text-sm font-medium">
                            {log.actor}
                          </span>
                        </TableCell>
                        <TableCell className="py-6">
                          <span className="text-sm">
                            {log.target}
                          </span>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="text-sm max-w-md">
                            {log.details}
                            {log.error_message && (
                              <div className="text-xs text-red-600 mt-2 font-mono">
                                Error: {log.error_message}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-6">
                          <Badge
                            className={getStatusColor(log.status)}
                          >
                            {getStatusIcon(log.status)}
                            <span className="ml-1 capitalize">
                              {log.status}
                            </span>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </LoadingCard>

          {/* Pagination - Always show like learners page */}
          {filteredLogs.length > 0 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{' '}
                {Math.min(startIndex + itemsPerPage, totalLogs)} of{' '}
                {totalLogs} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from(
                    {
                      length: Math.min(
                        5,
                        Math.ceil(totalLogs / itemsPerPage)
                      ),
                    },
                    (_, i) => {
                      const page = i + 1;
                      const isCurrentPage = page === currentPage;
                      return (
                        <Button
                          key={page}
                          variant={
                            isCurrentPage ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => setCurrentPage(page)}
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
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, totalPages)
                    )
                  }
                  disabled={currentPage >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
