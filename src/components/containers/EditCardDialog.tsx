import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cardService } from '@/services';
import AppContext from '@/stores/appContext';
import Editor, { EditorRefActions } from '@/components/ui/editor';

export function EditCardDialog({ children }: { children: React.ReactNode }) {
  const {
    globalState: { settings, view },
    locationState: { query },
  } = useContext(AppContext);
  const [open, setOpen] = useState(false);

  const ref = useRef<EditorRefActions>(null);

  useEffect(() => {
    if (settings.general.global && view) {
      view.registerEvent(
        view.app.workspace.on('create-card-dialog', () => {
          setOpen(true);
        }),
      );
      view.registerEvent(
        view.app.workspace.on('create-card-dialog-from-clipboard', () => {
          setOpen(true);
          setTimeout(async () => {
            const content = await navigator.clipboard.readText();
            console.log(content);
            ref.current.setContent(content);
          }, 200);
        }),
      );
    }
  }, [ref, settings, view]);

  const handleCardCreate = async (content: string) => {
    const path = settings.general.defaultFileName;
    const patch: CardPatch = {};
    if (query.color && query.color.length > 0) patch.color = query.color[0].split('-')[1];
    const tags = query.tags
      .map((tag) => {
        return '#' + tag;
      })
      .join(' ')
      .trim();

    console.log('tags: ', query, patch);

    const card = await cardService.createCard({
      text: content + (tags ? '\n' + tags : ''),
      type: 'text',
      path: path || 'card-library/card-root.canvas',
      patch,
    });

    cardService.pushCard(card);
  };

  const editorConfig = useMemo(() => {
    return {
      initialContent: '',
      onConfirmBtnClick: async (content: string) => {
        await handleCardCreate(content);
        setOpen(false);
        ref.current.clear();
        ref.current.destroy();
      },
      onCancelBtnClick: () => {
        setOpen(false);
        ref.current.clear();
        ref.current.destroy();
      },
    };
  }, [ref]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create card</DialogTitle>
          <DialogDescription>Create a card in default canvas.</DialogDescription>
        </DialogHeader>
        <Editor ref={ref} {...editorConfig} />
      </DialogContent>
    </Dialog>
  );
}
