import { ChatInterface } from '@/components/chat/chat-interface';

export default async function Page({
  params,
}: {
  params: { chatflowId: string };
}) {
  return <ChatInterface chatflowId={params.chatflowId} />;
}
