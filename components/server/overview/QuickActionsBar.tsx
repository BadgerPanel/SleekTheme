'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Square, RotateCw, Terminal, FolderOpen, Database, Calendar, Settings, Power, Loader2 } from 'lucide-react';
import { powerAction } from '@/lib/api/console';

interface QuickActionsBarProps {
  serverId: string;
  serverStatus?: string;
  onPowerAction?: () => void;
}

export function QuickActionsBar({ serverId, serverStatus, onPowerAction }: QuickActionsBarProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePowerAction = async (action: 'start' | 'stop' | 'restart' | 'kill') => {
    setLoading(action);
    try { await powerAction(serverId, action); onPowerAction?.(); }
    catch (error) { console.error('Power action failed:', error); }
    finally { setLoading(null); }
  };

  const isRunning = serverStatus === 'running';
  const isStarting = serverStatus === 'starting';
  const isStopping = serverStatus === 'stopping';
  const isInstalling = serverStatus === 'installing';
  const isOffline = serverStatus === 'offline' || !serverStatus;

  const powerActions = [
    { key: 'start', label: 'Start', icon: Play, bg: '#22c55e', disabled: isRunning || isStarting || isInstalling, show: !isRunning && !isStarting && !isInstalling },
    { key: 'stop', label: 'Stop', icon: Square, bg: '#dc2626', disabled: isOffline || isStopping || isInstalling, show: isRunning || isStarting },
    { key: 'restart', label: 'Restart', icon: RotateCw, bg: '#f59e0b', disabled: isOffline || isStopping || isInstalling, show: isRunning },
  ];

  const quickLinks = [
    { key: 'console', label: 'Console', icon: Terminal, href: `/servers/${serverId}/console` },
    { key: 'files', label: 'Files', icon: FolderOpen, href: `/servers/${serverId}/files` },
    { key: 'databases', label: 'Databases', icon: Database, href: `/servers/${serverId}/databases` },
    { key: 'schedules', label: 'Schedules', icon: Calendar, href: `/servers/${serverId}/schedules` },
    { key: 'settings', label: 'Settings', icon: Settings, href: `/servers/${serverId}/settings` },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <Power className="h-4 w-4 text-muted-foreground" /> Quick Actions
      </h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {powerActions.filter(a => a.show).map((action) => {
          const Icon = action.icon;
          const isLoading = loading === action.key;
          return (
            <button key={action.key} onClick={() => handlePowerAction(action.key as any)} disabled={action.disabled || isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: action.bg }}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
              {action.label}
            </button>
          );
        })}
        {isRunning && !isInstalling && (
          <button onClick={() => handlePowerAction('kill')} disabled={loading === 'kill'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
          >
            {loading === 'kill' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />} Kill
          </button>
        )}
        {isInstalling && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
            <Loader2 className="h-4 w-4 animate-spin" /> Installing...
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button key={link.key} onClick={() => router.push(link.href)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Icon className="h-3.5 w-3.5" /> {link.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
