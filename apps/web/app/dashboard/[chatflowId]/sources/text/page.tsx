import { Source } from '@/@types/source';
import { api } from '@/api/api';
import { SourceDialog } from '@/components/source/source-dialog';
import { TextSource } from '@/components/source/text-source';
import { UpsertChatflow } from '@/components/source/upsert-chatflow';

const getTextSources = async (chatflowId: string) => {
  const response = await api.get(
    `/sources?chatflowId=${chatflowId}&type=TEXT`,
    {
      next: {
        tags: ['sources'],
      },
    },
  );

  if ('error' in response) {
    return null;
  }

  return response;
};

export default async function Page({
  params,
}: {
  params: {
    chatflowId: string;
  };
}) {
  const textSources = await getTextSources(params.chatflowId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Text Sources</h1>
        <div className="flex gap-2">
          <UpsertChatflow chatflow={{ id: params.chatflowId }} />
          <SourceDialog type="TEXT" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-4">
        {textSources?.map((source: Source) => (
          <TextSource key={source.id} source={source} />
        ))}
      </div>
    </div>
  );
}
