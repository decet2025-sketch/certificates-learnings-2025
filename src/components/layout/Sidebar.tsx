'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  Home,
  BookOpen,
  Building2,
  BarChart3,
  Settings,
  X,
  Award,
  FileText,
  Calendar,
  HelpCircle,
  Users,
  User,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

interface NavItem {
  name: string;
  href: string;
  icon: ReactNode;
  badge?: string;
  children?: NavItem[];
  roles?: ('admin' | 'sop' | 'student')[];
}

// Admin navigation items
const adminNavigation: NavItem[] = [
  {
    name: 'Courses',
    href: '/courses',
    icon: <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />,
    roles: ['admin'],
  },
  {
    name: 'Organizations',
    href: '/organizations',
    icon: <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />,
    roles: ['admin'],
  },
  {
    name: 'Learners',
    href: '/learners',
    icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />,
    roles: ['admin'],
  },
  {
    name: 'Logs',
    href: '/logs',
    icon: <FileText className="h-4 w-4 sm:h-5 sm:w-5" />,
    roles: ['admin'],
  },
  // {
  //   name: 'Settings',
  //   href: '/settings',
  //   icon: <Settings className="h-4 w-4 sm:h-5 sm:w-5" />,
  //   roles: ['admin']
  // },
];

// POC navigation items
const pocNavigation: NavItem[] = [
  {
    name: 'Learners',
    href: '/poc-dashboard/learners',
    icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />,
    roles: ['sop'],
  },
];

export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/signin');
  };

  // Get navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return adminNavigation;
      case 'sop':
        return pocNavigation;
      case 'student':
        return []; // Students might have different navigation
      default:
        return [];
    }
  };

  const navigation = getNavigationItems();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">
                  Sharon Decet
                </h1>
                <p className="text-xs text-gray-500">
                  Certificate Management
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Admin Profile Section */}
            {user?.role === 'admin' && (
              <div className="px-2 mt-4">
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      <Badge
                        variant="secondary"
                        className="text-xs mt-1"
                      >
                        {user.role.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={onClose}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h1 className="text-lg font-semibold text-gray-900">
                      Sharon Decet
                    </h1>
                    <p className="text-xs text-gray-500">
                      Certificate Management
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex-grow flex flex-col">
                <nav className="flex-1 px-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                          isActive
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                        onClick={onClose}
                      >
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-medium px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* Admin Profile Section - Mobile */}
                {user?.role === 'admin' && (
                  <div className="px-2 mt-4">
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-xs mt-1"
                          >
                            {user.role.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        handleLogout();
                        onClose();
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
