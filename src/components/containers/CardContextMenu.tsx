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
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full h-full" asChild>
        {props.children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem inset onClick={props.handleEdit}>
          Edit
        </ContextMenuItem>
        <ContextMenuItem inset onClick={props.handleEditInTab}>
          Edit in tab
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger inset>Set color</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuLabel inset>Set color for card</ContextMenuLabel>
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
        <ContextMenuItem inset onClick={props.handleSource}>
          Reveal card
        </ContextMenuItem>
        <ContextMenuItem inset onClick={props.handleFocusCanvas}>
          Focus card's canvas
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem inset onClick={props.handleCopyCardContent}>
          Copy card text
        </ContextMenuItem>
        <ContextMenuItem inset onClick={props.handleCopyCardData}>
          Copy card data
        </ContextMenuItem>
        <ContextMenuItem inset onClick={props.handleDuplicate}>
          Make a copy
        </ContextMenuItem>
        <ContextMenuItem inset disabled>
          Send card to ...
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className={'text-red-500 hover:text-red-800 dark:text-red-800 dark:hover:text-red-500'}
          inset
          onSelect={(event) => {
            if (!confirmDelete) event.preventDefault();
            setConfirmDelete(true);
            if (confirmDelete) {
              props.handleDelete();
              return;
            }
          }}
        >
          {confirmDelete ? 'Confirm delete?' : 'Delete'}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
