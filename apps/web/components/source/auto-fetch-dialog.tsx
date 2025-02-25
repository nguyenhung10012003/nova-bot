'use client';
import { Source } from '@/@types/source';
import { api } from '@/api/api';
import { Button } from '@nova/ui/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@nova/ui/components/ui/dialog';
import { toast } from '@nova/ui/components/ui/sonner';
import { Switch } from '@nova/ui/components/ui/switch';
import { AlarmClock } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { LabelWithHelp } from '../label-with-help';
import RecurringTimeSelector from '../recurring-time-selector';

type AutoFetchDialogProps = {
  source: Source;
};
export function AutoFetchDialog({ source }: AutoFetchDialogProps) {
  const [open, setOpen] = useState(false);
  const [autoCrawl, setAutoCrawl] = useState(source.fetchSetting?.autoFetch);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await api.patch(`/sources/${source.id}`, {
      data: {
        fetchSetting: {
          ...source.fetchSetting,
          autoFetch: autoCrawl,
        },
      },
    });
    if (res.error) toast.error("Can't save setting");
    else {
      toast.success('Save successfully');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 w-full h-auto p-4 flex-col"
          variant={'outline'}
        >
          <AlarmClock className="w-8 h-8" />
          <span>Auto crawl</span>
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Auto crawl</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <LabelWithHelp
                label="Auto crawl"
                htmlFor="auto-crawl"
                explain={
                  <p className="w-[150px]">
                    Automatically fetch new data from urls and reprocess after a
                    range of time
                  </p>
                }
              />
              <Switch
                id="auto-crawl"
                name="auto-crawl"
                checked={autoCrawl}
                onCheckedChange={setAutoCrawl}
              />
            </div>
            {autoCrawl && <RecurringTimeSelector />}
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={() => setOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
