'use client';

import revalidate from '@/api/action';
import { api } from '@/api/api';
import { Button, ButtonProps } from '@nova/ui/components/ui/button';
import { toast } from '@nova/ui/components/ui/sonner';
import { useState } from 'react';

type UpsertVectorProps = Omit<ButtonProps, 'onClick'> & {
  chatflowId: string;
  beforeUpsert?: () => void;
  afterUpsert?: () => void;
};
export function UpsertVector({
  chatflowId,
  children,
  beforeUpsert,
  afterUpsert,
  ...props
}: UpsertVectorProps) {
  const [upserting, setUpserting] = useState(false);
  const handleUpsert = async () => {
    setUpserting(true);
    beforeUpsert?.();
    const res = await api.get(`/chatflow/${chatflowId}/upsert-vector`);
    if (res.error) {
      toast.error('Failed to upsert vector');
    } else { 
      revalidate(`sources`);
      toast.success('Vector upserted successfully');
    }
    afterUpsert?.();
    setUpserting(false);
  };
  return (
    <Button {...props} onClick={handleUpsert} disabled={upserting}>
      {children}
    </Button>
  );
}
