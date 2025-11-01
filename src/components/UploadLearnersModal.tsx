'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingButton } from '@/components/ui/loading';
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useDropzone, FileRejection } from 'react-dropzone';
import {
  uploadLearnersSchema,
  UploadLearnersInput,
} from '@/lib/validations';
import { useLearnersStore } from '@/stores/learnersStore';
import { useUIStore } from '@/stores/uiStore';
import { adminApi } from '@/lib/api/admin-api';
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface UploadLearnersModalProps {
  children?: React.ReactNode;
  courseId?: string;
}

export function UploadLearnersModal({
  children,
  courseId,
}: UploadLearnersModalProps) {
  const [open, setOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    conflicts: Array<{
      email: string;
      csv_organization_website: string;
      existing_organization_website: string;
      row_number: number;
      name: string;
    }>;
    conflict_count: number;
    conflict_emails: string[];
    has_conflicts: boolean;
  } | null>(null);

  const { uploadLearners, isLoading } = useLearnersStore();
  const { setModalOpen } = useUIStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<UploadLearnersInput>({
    resolver: zodResolver(uploadLearnersSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const file = watch('file');

  const validateCsvFile = async (file: File) => {
    if (!courseId) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const csvData = await file.text();
      const validation = await adminApi.validateCsvOrganizationConflicts(courseId, csvData);
      setValidationResult(validation);

      if (validation.has_conflicts) {
        showErrorToast(
          'Validation Failed',
          `Found ${validation.conflict_count} organization conflict(s). Please review the file.`
        );
      } else {
        showSuccessToast(
          'Validation Successful',
          'CSV file has no organization conflicts.'
        );
      }
    } catch (error) {
      showErrorToast(
        'Validation Error',
        'Failed to validate CSV file. Please try again.'
      );
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setValue('file', acceptedFiles[0]);
        setUploadStatus('idle');
        setErrorMessage('');
        setValidationResult(null);

        // Validate the CSV file
        await validateCsvFile(acceptedFiles[0]);
      }
    },
    [setValue, courseId]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const onSubmit = async (data: UploadLearnersInput) => {
    if (!data.file) return;

    if (!courseId) {
      showErrorToast(
        'Missing Information',
        'Course ID is required for uploading learners.'
      );
      return;
    }

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      setUploadProgress(0);
      setUploadStatus('idle');
      setErrorMessage('');

      // Simulate upload progress
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await uploadLearners(data.file, courseId);

      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');

      showSuccessToast(
        'Learners Uploaded',
        'The learners have been successfully uploaded to the system.'
      );

      setTimeout(() => {
        reset();
        setOpen(false);
        setModalOpen('uploadLearners', false);
        setUploadProgress(0);
        setUploadStatus('idle');
      }, 2000);
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval);
      setUploadStatus('error');
      setErrorMessage(
        'Failed to upload learners. Please check your file format and try again.'
      );

      showErrorToast(
        'Upload Failed',
        'Failed to upload learners. Please check your file format and try again.'
      );
    }
  };

  const handleClose = () => {
    reset();
    setOpen(false);
    setModalOpen('uploadLearners', false);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
    setValidationResult(null);
    setIsValidating(false);
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <FileText className="h-8 w-8 text-blue-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'success':
        return 'Upload completed successfully!';
      case 'error':
        return errorMessage;
      default:
        return 'Upload your CSV file to add learners to the system';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Learners</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Upload Learners (CSV)
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file containing learner data. Please ensure
            the file follows the specified format.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* CSV Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              CSV File Requirements:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• File must be in CSV format (.csv)</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Required columns: name, email, organization</li>
              <li>• First row should contain column headers</li>
              <li>• Use commas to separate values</li>
            </ul>
          </div>

          {/* File Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400',
              file && 'border-green-400 bg-green-50',
              errors.file && 'border-red-400 bg-red-50'
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              {getStatusIcon()}
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {file ? file.name : 'Drop your CSV file here'}
                </p>
                <p className="text-sm text-gray-500">
                  {getStatusMessage()}
                </p>
              </div>
              {!file && (
                <Button type="button" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              )}
            </div>
          </div>

          {/* File Rejection Errors */}
          {fileRejections.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h4 className="font-medium text-red-900">
                  File Rejected
                </h4>
              </div>
              <ul className="mt-2 text-sm text-red-800 space-y-1">
                {fileRejections.map(
                  ({ file, errors }: FileRejection) => (
                    <li key={file.name}>
                      {file.name}:{' '}
                      {errors.map((e: any) => e.message).join(', ')}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {/* Form Validation Errors */}
          {errors.file && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <h4 className="font-medium text-red-900">
                  Validation Error
                </h4>
              </div>
              <p className="mt-2 text-sm text-red-800">
                {errors.file.message}
              </p>
            </div>
          )}

          {/* CSV Validation Conflicts */}
          {validationResult && validationResult.has_conflicts && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h4 className="font-medium text-red-900">
                  Organization Conflicts Found ({validationResult.conflict_count})
                </h4>
              </div>
              <p className="text-sm text-red-800 mb-3">
                The following learners have organization conflicts. They cannot be uploaded until these conflicts are resolved:
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {validationResult.conflicts.map((conflict, index) => (
                  <div key={index} className="bg-white border border-red-200 rounded p-2 text-xs">
                    <div className="font-medium text-red-900">
                      Row {conflict.row_number}: {conflict.name} ({conflict.email})
                    </div>
                    <div className="text-red-700 mt-1">
                      CSV Organization: {conflict.csv_organization_website}
                    </div>
                    <div className="text-red-700">
                      Existing Organization: {conflict.existing_organization_website}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Success Message */}
          {validationResult && !validationResult.has_conflicts && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h4 className="font-medium text-green-900">
                  Validation Successful
                </h4>
              </div>
              <p className="mt-2 text-sm text-green-800">
                The CSV file has no organization conflicts and is ready for upload.
              </p>
            </div>
          )}

          {/* Validation Progress */}
          {isValidating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Validating CSV...</span>
              </div>
              <div className="animate-pulse bg-blue-100 h-2 rounded-full"></div>
            </div>
          )}

          {/* Upload Progress */}
          {(isSubmitting || isLoading) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Success Message */}
          {uploadStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h4 className="font-medium text-green-900">
                  Upload Successful
                </h4>
              </div>
              <p className="mt-2 text-sm text-green-800">
                Your learners have been successfully uploaded to the
                system.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || isLoading || isValidating}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            isLoading={isSubmitting || isLoading || isValidating}
            loadingText={isValidating ? "Validating..." : "Uploading..."}
            onClick={handleSubmit(onSubmit)}
            disabled={
              !file ||
              uploadStatus === 'success' ||
              isValidating ||
              (validationResult?.has_conflicts)
            }
            className="flex items-center space-x-2"
          >
            <span>Upload CSV</span>
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
