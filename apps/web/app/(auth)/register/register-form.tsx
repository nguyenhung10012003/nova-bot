'use client';
import { api } from '@/api/api';
import { Alert, AlertDescription } from '@nova/ui/components/ui/alert';
import { Button } from '@nova/ui/components/ui/button';
import { Input } from '@nova/ui/components/ui/input';
import { Label } from '@nova/ui/components/ui/label';
import { cn } from '@nova/ui/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    } else if (password.length > 32) {
      newErrors.password = 'Password must not exceed 32 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (validateForm()) {
      try {
        const response = await api.post('/auth/register', { email, password });
        router.push('/login');
      } catch (error) {
        setSubmitError('An error occurred. Please try again.');
      }
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
            value={email}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>

          <Input
            id="password"
            type="password"
            required
            minLength={6}
            maxLength={32}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? 'border-red-500' : ''}
            value={password}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            required
            minLength={6}
            maxLength={32}
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full">
          Register
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have account?{' '}
        <Link href="/login" className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </form>
  );
}
