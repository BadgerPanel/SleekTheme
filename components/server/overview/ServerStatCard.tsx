'use client';

import { useRef, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface ServerStatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  sparklineData?: number[];
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 80;
    const h = 24;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const max = Math.max(...data, 1);
    const pad = 2;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + '30');
    grad.addColorStop(1, color + '05');
    ctx.beginPath();
    ctx.moveTo(0, h);
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - pad - ((v / max) * (h - pad * 2));
      ctx.lineTo(x, y);
    });
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - pad - ((v / max) * (h - pad * 2));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }, [data, color]);

  if (data.length < 2) return null;
  return <canvas ref={canvasRef} style={{ width: 80, height: 24 }} className="mt-1" />;
}

export function ServerStatCard({
  label, value, subValue, icon: Icon, iconColor = '#7c3aed',
  trend, trendValue, sparklineData,
}: ServerStatCardProps) {
  const getTrendColor = () => {
    switch (trend) { case 'up': return '#22c55e'; case 'down': return '#ef4444'; default: return 'hsl(var(--muted-foreground))'; }
  };
  const getTrendIcon = () => {
    switch (trend) { case 'up': return '\u2191'; case 'down': return '\u2193'; default: return '\u2192'; }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subValue && <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>}
          {sparklineData && <Sparkline data={sparklineData} color={iconColor} />}
        </div>
        <div className="p-2 rounded-xl" style={{ backgroundColor: `${iconColor}12` }}>
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
      </div>
      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: getTrendColor() }}>
          <span>{getTrendIcon()}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
