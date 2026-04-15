'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { serverApi, authApi } from '@/lib/api';
import { useAuthStore, useIsAdmin } from '@/stores/auth';
import { useSettings } from '@/contexts/SettingsContext';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InlineAnnouncements } from '@/components/announcements';
import { Server, User, Activity, Cpu, MemoryStick, Mail, Loader2, ArrowUpRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = useIsAdmin();
  const { settings } = useSettings();
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const { data: serversData, isLoading } = useQuery({
    queryKey: ['servers'],
    queryFn: () => serverApi.list(1, 100),
    refetchInterval: 30000,
  });

  const servers = serversData?.data || [];
  const runningServers = servers.filter((s: any) => s.status === 'running').length;
  const totalServers = servers.length;

  const needsEmailVerification = settings?.require_email_verification && user && !user.email_verified_at && !isAdmin;

  const refreshUser = useCallback(async () => {
    if (!needsEmailVerification) return;
    try {
      const res = await authApi.me();
      if (res.data?.email_verified_at) {
        useAuthStore.getState().setUser(res.data);
      }
    } catch {}
  }, [needsEmailVerification]);

  useEffect(() => {
    if (!needsEmailVerification) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshUser();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [needsEmailVerification, refreshUser]);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResendingVerification(true);
    try {
      await authApi.resendVerification(user.email);
      setVerificationSent(true);
    } catch {} finally {
      setResendingVerification(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="p-6">
          <div className="rounded-2xl p-8 mb-8" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.1))' }}>
            <div className="h-8 w-64 bg-white/10 rounded animate-pulse mb-2" />
            <div className="h-5 w-80 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border">
                <div className="h-4 w-24 bg-muted/50 rounded animate-pulse mb-3" />
                <div className="h-8 w-16 bg-muted/50 rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-muted/30 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6">
        {needsEmailVerification && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <Mail className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-300">Verify your email address</p>
              <p className="text-xs text-amber-300/80">
                Please check your inbox for a verification link. Some features are restricted until your email is verified.
              </p>
            </div>
            {verificationSent ? (
              <span className="text-xs text-green-400">Verification email sent!</span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={resendingVerification}
                className="border-amber-500/30 text-amber-300 hover:bg-amber-500/20 flex-shrink-0"
              >
                {resendingVerification ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Resend Email
              </Button>
            )}
          </div>
        )}

        <div
          className="rounded-2xl p-8 mb-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6366f1 100%)',
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(30%, -40%)' }} />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(-50%, 50%)' }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-5 w-5 text-violet-200" />
              <span className="text-sm font-medium text-violet-200">Welcome back</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">{user?.username}</h2>
            <p className="text-violet-200 text-sm">
              You have {runningServers} server{runningServers !== 1 ? 's' : ''} running out of {totalServers} total.
            </p>
          </div>
        </div>

        <InlineAnnouncements page="dashboard" className="mb-6" />

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SleekStatsCard
            title="Total Servers"
            value={totalServers}
            description="Servers in your account"
            icon={Server}
            href="/dashboard/servers"
            color="#7c3aed"
          />
          <SleekStatsCard
            title="Running"
            value={runningServers}
            description="Currently online"
            icon={Activity}
            color="#22c55e"
          />
          <SleekStatsCard
            title="Offline"
            value={totalServers - runningServers}
            description="Currently stopped"
            icon={Server}
            color="#eab308"
          />
          {isAdmin && (
            <SleekStatsCard
              title="Role"
              value="Admin"
              description="Full system access"
              icon={User}
              color="#3b82f6"
            />
          )}
        </div>

        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Your Servers</CardTitle>
                <CardDescription>Quick access to your game servers</CardDescription>
              </div>
              <Link href="/dashboard/servers">
                <Badge variant="outline" className="cursor-pointer hover:bg-accent gap-1">
                  View all
                  <ArrowUpRight className="h-3 w-3" />
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {servers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(124, 58, 237, 0.1)' }}>
                  <Server className="h-8 w-8" style={{ color: '#7c3aed' }} />
                </div>
                <h3 className="text-lg font-semibold">No servers yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isAdmin
                    ? 'Create your first server to get started.'
                    : 'Contact an administrator to get a server assigned.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {servers.slice(0, 5).map((server: any) => (
                  <Link
                    key={server.id}
                    href={`/servers/${server.uuid || server.id}`}
                    className="flex items-center justify-between rounded-xl border border-border p-4 transition-all hover:bg-accent/50 hover:border-violet-500/20"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: server.status === 'running'
                            ? '#22c55e'
                            : server.status === 'starting' || server.status === 'stopping'
                            ? '#eab308'
                            : '#6b7280',
                          boxShadow: server.status === 'running'
                            ? '0 0 8px rgba(34, 197, 94, 0.4)'
                            : undefined,
                        }}
                      />
                      <div>
                        <p className="font-semibold text-sm">{server.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(() => {
                            if (server.deployment_type === 'kubernetes') {
                              const alloc = server.k8s_allocations?.find((a: any) => a.is_primary) || server.k8s_allocations?.[0];
                              if (alloc) return `${alloc.node_ip || server.cluster?.connection_address || 'K8s'}:${alloc.node_port}`;
                              return 'No allocation';
                            }
                            if (server.allocation?.ip_address && server.allocation?.port) {
                              const ip = server.allocation.display_ip || server.allocation.ip_alias || server.allocation.ip_address;
                              return `${ip}:${server.allocation.port}`;
                            }
                            return 'No allocation';
                          })()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="hidden items-center gap-1 sm:flex text-xs">
                        <MemoryStick className="h-3.5 w-3.5" />
                        {server.memory_limit} MB
                      </span>
                      <span className="hidden items-center gap-1 sm:flex text-xs">
                        <Cpu className="h-3.5 w-3.5" />
                        {server.deployment_type === 'kubernetes' ? (server.cpu_limit / 10) : server.cpu_limit}%
                      </span>
                      <Badge
                        variant={
                          server.status === 'running'
                            ? 'success'
                            : server.status === 'offline'
                            ? 'secondary'
                            : 'warning'
                        }
                        className="capitalize text-xs"
                      >
                        {server.status || 'offline'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

interface SleekStatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  color: string;
  href?: string;
}

function SleekStatsCard({ title, value, description, icon: Icon, color, href }: SleekStatsCardProps) {
  const content = (
    <Card className="rounded-xl transition-all hover:shadow-lg group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
          <div
            className="rounded-xl p-3 transition-transform group-hover:scale-105"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
