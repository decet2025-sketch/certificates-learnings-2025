'use client';

import { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MainContentProps {
  children: ReactNode;
  onMenuClick?: () => void;
  isMobile?: boolean;
}

export function MainContent({
  children,
  onMenuClick,
  isMobile,
}: MainContentProps) {
  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden">
      {/* Mobile Menu Button */}
      {isMobile && onMenuClick && (
        <div className="lg:hidden px-3 sm:px-4 py-2 sm:py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="p-2 h-10 w-10 min-h-[44px] min-w-[44px]"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="py-3 sm:py-4 lg:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="w-full">{children}</div>
        </div>
      </div>
    </main>
  );
}
