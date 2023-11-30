import useHover from '@/hooks/useHover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PinIcon, PinOffIcon } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import { ActionProps, CardActionButton } from '@/components/containers/CardActionButton';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipPortal, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { globalService } from '@/services';
import { PathList } from '@/components/containers/PathList';
import appContext from '@/stores/appContext';
import AppContext from '@/stores/appContext';
import useMarkdownRenderer from '@/hooks/useMarkdownRenderer';
import { readFileContent } from '@/lib/obsidianUtils';
import { CollapseCardContent } from '@/components/containers/CardContent';
import { ICON_MAP, MouseActionProps } from '@/components/containers/CanvasCard';

function getPin(card: Model.Card, handlePin?: (pinned: boolean) => void) {
  const [hoveredElement] = useHover((hovering) => {
    return (
      <Button
        onClick={() => handlePin(!card.pinned)}
        variant="ghost"
        className={cn('shadow-none flex h-8 w-8 mr-[-0.5rem] p-0 hover:bg-opacity-50', 'pin-button')}
        size="icon"
      >
        {hovering && card.pinned ? (
          <PinOffIcon className="h-4 w-4 text-gray-200 hover:text-muted-foreground dark:text-slate-500 dark:hover:text-slate-300" />
        ) : (
          <PinIcon className={cn('h-4 w-4', card.pinned || hovering ? 'text-muted-foreground' : 'text-transparent')} />
        )}
      </Button>
    );
  });

  return hoveredElement;
}

export function CardActionHeader({
  icon,
  card,
  title,
  funcProps,
  children,
}: {
  icon: React.ReactNode;
  card: Model.Card;
  funcProps?: ActionProps;
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <CardHeader
      className={cn(
        'card-header w-full max-w-full flex flex-row items-center justify-between space-y-0 pb-1 pt-2',
        children ? 'pt-2 px-2 border-b dark:border-slate-600' : '',
      )}
    >
      <TooltipProvider>
        <div
          className="flex flex-row justify-center items-center"
          draggable={true}
          onDragStart={(event) => {
            event.dataTransfer.setData('text/plain', card.content);
          }}
        >
          {children ?? ''}

          <Tooltip>
            <TooltipTrigger className="shadow-none">
              <Button
                size={'icon'}
                variant={'blank'}
                className={'h-8 w-8 ml-[-0.5rem]'}
                onClick={async (event) => {
                  if (event.ctrlKey || event.metaKey) {
                    funcProps.handleCopyCardData?.();
                  } else {
                    await funcProps.handleCopyCardContent?.();
                  }
                }}
              >
                {icon}
              </Button>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent className="flex flex-col items-center dark:bg-slate-700 dark:text-muted-foreground">
                <p>Click to copy Content to clipboard</p>
                <p>⌘ + click to copy card</p>
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </div>
        <Tooltip>
          <TooltipTrigger className="shadow-none" asChild>
            <CardTitle className="max-w-[10rem] overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap text-gray-400 dark:text-slate-500 dark:hover:text-slate-300">
              {title}
            </CardTitle>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent className="flex flex-col items-center dark:bg-slate-700 dark:text-muted-foreground">
              <p>{title}</p>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
      <div className="flex flex-row items-center gap-1">
        {getPin(card, funcProps.handlePin)}
        {<PathList card={card} />}
        {funcProps && !children && <CardActionButton {...funcProps} {...card} />}
      </div>
    </CardHeader>
  );
}

export function TextCard({
  card,
  actionProps,
  mouseActionProps,
}: {
  card: Model.Card;
  actionProps: ActionProps;
  mouseActionProps: MouseActionProps;
}): React.JSX.Element {
  const { content, path, type } = card;
  return (
    <>
      <CardActionHeader icon={ICON_MAP[card.type]} card={card} funcProps={actionProps}></CardActionHeader>
      <CollapseCardContent content={content} path={path} mouseActionProps={mouseActionProps} />
    </>
  );
}

export function FileCard({
  card,
  actionProps,
  mouseActionProps,
}: {
  card: Model.Card;
  actionProps: ActionProps;
  mouseActionProps: MouseActionProps;
}): React.JSX.Element {
  const {
    globalState: { app },
  } = useContext(AppContext);
  const { content: path, type } = card;
  const [content, setContent] = useState('');

  useEffect(() => {
    const loadAndRenderContent = async () => {
      try {
        const temp = await readFileContent(app, path);
        setContent(temp);
      } catch (error) {
        console.error('Error loading markdown content:', error);
      }
    };

    loadAndRenderContent();

    return () => {
      setContent('');
    };
  }, [path]);

  return (
    <>
      <CardActionHeader
        icon={ICON_MAP[card.type]}
        card={card}
        funcProps={actionProps}
        title={path.split('/').pop()}
      ></CardActionHeader>
      <CollapseCardContent content={content} path={path} mouseActionProps={mouseActionProps} />
    </>
  );
}

export function ImageCard({ card, actionProps }: { card: Model.Card; actionProps: ActionProps }): React.JSX.Element {
  const { content, path, type } = card;
  const {
    globalState: { app, view },
  } = useContext(appContext);

  const { render, ref } = useMarkdownRenderer(app, view);

  useEffect(() => {
    if (!ref.current) return;
    render(path, `![[${content}]]`);
  }, [content]);

  return (
    <>
      <CardActionHeader
        icon={ICON_MAP[card.type]}
        card={card}
        funcProps={actionProps}
        title={content.split('/').pop()}
      ></CardActionHeader>
      <CardContent>
        <div ref={ref} className="overflow-y-auto text-xs text-muted-foreground">
          {content}
        </div>
      </CardContent>
    </>
  );
}

export function PdfCard({ card, actionProps }: { card: Model.Card; actionProps: ActionProps }): React.JSX.Element {
  const { content } = card;

  return (
    <>
      <CardActionHeader
        icon={ICON_MAP[card.type]}
        card={card}
        funcProps={actionProps}
        title={content.split('/').pop()}
      ></CardActionHeader>
      <CardContent>
        <div className="overflow-y-auto text-xs text-muted-foreground">{content}</div>
      </CardContent>
    </>
  );
}

export function MediaCard({ card, actionProps }: { card: Model.Card; actionProps: ActionProps }): React.JSX.Element {
  const { content, path, type } = card;
  const {
    globalState: { app, view },
  } = useContext(appContext);

  const { render, ref } = useMarkdownRenderer(app, view);

  useEffect(() => {
    if (!ref.current) return;
    render(path, `![[${content}]]`);
  }, [content]);

  return (
    <>
      <CardActionHeader
        icon={ICON_MAP[card.type]}
        card={card}
        funcProps={actionProps}
        title={content.split('/').pop()}
      ></CardActionHeader>
      <CardContent>
        <div ref={ref} className="overflow-y-auto text-xs text-muted-foreground">
          {content}
        </div>
      </CardContent>
    </>
  );
}

export function LinkCard({ card, actionProps }: { card: Model.Card; actionProps: ActionProps }): React.JSX.Element {
  const { content } = card;

  return (
    <>
      <CardActionHeader
        icon={ICON_MAP[card.type]}
        card={card}
        funcProps={actionProps}
        title={'Web Link'}
      ></CardActionHeader>
      <CardContent>
        <div className="flex justify-center items-center overflow-y-auto text-xs text-muted-foreground">
          <Button
            size={'default'}
            variant={'outline'}
            className={cn('flex justify-center items-center', 'w-full h-full')}
            onClick={() => {
              window.open(content);
            }}
          >
            <div className="text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">{content}</div>
          </Button>
        </div>
      </CardContent>
    </>
  );
}
