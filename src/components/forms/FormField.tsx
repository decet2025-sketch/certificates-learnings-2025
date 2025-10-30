'use client'

import React from 'react'
import { FieldError, FieldPath, FieldValues, UseFormRegister } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  label: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'file'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  register: UseFormRegister<T>
  error?: FieldError
  className?: string
  description?: string
  accept?: string
  multiple?: boolean
}

export function FormField<T extends FieldValues>({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  register,
  error,
  className,
  description,
  accept,
  multiple = false
}: FormFieldProps<T>) {
  const fieldId = `field-${name}`

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      <Input
        id={fieldId}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        accept={accept}
        multiple={multiple}
        className={cn(
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
        )}
        {...register(name)}
      />
      
      {error && (
        <p className="text-sm text-red-500 flex items-center space-x-1">
          <span>{error.message}</span>
        </p>
      )}
    </div>
  )
}

interface SelectFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  label: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
  required?: boolean
  disabled?: boolean
  register: UseFormRegister<T>
  error?: FieldError
  className?: string
  description?: string
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  options,
  placeholder,
  required = false,
  disabled = false,
  register,
  error,
  className,
  description
}: SelectFieldProps<T>) {
  const fieldId = `field-${name}`

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      <select
        id={fieldId}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
        )}
        {...register(name)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-red-500 flex items-center space-x-1">
          <span>{error.message}</span>
        </p>
      )}
    </div>
  )
}

interface TextareaFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  rows?: number
  register: UseFormRegister<T>
  error?: FieldError
  className?: string
  description?: string
}

export function TextareaField<T extends FieldValues>({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  rows = 3,
  register,
  error,
  className,
  description
}: TextareaFieldProps<T>) {
  const fieldId = `field-${name}`

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      <textarea
        id={fieldId}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
        )}
        {...register(name)}
      />
      
      {error && (
        <p className="text-sm text-red-500 flex items-center space-x-1">
          <span>{error.message}</span>
        </p>
      )}
    </div>
  )
}

interface CheckboxFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  label: string
  description?: string
  required?: boolean
  disabled?: boolean
  register: UseFormRegister<T>
  error?: FieldError
  className?: string
}

export function CheckboxField<T extends FieldValues>({
  name,
  label,
  description,
  required = false,
  disabled = false,
  register,
  error,
  className
}: CheckboxFieldProps<T>) {
  const fieldId = `field-${name}`

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start space-x-2">
        <input
          id={fieldId}
          type="checkbox"
          disabled={disabled}
          className={cn(
            'h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary',
            error && 'border-red-500 text-red-500 focus:ring-red-500'
          )}
          {...register(name)}
        />
        <div className="flex-1">
          <Label htmlFor={fieldId} className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-500 flex items-center space-x-1">
          <span>{error.message}</span>
        </p>
      )}
    </div>
  )
}
