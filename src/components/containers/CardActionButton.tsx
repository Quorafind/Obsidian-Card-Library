import { CircleIcon, DotsHorizontalIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import React from 'react';
import { COLOR_MAP } from '@/components/containers/CanvasCard';
import { cn } from '@/lib/utils';
import { colors } from '@/lib/mockdata';

export interface ActionProps {
  handleEdit?: () => void;
  handleDuplicate?: () => void;
  handlePin?: (pinned: boolean) => void;
  handleArchive?: () => void;
  handleSource?: () => void;
  handleDelete?: () => void;
  handleChangeColor?: (color: string) => void;
  handleEditInTab?: () => void;
  handleFocusCanvas?: () => void;
  handleCopyCardData?: () => void;
  handleCopyCardContent?: () => Promise<void>;
}

type Props = Model.Card & ActionProps;

export function CardActionButton(props: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-gray-400 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-transparent shadow-none flex h-8 w-8 mr-[-0.5rem] p-0 data-[state=open]:bg-transparent"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px] dark:border-slate-600">
        <DropdownMenuItem onClick={props.handleEdit}>Edit</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Set color</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className={'dark:border-slate-600'}>
              {Object.keys(COLOR_MAP).map((color, index) => {
                return (
                  <DropdownMenuItem
                    key={index}
                    className={cn(`card-${color}`)}
                    onClick={() => props.handleChangeColor(color)}
                  >
                    <CircleIcon className="h-4 w-4 mr-2" />
                    {colors.find((c) => c.value === color)?.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={props.handleDuplicate}>Make a copy</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => props.handlePin(!props.pinned)}>
          {props.pinned ? 'Unpin' : 'Pin'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={props.handleArchive}>Archive</DropdownMenuItem>
        <DropdownMenuItem onClick={props.handleSource}>Source</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={props.handleDelete}>
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
