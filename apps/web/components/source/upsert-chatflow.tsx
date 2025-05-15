'use client';

import { api } from "@/api/api";
import { Button } from "@nova/ui/components/ui/button";
import { toast } from "@nova/ui/components/ui/sonner";
import { ArrowUp } from "lucide-react";

type UpsertChatflowProps = {
  chatflow: {
    id: string
  }
};


export function UpsertChatflow({chatflow}: UpsertChatflowProps) {

  const upsertSource = async () => {
    const res = await api.get(`/chatflow/${chatflow.id}/upsert-vector`);
    if (res.error) {
      toast.error("Failed to upsert chatflow");
    } else {
      toast.success("Chatflow upserted successfully");
    }
  }

  return (
    <Button className="gap-2" onClick={upsertSource} variant={"secondary"}>
      <ArrowUp />
      <span>Upsert</span>
    </Button>
  )
}