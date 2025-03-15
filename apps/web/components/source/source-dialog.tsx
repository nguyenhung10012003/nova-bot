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
import { Label } from '@nova/ui/components/ui/label';
import { Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type SourceDialogProps = {
  source?: Source;
  trigger?: React.ReactNode;
  type?: 'WEBSITE' | 'FILE';
};
export function SourceDialog({ source, trigger, type = 'WEBSITE' }: SourceDialogProps) {
  const isEdit = useMemo(() => !!source, [source]);
  const [open, setOpen] = useState(false);
  const { chatflowId } = useParams();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    if (isEdit) {
      const res = await api.patch(`/sources/${source?.id}`, {
        name: data.name,
        rootUrl: data.url,
        type: source?.type,
        chatflowId,
      });
      if (res.error) {
        console.error(res.error);
        toast('Failed to update source');
        return;
      }
      revalidate('sources');
      revalidate(`source-${source?.id}`);
      setOpen(false);
      toast('Source updated successfully');
    } else {
      const res = await api.post('/sources', {
        name: data.name,
        rootUrl: data.url,
        type: type,
        chatflowId,
      });
      if (res.error) {
        console.error(res.error);
        toast('Failed to create source');
        return;
      }
      setOpen(false);
      toast('Source created successfully');
      revalidate('sources');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus />
            <span className="ml-2">Add new</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit source' : 'Create Source'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Edit the source details' : 'Create a new source'}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              name="name"
              placeholder="Example page"
              defaultValue={source?.name}
              required
            />
          </div>
          {type === 'WEBSITE' && <div className="flex flex-col space-y-2">
            <Label htmlFor="url">Url</Label>
            <Input
              id="url"
              type="text"
              name="url"
              placeholder="https://example.com"
              defaultValue={source?.rootUrl}
              required
            />
          </div>}
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
