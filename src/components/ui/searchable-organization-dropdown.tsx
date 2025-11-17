import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Organization {
  id: string;
  name: string;
  website: string;
}

interface SearchableOrganizationDropdownProps {
  organizations: Organization[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function SearchableOrganizationDropdown({
  organizations,
  value,
  onChange,
  disabled = false,
  placeholder = "Organization Website",
  isLoading = false,
  className,
}: SearchableOrganizationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter organizations based on search query
  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.website.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected organization name for display
  const selectedOrg = organizations.find(org => org.website === value);
  const displayValue = value === '' || !selectedOrg ? '' : `${selectedOrg.name} (${selectedOrg.website})`;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle organization selection
  const handleSelect = (organization: Organization) => {
    onChange(organization.website);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Handle "All Organizations" selection
  const handleSelectAll = () => {
    onChange('');
    setIsOpen(false);
    setSearchQuery('');
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (!disabled && !isLoading) {
      setIsOpen(true);
      // Set search query to current selected org name when opening
      if (selectedOrg && !searchQuery) {
        setSearchQuery(`${selectedOrg.name} ${selectedOrg.website}`);
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div ref={dropdownRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={isOpen ? searchQuery : displayValue}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Loading organizations..." : placeholder}
          disabled={disabled || isLoading}
          className="pl-10 pr-10 cursor-pointer"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || isLoading}
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isOpen && !disabled && !isLoading && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-2 text-base text-muted-foreground">
              <Search className="h-5 w-5" />
              <span>Search organizations...</span>
            </div>
          </div>

          <div className="p-2">
            {/* All Organizations Option */}
            <button
              type="button"
              onClick={handleSelectAll}
              className={cn(
                "w-full text-left px-4 py-3 rounded-md text-base hover:bg-accent hover:text-accent-foreground transition-colors",
                value === '' ? "bg-accent text-accent-foreground" : ""
              )}
            >
              <div className="font-medium text-base">All Organizations</div>
              <div className="text-sm text-muted-foreground">Show all organizations</div>
            </button>

            {/* Filtered Organizations */}
            {filteredOrganizations.length === 0 && searchQuery ? (
              <div className="px-4 py-6 text-center text-base text-muted-foreground">
                No organizations found matching "{searchQuery}"
              </div>
            ) : (
              filteredOrganizations.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => handleSelect(org)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-md text-base hover:bg-accent hover:text-accent-foreground transition-colors",
                    value === org.website ? "bg-accent text-accent-foreground" : ""
                  )}
                >
                  <div className="font-medium text-base truncate">{org.name}</div>
                  <div className="text-sm text-muted-foreground break-all">{org.website}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
