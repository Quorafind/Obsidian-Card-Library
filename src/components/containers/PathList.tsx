import { useContext, useEffect, useState } from 'react';
import AppContext from '@/stores/appContext';
import React from 'react';
import { HoverCard, HoverCardContent, HoverCardPortal, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { FocusIcon, Layers2, LayoutDashboardIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cardService, locationService } from '@/services';

export function PathList({ card }: { card: Model.Card }) {
  const {
    cardState: { cards },
  } = useContext(AppContext);
  const [pathList, setPathList] = useState<string[]>([]);
  const [pathMap, setPathMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!card.content || !card.content.trim()) return;

    const sameContentCards = cards.filter((c) => c.content === card.content);
    const pathPairList = sameContentCards.map((c) => {
      return {
        path: c.path,
        id: c.id,
      };
    });
    const pathSet: Set<string> = new Set();
    const pathMap: Map<string, string> = new Map();
    for (const pair of pathPairList) {
      if (pathSet.has(pair.path)) continue;
      pathSet.add(pair.path);
      pathMap.set(pair.path, pair.id);
    }
    setPathList(Array.from(pathSet));
    setPathMap(pathMap);
  }, [cards]);

  return (
    <>
      {pathList && pathList.length > 1 && (
        <HoverCard openDelay={0} closeDelay={200}>
          <HoverCardTrigger>
            <Button variant={'ghost'} size={'icon'} className="h-8 w-8 mr-[-0.5rem]">
              <Layers2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent className="flex flex-col gap-2 border-muted-foreground/40 ">
              <div className="flex flex-row items-center w-full gap-4">
                <LayoutDashboardIcon className="h-4 w-4 text-muted-foreground" />
                <Label className="text-md">Canvas</Label>
              </div>

              <div className="flex flex-col w-full gap-2">
                {pathList.map((path, index) => {
                  return (
                    <div className="flex flex-row w-full gap-2">
                      <Button
                        className="w-full p-2 overflow-hidden text-ellipsis whitespace-nowrap dark:bg-slate-800"
                        variant={'outline'}
                        size={'default'}
                        key={index}
                        onClick={async () => {
                          locationService.setQueryWithType('path', [path]);
                        }}
                      >
                        {path.replace('.canvas', '')}
                      </Button>
                      <Button className={'dark:bg-slate-800'} size={'icon'} variant={'outline'}>
                        <FocusIcon
                          className="h-5 w-5 text-muted-foreground"
                          onClick={async () => {
                            const id = pathMap.get(path);
                            const card = cards.find((c) => c.id === id);
                            if (!card) return;
                            await cardService.revealCard(card);
                          }}
                        />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCard>
      )}
    </>
  );
}
