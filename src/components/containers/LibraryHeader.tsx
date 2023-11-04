import CanvasSwitcher from '@/components/containers/CanvasSwitcher';
import React from 'react';
import { LibraryToolbar } from '@/components/containers/LibraryToolbar';

export default function LibraryHeader() {
  return (
    <div className="library-header border-b dark:border-slate-600">
      <div className="flex h-16 items-center px-4 space-x-2 overflow-x-scroll w-full">
        <div className="max-w-[20%] flex flex-col items-center">
          <CanvasSwitcher />
        </div>
        <LibraryToolbar />
      </div>
    </div>
  );
}
