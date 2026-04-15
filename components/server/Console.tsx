'use client';

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useConsole } from '@/hooks/useConsole';
import { Terminal as TerminalIcon, Send, Trash2, Download, Circle, Loader2, PictureInPicture2 } from 'lucide-react';
import { downloadConsoleLogs } from '@/lib/api/console';
import { useMiniConsoleStore } from '@/stores/miniConsole';

interface ConsoleProps {
  serverId: string;
  serverName?: string;
}

export function Console({ serverId, serverName: serverNameProp }: ConsoleProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const popOut = useMiniConsoleStore((s) => s.popOut);

  const resolvedServerName = serverNameProp || (() => {
    const cached = queryClient.getQueryData<any>(['server', serverId]);
    return cached?.name || 'Server';
  })();
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const {
    terminal, isConnected, sendCommand, clearTerminal, connectionStatus, isTerminalReady,
  } = useConsole(serverId, terminalRef);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    sendCommand(command);
    setCommandHistory(prev => [...prev.slice(-49), command]);
    setHistoryIndex(-1);
    setCommand('');
  }, [command, sendCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  }, [commandHistory, historyIndex]);

  const handleClear = useCallback(() => { clearTerminal(); }, [clearTerminal]);

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadLogs = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try { await downloadConsoleLogs(serverId); }
    catch (error) { console.error('Failed to download console logs:', error); }
    finally { setIsDownloading(false); }
  }, [serverId, isDownloading]);

  const handleTerminalDoubleClick = useCallback(() => { inputRef.current?.focus(); }, []);

  const getStatusColor = () => {
    if (isConnected) return '#22c55e';
    if (connectionStatus === 'Reconnecting...') return '#eab308';
    if (connectionStatus === 'Offline') return '#ef4444';
    return 'hsl(var(--muted-foreground))';
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden flex flex-col h-full max-h-full bg-card">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0" style={{ background: 'hsl(var(--muted))' }}>
        <div className="flex items-center gap-3">
          <TerminalIcon className="h-4 w-4" style={{ color: '#7c3aed' }} />
          <span className="text-sm font-medium text-foreground">Console</span>
          <div className="flex items-center gap-1.5">
            <Circle className="h-2 w-2 fill-current" style={{ color: getStatusColor() }} />
            <span className="text-xs" style={{ color: getStatusColor() }}>{connectionStatus}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleDownloadLogs} disabled={isDownloading}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors disabled:opacity-50" title="Download logs">
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          </button>
          <button onClick={() => { popOut(serverId, resolvedServerName); router.push('/dashboard'); }}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" title="Pop out console">
            <PictureInPicture2 className="h-4 w-4" />
          </button>
          <button onClick={handleClear} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" title="Clear console">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={terminalRef} className="flex-1 min-h-0 overflow-hidden cursor-text" style={{ background: '#0f0f14' }} onDoubleClick={handleTerminalDoubleClick} />

      <form onSubmit={handleSubmit} className="border-t border-border shrink-0">
        <div className="flex items-center gap-3 px-4 py-3 bg-card">
          <span className="font-mono text-sm font-bold" style={{ color: '#7c3aed' }}>{'\u00BB'}</span>
          <input ref={inputRef} type="text" value={command} onChange={(e) => setCommand(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Type a command..." className="flex-1 bg-transparent border-none outline-none text-foreground font-mono text-sm placeholder-muted-foreground"
            autoComplete="off" spellCheck={false} />
          <button type="submit" disabled={!command.trim()}
            className="p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-accent"
            style={{ color: command.trim() ? '#7c3aed' : 'hsl(var(--muted-foreground))' }}>
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
