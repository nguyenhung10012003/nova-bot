'use client';
import { Source } from '@/@types/source';
import revalidate from '@/api/action';
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
import { Input } from '@nova/ui/components/ui/input';
import { toast } from '@nova/ui/components/ui/sonner';
import { Settings } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { LabelWithHelp } from '../label-with-help';

type FetchSettingDialogProps = {
  source: Source;
};
export function FetchSettingDialog({ source }: FetchSettingDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const res = await api.patch(`/sources/${source.id}`, {
      fetchSetting: {
        ...source.fetchSetting,
        maxUrlsToCrawl: data.maxUrls
          ? parseInt(data.maxUrls as string)
          : undefined,
      },
    });
    if (res.error) toast.error("Can't save setting");
    else {
      revalidate(`source-${source.id}`);
      toast.success('Save successfully');
      setOpen(false);
    }
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
              <Input type="text" id="match" name="match" defaultValue={source.fetchSetting?.matchPattern} />
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
              <Input type="text" id="exclude" name="exclude" defaultValue={source.fetchSetting?.excludePattern}/>
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
              <Input type="number" id="max-urls" min={1} name="maxUrls" defaultValue={source.fetchSetting?.maxUrlsToCrawl} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
