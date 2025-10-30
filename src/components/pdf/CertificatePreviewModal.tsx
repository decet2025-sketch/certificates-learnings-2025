'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SimplePdfViewer } from './SimplePdfViewer';
import {
  Download,
  RefreshCw,
  Eye,
  Calendar,
  BookOpen,
  Building2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDownloadManager } from '@/hooks/useDownloadManager';
import { useResendManager } from '@/hooks/useResendManager';

interface Certificate {
  id: string;
  name: string;
  course: string;
  learnerName: string;
  learnerEmail: string;
  organization?: string;
  status: string;
  issueDate: string;
  expiryDate: string;
  downloads: number;
  lastDownloaded?: string;
  resends: number;
  lastResent?: string;
  pdfUrl?: string;
}

interface CertificatePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate: Certificate | null;
  onDownload?: (certificateId: string) => void;
  onResend?: (certificateId: string) => void;
  isAdmin?: boolean;
}

export const CertificatePreviewModal: React.FC<
  CertificatePreviewModalProps
> = ({
  open,
  onOpenChange,
  certificate,
  onDownload,
  onResend,
  isAdmin = false,
}) => {
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Use the new hooks
  const { downloadState, downloadFile, resetDownload } =
    useDownloadManager();
  const { resendCertificate, isResending, isAnyResending } =
    useResendManager();

  if (!certificate) return null;

  const handleDownload = async () => {
    if (onDownload) {
      await onDownload(certificate.id);
    } else {
      try {
        await downloadFile(
          certificate.learnerEmail,
          certificate.course,
          certificate.name
        );
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  const handleResend = async () => {
    if (onResend) {
      await onResend(certificate.id);
    } else {
      try {
        await resendCertificate(
          certificate.learnerEmail,
          certificate.course
        );
        console.log('Certificate resent successfully');
      } catch (error) {
        console.error('Resend failed:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Active: {
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800',
      },
      Expired: {
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800',
      },
      Revoked: {
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800',
      },
      Pending: {
        variant: 'secondary' as const,
        className: 'bg-yellow-100 text-yellow-800',
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig['Pending'];

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const pdfUrl =
    certificate.pdfUrl ||
    `https://example.com/certificates/${certificate.id}.pdf`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Certificate Preview</span>
          </DialogTitle>
          <DialogDescription>
            Preview and manage certificate: {certificate.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Certificate Information */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">
                    Name:
                  </span>
                  <p>{certificate.name}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Course:
                  </span>
                  <p>{certificate.course}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Learner:
                  </span>
                  <p>{certificate.learnerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {certificate.learnerEmail}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">
                    Status:
                  </span>
                  <div className="mt-1">
                    {getStatusBadge(certificate.status)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={handleDownload}
              disabled={downloadState.isDownloading}
              className="flex-1"
            >
              {downloadState.isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleResend}
              disabled={isResending(
                certificate.learnerEmail,
                certificate.course
              )}
              className="flex-1"
            >
              {isResending(
                certificate.learnerEmail,
                certificate.course
              ) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Certificate
                </>
              )}
            </Button>
          </div>

          {/* Error Messages */}
          {downloadState.status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Download failed: {downloadState.errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* PDF Viewer */}
          <div className="h-96">
            <SimplePdfViewer pdfUrl={pdfUrl} className="h-full" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CertificatePreviewModal;
