import { api } from '@/api/api';
import { GotoBtn } from '@/components/goto-btn';
import DeleteSource from '@/components/source/delete-source';
import { RerefreshSource } from '@/components/source/refresh-source';
import { SourceControlCard } from '@/components/source/source-control-card';
import SourceStatusBadge from '@/components/source/source-status-badge';
import { UrlList } from '@/components/source/url-list';
import { WebSourceDialog } from '@/components/source/web-source-dialog';
import { Button } from '@nova/ui/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';

const getSource = async (sourceId: string) => {
  try {
    const response = await api.get(`/sources/${sourceId}`, {
      next: {
        tags: [`source-${sourceId}`],
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
            to={`/dashboard/${params.chatflowId}/sources/web`}
            size={'icon'}
            className="rounded-full"
          >
            <ArrowLeft />
          </GotoBtn>
          <h1 className="text-2xl font-bold text-foreground">{source.name}</h1>
          <WebSourceDialog
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
      <div className="flex flex-col md:flex-row mt-8">
        <div className="flex basis-3/5 shrink-0 w-full flex-col">
          <UrlList urls={source?.urls || []} />
        </div>
        <div className="basis-2/5 shrink-0 w-full relative md:pl-4 py-4">
          <SourceControlCard source={source} />
        </div>
      </div>
    </div>
  );
}
