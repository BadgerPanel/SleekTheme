'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { TwoFactorVerification } from '@/components/auth/TwoFactorVerification';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { Shield, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, setTwoFactorRequired, twoFactor, clearTwoFactor } = useAuthStore();
  const { settings, refreshSettings } = useSettings();
  const { refreshTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const oauthErrorMessages: Record<string, string> = {
      'access_denied': 'OAuth access was denied.',
      'invalid_state': 'OAuth session expired, please try again.',
      'provider_error': 'The OAuth provider returned an error.',
      'account_exists': 'An account with this email already exists.',
      'not_configured': 'This OAuth provider is not configured.',
      'email_required': 'Email address is required from the OAuth provider.',
      'server_error': 'An unexpected error occurred during OAuth sign-in.',
    };
    const oauthError = searchParams.get('oauth_error');
    if (oauthError) {
      setError(oauthErrorMessages[oauthError] || 'An error occurred during sign-in.');
    }
    if (searchParams.get('registered') === 'true') {
      if (searchParams.get('verify') === 'true') {
        setSuccessMessage('Account created successfully! Please check your email for a verification link, then sign in.');
      } else {
        setSuccessMessage('Account created successfully! Please sign in.');
      }
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.login(data.email, data.password);

      if (response.data?.requires_2fa && response.data?.two_factor_token) {
        setTwoFactorRequired(
          response.data.two_factor_token,
          data.email,
          response.data.webauthn_enabled ?? false,
          response.data.totp_enabled ?? false,
        );
        return;
      }

      if (response.success) {
        setAuth(response.data.access_token, response.data.user);
        await Promise.all([refreshSettings(), refreshTheme()]);
        const returnUrl = searchParams.get('returnUrl');
        router.push(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard');
      } else {
        setError(response.error?.message || 'Login failed');
      }
    } catch (err: any) {
      const errorData = err.response?.data?.error;
      let message: string;
      if (typeof errorData === 'string') {
        message = errorData;
      } else if (errorData && typeof errorData === 'object' && errorData.message) {
        message = errorData.message;
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else {
        message = 'An error occurred during login';
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (twoFactor.required) {
    return <TwoFactorVerification onBack={() => { clearTwoFactor(); setError(null); }} />;
  }

  const panelName = settings?.panel_name || 'BadgerPanel';

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
          <Shield className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to {panelName}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {successMessage && (
          <Alert variant="success">{successMessage}</Alert>
        )}
        {error && (
          <Alert variant="destructive">{error}</Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="h-11 rounded-lg"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Password</Label>
            <Link href="/auth/forgot-password" className="text-xs font-medium" style={{ color: '#a78bfa' }}>
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            className="h-11 rounded-lg"
            {...register('password')}
            error={errors.password?.message}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-lg text-sm font-semibold"
          isLoading={isLoading}
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', border: 'none' }}
        >
          {!isLoading && (
            <>
              Sign in
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <OAuthButtons action="login" />

        {settings?.registration_enabled !== false && (
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-medium hover:underline" style={{ color: '#a78bfa' }}>
              Create one
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}
