import { api } from '@/api/api';
import IntegrationTable from '@/components/integration/integration-table';

const getIntegration = async (chatflowId: string) => {
  const res = await api.get(`/integration?chatflowId=${chatflowId}`, {
    next: {
      tags: ['integrations'],
    },
  });

  if (res.error) {
    return null;
  }
  return res;
};

export default async function Page({
  params,
}: {
  params: {
    chatflowId: string;
  };
}) {
  const integrations = await getIntegration(params.chatflowId);
  return (
    <div className="flex w-full md:px-8 px-6 pt-2 pb-8 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Connect to Chatbot</h1>
        <p className="text-sm text-muted-foreground">
          Connect chatbot with Facebook Page or Telegram bot to auto reply
          customer messages
        </p>
      </div>

      <IntegrationTable integrations={integrations || []} />
    </div>
  );
}
