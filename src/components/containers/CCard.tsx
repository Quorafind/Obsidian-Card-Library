import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FileTextIcon, ImageIcon, Link1Icon, PlusCircledIcon, ReaderIcon } from '@radix-ui/react-icons';
import { FileType2, FilmIcon, PinIcon, PinOffIcon, PlusIcon } from 'lucide-react';
import AppContext from '@/stores/appContext';
import { cn } from '@/lib/utils';
import { ActionProps, CardActionButton } from '@/components/containers/CardActionButton';
import { cardService, globalService, locationService } from '@/services';
import { CardEditor } from '@/components/containers/CardEditor';
import { Button } from '@/components/ui/button';
import useHover from '@/hooks/useHover';
import { focusNodeInCanvas, readFileContent } from '@/lib/obsidianUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LinkPreview } from '@dhaiwat10/react-link-preview';
import { request } from 'obsidian';
import { CollapseCardContent } from '@/components/containers/CardContent';

interface MouseActionProps {
  handleDoubleClick: () => void;
  handleSingleClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const COLOR_MAP = {
  'color-1': 'bg-red-100/30 dark:bg-gray-700/80 dark:border-2 dark:border-red-500/80 dark:text-slate-200',
  'color-2': 'bg-orange-100/30 dark:bg-gray-700/80 dark:border-2 dark:border-orange-500/80 dark:text-slate-200',
  'color-3': 'bg-yellow-100/30 dark:bg-gray-700/80 dark:border-2 dark:border-yellow-500/80 dark:text-slate-200',
  'color-4': 'bg-green-100/30 dark:bg-gray-700/80 dark:border-2 dark:border-green-500/80 dark:text-slate-200',
  'color-5': 'bg-cyan-100/30 dark:bg-gray-700/80 dark:border-2 dark:border-cyan-500/80 dark:text-slate-200',
  'color-6': 'bg-violet-100/30  dark:bg-gray-700/80 dark:border-2 dark:border-violet-500/80 dark:text-slate-200',
};

function switchColor(color: string) {
  return COLOR_MAP[color] || 'bg-gray-100/30 dark:bg-gray-700/80 dark:border-gray-700/80 dark:text-slate-200';
}

const CARD_COMPONENT_MAP = {
  text: TextCard,
  pdf: PdfCard,
  file: FileCard,
  image: ImageCard,
  link: LinkCard,
  media: MediaCard,
};

const ICON_MAP = {
  text: <ReaderIcon className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-accent-foreground" />,
  pdf: <FileType2 className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-accent-foreground" />,
  file: <FileTextIcon className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-accent-foreground" />,
  image: <ImageIcon className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-accent-foreground" />,
  link: <Link1Icon className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-accent-foreground" />,
  media: <FilmIcon className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-accent-foreground" />,
};

const customFetcher = async (url: string) => {
  const response = (await request(url)) as any;

  const parser = new DOMParser();
  const doc = parser.parseFromString(response, 'text/html');
  const metas = doc.head.getElementsByTagName('meta');
  const metaInfos = [];

  for (const meta of metas as any) {
    metaInfos.push({
      name: meta.getAttribute('name'),
      content: meta.getAttribute('content'),
      property: meta.getAttribute('property'),
    });
  }

  const metaInfo = {
    title:
      metaInfos.find((i) => {
        return i.name === 'og:title' || i.property === 'og:title';
      })?.content || null,
    description:
      metaInfos.find((i) => {
        return i.name === 'og:description' || i.property === 'og:description';
      })?.content || null,
    image:
      metaInfos.find((i) => {
        return i.name === 'og:image' || i.property === 'og:image';
      })?.content || null,
    siteName: url,
    hostname: url.replace('https://', '').replace('http://', '').split(/[/?#]/)[0],
  };

  console.log(metaInfo);

  return metaInfo;
};

function getPin(card: Model.Card, handlePin?: (pinned: boolean) => void) {
  const [hoveredElement] = useHover((hovering) => {
    return (
      <Button
        onClick={() => handlePin(!card.pinned)}
        variant="ghost"
        className={cn('hover:bg-transparent shadow-none flex h-8 w-8 mr-[-0.5rem] p-0', 'pin-button')}
        size="icon"
      >
        {hovering && card.pinned ? (
          <PinOffIcon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <PinIcon className={cn('h-4 w-4', card.pinned || hovering ? 'text-muted-foreground' : 'text-transparent')} />
        )}
      </Button>
    );
  });

  return hoveredElement;
}

function CardActionHeader({
  icon,
  card,
  title,
  funcProps,
}: {
  icon: React.ReactNode;
  card: Model.Card;
  funcProps: ActionProps;
  title?: string;
}) {
  return (
    <CardHeader className="w-full max-w-full flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="shadow-none">
            <div
              onClick={async () => {
                await navigator.clipboard.writeText(card.content);
              }}
            >
              {icon}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy to clipboard</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <CardTitle className="max-w-[10rem] overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap">
        {title}
      </CardTitle>
      <div className="flex flex-row items-center gap-2">
        {getPin(card, funcProps.handlePin)}
        <CardActionButton {...funcProps} {...card} />
      </div>
    </CardHeader>
  );
}

export function CCard(props: Model.Card): React.JSX.Element {
  const {
    globalState: { editCardId, focused },
  } = useContext(AppContext);
  const { type, path, content, id, color } = props;

  const handleEdit = async () => {
    globalService.setEditCardId(id);
    if (focused) focusNodeInCanvas(id);
  };
  const handlePin = async (pinned: boolean) => {
    pinned ? await cardService.pinCardById(id) : await cardService.unpinCardById(id);
  };

  const handleDelete = async () => {
    await cardService.hideMemoById(id);
  };

  const handleArchive = async () => {
    await cardService.archiveCard(props);
  };

  const handleSource = async () => {
    await cardService.revealCard(props);
  };

  const handleCopy = async () => {
    await cardService.duplicateCard(props);
  };

  const handleDoubleClick = async () => {
    await handleEdit();
  };

  const handleSingleClick = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (focused) focusNodeInCanvas(id);
    if ((event.target as HTMLElement).className === 'tag') {
      const currentQuery = locationService.getState().query;
      const tags = [...(currentQuery.tags || [])] as string[];
      const index = tags.indexOf((event.target as HTMLAnchorElement).href.split('#')[1] as string);
      if (index > -1) {
        tags.splice(index, 1);
      } else {
        tags.push((event.target as HTMLAnchorElement).href.split('#')[1] as string);
      }
      locationService.setQueryWithType('tags', tags);
    }
    if (event.metaKey || event.ctrlKey) {
      await handleSource();
    } else if (event.shiftKey) {
      await handleCopy();
    } else if (event.altKey) {
      await handleArchive();
    }
  };

  const handleChangeColor = async (color: string) => {
    const card = await cardService.patchCardViaID(props.id, {
      color: color.replace('color-', '').replace('default', ''),
    });
    await cardService.editCard(card);
  };

  const cardType = (actionProps?: ActionProps, mouseActionProps?: MouseActionProps) => {
    const SpecificCard = CARD_COMPONENT_MAP[type];
    return <SpecificCard card={props} actionProps={actionProps} mouseActionProps={mouseActionProps} />;
  };

  const actionProps = useMemo(() => {
    return {
      handleEdit,
      handlePin,
      handleDelete,
      handleArchive,
      handleSource,
      handleCopy,
      handleChangeColor,
    };
  }, [props]);

  const mouseActionProps = useMemo(() => {
    return {
      handleDoubleClick,
      handleSingleClick,
    };
  }, [props]);

  return (
    <>
      <Card
        className={cn(`cl-card`, `w-full max-w-full h-fit flex flex-col justify-center`, `${switchColor(color)}`)}
        data-card-path={type === 'text' ? path : content}
        data-card-type={type}
        data-card-id={id}
      >
        {editCardId === id ? (
          <CardEditor
            {...props}
            onSubmit={async (content) => {
              let card: Model.Card;
              if (id === 'fake') {
                card = await cardService.createCard({
                  text: content,
                  type: 'text',
                  path: path,
                });
                cardService.pushCard(card);
              } else {
                card = await cardService.patchCardViaID(id, { content: content });
                await cardService.editCard(card);
              }
              globalService.setEditCardId('');
            }}
          />
        ) : id === 'fake' ? (
          <Button variant={'ghost'} size={'lg'} className="h-20 shadow-none" onClick={handleEdit}>
            <PlusIcon className="h-9 w-9 text-muted-foreground/50 dark:text-slate-500/80" />
          </Button>
        ) : (
          cardType(actionProps, mouseActionProps)
        )}
      </Card>
    </>
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
  const { content, path } = card;
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
  const { content: path } = card;
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
        <div className="overflow-y-auto text-xs text-muted-foreground">
          {/*<LinkPreview url={content} width="100%" />*/}
          <LinkPreview
            className="w-full h-full overflow-y-scroll"
            descriptionLength={20}
            url={content}
            fetcher={customFetcher}
            fallback={<a href={content}></a>}
          />
        </div>
      </CardContent>
    </>
  );
}
