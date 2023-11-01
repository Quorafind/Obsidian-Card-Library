import React, { useContext } from 'react';
import { Cross2Icon, FrameIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { colors, labels, types } from '@/lib/mockdata';
import { CardLibraryFacetedFilter } from './CardLibraryFacetedFilter';
import { locationService } from '@/services';
import AppContext from '@/stores/appContext';
import { convertToMap, countByKey, queryIsEmptyOrBlank } from '@/lib/utils';

export function CardLibraryToolbar() {
  const {
    locationState: { query },
    cardState: { cards, tags, tagsNum },
  } = useContext(AppContext);
  const isFiltered = !queryIsEmptyOrBlank(query);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex flex-1 items-center space-x-2">
        {types.length > 0 && (
          <CardLibraryFacetedFilter target="type" facets={countByKey(cards, 'type')} title="Type" options={types} />
        )}
        {cards.length > 0 && (
          <CardLibraryFacetedFilter target="color" facets={countByKey(cards, 'color')} title="Color" options={colors} />
        )}
        {labels.length > 0 && (
          <CardLibraryFacetedFilter
            target="linked"
            facets={countByKey(cards, 'linked')}
            title="Link"
            options={labels}
          />
        )}
        {tagsNum && (
          <CardLibraryFacetedFilter
            target="tags"
            facets={convertToMap(tagsNum)}
            title="Tag"
            options={tags.map((tag) => ({ label: tag, value: tag, icon: FrameIcon }))}
          />
        )}
        {isFiltered && (
          <Button variant="ghost" onClick={() => locationService.clearQuery()} className="h-8 px-2 lg:px-3">
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <Input
        placeholder="Filter cards..."
        value={(query.text as string) ?? ''}
        onChange={(event) => locationService.setTextQuery(event.target.value)}
        className="h-8 w-[150px] lg:w-[250px] shadow-none active:shadow-none"
      />
      {/*<CardLibraryViewOptions table={table} />*/}
    </div>
  );
}
