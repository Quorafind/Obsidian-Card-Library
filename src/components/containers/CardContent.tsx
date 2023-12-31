import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import useMarkdownRenderer from '@/hooks/useMarkdownRenderer';
import AppContext from '@/stores/appContext';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MouseActionProps {
  handleDoubleClick: () => void;
  handleSingleClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export function CollapseCardContent({
  path,
  content,
  mouseActionProps,
}: {
  path: string;
  content: string;
  mouseActionProps: MouseActionProps;
}) {
  const {
    globalState: { app, view, settings },
  } = useContext(AppContext);

  const collapsible = useMemo(() => {
    return settings?.theme.listStyle === 'masonry';
  }, [settings?.theme.listStyle]);

  const { render, ref } = useMarkdownRenderer(app, view);
  const [isContentTooTall, setIsContentTooTall] = useState(false);
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const maxHeight = 300;

  useEffect(() => {
    let isMounted = true;

    const loadAndRenderContent = async () => {
      try {
        if (isMounted) {
          await render(path, content);
        }
      } catch (error) {
        console.error('Error loading markdown content:', error);
      }
    };

    loadAndRenderContent();

    return () => {
      isMounted = false;
    };
  }, [path, content, render]);

  useEffect(() => {
    if (ref.current) {
      setIsContentTooTall(ref.current.scrollHeight + 80 > maxHeight);
    }
  }, [content]);

  return (
    <Collapsible
      className={cn('relative', settings.theme.listStyle === 'grid' ? 'h-full' : '')}
      defaultOpen={false}
      open={isCodeExpanded}
      onOpenChange={setIsCodeExpanded}
    >
      <CollapsibleContent className={cn(settings.theme.listStyle === 'grid' ? 'h-full' : '')} forceMount={true}>
        <CardContent
          className={cn(
            'w-full max-w-full overflow-y-auto',
            settings.theme.listStyle === 'grid' ? 'h-full' : 'h-[calc(100%_-_4rem)]',
            collapsible && isContentTooTall ? (collapsible && !isCodeExpanded ? 'pb-1' : 'pb-16') : '',
            collapsible && isContentTooTall
              ? collapsible && isCodeExpanded
                ? 'grid grid-rows-1'
                : `grid grid-rows-[150px]`
              : '',
          )}
          onClick={mouseActionProps.handleSingleClick}
          onDoubleClick={mouseActionProps.handleDoubleClick}
        >
          {content.trim().length === 0 ? (
            <div className={cn('w-full max-w-full text-xs text-accent-foreground text-ellipsis', 'overflow-hidden')}>
              <Button variant="outline" className="w-full h-full" onClick={mouseActionProps.handleDoubleClick}>
                Add content
              </Button>
            </div>
          ) : (
            <div
              ref={ref}
              className={cn('w-full max-w-full text-xs text-accent-foreground text-ellipsis', 'overflow-hidden')}
            ></div>
          )}
        </CardContent>
      </CollapsibleContent>
      {collapsible && isContentTooTall && (
        <div
          className={cn(
            'flex flex-row justify-center items-center absolute left-0 right-0 bottom-0 h-16 overflow-hidden',
            !isCodeExpanded ? 'content-collapsed' : '',
          )}
        >
          <CollapsibleTrigger
            className={cn(
              'z-30 p-1 bg-secondary text-secondary-foreground shadow hover:bg-secondary/90 dark:bg-gray-600',
              isCodeExpanded
                ? 'pointer-events-auto text-muted-foreground/50 bg-secondary/20 hover:bg-secondary/90 hover:text-muted-foreground dark:hover:text-slate-50'
                : '',
            )}
            onClick={() => setIsCodeExpanded(!isCodeExpanded)}
          >
            {isCodeExpanded ? 'Collapse' : 'Expand'}
          </CollapsibleTrigger>
        </div>
      )}
    </Collapsible>
  );
}
