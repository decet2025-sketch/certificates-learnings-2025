'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth, isLoading } =
    useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Only check auth if we don't have user data or if not authenticated
      if (!user || !isAuthenticated) {
        await checkAuth();
      }
      setInitialized(true);
    };

    initAuth();
  }, [checkAuth, user, isAuthenticated]);

  useEffect(() => {
    if (initialized && !isLoading) {
      if (!isAuthenticated || !user) {
        router.push('/auth/signin');
        return;
      }

      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          router.push('/courses');
          break;
        case 'sop':
          router.push('/poc-dashboard/learners');
          break;
        case 'student':
          router.push('/unauthorized'); // Students might have different access
          break;
        default:
          router.push('/unauthorized');
      }
    }
  }, [initialized, isLoading, isAuthenticated, user, router]);

  // Show loading only during initial auth check, not on every navigation
  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
