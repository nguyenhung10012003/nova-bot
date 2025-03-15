'use client';
import { Source } from '@/@types/source';
import revalidate from '@/api/action';
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
      revalidate(`source-${props.source.id}`);
      toast.success('Source reprocessed');
    }
    setLoading(false);
  };
  return (
    <Button
      className="gap-2 justify-start px-2"
      onClick={reprocess}
      disabled={loading}
      variant={'ghost'}
    >
      <DatabaseBackup className="w-5 h-5" />
      <span>Reprocess</span>
    </Button>
  );
}
