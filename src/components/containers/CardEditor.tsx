import React, { useMemo, useRef } from 'react';
import { globalService } from '@/services';
import Editor, { EditorRefActions } from '@/components/ui/editor';

type Props = Model.Card & {
  onSubmit: (content: string) => void;
};

export function CardEditor(props: Props): React.JSX.Element {
  const { content } = props;
  const ref = useRef<EditorRefActions>(null);

  const editorConfig = useMemo(() => {
    return {
      initialContent: content,
      onConfirmBtnClick: (content: string) => {
        props.onSubmit(content);
        ref.current.clear();
        ref.current.destroy();
      },
      onCancelBtnClick: () => {
        globalService.setEditCardId('');
        ref.current.clear();
        ref.current.destroy();
      },
    };
  }, [ref, props.content]);

  return (
    <>
      <div className="flex flex-col h-full w-full gap-2 p-2">
        <Editor ref={ref} {...editorConfig} />
      </div>
    </>
  );
}
