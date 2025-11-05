'use client'

import React, { createContext, useContext, useCallback } from 'react'
import { ToastContainer, toast, ToastOptions } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Toast context
interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => string
  hideToast: (id: string) => void
  clearAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Toast provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11)
    
    const toastOptions: ToastOptions = {
      toastId: id,
      autoClose: toastData.duration || 5000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      position: 'top-right'
    }

    switch (toastData.type) {
      case 'success':
        toast.success(
          <ToastContent title={toastData.title} message={toastData.message} action={toastData.action} />,
          toastOptions
        )
        break
      case 'error':
        toast.error(
          <ToastContent title={toastData.title} message={toastData.message} action={toastData.action} />,
          { ...toastOptions, autoClose: toastData.duration || 2000 }
        )
        break
      case 'warning':
        toast.warning(
          <ToastContent title={toastData.title} message={toastData.message} action={toastData.action} />,
          toastOptions
        )
        break
      case 'info':
        toast.info(
          <ToastContent title={toastData.title} message={toastData.message} action={toastData.action} />,
          toastOptions
        )
        break
    }

    return id
  }, [])

  const hideToast = useCallback((id: string) => {
    toast.dismiss(id)
  }, [])

  const clearAllToasts = useCallback(() => {
    toast.dismiss()
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast, clearAllToasts }}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="toast-container"
        toastClassName="toast-item"
      />
    </ToastContext.Provider>
  )
}

// Toast content component
const ToastContent: React.FC<{
  title: string
  message: string
  action?: Toast['action']
}> = ({ title, message, action }) => {
  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  // Determine type from toast context (this is a simplified approach)
  const type = 'info' as ToastType // In a real implementation, you'd pass this as a prop

  return (
    <div className="flex items-start space-x-3 p-1">
      <div className="flex-shrink-0">
        {getIcon(type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">
          {title}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {message}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}

// Custom toast component
export const CustomToast: React.FC<{
  toast: Toast
  onClose: () => void
}> = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div
      className={cn(
        'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border',
        getBackgroundColor()
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {toast.title}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {toast.message}
            </p>
            {toast.action && (
              <div className="mt-2">
                <button
                  onClick={toast.action.onClick}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Utility functions
export const showSuccessToast = (title: string, message: string, duration?: number) => {
  return toast.success(
    <ToastContent title={title} message={message} />,
    { autoClose: duration || 5000 }
  )
}

export const showErrorToast = (title: string, message: string, duration?: number) => {
  return toast.error(
    <ToastContent title={title} message={message} />,
    { autoClose: duration || 2000 }
  )
}

export const showWarningToast = (title: string, message: string, duration?: number) => {
  return toast.warning(
    <ToastContent title={title} message={message} />,
    { autoClose: duration || 5000 }
  )
}

export const showInfoToast = (title: string, message: string, duration?: number) => {
  return toast.info(
    <ToastContent title={title} message={message} />,
    { autoClose: duration || 5000 }
  )
}
