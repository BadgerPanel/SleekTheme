'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, RotateCcw, Square, Loader2, Skull } from 'lucide-react';
import { powerAction } from '@/lib/api/console';

interface ServerPowerControlsProps {
  serverId: string;
  currentStatus: string;
}

export function ServerPowerControls({ serverId, currentStatus }: ServerPowerControlsProps) {
  const queryClient = useQueryClient();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const powerMutation = useMutation({
    mutationFn: (action: 'start' | 'stop' | 'restart' | 'kill') => powerAction(serverId, action),
    onMutate: (action) => { setLoadingAction(action); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server', serverId] });
      queryClient.invalidateQueries({ queryKey: ['server-resources', serverId] });
    },
    onSettled: () => { setLoadingAction(null); },
  });

  const status = currentStatus?.toLowerCase() || 'offline';
  const isRunning = status === 'running';
  const isStarting = status === 'starting';
  const isStopping = status === 'stopping';
  const isInstalling = status === 'installing';
  const isOffline = status === 'offline' || status === 'stopped';

  const handlePower = (action: 'start' | 'stop' | 'restart' | 'kill') => {
    if (loadingAction) return;
    powerMutation.mutate(action);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handlePower('start')}
        disabled={isRunning || isStarting || isInstalling || loadingAction !== null}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
        style={isRunning || isStarting || isInstalling
          ? { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', cursor: 'not-allowed' }
          : { background: '#22c55e', color: 'white' }
        }
        title={isInstalling ? 'Server is installing' : 'Start server'}
      >
        {loadingAction === 'start' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        <span>Start</span>
      </button>

      <button
        onClick={() => handlePower('restart')}
        disabled={!isRunning || isInstalling || loadingAction !== null}
        className="flex items-center justify-center p-2 rounded-lg transition-all"
        style={!isRunning || isInstalling
          ? { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', cursor: 'not-allowed' }
          : { background: 'hsl(var(--accent))', color: 'hsl(var(--foreground))' }
        }
        title="Restart server"
      >
        {loadingAction === 'restart' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
      </button>

      <button
        onClick={() => handlePower('stop')}
        disabled={!isRunning || isInstalling || loadingAction !== null}
        className="flex items-center justify-center p-2 rounded-lg transition-all"
        style={!isRunning || isInstalling
          ? { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', cursor: 'not-allowed' }
          : { background: '#dc2626', color: 'white' }
        }
        title="Stop server"
      >
        {loadingAction === 'stop' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
      </button>

      {!isOffline && !isInstalling && (
        <button
          onClick={() => handlePower('kill')}
          disabled={loadingAction !== null}
          className="flex items-center justify-center p-2 rounded-lg transition-all"
          style={isStopping
            ? { background: '#ea580c', color: 'white' }
            : { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }
          }
          title={isStopping ? 'Force kill (stuck stopping)' : 'Force kill server'}
        >
          {loadingAction === 'kill' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Skull className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
