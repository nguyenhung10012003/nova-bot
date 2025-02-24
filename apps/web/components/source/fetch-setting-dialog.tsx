'use client';
import { Source } from '@/@types/source';
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
import { Input } from '@nova/ui/components/ui/input';
import { Switch } from '@nova/ui/components/ui/switch';
import { Settings } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { LabelWithHelp } from '../label-with-help';

type FetchSettingDialogProps = {
  source: Source;
};
export function FetchSettingDialog({ source }: FetchSettingDialogProps) {
  const [open, setOpen] = useState(false);
  const [autoCrawl, setAutoCrawl] = useState<boolean>(source?.fetchSetting?.autoFetch || false);

  const handleSave = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 w-full h-auto p-4 flex-col"
          variant={'outline'}
        >
          <Settings className="w-8 h-8" />
          <span>Crawl Setting</span>
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Crawl Setting</DialogTitle>
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
              <Switch id="auto-crawl" name="auto-crawl"  />
            </div>
            <div className="space-y-2">
              <LabelWithHelp
                label="Match pattern"
                htmlFor="match"
                explain={
                  <p className="w-[150px]">
                    Only fetch urls that match the pattern. The pattern is glob
                    pattern.
                  </p>
                }
              />
              <Input type="text" id="match" name="match" />
            </div>
            <div className="space-y-2">
              <LabelWithHelp
                label="Exclude Pattern"
                htmlFor="exclude"
                explain={
                  <p className="w-[150px]">
                    Exclude urls that match the pattern. The pattern is glob
                    pattern.
                  </p>
                }
              />
              <Input type="text" id="exclude" name="exclude" />
            </div>
            <div className="space-y-2">
              <LabelWithHelp
                label="Max urls to crawl"
                htmlFor="max-urls"
                explain={
                  <p className="w-[150px]">
                    Maximum number of urls to fetch in one fetch
                  </p>
                }
              />
              <Input type="number" id="max-urls" min={1} name="max-urls" />
            </div>
          </div>
          <DialogFooter>
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
