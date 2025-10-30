'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { LoadingButton } from '@/components/ui/loading'
import { Loader2, Save, Eye, Code } from 'lucide-react'
import { courseApi } from '@/lib/api/admin-api'
import { useCoursesStore } from '@/stores/coursesStore'

interface CertificateTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  courseName: string
  currentTemplate: string
  mode: 'preview' | 'edit'
  onModeChange?: (mode: 'preview' | 'edit') => void
}

export function CertificateTemplateModal({ 
  isOpen, 
  onClose, 
  courseId, 
  courseName,
  currentTemplate,
  mode,
  onModeChange
}: CertificateTemplateModalProps) {
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { updateCourse } = useCoursesStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<{ template: string }>({
    defaultValues: {
      template: currentTemplate
    }
  })

  const templateValue = watch('template')

  // Generate preview HTML with placeholders
  const generatePreview = (template: string) => {
    const preview = template
      .replace(/{learnerName}/g, 'John Doe')
      .replace(/{courseName}/g, courseName)
      .replace(/{completionDate}/g, new Date().toLocaleDateString())
      .replace(/{organizationName}/g, 'Sample Organization')
    
    setPreviewHtml(preview)
  }

  // Generate preview when template changes
  useEffect(() => {
    if (templateValue) {
      generatePreview(templateValue)
    }
  }, [templateValue, courseName])

  // Initialize with current template
  useEffect(() => {
    if (currentTemplate) {
      setValue('template', currentTemplate)
      generatePreview(currentTemplate)
    }
  }, [currentTemplate, setValue, courseName])

  const onSubmit = async (data: { template: string }) => {
    setIsSaving(true)
    setError(null)
    
    try {
      const response = await courseApi.editCourse({
        course_id: courseId,
        name: courseName,
        certificate_template_html: data.template
      })
      
      if (!response.ok) {
        throw new Error(response.error?.message || 'Failed to save template')
      }
      
      // Update the course in the store
      console.log("Updating course with ID:", courseId, "Template:", data.template);
      await updateCourse(courseId, {
        certificateTemplate: data.template
      })
      
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRefresh = () => {
    generatePreview(templateValue)
  }

  const handleModeToggle = (newMode: 'preview' | 'edit') => {
    onModeChange?.(newMode)
  }

  const handleClose = () => {
    // Reset form when closing
    reset({ template: currentTemplate })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-4 space-y-4">
          <DialogTitle>Certificate Template</DialogTitle>
          <DialogDescription>
            {mode === 'preview' 
              ? `Preview for course: ${courseName}`
              : `Edit the HTML template for course: ${courseName}`
            }
          </DialogDescription>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1">
            <Button
              variant={mode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeToggle('preview')}
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </Button>
            <Button
              variant={mode === 'edit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeToggle('edit')}
              className="flex items-center space-x-2"
            >
              <Code className="h-4 w-4" />
              <span>Edit HTML</span>
            </Button>
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Edit Mode */}
          {mode === 'edit' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  HTML Template
                </label>
                <Textarea
                  {...register('template', { required: 'Template is required' })}
                  placeholder="Enter your HTML template here..."
                  className="min-h-[400px] font-mono text-sm"
                  style={{ resize: 'vertical' }}
                />
                {errors.template && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.template.message}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-start space-x-2">
                  <Code className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Available Placeholders:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li><code>{'{learnerName}'}</code> - Learner's full name</li>
                      <li><code>{'{courseName}'}</code> - Course name</li>
                      <li><code>{'{completionDate}'}</code> - Completion date</li>
                      <li><code>{'{organizationName}'}</code> - Organization name</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Mode */}
          {mode === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Certificate Preview</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Refresh</span>
                </Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <p className="text-sm text-gray-600">
                    Preview with sample data (John Doe, {courseName}, etc.)
                  </p>
                </div>
                <div className="h-[500px] overflow-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <iframe
                      srcDoc={previewHtml}
                      title="Certificate Preview"
                      className="w-full h-full bg-white"
                      style={{
                        boxShadow: 'none',
                        border: 'none',
                        outline: 'none'
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="p-6 pt-4 space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          {mode === 'edit' && (
            <LoadingButton
              type="button"
              onClick={handleSubmit(onSubmit)}
              isLoading={isSaving}
              loadingText="Saving..."
              className="flex items-center space-x-2"
            >
              {!isSaving && <Save className="h-4 w-4" />}
              <span>Save Template</span>
            </LoadingButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
