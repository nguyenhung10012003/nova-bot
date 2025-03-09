'use client';
import { Chatflow } from '@/@types/chatflow';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@nova/ui/components/ui/card';
import { Label } from '@nova/ui/components/ui/label';
import { Input } from '@nova/ui/components/ui/input';
import { Button } from '@nova/ui/components/ui/button';
import { api } from '@/api/api';
import { toast } from '@nova/ui/components/ui/sonner';
import { useState } from 'react';
import revalidate from '@/api/action';

export default function ChatflowSettingCard({
  chatflow,
}: {
  chatflow: Chatflow;
}) {
  const [saving, setSaving] = useState(false);
  const onSaveSetting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      baseUrl: formData.get('baseUrl') as string,
      apiKey: formData.get('apiKey') as string,
      chatflowId: formData.get('chatflowId') as string,
    };
    
    const res = await api.patch(`/chatflow/${chatflow.id}`, {
      ...data
    });
    if (res.error) {
      toast.error('Failed to save setting');
    }
    else {
      revalidate('chatflows');
      revalidate(`chatflow-${chatflow.id}`);
      toast.success('Setting saved');
    }
    setSaving(false);
  };
  return (
    <form onSubmit={onSaveSetting} autoComplete="off">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Change your chatflow setting here</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={chatflow.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chatflowId">Flowise ID</Label>
            <Input
              id="chatflowId"
              name="chatflowId"
              type="text"
              defaultValue={chatflow.chatflowId}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              name="baseUrl"
              type="text"
              defaultValue={chatflow.baseUrl}
              placeholder="https://api.example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              name="apiKey"
              type="password"
              defaultValue={chatflow.apiKey}
              placeholder="********"
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={saving}>
            Save
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
