import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { EnvelopeOpenIcon } from '@radix-ui/react-icons';
import { globalService } from '@/services';

type Props = Model.Card & {
  onSubmit: (content: string) => void;
};

export function CardEditor(props: Props): React.JSX.Element {
  const { content } = props;
  const [text, setText] = React.useState(content);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  return (
    <>
      <div className="flex flex-col h-full w-full gap-2 p-2">
        <Textarea className="h-full" placeholder="Type your message here." value={text} onChange={handleChange} />
        <div className="flex justify-end items-center gap-2">
          <Button
            variant={'secondary'}
            onClick={() => {
              setText('');
              globalService.setEditCardId('');
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={text === content || text === ''}
            variant={'default'}
            type={'submit'}
            onClick={() => {
              props.onSubmit(text);
            }}
          >
            <EnvelopeOpenIcon className="mr-2 h-4 w-4" /> Save
          </Button>
        </div>
      </div>
    </>
  );
}
