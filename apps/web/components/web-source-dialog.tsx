'use client';
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

type WebSourceDialogProps = {
  source?: {
    name: string;
    id: string;
    type: 'WEBSITE' | 'FILE' | 'TEXT';
    rootUrl?: string;
    text?: string;
    chatflowId: string;
    urls?: {
      url: string;
      type: 'URL' | 'FILE';
    }[];
    autoFetch: {
      cronExpression: string;
      isEnabled?: boolean;
      matchPattern?: string;
      excludePattern?: string;
      filePattern?: string;
    };
  };
  trigger?: React.ReactNode;
};
export function WebSourceDialog({ source, trigger }: WebSourceDialogProps) {
  const isEdit = useMemo(() => !!source, [source]);
  const [open, setOpen] = useState(false);
  const { chatflowId } = useParams();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    if (isEdit) {
      // update source
    } else {
      try {
        await api.post('/sources', {
          name: data.name,
          rootUrl: data.url,
          type: 'WEBSITE',
          chatflowId,
        });
      } catch (e) {
        console.error(e);
      }
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
            <Input id="name" type="text" name="name" />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="url">Url</Label>
            <Input id="url" type="text" name="url" />
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
