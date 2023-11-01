import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useContext, useEffect } from 'react';
import { ImageIcon, Link1Icon, FileTextIcon, ReaderIcon } from '@radix-ui/react-icons';
import { FileType2, FilmIcon } from 'lucide-react';
import AppContext from '@/stores/appContext';
import { MarkdownRenderer, normalizePath } from 'obsidian';
import { VIEW_TYPE } from '@/cardLibraryIndex';
import { cn } from '@/lib/utils';
import { ActionProps, CardAction } from '@/components/containers/CardAction';
import { cardService, globalService } from '@/services';
import { CardEditor } from '@/components/containers/CardEditor';

function switchColor(color: string) {
  switch (color) {
    case 'color-1':
      return 'bg-red-100/70';
    case 'color-2':
      return 'bg-orange-100/70';
    case 'color-3':
      return 'bg-yellow-100/70';
    case 'color-4':
      return 'bg-green-100/70';
    case 'color-5':
      return 'bg-cyan-100/70';
    case 'color-6':
      return 'bg-violet-100/70';
    default:
      return 'bg-gray-100/70';
  }
}

export function CardComponent(props: Model.Card): React.JSX.Element {
  const {
    globalState: { editCardId },
  } = useContext(AppContext);
  const { type, path, content, id, color } = props;

  useEffect(() => {
    console.log(editCardId, editCardId === id, id);
  }, [editCardId]);

  const cardType = (actionProps?: ActionProps) => {
    switch (type) {
      case 'text':
        return <TextCard card={props} actionProps={actionProps} />;
      case 'pdf':
        return <PdfCard card={props} actionProps={actionProps} />;
      case 'file':
        return <FileCard card={props} actionProps={actionProps} />;
      case 'image':
        return <ImageCard card={props} actionProps={actionProps} />;
      case 'link':
        return <LinkCard card={props} actionProps={actionProps} />;
      case 'media':
        return <MediaCard card={props} actionProps={actionProps} />;
    }
  };

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

  const actionProps = {
    handleEdit,
    handlePin,
    handleDelete,
    handleArchive,
    handleSource,
    handleCopy,
  };

  return (
    <>
      <Card
        className={cn(`w-full h-72`, `${switchColor(color)}`)}
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
          cardType(actionProps)
        )}
      </Card>
    </>
  );
}

export function TextCard({ card, actionProps }: { card: Model.Card; actionProps: ActionProps }): React.JSX.Element {
  const { content } = card;

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <ReaderIcon className="h-4 w-4 text-muted-foreground" />
        {/*<CardTitle className="text-sm font-medium">Active Now</CardTitle>*/}
        <CardAction {...actionProps} {...card} />
      </CardHeader>
      <CardContent className="h-[calc(100%_-_4rem)] overflow-y-auto">
        <div className="overflow-y-auto text-xs text-muted-foreground text-ellipsis">{content}</div>
      </CardContent>
    </>
  );
}

export function ImageCard({ card, actionProps }: { card: Model.Card; actionProps: ActionProps }): React.JSX.Element {
  const { content } = card;

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="max-w-[10rem] overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap">
          {content.split('/').pop()}
        </CardTitle>
        <CardAction {...actionProps} {...card} />
      </CardHeader>
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <FileType2 className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="max-w-[10rem] overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap">
          {content.split('/').pop()}
        </CardTitle>
        <CardAction {...actionProps} {...card} />
      </CardHeader>
      <CardContent>
        <div className="overflow-y-auto text-xs text-muted-foreground">{content}</div>
      </CardContent>
    </>
  );
}

export function FileCard({ card, actionProps }: { card: Model.Card; actionProps: ActionProps }): React.JSX.Element {
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <FileTextIcon className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="max-w-[10rem] overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap">
          {path.split('/').pop()}
        </CardTitle>
        <CardAction {...actionProps} {...card} />
      </CardHeader>
      <CardContent className="h-[calc(100%_-_4rem)] overflow-y-auto">
        <div ref={contentRef} className="text-xs text-muted-foreground"></div>
      </CardContent>
    </>
  );
}

export function MediaCard({ card, actionProps }: { card: Model.Card; actionProps: ActionProps }): React.JSX.Element {
  const { content } = card;

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <FilmIcon className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="max-w-[10rem] overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap">
          {content.split('/').pop()}
        </CardTitle>
        <CardAction {...actionProps} {...card} />
      </CardHeader>
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
        <Link1Icon className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="max-w-[10rem] text-sm font-medium">Website</CardTitle>
        <CardAction {...actionProps} {...card} />
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">{content}</div>
      </CardContent>
    </>
  );
}
