'use client';

interface ResourceGaugeProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
  colorClass?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ResourceGauge({ label, value, max, unit = '', colorClass, size = 'md' }: ResourceGaugeProps) {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const safeMax = typeof max === 'number' && !isNaN(max) ? max : 0;
  const percent = safeMax > 0 ? Math.min(Math.round((safeValue / safeMax) * 100), 100) : 0;

  const getColor = () => {
    if (colorClass) return colorClass;
    if (percent >= 90) return 'text-red-500';
    if (percent >= 75) return 'text-yellow-500';
    return 'text-violet-500';
  };

  const getStrokeColor = () => {
    if (percent >= 90) return '#ef4444';
    if (percent >= 75) return '#eab308';
    return '#7c3aed';
  };

  const sizeConfig = {
    sm: { dimension: 80, strokeWidth: 6, fontSize: 'text-lg', labelSize: 'text-xs' },
    md: { dimension: 120, strokeWidth: 8, fontSize: 'text-2xl', labelSize: 'text-sm' },
    lg: { dimension: 160, strokeWidth: 10, fontSize: 'text-3xl', labelSize: 'text-base' },
  };

  const config = sizeConfig[size];
  const radius = (config.dimension - config.strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const formatValue = (val: number) => {
    const v = typeof val === 'number' && !isNaN(val) ? val : 0;
    if (v >= 1024 && unit === 'MB') return `${(v / 1024).toFixed(1)} GB`;
    return `${v}${unit ? ` ${unit}` : ''}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.dimension, height: config.dimension }}>
        <svg className="transform -rotate-90" width={config.dimension} height={config.dimension}>
          <circle cx={config.dimension / 2} cy={config.dimension / 2} r={radius} fill="none" strokeWidth={config.strokeWidth} stroke="rgba(255,255,255,0.06)" />
          <circle cx={config.dimension / 2} cy={config.dimension / 2} r={radius} fill="none" strokeWidth={config.strokeWidth} strokeLinecap="round" stroke={getStrokeColor()}
            style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${config.fontSize} font-bold ${getColor()}`}>{percent}%</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className={`${config.labelSize} text-muted-foreground`}>{label}</p>
        <p className="text-xs text-muted-foreground">{formatValue(safeValue)} / {formatValue(safeMax)}</p>
      </div>
    </div>
  );
}

export default ResourceGauge;
