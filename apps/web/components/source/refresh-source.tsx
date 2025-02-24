'use client';

import revalidate from '@/api/action';
import { Button } from '@nova/ui/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@nova/ui/components/ui/tooltip';
import { RotateCw } from 'lucide-react';
import { useState } from 'react';

type RefreshSourceProps = {
  source: {
    id: string;
  };
  beforeRefresh?: () => void;
  onRefresh?: () => void;
  afterRefresh?: () => void;
};
export function RerefreshSource({
  source,
  onRefresh,
  beforeRefresh,
  afterRefresh,
}: RefreshSourceProps) {
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    beforeRefresh?.();
    await revalidate(`source-${source.id}`);
    onRefresh?.();
    setRefreshing(false);
    afterRefresh?.();
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          onClick={refresh}
          size={'icon'}
          disabled={refreshing}
        >
          <RotateCw />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Refresh</TooltipContent>
    </Tooltip>
  );
}
