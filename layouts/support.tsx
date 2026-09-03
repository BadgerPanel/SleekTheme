'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Sidebar, Footer } from '@/components/layout';
import { Loading } from '@/components/ui/spinner';

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, setLoading } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentState = useAuthStore.getState();
      if (currentState.isAuthenticated && currentState.accessToken) {
        setLoading(false);
        setChecking(false);
        return;
      }
      try {
        const stored = localStorage.getItem('badger-auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          const state = parsed?.state;
          if (state?._hasSession && state?.user) {
            setLoading(false);
            setChecking(false);
            return;
          }
        }
      } catch {
        localStorage.removeItem('badger-auth');
      }
      router.replace('/auth/login');
    };
    checkAuth();
  }, [router, setLoading]);

  if (checking) return <Loading fullScreen message="Loading..." />;
  if (!isAuthenticated) return <Loading fullScreen message="Redirecting..." />;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col pt-14 sleek-content">
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
