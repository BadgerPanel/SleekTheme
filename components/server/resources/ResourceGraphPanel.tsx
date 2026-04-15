'use client';

import { useState } from 'react';
import { Cpu, MemoryStick, HardDrive, Network, Loader2 } from 'lucide-react';
import { ResourceChart } from './ResourceChart';
import { useResourceHistory } from '@/hooks/useResources';
import type { ResourceHistoryPeriod } from '@/types/server';

interface ResourceGraphPanelProps {
  serverId: string;
}

const PERIODS: { value: ResourceHistoryPeriod; label: string }[] = [
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
];

const RESOURCE_TYPES = [
  { key: 'cpu' as const, label: 'CPU', icon: Cpu, color: '#7c3aed' },
  { key: 'memory' as const, label: 'Memory', icon: MemoryStick, color: '#a855f7' },
  { key: 'disk' as const, label: 'Disk', icon: HardDrive, color: '#22c55e' },
  { key: 'network' as const, label: 'Network', icon: Network, color: '#6366f1' },
];

export function ResourceGraphPanel({ serverId }: ResourceGraphPanelProps) {
  const [period, setPeriod] = useState<ResourceHistoryPeriod>('1h');
  const [activeResource, setActiveResource] = useState<'cpu' | 'memory' | 'disk' | 'network'>('cpu');

  const { data: history, isLoading, error } = useResourceHistory(serverId, period);
  const activeType = RESOURCE_TYPES.find((t) => t.key === activeResource)!;
  const ActiveIcon = activeType.icon;

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ActiveIcon className="h-5 w-5" style={{ color: activeType.color }} />
          <h3 className="text-lg font-semibold text-foreground">Resource Usage</h3>
        </div>

        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'hsl(var(--muted))' }}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="px-3 py-1 text-xs font-medium rounded-md transition-all"
              style={period === p.value
                ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', boxShadow: '0 2px 6px -1px rgba(124,58,237,0.3)' }
                : { color: 'hsl(var(--muted-foreground))' }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sleek-tabs border-b border-border">
        {RESOURCE_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.key}
              onClick={() => setActiveResource(type.key)}
              className={`sleek-tab flex-1 justify-center ${activeResource === type.key ? 'active' : ''}`}
              style={activeResource === type.key ? { color: type.color, borderBottomColor: type.color } : {}}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{type.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#7c3aed' }} />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-sm text-destructive">Failed to load resource history</p>
          </div>
        ) : history && history.data.length > 0 ? (
          <ResourceChart data={history.data} period={period} type={activeResource} height={200} />
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-sm text-muted-foreground">No data available for this period</p>
          </div>
        )}
      </div>

      {history && history.data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 p-4 border-t border-border" style={{ background: 'hsl(var(--muted))' }}>
          <StatBox label="Current" value={getCurrent(history.data, activeResource)} type={activeResource} />
          <StatBox label="Average" value={getAverage(history.data, activeResource)} type={activeResource} />
          <StatBox label="Peak" value={getPeak(history.data, activeResource)} type={activeResource} />
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, type }: { label: string; value: number; type: string }) {
  const fmt = (v: number): string => {
    if (type === 'network') return v >= 1024 ? `${(v / 1024).toFixed(1)} GB` : `${v.toFixed(1)} MB`;
    return `${v.toFixed(1)}%`;
  };
  return (
    <div className="text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-semibold text-foreground">{fmt(value)}</p>
    </div>
  );
}

function getCurrent(data: any[], type: string): number {
  const latest = data[data.length - 1];
  if (!latest) return 0;
  switch (type) { case 'cpu': return latest.cpu_percent; case 'memory': return latest.memory_percent; case 'disk': return latest.disk_percent; case 'network': return latest.network_rx_bytes / (1024 * 1024); default: return 0; }
}

function getAverage(data: any[], type: string): number {
  if (!data.length) return 0;
  const sum = data.reduce((a, p) => { switch (type) { case 'cpu': return a + p.cpu_percent; case 'memory': return a + p.memory_percent; case 'disk': return a + p.disk_percent; case 'network': return a + p.network_rx_bytes / (1024 * 1024); default: return a; } }, 0);
  return sum / data.length;
}

function getPeak(data: any[], type: string): number {
  if (!data.length) return 0;
  return Math.max(...data.map(p => { switch (type) { case 'cpu': return p.cpu_percent; case 'memory': return p.memory_percent; case 'disk': return p.disk_percent; case 'network': return p.network_rx_bytes / (1024 * 1024); default: return 0; } }));
}
