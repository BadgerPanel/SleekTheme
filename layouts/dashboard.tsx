'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Sidebar, Footer } from '@/components/layout';
import { AnnouncementBanner, AnnouncementModal } from '@/components/announcements';
import { useDashboardWebSocket } from '@/hooks/useDashboardWebSocket';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, setLoading } = useAuthStore();
  const _hasSession = useAuthStore((s) => s._hasSession);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    if (!_hasSession && !isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    setLoading(false);
  }, [_hasSession, isAuthenticated, router, setLoading]);

  useDashboardWebSocket();

  if (!_hasSession && !isAuthenticated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col pt-14 sleek-content">
        <AnnouncementBanner className="mx-auto mt-4 w-full max-w-[1600px] px-4" />
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6">{children}</main>
        <Footer />
      </div>
      {showModal && <AnnouncementModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
