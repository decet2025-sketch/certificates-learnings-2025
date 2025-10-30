'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, CheckCircle, AlertCircle, X, Loader2, FileText } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DownloadProgressProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  progress: number
  fileName: string
  status: 'idle' | 'downloading' | 'completed' | 'error'
  errorMessage?: string | null
  className?: string
}

export const DownloadProgress: React.FC<DownloadProgressProps> = ({
  open,
  onOpenChange,
  progress,
  fileName,
  status,
  errorMessage,
  className = ''
}) => {
  if (!open) return null

  const getStatusIcon = () => {
    switch (status) {
      case 'downloading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Download className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case 'downloading':
        return 'Downloading Certificate'
      case 'completed':
        return 'Download Complete'
      case 'error':
        return 'Download Failed'
      default:
        return 'Download Status'
    }
  }

  const getStatusDescription = () => {
    switch (status) {
      case 'downloading':
        return `Downloading ${fileName}...`
      case 'completed':
        return `${fileName} has been downloaded successfully`
      case 'error':
        return `Failed to download ${fileName}`
      default:
        return `Preparing to download ${fileName}...`
    }
  }

  const getProgressColor = () => {
    switch (status) {
      case 'downloading':
        return 'bg-blue-600'
      case 'completed':
        return 'bg-green-600'
      case 'error':
        return 'bg-red-600'
      default:
        return 'bg-blue-600'
    }
  }

  const formatFileSize = (progress: number) => {
    // Mock file size calculation based on progress
    const estimatedSize = 1024 * 1024 // 1MB estimated
    const downloadedSize = (progress / 100) * estimatedSize
    
    if (downloadedSize < 1024) {
      return `${Math.round(downloadedSize)} B`
    } else if (downloadedSize < 1024 * 1024) {
      return `${Math.round(downloadedSize / 1024)} KB`
    } else {
      return `${Math.round(downloadedSize / (1024 * 1024))} MB`
    }
  }

  const handleClose = () => {
    if (status === 'completed' || status === 'error') {
      onOpenChange(false)
    }
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 w-80 ${className}`}>
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-muted/50 rounded-lg">
                {getStatusIcon()}
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">
                  {getStatusTitle()}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {getStatusDescription()}
                </p>
              </div>
            </div>
            
            {(status === 'completed' || status === 'error') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {status === 'downloading' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-2"
                />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>{fileName}</span>
                </div>
                <span>{formatFileSize(progress)}</span>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Download successful!</span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>File saved to your Downloads folder</p>
                <p className="font-mono text-xs mt-1">{fileName}</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {errorMessage || 'An unexpected error occurred during download'}
                </AlertDescription>
              </Alert>
              
              <div className="text-xs text-muted-foreground">
                <p>Please try downloading again or contact support if the issue persists.</p>
              </div>
            </div>
          )}

          {status === 'idle' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-blue-600">
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">Preparing download...</span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>Initializing download for {fileName}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DownloadProgress
