import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  variant?: 'primary' | 'default';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingSpinner({
  size = 'md',
  className,
  text,
  variant = 'primary',
}: LoadingSpinnerProps) {
  const spinnerClasses = cn(
    'animate-spin',
    sizeClasses[size],
    variant === 'primary' ? 'text-primary' : 'text-muted-foreground',
    className
  );

  if (text) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <Loader2 className={spinnerClasses} />
        <p className="text-sm text-muted-foreground mt-2">{text}</p>
      </div>
    );
  }

  return <Loader2 className={spinnerClasses} />;
}

interface LoadingCardProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  className?: string;
  height?: string;
}

export function LoadingCard({
  isLoading,
  children,
  text = 'Loading...',
  className,
  height = 'h-32',
}: LoadingCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center text-center',
          height,
          className
        )}
      >
        <LoadingSpinner size="md" text={text} />
      </div>
    );
  }

  return <>{children}</>;
}
