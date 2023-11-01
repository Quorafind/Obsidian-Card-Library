import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import React, { useContext, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CaretSortIcon, CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from '@/components/ui/search';
import AppContext from '@/stores/appContext';
import { locationService } from '@/services';

const groups = [
  {
    label: 'Special',
    teams: [
      {
        label: 'All Canvases',
        value: 'all',
      },
    ],
  },
  {
    label: 'Normal',
    teams: [],
  },
];

type Team = typeof groups[number]['teams'][number];

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface TeamSwitcherProps extends PopoverTriggerProps {}

export default function CanvasSwitcher({ className }: TeamSwitcherProps) {
  const {
    fileState: { files },
    locationState: { query },
  } = useContext(AppContext);
  const [initialied, setInitialized] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState<Team[]>([groups[0].teams[0]]);
  const [containerElement, setContainerElement] = React.useState<HTMLElement | null>(null);
  const selectedValues = new Set(query['path'] ?? []);

  useEffect(() => {
    if (!files) return;
    if (initialied) return;
    setInitialized(true);

    files?.forEach((file) => {
      groups[1].teams.push({
        // leave basename and parent folder path
        label: file.path.replace('.canvas', ''),
        value: file.path,
      });
    });
    return () => {
      groups[1].teams = [];
    };
  }, [files]);

  useEffect(() => {
    setContainerElement(document.querySelector("div[data-type='card-library-view'] .content") as HTMLElement);
  }, []);

  return (
    <Dialog open={showNewTeamDialog} onOpenChange={setShowNewTeamDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a team"
            className={cn('w-[200px] justify-between', className)}
          >
            {groups[1].teams.find((team) => team.value === Array.from(selectedValues)[0])?.label ?? 'All Canvases'}
            <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput className="focus:outline-none focus:shadow-none" placeholder="Search canvas..." />
              <CommandEmpty>No team found.</CommandEmpty>
              {groups.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.teams.map((team) => {
                    const isSelected = selectedValues.has(team.value);

                    return (
                      <CommandItem
                        key={team.value}
                        onSelect={() => {
                          if (team.value === 'all') {
                            locationService.setQueryWithType('path', [] as string[] | CardSpecType[]);
                            selectedValues.add(team.value);
                            return;
                          }

                          if (isSelected) {
                            selectedValues.delete(team.value);
                          } else {
                            selectedValues.add(team.value);
                          }
                          const filterValues = Array.from(selectedValues);
                          locationService.setQueryWithType('path', filterValues as string[] | CardSpecType[]);
                        }}
                        className="text-sm"
                      >
                        {team.label}
                        <CheckIcon className={cn('ml-auto h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowNewTeamDialog(true);
                    }}
                  >
                    <PlusCircledIcon className="mr-2 h-5 w-5" />
                    Create Canvas
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent container={containerElement}>
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>
          <DialogDescription>Add a new team to manage products and customers.</DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team name</Label>
              <Search id="name" placeholder="Acme Inc." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Subscription plan</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">
                    <span className="font-medium">Free</span> -{' '}
                    <span className="text-muted-foreground">Trial for two weeks</span>
                  </SelectItem>
                  <SelectItem value="pro">
                    <span className="font-medium">Pro</span> -{' '}
                    <span className="text-muted-foreground">$9/month per user</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowNewTeamDialog(false)}>
            Cancel
          </Button>
          <Button type="submit">Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
