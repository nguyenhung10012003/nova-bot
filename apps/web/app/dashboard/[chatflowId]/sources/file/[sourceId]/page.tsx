import { api } from '@/api/api';
import { GotoBtn } from '@/components/goto-btn';
import DeleteSource from '@/components/source/delete-source';
import FileSource from '@/components/source/file-source';
import { RerefreshSource } from '@/components/source/refresh-source';
import { SourceControlCard } from '@/components/source/source-control-card';
import { SourceDialog } from '@/components/source/source-dialog';
import SourceStatusBadge from '@/components/source/source-status-badge';
import { Button } from '@nova/ui/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';

const getSource = async (sourceId: string) => {
  try {
    const response = await api.get(`/sources/${sourceId}`, {
      next: {
        tags: [`source-${sourceId}`, 'sources'],
      },
    });
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default async function Page({
  params,
}: {
  params: { chatflowId: string; sourceId: string };
}) {
  const source = await getSource(params.sourceId);
  if (!source) {
    return <div>Source not found</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <GotoBtn
            to={`/dashboard/${params.chatflowId}/sources/file`}
            size={'icon'}
            className="rounded-full"
          >
            <ArrowLeft />
          </GotoBtn>
          <h1 className="text-2xl font-bold text-foreground">{source.name}</h1>
          <SourceDialog
            source={source}
            trigger={
              <Button
                variant={'outline'}
                size={'icon'}
                className="rounded-full"
              >
                <Edit />
              </Button>
            }
          />
        </div>
        <div className="flex gap-2">
          <RerefreshSource source={source} />
          <DeleteSource source={source} />
        </div>
      </div>
      <div className="flex mt-4">
        <SourceStatusBadge status={source.sourceStatus} />
      </div>
      <div className="flex flex-col md:flex-row mt-8 gap-4">
        <div className="flex basis-2/3 shrink-0 w-full flex-col space-y-6">
          <FileSource source={source} />
        </div>
        <div className="basis-1/3 shrink-0 w-full" id="actions">
          <SourceControlCard source={source} />
        </div>
      </div>
    </div>
  );
}
