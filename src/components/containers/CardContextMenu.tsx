import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import React from 'react';
import { ActionProps } from '@/components/containers/CardActionButton';
import { COLOR_MAP } from '@/components/containers/CanvasCard';
import { cn } from '@/lib/utils';
import { CircleIcon } from '@radix-ui/react-icons';
import { colors } from '@/lib/mockdata';

type MenuActionProps = ActionProps & {
  card: Model.Card;
  children: React.ReactNode;
};

export function CardContextMenu(props: MenuActionProps) {
  console.log('text', props);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className="flex w-full h-full items-center justify-center rounded-md border border-dashed text-sm"
        asChild={true}
      >
        {props.children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem inset onClick={props.handleEdit}>
          Edit
        </ContextMenuItem>
        <ContextMenuItem inset>Edit in new tab</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger inset>Set color</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuLabel inset>Color</ContextMenuLabel>
            <ContextMenuRadioGroup value={props.card.color}>
              <ContextMenuSeparator />
              {Object.keys(COLOR_MAP).map((color, index) => {
                return (
                  <ContextMenuRadioItem
                    value={color}
                    key={index}
                    className={cn(`card-${color}`)}
                    onClick={() => props.handleChangeColor(color)}
                  >
                    <CircleIcon className="h-4 w-4 mr-2" />
                    {colors.find((c) => c.value === color)?.label}
                  </ContextMenuRadioItem>
                );
              })}
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem inset onClick={() => props.handlePin(!props.card.pinned)}>
          {props.card.pinned ? 'Unpin' : 'Pin'}
        </ContextMenuItem>
        <ContextMenuItem inset onClick={props.handleArchive}>
          Archive
        </ContextMenuItem>

        <ContextMenuSeparator />
        <ContextMenuItem inset>Reveal card</ContextMenuItem>
        <ContextMenuItem inset>Focus card's canvas</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem inset>Make a copy</ContextMenuItem>
        <ContextMenuItem inset>Copy card text</ContextMenuItem>
        <ContextMenuItem inset>Copy card data</ContextMenuItem>
        <ContextMenuItem inset>Send card to ...</ContextMenuItem>

        <ContextMenuSeparator />
        <ContextMenuItem inset onClick={props.handleDelete}>
          Delete
        </ContextMenuItem>
        <ContextMenuSeparator />
      </ContextMenuContent>
    </ContextMenu>
  );
}
