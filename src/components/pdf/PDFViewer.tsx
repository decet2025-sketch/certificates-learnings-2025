'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ZoomIn, ZoomOut, RotateCw, Download, X, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PDFViewerProps {
  pdfUrl: string
  fileName?: string
  onClose?: () => void
  onDownload?: () => void
  className?: string
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  fileName = 'Certificate',
  onClose,
  onDownload,
  className = ''
}) => {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const zoomLevels = [50, 75, 100, 125, 150, 200, 300]
  const minZoom = 25
  const maxZoom = 500

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    
    // Simulate loading time for PDF
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [pdfUrl])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, maxZoom))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.min(prev - 25, minZoom))
  }

  const handleZoomReset = () => {
    setZoom(100)
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    } else {
      // Fallback download
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = fileName
      link.click()
    }
  }

  const handleIframeError = () => {
    setError('Failed to load PDF. Please check the file URL and try again.')
    setIsLoading(false)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
    setError(null)
  }

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold truncate">{fileName}</h3>
          {isLoading && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span>Loading...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= minZoom || isLoading}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[3rem] text-center">
              {zoom}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= maxZoom || isLoading}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomReset}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>

          {/* Rotation control */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
            disabled={isLoading}
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          {/* Download button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isLoading || !!error}
          >
            <Download className="h-4 w-4" />
          </Button>

          {/* Close button */}
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div className="relative bg-gray-100 min-h-[600px] flex items-center justify-center">
        {error ? (
          <Alert className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div
            className="w-full h-full"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-in-out'
            }}
          >
            <iframe
              ref={iframeRef}
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=${zoom}`}
              className="w-full h-[600px] border-0"
              title={fileName}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{
                transform: `rotate(${-rotation}deg)`,
                transformOrigin: 'center center'
              }}
            />
          </div>
        )}
      </div>

      {/* Footer with zoom level info */}
      <div className="flex items-center justify-between p-2 border-t bg-muted/30 text-xs text-muted-foreground">
        <span>PDF Viewer</span>
        <span>Zoom: {zoom}% | Rotation: {rotation}°</span>
      </div>
    </Card>
  )
}

export default PDFViewer
