'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Button, ButtonProps } from './button';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <Loader2
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  children,
  message = 'Loading...',
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn('relative', className)}>
      {children}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}

interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  isLoading,
  loadingText = 'Loading...',
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center space-x-2',
        className
      )}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      <span>{isLoading ? loadingText : children}</span>
    </Button>
  );
}

interface LoadingCardProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

export function LoadingCard({
  isLoading,
  children,
  message = 'Loading...',
  className,
}: LoadingCardProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 space-y-4',
        'bg-white rounded-lg border border-gray-200',
        className
      )}
    >
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface LoadingTableProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  rows?: number;
  className?: string;
}

export function LoadingTable({
  isLoading,
  children,
  message = 'Loading...',
  rows = 5,
  className,
}: LoadingTableProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>

      {/* Skeleton rows */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex space-x-4 p-4 bg-gray-50 rounded animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LoadingPageProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}

export function LoadingPage({
  isLoading,
  children,
  message = 'Loading...',
  className,
}: LoadingPageProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center bg-gray-50',
        className
      )}
    >
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" />
        <p className="text-lg text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
