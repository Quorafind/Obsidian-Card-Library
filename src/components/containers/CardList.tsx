import React, { useContext, useEffect, useRef, useState } from 'react';
import AppContext from '@/stores/appContext';
import { CCard } from '@/components/containers/CCard';
import useStateRef from '@/hooks/useStateRef';
import { debounce, Notice } from 'obsidian';
import '@/less/card-list.less';
import { cn, isMobileView, queryIsEmptyOrBlank } from '@/lib/utils';
import { globalService, queryService } from '@/services';
import { FIRST_TAG_REG, NOP_FIRST_TAG_REG, TAG_REG } from '@/lib/consts';
import Masonry from 'react-masonry-css';

function createFakeCard(path: string) {
  return {
    id: 'fake',
    content: '',
    path: path,
    type: 'text' as CardSpecType,
  };
}

const shouldShowedCards = ({ temp, query }: { temp: Model.Card[]; query: Query }) => {
  const cards = temp.filter((card) => {
    return !(card.rowStatus === 'ARCHIVED') && !(card.deletedAt !== '' && card.deletedAt);
  });
  const { tags, color, linked, path, type, text: textQuery, filter: queryId } = query;
  const queryFilter = queryService.getQueryById(queryId);
  const isFiltered = !queryIsEmptyOrBlank(query);

  if (!isFiltered) return cards;

  return cards.filter((card) => {
    let shouldShow = true;

    if (queryFilter) {
      const filters = JSON.parse(queryFilter.querystring) as Filter[];
      if (Array.isArray(filters)) {
        shouldShow = queryService.checkInFilters(card, filters);
      }
    }

    if (tags && tags.length > 0) {
      const tagsSet = new Set<string>();
      for (const t of Array.from(card.content.match(TAG_REG) ?? [])) {
        const tag = t.replace(TAG_REG, '$1').trim();
        const items = tag.split('/');
        let temp = '';
        for (const i of items) {
          temp += i;
          tagsSet.add(temp);
          temp += '/';
        }
      }
      for (const t of Array.from(card.content.match(NOP_FIRST_TAG_REG) ?? [])) {
        const tag = t.replace(NOP_FIRST_TAG_REG, '$1').trim();
        const items = tag.split('/');
        let temp = '';
        for (const i of items) {
          temp += i;
          tagsSet.add(temp);
          temp += '/';
        }
      }
      for (const t of Array.from(card.content.match(FIRST_TAG_REG) ?? [])) {
        const tag = t.replace(FIRST_TAG_REG, '$2').trim();
        const items = tag.split('/');
        let temp = '';
        for (const i of items) {
          temp += i;
          tagsSet.add(temp);
          temp += '/';
        }
      }
      if (tags.length > 0) {
        if (!tags.some((tag) => tagsSet.has(tag))) {
          shouldShow = false;
        }
      }
    }

    if (color && color.length > 0) {
      if (!color.includes(card.color)) {
        shouldShow = false;
      }
    }
    if (type && type.length > 0) {
      if (!type.includes(card.type)) {
        shouldShow = false;
      }
    }

    if (linked && linked.length > 0) {
      if (!linked.includes(card.linked)) {
        shouldShow = false;
      }
    }

    if (path && path.length > 0) {
      if (!path.includes(card.path)) {
        shouldShow = false;
      }
    }

    if (textQuery && !card.content.includes(textQuery)) {
      shouldShow = false;
    }

    return shouldShow;
  });
};

function sortCards(arr: Model.Card[]): Model.Card[] {
  const pinnedObjects = arr.filter((obj) => obj.pinned);
  const otherObjects = arr.filter((obj) => !obj.pinned);

  return [...pinnedObjects, ...otherObjects];
}

