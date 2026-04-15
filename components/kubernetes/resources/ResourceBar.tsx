'use client';

import { LucideIcon } from 'lucide-react';

interface ResourceBarProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  icon?: LucideIcon;
  showPercent?: boolean;
}

export function ResourceBar({ label, value, max, unit = '', icon: Icon, showPercent = true }: ResourceBarProps) {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const safeMax = typeof max === 'number' && !isNaN(max) ? max : 0;
  const percent = safeMax > 0 ? Math.min(Math.round((safeValue / safeMax) * 100), 100) : 0;

  const getBarColor = () => {
    if (percent >= 90) return '#ef4444';
    if (percent >= 75) return '#eab308';
    if (percent >= 50) return '#7c3aed';
    return '#22c55e';
  };

  const formatValue = (val: number) => {
    const v = typeof val === 'number' && !isNaN(val) ? val : 0;
    if (unit === 'bytes') {
      if (v === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(v) / Math.log(k));
      return parseFloat((v / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    if (unit === 'MB' && v >= 1024) return `${(v / 1024).toFixed(1)} GB`;
    if (unit === 'cores' || unit === 'millicores') return v >= 1000 ? `${(v / 1000).toFixed(1)} cores` : `${v}m`;
    return `${v}${unit ? ` ${unit}` : ''}`;
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">{formatValue(safeValue)} / {formatValue(safeMax)}</span>
          {showPercent && <span className="text-xs text-muted-foreground">({percent}%)</span>}
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${percent}%`, backgroundColor: getBarColor() }} />
      </div>
    </div>
  );
}

export default ResourceBar;
