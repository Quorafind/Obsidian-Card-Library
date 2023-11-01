import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  Link1Icon,
  ImageIcon,
  ReaderIcon,
  FileTextIcon,
  CircleIcon,
  Link2Icon,
} from '@radix-ui/react-icons';
import { FileType2, FilmIcon } from 'lucide-react';
import { FC, SVGProps } from 'react';

export const labels = [
  {
    value: 'linked',
    label: 'Linked',
    icon: Link2Icon,
  },
  {
    value: 'single',
    label: 'Single',
    icon: CircleIcon,
  },
];

export const types: {
  value: CardSpecType;
  label: string;
  icon: FC<SVGProps<SVGSVGElement>>;
}[] = [
  {
    value: 'file',
    label: 'File',
    icon: FileTextIcon,
  },
  {
    value: 'text',
    label: 'Text',
    icon: ReaderIcon,
  },
  {
    value: 'pdf',
    label: 'Pdf',
    icon: FileType2,
  },

  {
    value: 'media',
    label: 'Media',
    icon: FilmIcon,
  },
  {
    value: 'image',
    label: 'Image',
    icon: ImageIcon,
  },
  {
    value: 'link',
    label: 'Link',
    icon: Link1Icon,
  },
];

export const colors: {
  value: string;
  label: string;
  icon: FC<SVGProps<SVGSVGElement>>;
}[] = [
  {
    value: 'color-blank',
    label: 'Default',
    icon: CircleIcon,
  },
  {
    value: 'color-1',
    label: 'Red',
    icon: CircleIcon,
  },
  {
    value: 'color-2',
    label: 'Orange',
    icon: CircleIcon,
  },
  {
    value: 'color-3',
    label: 'Yellow',
    icon: CircleIcon,
  },
  {
    value: 'color-4',
    label: 'Green',
    icon: CircleIcon,
  },
  {
    value: 'color-5',
    label: 'Cyan',
    icon: CircleIcon,
  },
  {
    value: 'color-6',
    label: 'Purple',
    icon: CircleIcon,
  },
  {
    value: 'color-custom',
    label: 'Custom',
    icon: CircleIcon,
  },
];

export const priorities = [
  {
    label: 'Low',
    value: 'low',
    icon: ArrowDownIcon,
  },
  {
    label: 'Medium',
    value: 'medium',
    icon: ArrowRightIcon,
  },
  {
    label: 'High',
    value: 'high',
    icon: ArrowUpIcon,
  },
];
