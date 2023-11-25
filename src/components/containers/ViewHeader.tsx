import { SearchBar } from '@/components/containers/SearchBar';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import React, { useContext } from 'react';
import { EditCardDialog } from '@/components/containers/EditCardDialog';
import { CardLibraryView } from '@/cardLibraryView';
import AppContext from '@/stores/appContext';
import { Tooltip, TooltipContent, TooltipPortal, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ViewHeader() {
  const {
    globalState: { settings },
  } = useContext(AppContext);

  return (
    <>
      <div className="flex flex-row p-2">
        {settings.general.global && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <EditCardDialog>
                  <Button variant={'ghost'} size={'icon'}>
                    <PlusIcon className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </EditCardDialog>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent>
                  <p>⌘N - Create card</p>
                  <p>⌘⇧N - Create card from clipboard</p>
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        )}
        <SearchBar inputType={'header'} />
      </div>
    </>
  );
}
