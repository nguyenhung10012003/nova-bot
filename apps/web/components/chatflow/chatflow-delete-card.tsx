'use client';

import { Chatflow } from '@/@types/chatflow';
import revalidate from '@/api/action';
import { api } from '@/api/api';
import { Button } from '@nova/ui/components/ui/button';
import { Card, CardContent } from '@nova/ui/components/ui/card';
import { toast } from '@nova/ui/components/ui/sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ChatflowDeleteCard({chatflow} : {chatflow: Chatflow}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await api.delete(`/chatflow/${chatflow.id}`)
    if (!res.error) {
      toast.success('Chatflow deleted successfully');
      revalidate('chatflows');
      router.push('/dashboard');
    } else {
      toast.error('Failed to delete chatflow');
    }
  };

  return (
    <Card className="border border-destructive rounded-xl p-6">
      <CardContent className="p-0 space-y-4">
        <h2 className="text-2xl font-semibold text-destructive">Delete chatflow</h2>

        <div className="space-y-2 text-base">
          <p>
            Once you delete your chatflow, there is no going back. Please be
            certain.
          </p>
          <p>All your uploaded data and trained agents will be deleted.</p>
          <p className="font-bold">This action is not reversible</p>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            variant="destructive"
            className="text-white px-4 py-2 rounded-md"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
