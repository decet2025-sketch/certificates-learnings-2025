import { useState, useCallback } from 'react'

interface DownloadState {
  isDownloading: boolean
  progress: number
  fileName: string | null
  status: 'idle' | 'downloading' | 'completed' | 'error'
  errorMessage: string | null
}

interface SOPDownloadResponse {
  ok: boolean
  status: number
  data?: {
    download_url: string
    file_name: string
    file_size: number
  }
  error?: {
    code: string
    message: string
  }
}

export function useDownloadManager() {
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isDownloading: false,
    progress: 0,
    fileName: null,
    status: 'idle',
    errorMessage: null
  })

  const downloadFile = useCallback(async (learnerEmail: string, courseId: string, fileName?: string) => {
    setDownloadState({
      isDownloading: true,
      progress: 0,
      fileName: fileName || 'Certificate',
      status: 'downloading',
      errorMessage: null
    })

    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('user')
      if (!userData) {
        throw new Error('User not authenticated')
      }

      const user = JSON.parse(userData)

      // Call the SOP Router DOWNLOAD_CERTIFICATE API
      setDownloadState(prev => ({ ...prev, progress: 25 }))

      const response = await fetch('https://cloud.appwrite.io/v1/functions/sop_router/executions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': '68cf04e30030d4b38d19',
          'X-Appwrite-Key': 'standard_433c1d266b99746da7293cecabc52ca95bb22210e821cfd4292da0a8eadb137d36963b60dd3ecf89f7cf0461a67046c676ceacb273c60dbc1a19da1bc9042cc82e7653cb167498d8504c6abbda8634393289c3335a0cb72eb8d7972249a0b22a10f9195b0d43243116b54f34f7a15ad837a900922e23bcba34c80c5c09635142'
        },
        body: JSON.stringify({
          body: JSON.stringify({
            action: 'DOWNLOAD_CERTIFICATE',
            payload: {
              learner_email: learnerEmail,
              course_id: courseId
            },
            jwt_token: user.token // Assuming the user object has a token field
          })
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SOPDownloadResponse = await response.json()

      if (!data.ok) {
        throw new Error(data.error?.message || 'Failed to get download link')
      }

      if (!data.data?.download_url) {
        throw new Error('No download URL provided')
      }

      // Step 2: Download the file using the provided URL
      setDownloadState(prev => ({ ...prev, progress: 50 }))

      const downloadResponse = await fetch(data.data.download_url)
      
      if (!downloadResponse.ok) {
        throw new Error('Failed to download file')
      }

      // Step 3: Create blob and trigger download
      setDownloadState(prev => ({ ...prev, progress: 75 }))

      const blob = await downloadResponse.blob()
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = data.data.file_name || fileName || `${learnerEmail}_${courseId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(url)

      setDownloadState(prev => ({
        ...prev,
        progress: 100,
        status: 'completed',
        isDownloading: false
      }))

    } catch (error) {
      console.error('Download error:', error)
      setDownloadState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Download failed',
        isDownloading: false
      }))
    }
  }, [])

  const resetDownload = useCallback(() => {
    setDownloadState({
      isDownloading: false,
      progress: 0,
      fileName: null,
      status: 'idle',
      errorMessage: null
    })
  }, [])

  return {
    downloadState,
    downloadFile,
    resetDownload
  }
}
