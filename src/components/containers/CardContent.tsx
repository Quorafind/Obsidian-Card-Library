import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import React, { useContext, useEffect, useState } from 'react';
import useMarkdownRenderer from '@/hooks/useMarkdownRenderer';
import AppContext from '@/stores/appContext';
import { CardContent } from '@/components/ui/card';

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
    globalState: { app, view },
  } = useContext(AppContext);

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
      console.log(ref.current.scrollHeight > maxHeight);
      setIsContentTooTall(ref.current.scrollHeight > maxHeight);
    }
  }, [content]);

  return (
    <Collapsible className="relative" defaultOpen={false} open={isCodeExpanded} onOpenChange={setIsCodeExpanded}>
      <CollapsibleContent forceMount={true}>
        <CardContent
          className={cn(
            'h-[calc(100%_-_4rem)] w-full max-w-full overflow-y-auto',
            isContentTooTall ? (!isCodeExpanded ? 'pb-1' : 'pb-16') : '',
            isContentTooTall ? (isCodeExpanded ? 'grid grid-rows-1' : `grid grid-rows-[150px]`) : '',
          )}
          onClick={mouseActionProps.handleSingleClick}
          onDoubleClick={mouseActionProps.handleDoubleClick}
        >
          <div
            ref={ref}
            className={cn('w-full max-w-full text-xs text-muted-foreground text-ellipsis', 'overflow-hidden')}
          ></div>
        </CardContent>
      </CollapsibleContent>
      {isContentTooTall && (
        <div
          className={cn(
            'flex flex-row justify-center items-center absolute left-0 right-0 bottom-0 h-16 overflow-hidden',
            !isCodeExpanded
              ? "before:content-[''] before:pointer-events-none before:absolute before:inset-0 before:rounded-b-xl before:opacity-90 before:bg-gradient-to-b before:from-transparent before:to-gray-100/20 dark:before:to-gray-700"
              : '',
          )}
        >
          <CollapsibleTrigger
            className={cn(
              'p-1 bg-secondary text-secondary-foreground shadow hover:bg-secondary/90 dark:bg-gray-600',
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
