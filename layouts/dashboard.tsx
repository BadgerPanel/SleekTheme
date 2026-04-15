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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 pl-[60px] flex flex-col min-h-screen transition-all duration-300 sleek-content">
        <AnnouncementBanner className="mx-6 mt-4" />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      {showModal && <AnnouncementModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
