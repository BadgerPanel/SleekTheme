'use client';

import { memo, useRef, useEffect } from 'react';
import {
  Globe, Clock, Cpu, MemoryStick, HardDrive,
  ArrowDownToLine, ArrowUpFromLine,
} from 'lucide-react';

interface ServerStatsPanelProps {
  server: {
    id?: string; name?: string; uuid?: string; status?: string;
    allocation_ip?: string; allocation_port?: number;
    node_name?: string; node_id?: string | null;
    allocation?: { ip_address?: string; ip?: string; ip_alias?: string; display_ip?: string; port?: number };
    node?: { id?: string; name?: string; uuid?: string };
    memory_limit?: number; disk_limit?: number; cpu_limit?: number;
    deployment_type?: 'daemon' | 'kubernetes'; cluster_id?: string; cluster_name?: string;
    cluster?: { id?: string; name?: string; connection_address?: string };
    k8s_allocations?: Array<{ node_port: number; container_port: number; protocol: string; is_primary: boolean; node_ip?: string }>;
    k8s_node_ip?: string;
  };
  resources?: {
    cpu_percent?: number; memory_bytes?: number; memory_limit?: number;
    disk_bytes?: number; disk_limit?: number;
    network_rx_bytes?: number; network_tx_bytes?: number; uptime_seconds?: number;
  };
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

function formatUptime(seconds: number): string {
  if (!seconds || seconds <= 0) return 'Offline';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function CircularGauge({ percent, label, color, size = 72 }: { percent: number; label: string; color: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = (size - 12) / 2;
    const lineWidth = 6;
    const startAngle = Math.PI * 0.75;
    const totalAngle = Math.PI * 1.5;
    const valueAngle = startAngle + (totalAngle * Math.min(100, Math.max(0, percent)) / 100);

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, startAngle + totalAngle);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    if (percent > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, valueAngle);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `bold ${size * 0.22}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(percent)}%`, cx, cy - 2);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = `500 ${size * 0.12}px Inter, sans-serif`;
    ctx.fillText(label, cx, cy + size * 0.16);
  }, [percent, label, color, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
    />
  );
}

export const ServerStatsPanel = memo(function ServerStatsPanel({ server, resources }: ServerStatsPanelProps) {
  const isOnline = server.status?.toLowerCase() === 'running';
  const isK8s = server.deployment_type === 'kubernetes';

  let address = 'Not assigned';
  if (isK8s) {
    const alloc = server.k8s_allocations?.find(a => a.is_primary) || server.k8s_allocations?.[0];
    if (alloc) {
      const nodeIp = alloc.node_ip || server.k8s_node_ip || server.cluster?.connection_address || 'K8s';
      address = `${nodeIp}:${alloc.node_port}`;
    }
  } else {
    const ip = server.allocation?.display_ip || server.allocation?.ip_alias || server.allocation?.ip_address || server.allocation?.ip || server.allocation_ip;
    const port = server.allocation?.port || server.allocation_port;
    if (ip && port) address = `${ip}:${port}`;
  }

  const nodeName = isK8s
    ? (server.cluster?.name || server.cluster_name || `Cluster ${server.cluster_id?.slice(0, 8) || '?'}`)
    : (server.node?.name || server.node_name || 'Unknown');

  const memUsed = resources?.memory_bytes || 0;
  const memLimit = resources?.memory_limit || (server.memory_limit ? server.memory_limit * 1024 * 1024 : 0);
  const memPct = memLimit > 0 ? (memUsed / memLimit) * 100 : 0;

  const diskUsed = resources?.disk_bytes || 0;
  const diskLimit = resources?.disk_limit || (server.disk_limit ? server.disk_limit * 1024 * 1024 : 0);
  const diskPct = diskLimit > 0 ? (diskUsed / diskLimit) * 100 : 0;

  const cpuPct = resources?.cpu_percent || 0;
  const rawCpuLimit = server.cpu_limit || 100;
  const cpuLimit = isK8s ? rawCpuLimit / 10 : rawCpuLimit;
  const cpuProgress = cpuLimit > 0 ? (cpuPct / cpuLimit) * 100 : cpuPct;

  const getGaugeColor = (pct: number) => {
    if (pct >= 90) return '#ef4444';
    if (pct >= 70) return '#eab308';
    return '#7c3aed';
  };

  return (
    <aside className="w-64 border-l border-border p-4 flex flex-col gap-3 shrink-0 overflow-y-auto bg-card">
      <h2 className="text-sm font-semibold text-foreground mb-1">Server Info</h2>

      {isOnline && (
        <div className="flex items-center justify-around py-2">
          <CircularGauge percent={cpuProgress} label="CPU" color={getGaugeColor(cpuProgress)} />
          <CircularGauge percent={memPct} label="RAM" color={getGaugeColor(memPct)} />
          <CircularGauge percent={diskPct} label="Disk" color={getGaugeColor(diskPct)} />
        </div>
      )}

      <StatRow icon={<Globe className="h-4 w-4" />} label="Address" value={address} iconColor="#7c3aed" />
      <StatRow icon={<Clock className="h-4 w-4" />} label="Uptime" value={isOnline ? formatUptime(resources?.uptime_seconds || 0) : 'Offline'} iconColor="#22c55e" />
      <StatRow icon={<Cpu className="h-4 w-4" />} label="CPU" value={isOnline ? `${cpuPct.toFixed(1)}% / ${cpuLimit}%` : 'Offline'} iconColor="#f97316" />
      <StatRow icon={<MemoryStick className="h-4 w-4" />} label="Memory" value={isOnline && memUsed > 0 ? `${formatBytes(memUsed)} / ${memLimit > 0 ? formatBytes(memLimit) : '\u221e'}` : 'Offline'} iconColor="#a855f7" />
      <StatRow icon={<HardDrive className="h-4 w-4" />} label="Disk" value={`${formatBytes(diskUsed)} / ${diskLimit > 0 ? formatBytes(diskLimit) : '\u221e'}`} iconColor="#06b6d4" />
      {isOnline && (
        <>
          <StatRow icon={<ArrowDownToLine className="h-4 w-4" />} label="Net In" value={formatBytes(resources?.network_rx_bytes || 0)} iconColor="#22c55e" />
          <StatRow icon={<ArrowUpFromLine className="h-4 w-4" />} label="Net Out" value={formatBytes(resources?.network_tx_bytes || 0)} iconColor="#eab308" />
        </>
      )}

      <div className="mt-auto pt-3 border-t border-border">
        <h3 className="text-xs font-semibold text-muted-foreground mb-2">Details</h3>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{isK8s ? 'Cluster' : 'Node'}</span>
            <span className="text-foreground">{nodeName}</span>
          </div>
          {isK8s && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span style={{ color: '#7c3aed' }} className="text-[10px]">Kubernetes</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">UUID</span>
            <span className="text-foreground font-mono text-[10px]">{server.uuid?.slice(0, 8) || '-'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
});

function StatRow({ icon, label, value, iconColor }: { icon: React.ReactNode; label: string; value: string; iconColor: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg p-2.5" style={{ background: 'hsl(var(--muted))' }}>
      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${iconColor}15`, color: iconColor }}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-xs font-semibold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
