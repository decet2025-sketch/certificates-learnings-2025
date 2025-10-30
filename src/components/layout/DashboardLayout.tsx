'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';

interface DashboardLayoutProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'sop' | 'student';
  redirectTo?: string;
}

export function DashboardLayout({
  children,
  requiredRole,
  redirectTo = '/auth/signin',
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth, isLoading } =
    useAuthStore();
  const [initialized, setInitialized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Authentication logic
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

  // Mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false); // Close sidebar on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isMobile={isMobile}
      />

      {/* Main Content Area - Fixed positioning for desktop sidebar */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Main Content */}
        <MainContent onMenuClick={toggleSidebar} isMobile={isMobile}>
          {children}
        </MainContent>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
