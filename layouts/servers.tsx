'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useDashboardWebSocket } from '@/hooks/useDashboardWebSocket';

export default function ServersLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, setLoading } = useAuthStore();
  const _hasSession = useAuthStore((s) => s._hasSession);

  useEffect(() => {
    if (!_hasSession && !isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    setLoading(false);
  }, [_hasSession, isAuthenticated, router, setLoading]);

  useDashboardWebSocket();

  if (!_hasSession && !isAuthenticated) return null;

  return <>{children}</>;
}
