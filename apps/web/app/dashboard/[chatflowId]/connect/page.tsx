import { api } from '@/api/api';
import { IntegrationCard } from '@/components/integration/integration-card';
import IntegrationTable from '@/components/integration/integration-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@nova/ui/components/ui/card';

const getIntegration = async (chatflowId: string, type?: string) => {
  const res = await api.get(
    `/integration?chatflowId=${chatflowId}&type=${type === 'fb' ? 'FACEBOOK' : 'TELEGRAM'}`,
    {
      next: {
        tags: ['integrations'],
      },
    },
  );
  console.log(res)

  if (res.error) {
    return null;
  }
  return res;
};

export default async function Page({
  params,
  searchParams,
}: {
  params: {
    chatflowId: string;
  };
  searchParams?: { [key: string]: string };
}) {
  const integrations = await getIntegration(
    params.chatflowId,
    searchParams?.channel,
  );
  if (searchParams?.channel === 'fb') {
    return (
      <div className="flex w-full px-4 pt-2 pb-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Facebook Messenger</CardTitle>
            <CardDescription>
              Connect chatbot with Facebook Page to auto reply customer messages
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <IntegrationTable integrations={integrations || []} />
          </CardContent>
        </Card>
      </div>
    );
  } else if (searchParams?.channel === 'telegram') {
    return <></>;
  } else {
    const integrations = [
      {
        title: 'Facebook Messenger',
        img: '/images/messenger.png',
        description:
          'Connect chatbot with Facebook Page to auto reply customer messages',
        url: `/dashboard/${params.chatflowId}/connect?channel=fb`,
      },
      {
        title: 'Telegram',
        img: '/images/telegram.png',
        description:
          'Connect chatbot with Telegram bot to auto reply customer messages',
        url: `/dashboard/${params.chatflowId}/connect?channel=telegram`,
      },
    ];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4 py-2 gap-4">
        {integrations.map((integration, index) => (
          <IntegrationCard {...integration} key={index} />
        ))}
      </div>
    );
  }
}
