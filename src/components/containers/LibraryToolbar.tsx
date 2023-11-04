import React, { useContext } from 'react';
import { Cross2Icon, FrameIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { colors, labels, types } from '@/lib/mockdata';
import { FacetedFilter, FacetedType } from './FacetedFilter';
import { locationService } from '@/services';
import AppContext from '@/stores/appContext';
import { countByKey, queryIsEmptyOrBlank } from '@/lib/utils';
import { COLOR_MAP } from '@/components/containers/CCard';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FilterIcon, FilterXIcon } from 'lucide-react';

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
        <Button variant="outline" size={'icon'}>
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52" side={'bottom'}>
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

export function LibraryToolbar() {
  const {
    globalState: { isMobileView },
    locationState: { query },
  } = useContext(AppContext);
  const isFiltered = !queryIsEmptyOrBlank(query);

  return (
    <div className="flex items-center justify-between max-w-[90%] w-full gap-2">
      <div className="flex items-center overflow-x-scroll space-x-2 lg:max-w-[520px]">
        {isMobileView ? <MobileFacetedFilterList>{FacetedFilterList()}</MobileFacetedFilterList> : FacetedFilterList()}
        {isFiltered && (
          <Button variant="ghost" onClick={() => locationService.clearQuery()} className="h-9 px-2 lg:px-3">
            {isMobileView ? <FilterXIcon className="h-4 w-4 text-red-300" /> : 'Reset'}
            {!isMobileView && <Cross2Icon className="ml-2 h-4 w-4" />}
          </Button>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Input
          placeholder="Filter cards..."
          value={(query.text as string) ?? ''}
          onChange={(event) => locationService.setTextQuery(event.target.value)}
          className="search-bar h-9 w-[150px] lg:w-[240px] shadow-none active:shadow-none dark:focus-visible:border-slate-800"
        />
      </div>
      {/*<CardLibraryViewOptions table={table} />*/}
    </div>
  );
}
