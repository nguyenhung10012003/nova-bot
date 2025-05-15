'use client';
import { Source } from '@/@types/source';
import revalidate from '@/api/action';
import { api } from '@/api/api';
import {
  generateCronString,
  parseCronString,
  RecurrenceState,
} from '@/utils/cron';
import { Button } from '@nova/ui/components/ui/button';
import { Checkbox } from '@nova/ui/components/ui/checkbox';
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
import { Switch } from '@nova/ui/components/ui/switch';
import { PickaxeIcon } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { LabelWithHelp } from '../label-with-help';
import MultiStringInput from '../muti-string-input';
import RecurringTimeSelector from '../recurring-time-selector';

type FetchSettingDialogProps = {
  source: Source;
};
const allowFiles = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
  'json',
];
export function FetchSettingDialog({ source }: FetchSettingDialogProps) {
  const [open, setOpen] = useState(false);
  const [autoCrawl, setAutoCrawl] = useState(source.fetchSetting?.autoFetch);
  const [includeFilePattern, setIncludeFilePattern] = useState(
    !!source.fetchSetting?.filePattern,
  );
  const [filePattern, setFilePattern] = useState(
    source.fetchSetting?.filePattern || [],
  );
  const [matchPattern, setMatchPattern] = useState(
    source.fetchSetting?.matchPattern
      ? source.fetchSetting?.matchPattern?.split(',')
      : [],
  );
  const [excludePattern, setExcludePattern] = useState(
    source.fetchSetting?.excludePattern
      ? source.fetchSetting?.excludePattern?.split(',')
      : [],
  );
  const [recurrence, setRecurrence] = useState<RecurrenceState | null>(
    parseCronString(source.fetchSetting?.cronExpression || ''),
  );

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const res = await api.patch(`/sources/${source.id}`, {
      fetchSetting: {
        ...source.fetchSetting,
        matchPattern: matchPattern.length ? matchPattern.join(',') : '',
        excludePattern: excludePattern.length ? excludePattern.join(',') : '',
        maxUrlsToCrawl: data.maxUrls
          ? parseInt(data.maxUrls as string)
          : undefined,
        autoFetch: autoCrawl,
        filePattern: includeFilePattern ? filePattern : [],
        cronExpression: autoCrawl ? generateCronString(recurrence) : undefined,
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
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button className="gap-2 px-2 justify-start" variant={'ghost'}>
          <PickaxeIcon className="w-5 h-5" />
          <span>Crawl Setting</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-[700px] w-[90%] rounded-lg gap-0 p-0"
      >
        <DialogHeader className="px-6 py-4 border-b border-muted">
          <DialogTitle>Crawl Setting</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSave}
          className="px-6 pb-6 pt-4 flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-1">
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
              <MultiStringInput
                strs={matchPattern}
                onAddTag={(tag) => {
                  setMatchPattern([...matchPattern, tag]);
                }}
                onRemoveTag={(tag) => {
                  setMatchPattern(matchPattern.filter((t) => t !== tag));
                }}
              />
            </div>
            <div className="space-y-1">
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
              <MultiStringInput
                strs={excludePattern}
                onAddTag={(tag) => {
                  setExcludePattern([...excludePattern, tag]);
                }}
                onRemoveTag={(tag) => {
                  setExcludePattern(excludePattern.filter((t) => t !== tag));
                }}
              />
            </div>
            <div className="space-y-1">
              <LabelWithHelp
                label="Max urls to crawl"
                htmlFor="max-urls"
                explain={
                  <p className="w-[150px]">
                    Maximum number of urls to fetch in one fetch
                  </p>
                }
              />
              <Input
                type="number"
                id="max-urls"
                min={1}
                name="maxUrls"
                defaultValue={source.fetchSetting?.maxUrlsToCrawl}
              />
            </div>
          </div>
          {/* <Separator /> */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-start gap-2 items-center">
              <LabelWithHelp
                label="Auto crawl"
                className="text-md"
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
            {autoCrawl && (
              <RecurringTimeSelector
                value={recurrence}
                onChange={setRecurrence}
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-start gap-2 items-center">
              <LabelWithHelp
                label="Include File"
                className="text-md"
                htmlFor="file-pattern"
                explain={
                  <p className="w-[150px]">
                    Check this to include files in the crawl
                  </p>
                }
              />
              <Switch
                id="file-pattern"
                name="file-pattern"
                checked={includeFilePattern}
                onCheckedChange={setIncludeFilePattern}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {includeFilePattern &&
                allowFiles.map((file) => (
                  <div
                    key={file}
                    className="flex gap-2 items-center w-full max-w-[80px]"
                  >
                    <Checkbox
                      checked={filePattern?.includes(file)}
                      onCheckedChange={(value) => {
                        if (value) {
                          setFilePattern((prev) => [...prev, file]);
                        } else {
                          setFilePattern((prev) =>
                            prev.filter((f) => f !== file),
                          );
                        }
                      }}
                    />
                    <span className="text-sm">{file}</span>
                  </div>
                ))}
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
