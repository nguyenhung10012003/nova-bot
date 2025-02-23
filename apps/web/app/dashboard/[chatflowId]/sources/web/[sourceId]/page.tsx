import { api } from '@/api/api';
import { GotoBtn } from '@/components/goto-btn';
import DeleteSource from '@/components/source/delete-source';
import { UrlList } from '@/components/source/url-list';
import { WebSourceDialog } from '@/components/source/web-source-dialog';
import { Badge } from '@nova/ui/components/ui/badge';
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
        <div className='flex'>
          <DeleteSource source={source} />
        </div>
      </div>
      <div className="flex mt-4">
        <Badge>{source.sourceStatus}</Badge>
      </div>
      <div className="flex flex-col md:flex-row mt-8 gap-4">
        <div className="flex basis-2/3 shrink-0 w-full flex-col">
          <UrlList urls={source?.urls || []} />
        </div>
        <div className="basis-1/3 shrink-0 w-full"></div>
      </div>
    </div>
  );
}
