'use client';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Id } from '../../../../../../convex/_generated/dataModel';

interface Subtheme {
  _id: Id<'subthemes'>;
  name: string;
  themeId: Id<'themes'>;
}

interface Theme {
  _id: Id<'themes'>;
  name: string;
}

interface SubthemeDialogProps {
  dialogTheme: Id<'themes'> | undefined;
  themes: Theme[];
  allSubthemes: Subtheme[];
  selectedSubthemes: Record<Id<'themes'>, Set<Id<'subthemes'>>>;
  onClose: () => void;
  onSubthemeSelect: (
    themeId: Id<'themes'>,
    subthemeId: Id<'subthemes'>,
  ) => void;
}

export function SubthemeDialog({
  dialogTheme,
  themes,
  allSubthemes,
  selectedSubthemes,
  onClose,
  onSubthemeSelect,
}: SubthemeDialogProps) {
  return (
    <Dialog open={dialogTheme !== undefined} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Subtemas de {themes.find(t => t._id === dialogTheme)?.name}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-2">
            {dialogTheme &&
              allSubthemes
                .filter(sub => sub.themeId === dialogTheme)
                .map(subtheme => (
                  <div
                    key={subtheme._id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={subtheme._id}
                      checked={selectedSubthemes[dialogTheme]?.has(
                        subtheme._id,
                      )}
                      onCheckedChange={() =>
                        onSubthemeSelect(dialogTheme, subtheme._id)
                      }
                    />
                    <label
                      htmlFor={subtheme._id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {subtheme.name}
                    </label>
                  </div>
                ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
