'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setError(null);
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      const errorData = e.response?.data?.error;
      setError(typeof errorData === 'string' ? errorData : e.response?.data?.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-[420px] text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
          <CheckCircle className="h-7 w-7" style={{ color: '#22c55e' }} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">Check your email</h2>
        <p className="text-sm text-muted-foreground mb-6">
          If an account exists with that email, we&apos;ve sent password reset instructions.
        </p>
        <Link href="/auth/login">
          <Button variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Forgot password?</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter your email and we&apos;ll send a reset link.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && <Alert variant="destructive">{error}</Alert>}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" className="h-11 rounded-lg" {...register('email')} error={errors.email?.message} />
        </div>

        <Button type="submit" className="w-full h-11 rounded-lg text-sm font-semibold" isLoading={isLoading}>
          <Mail className="mr-2 h-4 w-4" /> Send reset link
        </Button>

        <div className="text-center">
          <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
