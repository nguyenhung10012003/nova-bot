import { IntegrationCard } from '@/components/integration/integration-card';
import { Card } from '@nova/ui/components/ui/card';

export default function Page({
  params,
  searchParams,
}: {
  params: {
    chatflowId: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  if (searchParams?.channel === 'fb') {
    return <Card></Card>;
  } else if (searchParams?.channel === 'telegram') {
    return <></>;
  } else {
    const integrations = [
      {
        title: 'Facebook Messenger',
        img: '/images/messenger.png',
        description: 'Connect chatbot with Facebook Page to auto reply customer messages',
        url: `/dashboard/${params.chatflowId}/connect?channel=fb`
      },
      {
        title: 'Telegram',
        img: '/images/telegram.png',
        description: 'Connect chatbot with Telegram bot to auto reply customer messages',
        url: `/dashboard/${params.chatflowId}/connect?channel=telegram`
      }
    ]
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-4 py-2 gap-4">
        {integrations.map((integration, index) => (
          <IntegrationCard {...integration} key={index}/>
        ))}
      </div>
    );
  }
}
