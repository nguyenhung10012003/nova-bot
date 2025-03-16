import { api } from "@/api/api";
import Embed from "@/components/embed/embed";

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
export default async function Page({ params }: { params: { chatflowId: string } }) {
  const chatflow = await getChatflow(params.chatflowId);
  return (
    <div className="md:px-8 px-6 pt-2 pb-8 flex flex-col gap-2">
      <h1 className="text-2xl font-bold">Embed in website or use as API</h1>
      <Embed chatflow={chatflow} />
    </div>
  );
}
