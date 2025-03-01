'use client';
import { Source } from '@/@types/source';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@nova/ui/components/ui/card';
import { UpsertVector } from '../upsert-vector';
import { AutoFetchDialog } from './auto-fetch-dialog';
import { FetchSettingDialog } from './fetch-setting-dialog';
import { ReprocessSource } from './reprocess-source';
import { DatabaseZap } from 'lucide-react';

type SourceControlCardProps = {
  source: Source;
};
export function SourceControlCard({ source }: SourceControlCardProps) {
  return (
    <Card className="flex flex-col flex-wrap">
      <CardHeader>
        <CardTitle>Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ReprocessSource source={source} />
          <FetchSettingDialog source={source} />
          <AutoFetchDialog source={source} />
          <UpsertVector
            className="gap-2 w-full h-auto p-4 flex-col"
            variant={'outline'}
            chatflowId={source.chatflowId}
          >
            <DatabaseZap className="w-8 h-8" />
            Upsert Vector
          </UpsertVector>
        </div>
      </CardContent>
    </Card>
  );
}
