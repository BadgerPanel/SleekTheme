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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 pl-[60px] flex flex-col min-h-screen transition-all duration-300 sleek-content">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
