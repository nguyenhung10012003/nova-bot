'use client';
import { Source } from '@/@types/source';
import { Button } from '@nova/ui/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nova/ui/components/ui/popover';
import { DatabaseZap, Settings } from 'lucide-react';
import { UpsertVector } from '../upsert-vector';
import { FetchSettingDialog } from './fetch-setting-dialog';
import { ReprocessSource } from './reprocess-source';

type SourceSettingProps = {
  source: Source;
};
export function SourceSetting({ source }: SourceSettingProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={'outline'} size={'icon'}>
          <Settings />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex py-2 px-1 w-auto gap-2 flex-col">
        <span className="text-md font-semibold px-2">Tools</span>
        <div className="flex flex-col">
          <ReprocessSource source={source} />
          {source.type === 'WEBSITE' && <FetchSettingDialog source={source} />}
          <UpsertVector
            className="gap-2 justify-start px-2"
            variant={'ghost'}
            chatflowId={source.chatflowId}
          >
            <DatabaseZap className="w-5 h-5" />
            Upsert Vector
          </UpsertVector>
        </div>
      </PopoverContent>
    </Popover>
  );
}
