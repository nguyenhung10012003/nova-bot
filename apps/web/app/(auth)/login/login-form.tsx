'use client';
import { api } from '@/api/api';
import { useAuth } from '@/components/auth-provider';
import { Alert, AlertDescription } from '@nova/ui/components/ui/alert';
import { Button } from '@nova/ui/components/ui/button';
import { Input } from '@nova/ui/components/ui/input';
import { Label } from '@nova/ui/components/ui/label';
import { cn } from '@nova/ui/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();
  const { setAuth } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      setAuth(response);
      router.push('/dashboard'); // Redirect to dashboard on successful sign-in
    } catch (error) {
      setSubmitError('An error occurred. Please try again.');
    }
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            maxLength={32}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full">
          Login
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  );
}
