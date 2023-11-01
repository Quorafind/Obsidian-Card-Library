import CanvasSwitcher from '@/components/containers/CanvasSwitcher';
import React from 'react';
import { CardLibraryToolbar } from '@/components/containers/CardLibraryToolbar';

export default function LibraryHeader() {
  return (
    <div className="library-header border-b">
      <div className="flex h-16 items-center px-4 space-x-2">
        <CanvasSwitcher />
        <CardLibraryToolbar />
      </div>
    </div>
  );
}
