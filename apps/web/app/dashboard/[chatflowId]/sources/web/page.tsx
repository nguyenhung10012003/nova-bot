import { Source } from '@/@types/source';
import { api } from '@/api/api';
import { SourceDialog } from '@/components/source/source-dialog';
import SourceStatusBadge from '@/components/source/source-status-badge';
import { UpsertChatflow } from '@/components/source/upsert-chatflow';
import { Badge } from '@nova/ui/components/ui/badge';
import { Card } from '@nova/ui/components/ui/card';
import Link from 'next/link';

const getWebsiteSources = async (chatflowId: string) => {
  try {
    const response = await api.get(
      `/sources?chatflowId=${chatflowId}&type=WEBSITE`,
      {
        next: {
          tags: ['sources'],
        },
      },
    );
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default async function Page({
  params,
}: {
  params: {
    chatflowId: string;
  };
}) {
  const websiteSources = await getWebsiteSources(params.chatflowId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Website Sources</h1>
        <div className="flex gap-2">
          <UpsertChatflow chatflow={{ id: params.chatflowId }} />
          <SourceDialog />
        </div>
      </div>
      {websiteSources?.length ? (
        <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
          {websiteSources.map((source: Source, index: number) => (
            <Card
              key={index}
              className="p-4 shadow-sm group hover:shadow-md hover:cursor-pointer transition-all duration-200"
            >
              <Link
                href={`/dashboard/${params.chatflowId}/sources/web/${source.id}`}
                prefetch={false}
              >
                <h3 className="font-semibold text-xl">{source.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {source.rootUrl}
                </p>
                <div className="mt-6 flex gap-2">
                  <SourceStatusBadge status={source.sourceStatus} />
                  <Badge variant={'secondary'}>
                    {source.urls?.length || 0} urls
                  </Badge>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
