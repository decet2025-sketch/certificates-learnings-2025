'use client'

import React from 'react'

interface SimplePdfViewerProps {
  pdfUrl: string
  width?: string
  height?: string
  className?: string
}

export const SimplePdfViewer: React.FC<SimplePdfViewerProps> = ({ 
  pdfUrl, 
  width = '100%', 
  height = '500px',
  className = ''
}) => {
  return (
    <div 
      className={`border border-border rounded-lg overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <iframe
        src={pdfUrl}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="PDF Viewer"
        className="w-full h-full"
      >
        <p>
          This browser does not support PDFs. Please download the PDF to view it:{' '}
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            Download PDF
          </a>
        </p>
      </iframe>
    </div>
  )
}

export default SimplePdfViewer
