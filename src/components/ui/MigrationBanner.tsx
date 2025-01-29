import React from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import { Button } from './Button';

interface MigrationBannerProps {
  onDismiss: () => void;
  onExport: () => void;
}

export function MigrationBanner({ onDismiss, onExport }: MigrationBannerProps) {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center flex-1 min-w-0">
            <span className="flex p-2 rounded-lg bg-amber-100">
              <AlertTriangle className="h-6 w-6 text-amber-600" aria-hidden="true" />
            </span>
            <div className="ml-3 font-medium text-amber-900">
              <span className="md:hidden">Database migration scheduled for Feb 6, 2025.</span>
              <span className="hidden md:inline">
                Important: Database migration to Supabase scheduled for February 6, 2025. Please export your data as a backup.
                You'll need to create a new account after migration and can then import your data.
              </span>
            </div>
          </div>
          <div className="flex-shrink-0 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onExport}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              Export Data
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-amber-900 hover:bg-amber-100"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}