'use client';

import { useAuthStore } from '@/stores/auth';
import { User, Bell, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, useDropdownContext } from '@/components/ui/dropdown-menu';
import { useState, useCallback, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, Notification } from '@/lib/api/notifications';

interface HeaderProps {
  title?: string;
}

export const Header = memo(function Header({ title }: HeaderProps) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const response = await notificationsApi.getUnreadCount();
      return response?.data?.count ?? response?.count ?? 0;
    },
    refetchInterval: 30000,
  });

  const { data: notifications = [], isLoading: loadingNotifs } = useQuery({
    queryKey: ['notifications', 'header'],
    queryFn: async () => {
      const response = await notificationsApi.getNotifications({ limit: 5 });
      return response?.data?.notifications ?? [];
    },
    enabled: dropdownOpen,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (uuid: string) => notificationsApi.markAsRead(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAsRead = useCallback((uuid: string) => { markAsReadMutation.mutate(uuid); }, [markAsReadMutation]);
  const markAllAsRead = useCallback(() => { markAllAsReadMutation.mutate(); }, [markAllAsReadMutation]);

  const typeColors: Record<string, string> = {
    support: 'bg-blue-500', billing: 'bg-emerald-500', server: 'bg-amber-500',
    security: 'bg-red-500', system: 'bg-violet-500', info: 'bg-sky-500',
    success: 'bg-emerald-500', warning: 'bg-yellow-500', error: 'bg-red-500',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-6 h-14">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-lg font-bold tracking-tight">{title}</h1>}
      </div>

      <div className="flex items-center gap-1.5">
        <DropdownMenu onOpenChange={(open) => {
          setDropdownOpen(open);
          if (open) queryClient.invalidateQueries({ queryKey: ['notifications', 'header'] });
        }}>
          <DropdownMenuTrigger className="relative overflow-visible inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors hover:bg-accent h-9 w-9">
            <Bell className="h-[18px] w-[18px] text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white" style={{ background: '#7c3aed' }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="right" className="w-80 rounded-xl !p-0">
            <NotificationDropdownBody
              notifications={notifications}
              loadingNotifs={loadingNotifs}
              unreadCount={unreadCount}
              typeColors={typeColors}
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
            />
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-5 w-px bg-border mx-1" />

        <Link href="/account" className="flex items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-accent transition-colors">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-tight">{user?.username}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{user?.role?.name}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.username || 'Avatar'} className="h-full w-full object-cover" />
            ) : (
              <User className="h-3.5 w-3.5 text-white" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
});

function NotificationDropdownBody({
  notifications, loadingNotifs, unreadCount, typeColors, markAsRead, markAllAsRead,
}: {
  notifications: Notification[]; loadingNotifs: boolean; unreadCount: number;
  typeColors: Record<string, string>; markAsRead: (uuid: string) => void; markAllAsRead: () => void;
}) {
  const { setOpen } = useDropdownContext();
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        {unreadCount > 0 && (
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAllAsRead(); }}
            className="text-xs flex items-center gap-1 font-medium" style={{ color: '#a78bfa' }}>
            <Check className="h-3 w-3" /> Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {loadingNotifs ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent" style={{ borderColor: '#7c3aed' }} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.uuid}
              className={`px-4 py-3 border-b border-border last:border-0 hover:bg-accent/50 cursor-pointer transition-colors ${!notif.read ? 'bg-violet-500/5' : ''}`}
              onClick={() => {
                if (!notif.read) markAsRead(notif.uuid);
                if (notif.action_url) { setOpen(false); window.location.href = notif.action_url; }
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${typeColors[notif.type] || 'bg-gray-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{notif.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-muted-foreground">{notif.time_ago}</span>
                    {notif.action_url && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </div>
                {!notif.read && <div className="h-2 w-2 rounded-full flex-shrink-0 mt-2" style={{ background: '#7c3aed' }} />}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="px-4 py-2.5 border-t border-border">
        <Link href="/notifications" className="text-xs font-medium" style={{ color: '#a78bfa' }} onClick={() => setOpen(false)}>
          View all notifications
        </Link>
      </div>
    </>
  );
}
