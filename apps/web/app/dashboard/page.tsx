import { api } from '@/api/api';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const getChatflows = async () => {
  const res = await api.get('/chatflow', {
    next: {
      tags: ['chatflows'],
    },
  });
  if (res.error) {
    return null;
  }
  return res;
};

export default async function DashboardPage() {
  const chatflows = await getChatflows();
  if (!chatflows?.length) {
    redirect('dashboard/new');
  } else {
    redirect(`dashboard/${chatflows[0].id}`);
  }
}
