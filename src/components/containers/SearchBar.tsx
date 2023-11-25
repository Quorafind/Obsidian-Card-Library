import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import React, { useContext, useEffect } from 'react';
import AppContext from '@/stores/appContext';
import { debounce } from 'obsidian';
import { locationService } from '@/services';

const search = debounce((value: string) => locationService.setTextQuery(value), 300, true);

function SearchBar({ inputType }: { inputType: 'inline' | 'header' }): React.JSX.Element {
  const {
    globalState: { app, view },
    locationState: { query },
  } = useContext(AppContext);

  const searchBarRef = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState<string>((query.text as string) ?? '');

  useEffect(() => {
    if (!app || !view) return;
    view.registerEvent(
      app.workspace.on('focus-on-search-bar', (current: 'inline' | 'header') => {
        if (current === inputType) {
          searchBarRef.current?.focus();
        }
      }),
    );
  }, [inputType, app, view]);

  return (
    <div
      className={cn(
        'flex items-center border-b rounded-md border border-input transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600',
        inputType === 'inline' ? '' : ' pl-3',
        inputType === 'header' ? 'border-none' : '',
      )}
    >
      {inputType === 'header' && <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50 text-muted-foreground" />}
      <Input
        ref={searchBarRef}
        placeholder="Filter cards..."
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          search(event.target.value);
        }}
        className={cn(
          'search-bar border-none h-9 w-[150px] lg:w-[240px] flex rounded-md bg-transparent py-3 text-sm outline-none shadow-none active:shadow-none dark:focus-visible:border-slate-800',
          inputType === 'inline' ? '' : 'pl-1',
        )}
      />
    </div>
  );
}

export { SearchBar };
