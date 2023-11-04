import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '@/components/ui/button';

export function MobileFacetedFilterList({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-fit">
        <div className="flex flex-row max-w-fit">{children}</div>
      </PopoverContent>
    </Popover>
  );
}
