'use client';
import { Source } from '@/@types/source';
import { api } from '@/api/api';
import { Button } from '@nova/ui/components/ui/button';
import { toast } from '@nova/ui/components/ui/sonner';
import { DatabaseBackup } from 'lucide-react';
import { useState } from 'react';

type ReprocessSourceProps = {
  source: Source;
};
export function ReprocessSource(props: ReprocessSourceProps) {
  const [loading, setLoading] = useState(false);

  const reprocess = async () => {
    setLoading(true);
    const res = await api.patch(`/sources/${props.source.id}/reprocess`);
    if (res.error) {
      toast.error('Failed to reprocess source');
    } else {
      toast.success('Source reprocessed');
    }
    setLoading(false);
  };
  return (
    <Button
      className="gap-2 w-full h-auto p-4 flex-col"
      onClick={reprocess}
      disabled={loading}
      variant={'outline'}
    >
      <DatabaseBackup className="w-8 h-8" />
      <span>Reprocess</span>
    </Button>
  );
}
