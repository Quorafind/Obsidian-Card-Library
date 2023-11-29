import { Card } from '@/components/ui/card';
import React, { useContext, useMemo } from 'react';
import { FileTextIcon, ImageIcon, Link1Icon, ReaderIcon } from '@radix-ui/react-icons';
import { FileType2, FilmIcon, PlusIcon } from 'lucide-react';
import AppContext from '@/stores/appContext';
import { cn } from '@/lib/utils';
import { ActionProps } from '@/components/containers/CardActionButton';
import { cardService, globalService, locationService } from '@/services';
import { CardEditor } from '@/components/containers/CardEditor';
import { Button } from '@/components/ui/button';
import { focusNodeInCanvas } from '@/lib/obsidianUtils';
import { request } from 'obsidian';
import { CardContextMenu } from '@/components/containers/CardContextMenu';
import { FileCard, ImageCard, LinkCard, MediaCard, PdfCard, TextCard } from '@/components/containers/CardComponent';

export interface MouseActionProps {
  handleDoubleClick: () => void;
  handleSingleClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const COLOR_MAP = {
  'color-blank': 'bg-gray-100/30 dark:bg-gray-700/80 dark:border-gray-700/80 dark:text-slate-200',
  'color-1': 'bg-red-100/50 dark:bg-gray-700/80 dark:border-2 dark:border-red-500/80 dark:text-slate-200',
  'color-2': 'bg-orange-100/50 dark:bg-gray-700/80 dark:border-2 dark:border-orange-500/80 dark:text-slate-200',
  'color-3': 'bg-yellow-100/50 dark:bg-gray-700/80 dark:border-2 dark:border-yellow-500/80 dark:text-slate-200',
  'color-4': 'bg-green-100/50 dark:bg-gray-700/80 dark:border-2 dark:border-green-500/80 dark:text-slate-200',
  'color-5': 'bg-cyan-100/50 dark:bg-gray-700/80 dark:border-2 dark:border-cyan-500/80 dark:text-slate-200',
  'color-6': 'bg-violet-100/50  dark:bg-gray-700/80 dark:border-2 dark:border-violet-500/80 dark:text-slate-200',
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

export const ICON_MAP = {
  text: (
    <ReaderIcon className="h-4 w-4 text-gray-300 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer hover:text-accent-foreground" />
  ),
  pdf: (
    <FileType2 className="h-4 w-4 text-gray-300 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer hover:text-accent-foreground" />
  ),
  file: (
    <FileTextIcon className="h-4 w-4 text-gray-300 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer hover:text-accent-foreground" />
  ),
  image: (
    <ImageIcon className="h-4 w-4 text-gray-300 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer hover:text-accent-foreground" />
  ),
  link: (
    <Link1Icon className="h-4 w-4 text-gray-300 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer hover:text-accent-foreground" />
  ),
  media: (
    <FilmIcon className="h-4 w-4 text-gray-300 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer hover:text-accent-foreground" />
  ),
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

  return {
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
};

const cardType = (card: Model.Card, actionProps?: ActionProps, mouseActionProps?: MouseActionProps) => {
  const SpecificCard = CARD_COMPONENT_MAP[card.type];

  return <SpecificCard card={card} actionProps={actionProps} mouseActionProps={mouseActionProps} />;
};

export function CanvasCard(card: Model.Card): React.JSX.Element {
  const {
    globalState: { editCardId, focused },
  } = useContext(AppContext);
  const { type, path, content, id, color } = card;

  const handleEdit = () => {
    globalService.setEditCardId(id);
    if (focused) focusNodeInCanvas(id);
  };

  const handleEditInTab = () => {
    locationService.setPathname('/editor');
    globalService.setSidebarEditCardId(card.id);
  };

  const handleFocusCanvas = () => {
    locationService.setQueryWithType('path', [card.path]);
  };

  const handleCopyCardData = () => {
    globalService.setCopyCardId([card.id]);
    window.document.execCommand('copy');
  };

  const handleCopyCardContent = async () => {
    await navigator.clipboard.writeText(card.content);
  };

  const handlePin = async (pinned: boolean) => {
    pinned ? await cardService.pinCardById(id) : await cardService.unpinCardById(id);
  };

  const handleDelete = async () => {
    await cardService.deleteMemoById(id);
  };

  const handleArchive = async () => {
    await cardService.archiveCard(card);
  };

  const handleSource = async () => {
    await cardService.revealCard(card);
  };

  const handleDuplicate = async () => {
    await cardService.duplicateCard(card);
  };

  const handleDoubleClick = async () => {
    handleEdit();
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
      console.log('metaKey');
      await handleSource();
    } else if (event.shiftKey) {
      await handleDuplicate();
    } else if (event.altKey) {
      await handleArchive();
    }
  };

  const handleChangeColor = async (color: string) => {
    const targetCard = await cardService.patchCardViaID(card.id, {
      color: color.replace('color-', '').replace('default', ''),
    });
    await cardService.editCard(targetCard);
  };

  const actionProps = useMemo(() => {
    return {
      handleEdit,
      handlePin,
      handleDelete,
      handleArchive,
      handleSource,
      handleDuplicate,
      handleChangeColor,
      handleEditInTab,
      handleFocusCanvas,
      handleCopyCardData,
      handleCopyCardContent,
    };
  }, [card]);

  const mouseActionProps = useMemo(() => {
    return {
      handleDoubleClick,
      handleSingleClick,
    };
  }, [card]);

  return (
    <>
      <CardContextMenu card={card} {...mouseActionProps} {...actionProps}>
        <Card
          className={cn(`cl-card`, `w-full max-w-full h-fit flex flex-col justify-center`, `${switchColor(color)}`)}
          data-card-path={type === 'text' ? path : content}
          data-card-type={type}
          data-card-id={id}
        >
          {editCardId === id ? (
            <CardEditor
              {...card}
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
                  switch (type) {
                    case 'text':
                      card = await cardService.patchCardViaID(id, { content });
                      break;
                    case 'file':
                      card = await cardService.patchFileCard(id, { content });
                  }
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
            cardType(card, actionProps, mouseActionProps)
          )}
        </Card>
      </CardContextMenu>
    </>
  );
}
