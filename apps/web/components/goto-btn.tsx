'use client';
import { Button, ButtonProps } from '@nova/ui/components/ui/button';
import { useRouter } from 'next/router';

export function GotoBtn({
  to,
  children,
  ...props
}: {
  to: string;
  children: React.ReactNode;
} & ButtonProps) {
  const router = useRouter();
  return (
    <Button
      {...props}
      onClick={() => {
        router.push(to);
      }}
    >
      {children}
    </Button>
  );
}
