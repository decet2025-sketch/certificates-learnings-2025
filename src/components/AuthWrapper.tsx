'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface AuthWrapperProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'sop' | 'student';
  redirectTo?: string;
}

export function AuthWrapper({
  children,
  requiredRole,
  redirectTo = '/auth/signin',
}: AuthWrapperProps) {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth, isLoading } =
    useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Always check auth on mount to ensure we have the latest state
      // This handles cases where the store might not be properly rehydrated
      await checkAuth();
      setInitialized(true);
    };

    initAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (initialized && !isLoading) {
      if (!isAuthenticated || !user) {
        router.push(redirectTo);
        return;
      }

      if (requiredRole && user.role !== requiredRole) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [
    initialized,
    isLoading,
    isAuthenticated,
    user,
    requiredRole,
    router,
    redirectTo,
  ]);

  // Show loading only during initial auth check, not on every navigation
  if (!initialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
