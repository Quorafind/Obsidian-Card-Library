import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useContext, useEffect, useMemo } from 'react';
import { ImageIcon, Link1Icon, FileTextIcon, ReaderIcon } from '@radix-ui/react-icons';
import { FileType2, FilmIcon, PinIcon, PinOffIcon } from 'lucide-react';
import AppContext from '@/stores/appContext';
import { MarkdownRenderer, normalizePath } from 'obsidian';
import { VIEW_TYPE } from '@/cardLibraryIndex';
import { cn } from '@/lib/utils';
import { ActionProps, CardAction } from '@/components/containers/CardAction';
import { cardService, globalService } from '@/services';
import { CardEditor } from '@/components/containers/CardEditor';
import { Button } from '@/components/ui/button';
import useHover from '@/hooks/useHover';

interface MouseActionProps {
  handleDoubleClick: () => void;
  handleSingleClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

function switchColor(color: string) {
  switch (color) {
    case 'color-1':
      return 'bg-red-100/30';
    case 'color-2':
      return 'bg-orange-100/30';
    case 'color-3':
      return 'bg-yellow-100/30';
    case 'color-4':
      return 'bg-green-100/30';
    case 'color-5':
      return 'bg-cyan-100/30';
    case 'color-6':
      return 'bg-violet-100/30';
    default:
      return 'bg-gray-100/30';
  }
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
  text: <ReaderIcon className="h-4 w-4 text-muted-foreground" />,
  pdf: <FileType2 className="h-4 w-4 text-muted-foreground" />,
  file: <FileTextIcon className="h-4 w-4 text-muted-foreground" />,
  image: <ImageIcon className="h-4 w-4 text-muted-foreground" />,
  link: <Link1Icon className="h-4 w-4 text-muted-foreground" />,
  media: <FilmIcon className="h-4 w-4 text-muted-foreground" />,
};

function getPin(card: Model.Card, handlePin?: (pinned: boolean) => void) {
  const [hoveredElement, isHovered] = useHover((hovering) => {
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
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
      {icon}
      <CardTitle className="max-w-[10rem] overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap">
        {title}
      </CardTitle>
      <div className="flex flex-row items-center gap-2">
        {getPin(card, funcProps.handlePin)}
        <CardAction {...funcProps} {...card} />
      </div>
    </CardHeader>
  );
}

export function CardComponent(props: Model.Card): React.JSX.Element {
  const {
    globalState: { editCardId },
  } = useContext(AppContext);
  const { type, path, content, id, color } = props;

  const handleEdit = async () => {
    globalService.setEditCardId(id);
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
    cardService.revealCard(props);
  };

  const handleCopy = async () => {
    await cardService.duplicateCard(props);
  };

  const handleDoubleClick = async () => {
    await handleEdit();
  };

  const handleSingleClick = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.metaKey || event.ctrlKey) {
      await handleSource();
    } else if (event.shiftKey) {
      await handleCopy();
    } else if (event.altKey) {
      await handleArchive();
    }
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
        className={cn(`cl-card`, `w-full h-72`, `${switchColor(color)}`)}
        data-card-path={type === 'text' ? path : content}
        data-card-type={type}
        data-card-id={id}
      >
        {editCardId === id ? (
          <CardEditor
            {...props}
            onSubmit={async (content) => {
              const card = await cardService.patchCardViaID(id, { content: content });
              globalService.setEditCardId('');
              await cardService.editCard(card);
            }}
          />
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
  const { content } = card;

  return (
    <>
      <CardActionHeader icon={ICON_MAP[card.type]} card={card} funcProps={actionProps}></CardActionHeader>
      <CardContent
        className="h-[calc(100%_-_4rem)] overflow-y-auto"
        onClick={mouseActionProps.handleSingleClick}
        onDoubleClick={mouseActionProps.handleDoubleClick}
      >
        <div className="overflow-y-auto text-xs text-muted-foreground text-ellipsis">{content}</div>
      </CardContent>
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

export function FileCard({
  card,
  actionProps,
  mouseActionProps,
}: {
  card: Model.Card;
  actionProps: ActionProps;
  mouseActionProps: MouseActionProps;
}): React.JSX.Element {
  const { content: path } = card;
  const {
    globalState: { app, view },
  } = useContext(AppContext);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [targetPath, setTargetPath] = React.useState<string>('');

  useEffect(() => {
    if (!contentRef.current || (contentRef.current.hasChildNodes() && targetPath === path)) return;
    if (!view || !app) return;

    async function renderMarkdown() {
      if (!path) return;

      let target = `![[${path}]]`;
      switch (path.split('.').pop()) {
        case 'canvas':
          break;
        case 'md':
          if (path.endsWith('excalidraw.md')) {
            break;
          } else {
            const temp = await app.vault.adapter.read(normalizePath(path));
            target = temp;
          }
          break;
        default:
          break;
      }

      try {
        setTargetPath(path);
      } catch (e) {
        console.log(e);
      }

      if (contentRef.current.hasChildNodes()) contentRef.current.empty();

      await MarkdownRenderer.render(app, target, contentRef.current, path, view);

      contentRef.current?.toggleClass(['markdown-rendered'], true);

      const embeds = contentRef.current?.querySelectorAll('.internal-link');
      embeds?.forEach((embed) => {
        const el = embed as HTMLAnchorElement;
        const href = el.getAttribute('data-href');
        if (!href) return;

        const destination = app.metadataCache.getFirstLinkpathDest(href, path);
        if (!destination) embed.classList.add('is-unresolved');

        el.addEventListener('mouseover', (e) => {
          e.stopPropagation();
          app.workspace.trigger('hover-link', {
            event: e,
            source: VIEW_TYPE,
            hoverParent: view.containerEl,
            targetEl: el,
            linktext: href,
            sourcePath: el.href,
          });
        });
      });
    }
    renderMarkdown();
    return () => {
      contentRef.current?.empty();
    };
  }, [path, view, app]);

  return (
    <>
      <CardActionHeader
        icon={ICON_MAP[card.type]}
        card={card}
        funcProps={actionProps}
        title={path.split('/').pop()}
      ></CardActionHeader>
      <CardContent
        className="h-[calc(100%_-_4rem)] overflow-y-auto"
        onClick={mouseActionProps.handleSingleClick}
        onDoubleClick={mouseActionProps.handleDoubleClick}
      >
        <div ref={contentRef} className="text-xs text-muted-foreground"></div>
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
        <div className="text-xs text-muted-foreground">{content}</div>
      </CardContent>
    </>
  );
}
