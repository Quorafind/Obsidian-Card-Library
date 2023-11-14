import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { globalService } from '@/services';
import Editor, { EditorRefActions } from '@/components/ui/editor';
import { readFileContent } from '@/lib/obsidianUtils';
import appContext from '@/stores/appContext';

type Props = Model.Card & {
  onSubmit: (content: string) => void;
};

export function CardEditor(props: Props): React.JSX.Element {
  const {
    globalState: { app },
  } = useContext(appContext);
  const ref = useRef<EditorRefActions>(null);

  const [temp, setTemp] = useState(props.content);

  useEffect(() => {
    const loadContent = async () => {
      if (props.type === 'file' && app) {
        const tempContent = await readFileContent(app, props.content);
        setTemp(tempContent);
      } else {
        setTemp(props.content);
      }
    };

    loadContent();
  }, [props.type, app]);

  const editorConfig = useMemo(() => {
    console.log(temp);
    return {
      initialContent: temp,
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
  }, [ref, temp]);

  return (
    <>
      <div className="flex flex-col h-full w-full gap-2 p-2">
        <Editor ref={ref} {...editorConfig} />
      </div>
    </>
  );
}
