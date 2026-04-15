'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serverApi } from '@/lib/api';
import { useIsAdmin } from '@/stores/auth';
import { Header } from '@/components/layout/header';
import { ServerCard } from '@/components/servers/server-card';
import { PageLoading } from '@/components/ui/spinner';
import { Alert } from '@/components/ui/alert';
import { InlineAnnouncements } from '@/components/announcements';
import { Server as ServerIcon, User, Users, Shield } from 'lucide-react';
import { useState } from 'react';

type ServerFilter = 'all' | 'owned' | 'subuser' | 'admin';

export default function ServersPage() {
  const queryClient = useQueryClient();
  const isAdmin = useIsAdmin();
  const [actionError, setActionError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ServerFilter>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['servers', filter],
    queryFn: () => serverApi.list(1, 100, filter === 'all' ? undefined : filter),
    refetchInterval: 5000,
  });

  const powerMutation = useMutation({
    mutationFn: ({ serverId, action }: { serverId: string; action: 'start' | 'stop' | 'restart' }) =>
      serverApi.power(serverId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.response?.data?.error?.message || 'Failed to perform power action');
    },
  });

  const handlePowerAction = (serverId: string, action: 'start' | 'stop' | 'restart') => {
    setActionError(null);
    powerMutation.mutate({ serverId, action });
  };

  if (isLoading) return <PageLoading />;

  const servers = data?.data || [];

  const filters: { key: ServerFilter; label: string; icon: React.ComponentType<any> }[] = [
    { key: 'all', label: 'All Servers', icon: ServerIcon },
    { key: 'owned', label: 'My Servers', icon: User },
    { key: 'subuser', label: 'Shared With Me', icon: Users },
    ...(isAdmin ? [{ key: 'admin' as ServerFilter, label: 'All (Admin)', icon: Shield }] : []),
  ];

  return (
    <>
      <Header title="My Servers" />
      <div className="p-6">
        {error && <Alert variant="destructive" className="mb-6">Failed to load servers.</Alert>}
        {actionError && <Alert variant="destructive" className="mb-6">{actionError}</Alert>}
        <InlineAnnouncements page="servers" className="mb-6" />

        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'hsl(var(--muted))' }}>
          {filters.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={filter === key ? {
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: 'white',
                boxShadow: '0 2px 8px -2px rgba(124, 58, 237, 0.4)',
              } : {
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {servers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 rounded-2xl p-6" style={{ background: 'rgba(124, 58, 237, 0.08)' }}>
              <ServerIcon className="h-12 w-12" style={{ color: '#7c3aed' }} />
            </div>
            <h2 className="mb-2 text-xl font-semibold">
              {filter === 'subuser' ? 'No shared servers' : 'No servers found'}
            </h2>
            <p className="max-w-md text-muted-foreground">
              {filter === 'subuser' ? 'No servers have been shared with you yet.'
                : filter === 'owned' ? "You don't own any servers yet."
                : "You don't have any servers yet. Contact an administrator to get started."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {servers.map((server: any) => (
              <ServerCard key={server.id} server={server} onPowerAction={handlePowerAction} isLoading={powerMutation.isPending} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
