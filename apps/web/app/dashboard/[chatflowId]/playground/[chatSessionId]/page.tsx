import { ChatInterface } from '@/components/chat/chat-interface';

export default function Page({
  params,
}: {
  params: { chatflowId: string; chatSessionId: string };
}) {
  return (
    <ChatInterface
      chatflowId={params.chatflowId}
      chatSessionId={params.chatSessionId}
      ignoreInput
    />
  );
}
