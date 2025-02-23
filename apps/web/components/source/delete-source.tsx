'use client';
import revalidate from '@/api/action';
import { api } from '@/api/api';
import useGoBack from '@/hooks/useGoBack';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@nova/ui/components/ui/alert-dialog';
import { Button } from '@nova/ui/components/ui/button';
import { toast } from '@nova/ui/components/ui/sonner';
import { Trash } from 'lucide-react';

type DeleteSourceProps = {
  source: {
    id: string;
    name: string;
  };
};

export default function DeleteSource({ source }: DeleteSourceProps) {
  const goBack = useGoBack();

  const deleteSource = async () => {
    const res = await api.delete(`/sources/${source.id}`);
    if (res.error) {
      toast.error('Failed to delete source');
    } else {
      toast.success('Source deleted');
      revalidate('sources');
      goBack(1);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={'destructive'} className="gap-2">
          <span>Delete</span>
          <Trash className="w-5 h-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this source?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteSource}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
