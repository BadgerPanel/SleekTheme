'use client';

import { useMemo, memo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useSettings } from '@/contexts/SettingsContext';
import { useIsAdmin } from '@/stores/auth';
import { modificationsApi } from '@/lib/api/modifications';
import {
  Terminal, FolderOpen, Database, Calendar, Network, Settings,
  Activity, Archive, Users, Rocket, LayoutDashboard, Package,
  Puzzle, Blocks, Wrench, Eraser, ShieldCheck, type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Package, Puzzle, Blocks, Wrench, Terminal, Settings, Archive, Eraser,
};

interface ServerSidebarProps {
  serverId: string;
  activeTab: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  featureKey?: string;
}

export const ServerSidebar = memo(function ServerSidebar({ serverId, activeTab }: ServerSidebarProps) {
  const { settings } = useSettings();
  const isAdmin = useIsAdmin();

  const { data: modifications } = useQuery({
    queryKey: ['server-modifications', serverId],
    queryFn: () => modificationsApi.getServerModifications(serverId),
    staleTime: 60000,
  });

  const navItems: NavItem[] = useMemo(() => {
    const baseItems: NavItem[] = [
      { id: 'console', label: 'Console', icon: <Terminal className="h-4 w-4" />, href: `/servers/${serverId}` },
      { id: 'files', label: 'Files', icon: <FolderOpen className="h-4 w-4" />, href: `/servers/${serverId}/files` },
      { id: 'databases', label: 'Databases', icon: <Database className="h-4 w-4" />, href: `/servers/${serverId}/databases`, featureKey: 'feature_server_databases' },
      { id: 'schedules', label: 'Schedules', icon: <Calendar className="h-4 w-4" />, href: `/servers/${serverId}/schedules`, featureKey: 'feature_server_schedules' },
      { id: 'backups', label: 'Backups', icon: <Archive className="h-4 w-4" />, href: `/servers/${serverId}/backups`, featureKey: 'feature_server_backups' },
      { id: 'network', label: 'Network', icon: <Network className="h-4 w-4" />, href: `/servers/${serverId}/network` },
      { id: 'startup', label: 'Startup', icon: <Rocket className="h-4 w-4" />, href: `/servers/${serverId}/startup` },
      { id: 'subusers', label: 'Users', icon: <Users className="h-4 w-4" />, href: `/servers/${serverId}/subusers`, featureKey: 'feature_subuser_management' },
    ];

    const seenSlugs = new Set<string>();
    const modItems: NavItem[] = (modifications || [])
      .filter((mod) => { if (seenSlugs.has(mod.slug)) return false; seenSlugs.add(mod.slug); return true; })
      .map((mod) => {
        const IconComponent = iconMap[mod.icon || ''] || Package;
        return {
          id: mod.slug, label: mod.name,
          icon: <IconComponent className="h-4 w-4" />,
          href: `/servers/${serverId}/${mod.slug}`,
          featureKey: `feature_${mod.slug.replace(/-/g, '_')}`,
        };
      });

    const bottomItems: NavItem[] = [
      { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, href: `/servers/${serverId}/settings` },
      { id: 'activity', label: 'Activity', icon: <Activity className="h-4 w-4" />, href: `/servers/${serverId}/activity` },
    ];

    return [...baseItems, ...modItems, ...bottomItems].filter(item => {
      if (!item.featureKey) return true;
      const value = (settings as unknown as Record<string, unknown>)?.[item.featureKey];
      return value !== false;
    });
  }, [serverId, modifications, settings]);

  return (
    <div className="border-b border-border bg-card shrink-0">
      <div className="sleek-tabs px-4 max-w-[1920px] mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`sleek-tab ${activeTab === item.id ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="flex-1" />

        {isAdmin && (
          <Link href={`/admin/servers/${serverId}`} className="sleek-tab" style={{ color: '#a78bfa' }}>
            <ShieldCheck className="h-4 w-4" />
            <span>Admin</span>
          </Link>
        )}
        <Link href="/dashboard" className="sleek-tab">
          <LayoutDashboard className="h-4 w-4" />
          <span>All Servers</span>
        </Link>
      </div>
    </div>
  );
});
