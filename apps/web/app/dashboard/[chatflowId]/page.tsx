import { Icons } from '@/components/icons';
import { Card } from '@nova/ui/components/ui/card';
import Link from 'next/link';
import React from 'react';

type Widget = {
  title: string;
  href: string;
  description: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
};

export default function ChatflowPage({
  params,
}: {
  params: {
    chatflowId: string;
  };
}) {
  const widgets: Widget[] = [
    {
      title: 'Playground',
      href: `/${params.chatflowId}/playground`,
      description: 'Test your chatflow by sending messages to it',
      icon: Icons.SquareTerminal,
    },
    {
      title: 'History',
      href: `/${params.chatflowId}/history`,
      description: 'View all your chatflow messages from users',
      icon: Icons.History,
    },
    {
      title: 'Sources',
      href: `/${params.chatflowId}/sources`,
      description: 'Manage your chatflow sources and settings for each source',
      icon: Icons.FileStack,
    },
    {
      title: 'Connect',
      href: `/${params.chatflowId}/connect`,
      description:
        'Connect your chatflow to Facebook Messenger, WhatsApp, and more',
      icon: Icons.Connect,
    },
    {
      title: 'Integration',
      href: `/${params.chatflowId}/integration`,
      description: 'Embed your chatflow on your website or app',
      icon: Icons.Integration,
    },
  ];
  return (
    <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-4">
      {widgets.map((widget, index) => {
        return (
          <Card key={index} className="py-3 px-3 shadow-md group">
            <Link className="flex flex-col gap-2" href={widget.href}>
              <widget.icon className="size-8" />
              <h3 className="font-semibold text-xl">{widget.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {widget.description}
              </p>
              <div className="flex justify-between h-6">
                <span className="text-sm text-blue-600 group-hover:block hidden duration-300 transition-all">
                  Start now
                </span>
                <Icons.ArrowRight className="size-6 group-hover:block hidden  duration-300 transition-all" />
              </div>
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
