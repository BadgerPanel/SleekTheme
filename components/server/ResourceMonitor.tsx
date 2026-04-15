'use client';

import { useQuery } from '@tanstack/react-query';
import { getServerResources } from '@/lib/api/servers';
import { Cpu, MemoryStick, HardDrive, Network, Clock } from 'lucide-react';

interface ResourcesData {
  cpu_percent: number; memory_bytes: number; memory_limit: number;
  memory_percent: number; disk_bytes: number; disk_limit: number;
  disk_percent: number; network_rx_bytes: number; network_tx_bytes: number;
  uptime_seconds: number;
}

interface ResourceMonitorProps {
  resources?: ResourcesData;
  serverId: string;
  compact?: boolean;
}

export function ResourceMonitor({ resources: initialResources, serverId, compact = false }: ResourceMonitorProps) {
  const { data: resources } = useQuery({
    queryKey: ['server-resources', serverId],
    queryFn: () => getServerResources(serverId),
    refetchInterval: 5000,
    initialData: initialResources,
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    if (seconds < 86400) { const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); return `${h}h ${m}m`; }
    const d = Math.floor(seconds / 86400); const h = Math.floor((seconds % 86400) / 3600); return `${d}d ${h}h`;
  };

  const getBarColor = (percent: number) => {
    if (percent >= 90) return '#ef4444';
    if (percent >= 75) return '#eab308';
    return '#7c3aed';
  };

  const getTextColor = (percent: number) => {
    if (percent >= 90) return '#ef4444';
    if (percent >= 75) return '#eab308';
    return '#22c55e';
  };

  if (!resources) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <p className="text-muted-foreground text-sm text-center">Server offline</p>
      </div>
    );
  }

  const stats = [
    { label: 'CPU', value: `${resources.cpu_percent?.toFixed(1) || 0}%`, percent: resources.cpu_percent || 0, icon: Cpu },
    { label: 'Memory', value: `${formatBytes(resources.memory_bytes || 0)} / ${formatBytes(resources.memory_limit || 0)}`, percent: resources.memory_percent || 0, icon: MemoryStick },
    { label: 'Disk', value: `${formatBytes(resources.disk_bytes || 0)} / ${formatBytes(resources.disk_limit || 0)}`, percent: resources.disk_percent || 0, icon: HardDrive },
  ];

  if (compact) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Resources</h3>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground"><Icon className="h-3.5 w-3.5" />{stat.label}</span>
                <span style={{ color: getTextColor(stat.percent) }}>{stat.value}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${Math.min(100, stat.percent)}%`, backgroundColor: getBarColor(stat.percent) }} />
              </div>
            </div>
          );
        })}
        <div className="pt-2 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground"><Network className="h-3.5 w-3.5" />Network</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg" style={{ background: 'hsl(var(--muted))' }}>
              <span className="text-muted-foreground">{'\u2193'} RX</span>
              <p className="text-foreground">{formatBytes(resources.network_rx_bytes || 0)}</p>
            </div>
            <div className="p-2 rounded-lg" style={{ background: 'hsl(var(--muted))' }}>
              <span className="text-muted-foreground">{'\u2191'} TX</span>
              <p className="text-foreground">{formatBytes(resources.network_tx_bytes || 0)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
          <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3.5 w-3.5" />Uptime</span>
          <span className="text-foreground">{formatUptime(resources.uptime_seconds || 0)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Resource Usage</h3>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-foreground"><Icon className="h-4 w-4 text-muted-foreground" />{stat.label}</span>
              <span className="font-medium" style={{ color: getTextColor(stat.percent) }}>{stat.value}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, stat.percent)}%`, backgroundColor: getBarColor(stat.percent) }} />
            </div>
          </div>
        );
      })}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-foreground mb-3"><Network className="h-4 w-4 text-muted-foreground" />Network I/O</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl" style={{ background: 'hsl(var(--muted))' }}>
            <p className="text-xs text-muted-foreground mb-1">Received (RX)</p>
            <p className="text-lg font-semibold text-foreground">{formatBytes(resources.network_rx_bytes || 0)}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'hsl(var(--muted))' }}>
            <p className="text-xs text-muted-foreground mb-1">Transmitted (TX)</p>
            <p className="text-lg font-semibold text-foreground">{formatBytes(resources.network_tx_bytes || 0)}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="flex items-center gap-2 text-foreground"><Clock className="h-4 w-4 text-muted-foreground" />Uptime</span>
        <span className="text-lg font-semibold" style={{ color: '#22c55e' }}>{formatUptime(resources.uptime_seconds || 0)}</span>
      </div>
    </div>
  );
}
