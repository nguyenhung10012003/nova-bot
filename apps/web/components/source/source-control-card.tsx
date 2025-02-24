'use client';
import { Source } from '@/@types/source';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@nova/ui/components/ui/card';
import { FetchSettingDialog } from './fetch-setting-dialog';
import { ReprocessSource } from './reprocess-source';

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
        </div>
      </CardContent>
    </Card>
  );
}
