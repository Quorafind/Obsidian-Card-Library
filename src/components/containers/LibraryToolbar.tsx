import React, { useContext, useEffect } from 'react';
import { CopyIcon, Cross2Icon, FrameIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';

import { colors, labels, types } from '@/lib/mockdata';
import { FacetedFilter, FacetedType } from './FacetedFilter';
import { globalService, locationService } from '@/services';
import AppContext from '@/stores/appContext';
import { countByKey, isMobileView, queryIsEmptyOrBlank } from '@/lib/utils';
import { COLOR_MAP } from '@/components/containers/CanvasCard';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FilterIcon, FilterXIcon, CrosshairIcon } from 'lucide-react';
import { Toggle } from '../ui/toggle';
import { getCurrentCanvasView, revealCanvasByPath } from '@/lib/obsidianUtils';
import { SearchBar } from '@/components/containers/SearchBar';

function FacetedFilterListMap(tags?: string[]) {
  return {
    type: {
      title: 'Type',
      options: types,
    },
    color: {
      title: 'Color',
      options: colors,
    },
    linked: {
      title: 'Link',
      options: labels,
    },
    tags: {
      title: 'Tag',
      options: tags.map((tag) => ({ label: tag, value: tag, icon: FrameIcon })),
    },
  };
}

function CustomFacetedFilter(
  target: FacetedType,
  props: {
    cards: Model.Card[];
    tags: string[];
  },
) {
  return (
    <FacetedFilter
      target={target}
      facets={countByKey(props.cards, target)}
      title={FacetedFilterListMap(props.tags)[target].title}
      options={FacetedFilterListMap(props.tags)[target].options}
    />
  );
}

function MobileFacetedFilterList({ children }: { children: React.JSX.Element }): React.JSX.Element {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button aria-label="Toggle filter" variant="outline" size={'icon'}>
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 dark:border-slate-500" side={'bottom'}>
        <div className="flex flex-col w-full gap-2">{children}</div>
      </PopoverContent>
    </Popover>
  );
}

function FacetedFilterList() {
  const {
    cardState: { cards, tags, tagsNum },
  } = useContext(AppContext);

  return (
    <>
      {types.length > 0 && CustomFacetedFilter('type', { cards, tags })}
      {Object.keys(COLOR_MAP).length > 0 && CustomFacetedFilter('color', { cards, tags })}
      {labels.length > 0 && CustomFacetedFilter('linked', { cards, tags })}
      {tagsNum && CustomFacetedFilter('tags', { cards, tags })}
    </>
  );
}

function FocusAction() {
  const {
    locationState: { query },
    globalState: { focused, app, view },
  } = useContext(AppContext);

  useEffect(() => {
    if (!view) return;
    const eventRef = view.app.workspace.on('active-leaf-change', (leaf) => {
      if (leaf.view.getViewType() != 'canvas') return;
      if (focused) {
        const path = leaf.view.file?.path;
        if (path) {
          locationService.setQueryWithType('path', [path]);
        }
      }
    });
    view.registerEvent(eventRef);

    return () => {
      view.app.workspace.offref(eventRef);
    };
  }, [view, focused]);

  useEffect(() => {
    if (!focused) {
      locationService.setQueryWithType('path', []);
    }
  }, [focused]);

  const handleFocus = async () => {
    if (query.path && query.path.length === 1) {
      await revealCanvasByPath(query.path[0]);
      return;
    }
    const canvasView = getCurrentCanvasView(app);
    if (canvasView) {
      const path = canvasView?.view?.file?.path;
      if (path) {
        locationService.setQueryWithType('path', [path]);
      }
    } else {
      globalService.setFocused(false);
    }
  };

  return (
    <>
      <Toggle
        variant="outline"
        aria-label="Focus on current canvas view"
        aria-pressed={focused}
        pressed={focused}
        onPressedChange={(pressed: boolean) => {
          globalService.setFocused(pressed);
          pressed && handleFocus();
        }}
      >
        <CrosshairIcon className="h-4 w-4 text-muted-foreground" />
      </Toggle>
    </>
  );
}

export function LibraryToolbar({ children }: { children?: React.ReactNode }) {
  const {
    globalState: { viewStatus, viewHeaderVisibility, hasCanvasViewOpened },
    locationState: { query },
  } = useContext(AppContext);
  const isFiltered = !queryIsEmptyOrBlank(query);

  return (
    <div className="flex items-center justify-between w-full gap-2 overflow-x-scroll">
      <div className="flex items-center overflow-x-scroll space-x-2 min-w-[80px] md:max-w-[520px] lg:max-w-full">
        {children}
        {isMobileView(viewStatus) ? (
          <MobileFacetedFilterList>{FacetedFilterList()}</MobileFacetedFilterList>
        ) : (
          FacetedFilterList()
        )}
        {isFiltered && (
          <>
            <Button
              aria-label="Clear filter"
              variant="ghost"
              onClick={() => locationService.clearQuery()}
              className="h-9 px-2 lg:px-3"
            >
              {isMobileView(viewStatus) ? <FilterXIcon className="h-4 w-4 text-red-300" /> : 'Reset'}
              {!isMobileView(viewStatus) && <Cross2Icon className="ml-2 h-4 w-4" />}
            </Button>
            <Button
              aria-label="Copy cards"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey) {
                } else {
                  window.document.execCommand('copy');
                }
              }}
            >
              <CopyIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2">
        {hasCanvasViewOpened && <FocusAction />}
        {!viewHeaderVisibility && <SearchBar inputType="inline" />}
      </div>
    </div>
  );
}