export default function CardList(): React.JSX.Element {
  const {
    locationState: { query },
    cardState: { cards },
    globalState: { viewStatus, settings },
  } = useContext(AppContext);

  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [cache, setCache, cacheRef] = useStateRef<Model.Card[]>([]);
  const [temp, setTemp] = useState<Model.Card[]>([]);
  const [shown, setShown, shownRef] = useStateRef<Model.Card[]>([]);
  const [view, setView] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');

  const refreshCountRef = useRef(0);
  const throttledRef = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const wrapperElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewStatus) return;
    setView(viewStatus as 'sm' | 'md' | 'lg' | 'xl');
  }, [viewStatus]);

  useEffect(() => {
    if (cards.length === 0) return;
    setIsFetching(false);

    const pinned = sortCards(cards);
    const filtered = shouldShowedCards({
      temp: pinned,
      query,
    });

    if (query.path && query.path.length === 1) filtered.unshift(createFakeCard(query.path[0] as string));

    if (!queryIsEmptyOrBlank(query)) {
      globalService.setCopyCardId(filtered.length > 0 ? filtered.map((card) => card.id) : []);
    }

    setShown(filtered);
  }, [cards, query]);

  useEffect(() => {
    setCache(shown.slice(0, cache.length > 20 ? Math.min(cache.length, 40) : 40));
  }, [shown]);

  useEffect(() => {
    if (cache.length < 40) {
      moreRef.current?.click();
    }
  }, [shown]);

  useEffect(() => {
    if (
      (queryIsEmptyOrBlank(query) && cache.length < shown.length) ||
      (cache.length < shown.length && !queryIsEmptyOrBlank(query))
    ) {
      setIsComplete(false);
    }
    if (
      (queryIsEmptyOrBlank(query) && cache.length === cards.length && cards.length > 0) ||
      (!queryIsEmptyOrBlank(query) && cache.length === shown.length && shown.length > 0)
    ) {
      setIsComplete(true);
    }
    setTemp(cache);
  }, [cache]);

  useEffect(() => {
    if (!statusRef.current) return;
    const throttledFetch = async () => {
      if (throttledRef.current) return;
      refreshCountRef.current++;
      await handleFetchMoreClick();
      if (refreshCountRef.current >= 4) {
        throttledRef.current = true;
        setTimeout(() => {
          refreshCountRef.current = 0;
          throttledRef.current = false;
        }, 5000);
      }
    };

    if (cache.length < 40) {
      throttledFetch();
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (isComplete) {
          return;
        }
        throttledFetch();
      } else {
        refreshCountRef.current = 0;
        throttledRef.current = false;
      }
    });
    if (statusRef?.current) {
      observer.observe(statusRef.current);
    }
    return () => {
      if (statusRef?.current) {
        observer.unobserve(statusRef.current);
      }
    };
  }, [isFetching, isComplete, statusRef]);

  useEffect(() => {
    wrapperElement.current?.scrollTo({ top: 0 });
  }, []);

  const handleFetchMoreClick = async () => {
    try {
      if (shownRef.current.length > cacheRef.current.length) {
        setIsFetching(true);
        const fetchCount = Math.min(cacheRef.current.length + 40, shownRef.current.length) - cacheRef.current.length;
        const fetchedMemos = shownRef.current.slice(cacheRef.current.length, cacheRef.current.length + fetchCount);

        setCache((prevCachedMemos) => [...prevCachedMemos, ...fetchedMemos]);
        setIsFetching(false);
        setIsComplete(fetchedMemos.length < 40);
      }
    } catch (error: any) {
      console.error(error);
      new Notice(error.response.data.message);
    }
  };

  return (
    <div ref={wrapperElement} className="w-full flex flex-col overflow-y-scroll">
      <div className={cn('card-list-container')}>
        <Masonry
          breakpointCols={view === 'sm' ? 1 : view === 'md' ? 2 : view === 'lg' ? 3 : 5}
          className={cn(
            isMobileView(viewStatus) ? 'mobile-list-view' : '',
            `flex w-full max-w-full gap-2`,
            settings.theme.listStyle === 'grid' ? 'grid-card-list' : 'masonry-card-list',
            settings.theme.actionHeaderInGrid ? 'grid-card-action-header' : '',
            query.path && query.path.length === 1 ? 'show-new-card-button' : '',
          )}
          columnClassName="masonry-cardlist-grid_column flex flex-col gap-2"
        >
          {temp.map((card, index) => {
            return <CCard {...card} key={index} />;
          })}
        </Masonry>
      </div>

      <div ref={statusRef} className="status-text-container py-4">
        <p className="status-text">
          {isFetching ? (
            'Fetching data...'
          ) : isComplete ? (
            shown.length === 0 ? (
              'Noooop!'
            ) : (
              'All Data is Loaded 🎉'
            )
          ) : (
            <>
              <span
                ref={moreRef}
                className="cursor-pointer hover:text-green-600"
                onClick={() => debounce(handleFetchMoreClick, 3000)}
              >
                {'fetch more'}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
