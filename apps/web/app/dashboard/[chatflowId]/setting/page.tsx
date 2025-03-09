import { api } from '@/api/api';
import ChatflowDeleteCard from '@/components/chatflow/chatflow-delete-card';
import ChatflowSettingCard from '@/components/chatflow/chatflow-setting-card';
import { Separator } from '@nova/ui/components/ui/separator';

const getChatflow = async (chatflowId: string) => {
  const res = await api.get(`/chatflow/${chatflowId}`, {
    next: {
      tags: [`chatflow-${chatflowId}`],
    },
  });
  if (res.error) {
    return null;
  } else {
    return res;
  }
};
export default async function Page({
  params,
}: {
  params: {
    chatflowId: string;
  };
}) {
  const chatflow = await getChatflow(params.chatflowId);
  return (
    <div className="flex flex-col px-4 pt-2 pb-8 gap-12">
      <ChatflowSettingCard chatflow={chatflow} />
      <div className="relative flex justify-center items-center">
        <Separator />
        <span className="text-destructive absolute bg-background">Danger Zone</span>
      </div>
      <ChatflowDeleteCard chatflow={chatflow} />
    </div>
  );
}
