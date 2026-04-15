'use client';

import { ReactNode } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getServer, getServerResources } from '@/lib/api/servers';
import { useServerRealtime } from '@/hooks/useServerRealtime';
import { ServerSidebar } from './ServerSidebar';
import { ServerStatsPanel } from './ServerStatsPanel';
import { ServerPowerControls } from './ServerPowerControls';
import { ServerBottomCharts } from './ServerBottomCharts';
import { Server as ServerIcon, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface ServerDashboardLayoutProps {
  children: ReactNode;
}

export function ServerDashboardLayout({ children }: ServerDashboardLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const serverId = params.id as string;

  useServerRealtime(serverId);

  const getActiveTab = () => {
    if (pathname.includes('/files')) return 'files';
    if (pathname.includes('/databases')) return 'databases';
    if (pathname.includes('/schedules')) return 'schedules';
    if (pathname.includes('/network')) return 'network';
    if (pathname.includes('/startup')) return 'startup';
    if (pathname.includes('/settings')) return 'settings';
    if (pathname.includes('/activity')) return 'activity';
    if (pathname.includes('/backups')) return 'backups';
    if (pathname.includes('/subusers')) return 'subusers';
    if (pathname.includes('/minecraft-mods')) return 'minecraft-mods';
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 3) {
      const last = segments[segments.length - 1];
      if (!['console'].includes(last) && last !== serverId) return last;
    }
    return 'console';
  };

  const activeTab = getActiveTab();

  const { data: server, isLoading: serverLoading, error: serverError } = useQuery({
    queryKey: ['server', serverId],
    queryFn: () => getServer(serverId),
  });

  const { data: resources } = useQuery({
    queryKey: ['server-resources', serverId],
    queryFn: () => getServerResources(serverId),
    refetchInterval: false,
  });

  if (serverLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-muted/50 rounded animate-pulse" />
            <div className="h-3 w-3 bg-muted/50 rounded-full animate-pulse" />
            <div className="h-6 w-48 bg-muted/50 rounded animate-pulse" />
          </div>
        </div>
        <div className="border-b border-border px-4 flex gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 w-20 bg-muted/30 rounded animate-pulse my-1" />
          ))}
        </div>
        <div className="flex-1 p-4">
          <div className="bg-card border border-border rounded-xl h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (serverError || !server) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <ServerIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Server Not Found</h2>
        <p className="text-muted-foreground">The server you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.</p>
        <Link href="/dashboard" className="mt-4 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const getStatusColor = () => {
    const status = server.status?.toLowerCase() || 'offline';
    switch (status) {
      case 'running': return '#22c55e';
      case 'starting': case 'stopping': return '#eab308';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <header className="border-b border-border px-4 py-3 shrink-0 bg-card">
        <div className="flex items-center justify-between max-w-[1920px] mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-1.5 -ml-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" title="Back to servers">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getStatusColor(), boxShadow: server.status === 'running' ? `0 0 8px ${getStatusColor()}` : undefined }} />
            <h1 className="text-lg font-semibold text-foreground">{server.name || 'Unnamed Server'}</h1>
            <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-muted text-muted-foreground capitalize">{server.status || 'Unknown'}</span>
          </div>
          <ServerPowerControls serverId={serverId} currentStatus={server.status || 'offline'} />
        </div>
      </header>

      <ServerSidebar serverId={serverId} activeTab={activeTab} />

      <div className="flex-1 flex overflow-hidden min-h-0">
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 flex overflow-hidden min-h-0">
            <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-0">
              {children}
            </div>
            <ServerStatsPanel server={server} resources={resources} />
          </div>
          <ServerBottomCharts serverId={serverId} resources={resources} />
        </main>
      </div>
    </div>
  );
}
