import { Card } from '@nova/ui/components/ui/card';
import { File, Globe, Text } from 'lucide-react';
import Link from 'next/link';

export default function Page({ params }: { params: { chatflowId: string } }) {
  const sources = [
    {
      title: 'Web',
      description: 'Turn your website into a source of chatbot messages',
      href: `/dashboard/${params.chatflowId}/sources/web`,
      icon: Globe,
    },
    {
      title: 'File',
      description: 'Upload a file to use as a source of chatbot messages',
      href: `/dashboard/${params.chatflowId}/sources/file`,
      icon: File,
    },
    {
      title: 'Text',
      description: 'Type or paste text to use as a source of chatbot messages',
      href: `/dashboard/${params.chatflowId}/sources/text`,
      icon: Text,
    },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
      {sources.map((source, index) => (
        <Card
          className="flex p-4 flex-col shadow-md gap-3 justify-between"
          key={index}
        >
          <source.icon className="w-8 h-8 text-primary-500" />
          <h3 className="text-lg font-semibold">{source.title}</h3>
          <p className="text-sm text-gray-500 ">{source.description}</p>
          <Link
            href={source.href}
            className="text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md p-2 h-10 flex items-center justify-center"
          >
            Start
          </Link>
        </Card>
      ))}
    </div>
  );
}
