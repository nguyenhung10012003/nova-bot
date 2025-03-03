'use client';
import { Button } from "@nova/ui/components/ui/button";
import { Card } from "@nova/ui/components/ui/card";
import { Router } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type IntegrationCardProps = {
  img: string;
  title: string;
  description: string;
  url: string;
}
export function IntegrationCard({title, img, description, url} : IntegrationCardProps) {
  const router = useRouter();
  return (
    <Card className="flex flex-col py-4 px-6 border rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
      <div className="w-16 h-16">
        <Image src={img} alt={""} height={250} width={250} />
      </div>
      <h2 className="font-semibold text-xl mt-3">{title}</h2>
      <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
      <Button className="mt-4" onClick={() => router.push(url)}>Connect</Button>
    </Card>
  )
}