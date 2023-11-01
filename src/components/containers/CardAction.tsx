import { DotsHorizontalIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import React from 'react';

export interface ActionProps {
  handleEdit: () => void;
  handleCopy: () => void;
  handlePin: (pinned: boolean) => void;
  handleArchive: () => void;
  handleSource: () => void;
  handleDelete: () => void;
}

type Props = Model.Card & ActionProps;

export function CardAction(props: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="hover:bg-transparent shadow-none flex h-8 w-8 mr-[-0.5rem] p-0 data-[state=open]:bg-transparent"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => props.handleEdit()}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => props.handleCopy()}>Make a copy</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => props.handlePin(!props.pinned)}>
          {props.pinned ? 'Unpin' : 'Pin'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => props.handleArchive()}>Archive</DropdownMenuItem>
        <DropdownMenuItem onClick={() => props.handleSource()}>Source</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => props.handleDelete()}>
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
