'use client';

import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import type { ResourceDataPoint, ResourceHistoryPeriod } from '@/types/server';
import { formatChartTimestamp } from '@/lib/api/resources';

interface ResourceChartProps {
  data: ResourceDataPoint[];
  period: ResourceHistoryPeriod;
  type: 'cpu' | 'memory' | 'disk' | 'network';
  height?: number;
  showGrid?: boolean;
  showArea?: boolean;
}

const CHART_COLORS = {
  cpu: { stroke: '#7c3aed', fill: '#7c3aed' },
  memory: { stroke: '#a855f7', fill: '#a855f7' },
  disk: { stroke: '#22c55e', fill: '#22c55e' },
  network: { stroke: '#6366f1', fill: '#6366f1' },
};

export function ResourceChart({ data, period, type, height = 200, showGrid = true, showArea = true }: ResourceChartProps) {
  const chartData = useMemo(() => {
    return data.map((point) => {
      let value: number;
      let secondaryValue: number | undefined;
      switch (type) {
        case 'cpu': value = point.cpu_percent; break;
        case 'memory': value = point.memory_percent; break;
        case 'disk': value = point.disk_percent; break;
        case 'network':
          value = point.network_rx_bytes / (1024 * 1024);
          secondaryValue = point.network_tx_bytes / (1024 * 1024);
          break;
        default: value = 0;
      }
      return { timestamp: point.timestamp, time: formatChartTimestamp(point.timestamp, period), value, secondaryValue };
    });
  }, [data, period, type]);

  const colors = CHART_COLORS[type];

  const formatValue = (value: number): string => {
    if (type === 'network') return `${value.toFixed(1)} MB`;
    return `${value.toFixed(1)}%`;
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (!active || !payload) return null;
    return (
      <div className="rounded-lg p-3 shadow-xl border" style={{ background: 'hsl(230, 22%, 13%)', borderColor: 'hsl(232, 20%, 20%)' }}>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.dataKey === 'secondaryValue' ? '#f97316' : colors.stroke }}>
            {entry.dataKey === 'secondaryValue' ? 'TX: ' : type === 'network' ? 'RX: ' : ''}
            {formatValue(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  const gridColor = 'rgba(255,255,255,0.04)';
  const axisColor = 'hsl(220, 15%, 40%)';

  if (showArea && type !== 'network') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />}
          <XAxis dataKey="time" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <defs>
            <linearGradient id={`sleek-gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.fill} stopOpacity={0.25} />
              <stop offset="95%" stopColor={colors.fill} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={colors.stroke} strokeWidth={2} fill={`url(#sleek-gradient-${type})`} dot={false} activeDot={{ r: 4, fill: colors.stroke, stroke: 'hsl(230, 22%, 13%)', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />}
        <XAxis dataKey="time" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} domain={type === 'network' ? ['auto', 'auto'] : [0, 100]} tickFormatter={(v) => type === 'network' ? `${v.toFixed(0)}` : `${v}%`} width={40} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="value" stroke={colors.stroke} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: colors.stroke, stroke: 'hsl(230, 22%, 13%)', strokeWidth: 2 }} />
        {type === 'network' && (
          <Line type="monotone" dataKey="secondaryValue" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#f97316', stroke: 'hsl(230, 22%, 13%)', strokeWidth: 2 }} />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
