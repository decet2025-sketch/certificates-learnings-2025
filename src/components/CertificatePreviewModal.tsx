'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Share2, 
  Award, 
  CalendarDays, 
  Building2, 
  BookOpen, 
  Mail, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Loader2,
  ExternalLink
} from 'lucide-react'

interface LearnerProgress {
  id: string
  name: string
  email: string
  organization: string
  course: string
  enrollmentDate: string
  completionStatus: 'completed' | 'in-progress' | 'not-started'
  certificateStatus: 'issued' | 'pending' | 'not-eligible'
  progress: number
  certificateId?: string
  completionDate?: string
}

interface CertificatePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  learner: LearnerProgress
}

export function CertificatePreviewModal({ isOpen, onClose, learner }: CertificatePreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Downloading certificate for:', learner.name)
      // TODO: Implement actual download logic
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    setIsSharing(true)
    try {
      // Simulate sharing
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Sharing certificate for:', learner.name)
      // TODO: Implement actual sharing logic
    } catch (error) {
      console.error('Sharing failed:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const getStatusBadge = (status: LearnerProgress['certificateStatus']) => {
    switch (status) {
      case 'issued':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Issued
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'not-eligible':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Not Eligible
          </Badge>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Certificate Preview */}
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
          {/* Certificate Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-3 sm:mb-4">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">
              Certificate of Completion
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              This certifies that
            </p>
          </div>

          {/* Certificate Body */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            {/* Learner Name */}
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {learner.name}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                has successfully completed
              </p>
            </div>

            {/* Course Name */}
            <div className="text-center mb-6 sm:mb-8">
              <h4 className="text-lg sm:text-xl lg:text-2xl font-semibold text-blue-600 mb-2">
                {learner.course}
              </h4>
              <div className="flex items-center justify-center space-x-2 text-sm sm:text-base text-gray-600">
                <Building2 className="h-4 w-4" />
                <span>{learner.organization}</span>
              </div>
            </div>

            {/* Completion Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-sm sm:text-base text-gray-600 mb-1">
                  <CalendarDays className="h-4 w-4" />
                  <span className="font-medium">Completed on:</span>
                </div>
                <p className="text-sm sm:text-base text-gray-900">
                  {learner.completionDate ? formatDate(learner.completionDate) : 'Not completed'}
                </p>
              </div>
              <div className="text-center sm:text-right">
                <div className="flex items-center justify-center sm:justify-end space-x-2 text-sm sm:text-base text-gray-600 mb-1">
                  <Award className="h-4 w-4" />
                  <span className="font-medium">Certificate ID:</span>
                </div>
                <p className="text-sm sm:text-base text-gray-900 font-mono">
                  {learner.certificateId || 'N/A'}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center mb-6 sm:mb-8">
              {getStatusBadge(learner.certificateStatus)}
            </div>

            {/* Progress Bar */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between text-sm sm:text-base text-gray-600 mb-2">
                <span>Course Progress</span>
                <span className="font-medium">{learner.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 sm:h-3 rounded-full transition-all duration-300"
                  style={{ width: `${learner.progress}%` }}
                />
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="flex justify-center space-x-4 sm:space-x-8">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20"></div>
              <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-30"></div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20"></div>
            </div>
          </div>

          {/* Certificate Footer */}
          <div className="text-center text-xs sm:text-sm text-gray-500">
            <p>This certificate is digitally verified and can be verified online</p>
            <p className="mt-1">Issued on {formatDate(learner.enrollmentDate)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Close
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading || learner.certificateStatus !== 'issued'}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
          <Button
            onClick={handleShare}
            disabled={isSharing || learner.certificateStatus !== 'issued'}
            className="w-full sm:w-auto order-3"
          >
            {isSharing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
