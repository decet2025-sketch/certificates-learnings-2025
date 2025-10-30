'use client';

import { useState, useEffect } from 'react';
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
  Filter,
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
import { api } from '@/lib/api';
import { ActivityLog, ActivityLogListResponse } from '@/types/api';
import { LoadingCard } from '@/components/ui/loading-spinner';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedActivityType, setSelectedActivityType] =
    useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrganization, setSelectedOrganization] =
    useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [
    currentPage,
    selectedActivityType,
    selectedStatus,
    selectedOrganization,
  ]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const organizationWebsite =
        selectedOrganization === 'all'
          ? undefined
          : selectedOrganization;

      const response = await api.admin.listActivityLogs(
        itemsPerPage,
        offset,
        selectedActivityType === 'all'
          ? undefined
          : selectedActivityType,
        selectedStatus === 'all' ? undefined : selectedStatus,
        organizationWebsite
      );

      setLogs(response.logs);
      setTotalLogs(response.total);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // No client-side filtering needed since search is removed
  const filteredLogs = logs;

  // Pagination
  const totalPages = Math.ceil(totalLogs / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const getActivityIcon = (activityType: string) => {
    switch (activityType.toLowerCase()) {
      case 'certificate generated':
      case 'certificate_generated':
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
      case 'certificate generated':
      case 'certificate_generated':
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
    setSelectedActivityType('all');
    setSelectedStatus('all');
    setSelectedOrganization('all');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedActivityType !== 'all' ||
    selectedStatus !== 'all' ||
    selectedOrganization !== 'all';

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
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Activity Logs
          </h1>
          <p className="text-muted-foreground">
            Complete audit trail of platform activities
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>System Activity Logs</CardTitle>
                <CardDescription>
                  Comprehensive audit trail of all platform activities
                </CardDescription>
              </div>

            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={selectedActivityType}
                onValueChange={setSelectedActivityType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Activity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="Certificate Generated">
                    Certificate Generated
                  </SelectItem>
                  <SelectItem value="Learner Enrolled">
                    Learner Enrolled
                  </SelectItem>
                  <SelectItem value="Organization Added">
                    Organization Added
                  </SelectItem>
                  <SelectItem value="Organization Updated">
                    Organization Updated
                  </SelectItem>
                  <SelectItem value="Course Created">
                    Course Created
                  </SelectItem>
                  <SelectItem value="Bulk Upload">
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
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedOrganization}
                onValueChange={setSelectedOrganization}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Organizations
                  </SelectItem>
                  <SelectItem value="example.com">
                    Example Corporation
                  </SelectItem>
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
    </DashboardLayout>
  );
}
