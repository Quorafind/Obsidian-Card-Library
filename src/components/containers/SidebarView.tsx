import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import appContext from '@/stores/appContext';
import useEditorInstance from '@/hooks/useEditorInstance';
import { cardService, globalService, locationService } from '@/services';
import { Button } from '@/components/ui/button';
import { HomeIcon } from 'lucide-react';
import { debounce } from 'obsidian';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import useMarkdownRenderer from '@/hooks/useMarkdownRenderer';
import { CardActionHeader, CCard, ICON_MAP } from '@/components/containers/CCard';
import Masonry from 'react-masonry-css';
import { readFileContent } from '@/lib/obsidianUtils';

function SidebarEditor({ id, content, type }: { id: string; content: string; type: string }) {
  const {
    globalState: { app },
  } = useContext(appContext);

  const editorRef = useRef<HTMLDivElement>(null);
  const sidebarEditCardIdRef = useRef(id);
  const [temp, setTemp] = useState(content);

  useEffect(() => {
    sidebarEditCardIdRef.current = id;
  }, [id]);

  const onContentChange = debounce(
    async (content: string) => {
      switch (type) {
        case 'text':
          await cardService.patchCardViaID(sidebarEditCardIdRef.current, { content });
          break;
        case 'file':
          await cardService.patchFileCard(sidebarEditCardIdRef.current, { content });
      }
    },
    1500,
    true,
  );

  const handleContentChange = useCallback(onContentChange, [id]);

  const { instance, set, focus } = useEditorInstance(editorRef.current, handleContentChange);

  useEffect(() => {
    const loadContent = async () => {
      if (type === 'file' && app) {
        const tempContent = await readFileContent(app, content);
        setTemp(tempContent);
      } else {
        setTemp(content);
      }
    };

    loadContent();
  }, [content, type, app]);

  useEffect(() => {
    if (!id || !instance) return;

    console.log(temp);
    set(temp);
    focus();
  }, [temp, instance]);

  return <div className="h-full min-h-[250px] p-1 rounded-sm mod-cm6" ref={editorRef}></div>;
}

const renderCardSection = ({
  cardType,
  title,
  linkedCard,
  outLinkedCard,
}: {
  cardType: 'inLink' | 'outLink';
  title: string;
  linkedCard: Model.Card[];
  outLinkedCard: Model.Card[];
}) => {
  if (!linkedCard || linkedCard.length === 0) return null;

  const paddingTopClass = cardType === 'outLink' && outLinkedCard?.length > 0 ? 'pt-0' : '';

  return (
    <>
      <CardHeader className={`px-2 ${paddingTopClass}`}>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-2 w-full h-fit">
        <div className={cn('card-list-container', 'p-0')}>
          <Masonry
            breakpointCols={1}
            className={cn(`flex w-full max-w-full gap-2`)}
            columnClassName="masonry-cardlist-grid_column flex flex-col gap-2"
          >
            {linkedCard.map((card, index) => (
              <CCard {...card} key={index} />
            ))}
          </Masonry>
        </div>
      </CardContent>
    </>
  );
};

function SidebarContent({ content, path }: { content: string; path: string }) {
  const {
    globalState: { app, view },
  } = useContext(appContext);

  const { render, ref } = useMarkdownRenderer(app, view);

  useEffect(() => {
    if (!ref.current) return;
    render(path, `![[${content}]]`);
  }, [content]);

  return <div className="h-full w-full" ref={ref}></div>;
}

function SidebarCardFooter({ id, path }: { id: string; path: string }) {
  const {
    cardState: { cards },
  } = useContext(appContext);
  const [inLinkedCard, setInLinkedCard] = useState<Model.Card[]>([]);
  const [outLinkedCard, setOutLinkedCard] = useState<Model.Card[]>([]);

  useEffect(() => {
    getLinkedCard();
  }, [path, id, cards]);

  const getLinkedCard = useCallback(async () => {
    if (!path) return;
    const { inLinked, outLinked } = await cardService.getLinkedCard({ id, path });
    setInLinkedCard(inLinked);
    setOutLinkedCard(outLinked);
  }, [path, id]);

  return (
    <Card className="w-full h-fit px-2">
      {renderCardSection({
        cardType: 'inLink',
        title: 'InLinked',
        linkedCard: inLinkedCard,
        outLinkedCard: outLinkedCard,
      })}
      {renderCardSection({
        cardType: 'outLink',
        title: 'OutLinked',
        linkedCard: outLinkedCard,
        outLinkedCard: inLinkedCard,
      })}
    </Card>
  );
}

function SidebarView() {
  const {
    globalState: { sidebarEditCardId },
  } = useContext(appContext);

  const [card, setCard] = React.useState<Model.Card | null>(null);

  useEffect(() => {
    if (!sidebarEditCardId) return;
    const card = cardService.getCardById(sidebarEditCardId);
    console.log(card);
    setCard(card);
  }, [sidebarEditCardId]);

  const handleBackHome = () => {
    globalService.setSidebarEditCardId('');
    locationService.setPathname('/');
  };

  const editorConfig = useMemo(() => {
    return {
      id: card?.id,
      content: card?.content,
      type: card?.type,
      path: card?.path,
    };
  }, [card]);

  const contentConfig = useMemo(() => {
    return {
      content: card?.content,
      path: card?.path,
    };
  }, [card]);

  const handlePin = async () => {
    card.pinned ? await cardService.unpinCardById(card.id) : await cardService.pinCardById(card.id);
  };

  const contentRenderer = () => {
    switch (card?.type) {
      case 'text':
      case 'file':
        return <SidebarEditor {...editorConfig} />;
      case 'link':
        return <iframe className="h-full w-full" src={card?.content}></iframe>;
      case 'image':
      case 'media':
      case 'pdf':
        return <SidebarContent {...contentConfig} />;
    }
  };

  return (
    <>
      <Card
        className={cn(`sidebar-cl-card flex flex-col h-full w-full p-2 pt-1 gap-2 rounded-none`)}
        data-card-path={card?.type === 'text' ? card?.path : card?.content}
        data-card-type={card?.type}
        data-card-id={card?.id}
      >
        {card && (
          <>
            <CardActionHeader
              icon={ICON_MAP[card?.type] ?? ICON_MAP['text']}
              card={card}
              title={card?.type === 'text' ? card?.path : card?.content ?? 'Untitled'}
              funcProps={{
                handlePin,
              }}
              children={
                <>
                  <Button size={'icon'} variant={'outline'} className="mr-2">
                    <HomeIcon className="h-4 w-4 text-muted-foreground" onClick={handleBackHome} />
                  </Button>
                </>
              }
            />
            <div className="h-full overflow-y-scroll">
              <CardContent
                className={cn(
                  'min-h-[300px] px-2 flex-grow overflow-y-auto',
                  card?.type !== 'text' ? 'h-full' : 'h-36',
                )}
              >
                {contentRenderer()}
              </CardContent>
              <CardFooter className={cn('px-2', card?.linked === 'linked' ? 'pt-6' : '')}>
                {card?.linked === 'linked' ? <SidebarCardFooter id={card?.id} path={card?.path} /> : <></>}
              </CardFooter>
            </div>
          </>
        )}
      </Card>
    </>
  );
}

export default SidebarView;
