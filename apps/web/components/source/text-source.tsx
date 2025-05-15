'use client';

import { Source } from '@/@types/source';
import revalidate from '@/api/action';
import { api } from '@/api/api';
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@nova/ui/components/ui/card';
import { toast } from '@nova/ui/components/ui/sonner';
import { Edit, Trash } from 'lucide-react';
import { SourceDialog } from './source-dialog';

interface TextSourceProps {
  source: Source;
}

/**
 * Component for displaying a text source with its name and content
 * @param {TextSourceProps} props - Component props containing the source object
 * @returns {JSX.Element} Text source display component with edit functionality
 */
export function TextSource({ source }: TextSourceProps) {
  const deleteSource = async () => {
    const res = await api.delete(`/sources/${source.id}`);
    if ('error' in res) {
      toast.error('Failed to delete source');
    } else {
      toast.success('Source deleted');
      revalidate('sources');
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{source.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="whitespace-pre-wrap break-words line-clamp-6">
          {source.text}
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <SourceDialog
          source={source}
          type="TEXT"
          trigger={
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          }
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash className="h-4 w-4 mr-2" />
              Delete
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
              <AlertDialogAction onClick={deleteSource}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
