'use client';

import { ServerDashboardLayout } from '@/components/server/dashboard';

export default function ServerLayout({ children }: { children: React.ReactNode }) {
  return <ServerDashboardLayout>{children}</ServerDashboardLayout>;
}
