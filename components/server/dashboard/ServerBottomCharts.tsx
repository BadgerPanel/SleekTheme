'use client';

import { useEffect, useState, useRef, memo } from 'react';
import { Cpu, MemoryStick, Wifi } from 'lucide-react';

interface ServerBottomChartsProps {
  serverId: string;
  resources?: {
    cpu_percent?: number;
    memory_bytes?: number;
    memory_limit?: number;
    network_rx_bytes?: number;
    network_tx_bytes?: number;
  };
}

interface DataPoint {
  timestamp: number;
  value: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

interface MiniChartProps {
  title: string;
  icon: React.ReactNode;
  data: DataPoint[];
  currentValue: string;
  maxValue?: string;
  color: string;
}

function MiniChart({ title, icon, data, currentValue, maxValue, color }: MiniChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    if (data.length < 2) {
      ctx.strokeStyle = color + '40';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    const maxDataValue = Math.max(...data.map(d => d.value), 1);
    const padding = 4;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + '30');
    gradient.addColorStop(1, color + '05');

    ctx.beginPath();
    ctx.moveTo(0, height);
    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - padding - ((point.value / maxDataValue) * (height - padding * 2));
      ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    data.forEach((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - padding - ((point.value / maxDataValue) * (height - padding * 2));
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }, [data, color]);

  return (
    <div className="bg-card rounded-xl border border-border p-3 flex-1 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-foreground">{currentValue}</span>
          {maxValue && <span className="text-xs text-muted-foreground ml-1">/ {maxValue}</span>}
        </div>
      </div>
      <div className="relative h-12">
        <canvas ref={canvasRef} className="w-full h-full" style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}

const MAX_DATA_POINTS = 30;

export const ServerBottomCharts = memo(function ServerBottomCharts({ serverId, resources }: ServerBottomChartsProps) {
  const [cpuHistory, setCpuHistory] = useState<DataPoint[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<DataPoint[]>([]);
  const [networkHistory, setNetworkHistory] = useState<DataPoint[]>([]);
  const lastNetworkRef = useRef({ rx: 0, tx: 0, timestamp: Date.now() });

  useEffect(() => {
    if (!resources) return;
    const now = Date.now();

    setCpuHistory(prev => [...prev, { timestamp: now, value: resources.cpu_percent || 0 }].slice(-MAX_DATA_POINTS));

    const memPct = resources.memory_limit && resources.memory_limit > 0
      ? ((resources.memory_bytes || 0) / resources.memory_limit) * 100 : 0;
    setMemoryHistory(prev => [...prev, { timestamp: now, value: memPct }].slice(-MAX_DATA_POINTS));

    const currentRx = resources.network_rx_bytes || 0;
    const currentTx = resources.network_tx_bytes || 0;
    const timeDiff = (now - lastNetworkRef.current.timestamp) / 1000;
    if (timeDiff > 0 && lastNetworkRef.current.timestamp > 0) {
      const rxRate = Math.max(0, (currentRx - lastNetworkRef.current.rx) / timeDiff);
      const txRate = Math.max(0, (currentTx - lastNetworkRef.current.tx) / timeDiff);
      setNetworkHistory(prev => [...prev, { timestamp: now, value: rxRate + txRate }].slice(-MAX_DATA_POINTS));
    }
    lastNetworkRef.current = { rx: currentRx, tx: currentTx, timestamp: now };
  }, [resources]);

  const cpuPercent = resources?.cpu_percent || 0;
  const memoryBytes = resources?.memory_bytes || 0;
  const memoryLimit = resources?.memory_limit || 0;
  const networkRate = networkHistory.length > 0 ? networkHistory[networkHistory.length - 1].value : 0;

  return (
    <div className="bg-background border-t border-border p-4">
      <div className="flex gap-4 overflow-x-auto">
        <MiniChart title="CPU Load" icon={<Cpu className="h-4 w-4" />} data={cpuHistory}
          currentValue={`${cpuPercent.toFixed(1)}%`} maxValue="100%" color="#7c3aed" />
        <MiniChart title="Memory" icon={<MemoryStick className="h-4 w-4" />} data={memoryHistory}
          currentValue={formatBytes(memoryBytes)} maxValue={memoryLimit > 0 ? formatBytes(memoryLimit) : '\u221e'} color="#a855f7" />
        <MiniChart title="Network" icon={<Wifi className="h-4 w-4" />} data={networkHistory}
          currentValue={`${formatBytes(networkRate)}/s`} color="#22c55e" />
      </div>
    </div>
  );
});
