'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore, useIsAdmin, useHasAdminAccess } from '@/stores/auth';
import { useSettings } from '@/contexts/SettingsContext';
import { useUploadUrl } from '@/hooks/useUploadUrl';
import {
  LayoutDashboard,
  Server,
  Users,
  HardDrive,
  LogOut,
  CreditCard,
  Shield,
  LifeBuoy,
  Bell,
  Store,
  ShoppingBag,
  FileText,
  Package,
} from 'lucide-react';
import { useState, memo, useMemo, useCallback, useRef } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  requiresBilling?: boolean;
  requiresTickets?: boolean;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

const mainItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Servers', href: '/dashboard/servers', icon: Server },
  { title: 'Billing', href: '/billing', icon: CreditCard, requiresBilling: true },
  { title: 'Support', href: '/support/tickets', icon: LifeBuoy, requiresTickets: true },
];

const billingIntegratedItems: NavItem[] = [
  { title: 'Store', href: '/billing', icon: Store, requiresBilling: true },
  { title: 'Order New', href: '/billing/order', icon: ShoppingBag, requiresBilling: true },
  { title: 'Services', href: '/billing/services', icon: Package, requiresBilling: true },
  { title: 'Invoices', href: '/billing/invoices', icon: FileText, requiresBilling: true },
];

const adminItems: NavItem[] = [
  { title: 'Users', href: '/admin/users', icon: Users },
  { title: 'All Servers', href: '/admin/servers', icon: Server },
  { title: 'Nodes', href: '/admin/nodes', icon: HardDrive },
];

const adminSupportItems: NavItem[] = [
  { title: 'Tickets', href: '/admin/support/tickets', icon: LifeBuoy, requiresTickets: true },
  { title: 'Notifications', href: '/admin/notifications', icon: Bell },
];

const RAIL_WIDTH = 60;
const RAIL_WIDTH_MOBILE = 48;
const FLYOUT_WIDTH = 200;

export function Sidebar() {
  const pathname = usePathname();
  const hasAdminAccess = useHasAdminAccess();
  const logout = useAuthStore((state) => state.logout);
  const { settings } = useSettings();
  const { resolveUrl } = useUploadUrl();

  const isIntegratedBilling = settings?.billing_enabled && settings?.billing_layout_mode === 'integrated';

  const filteredMainItems = useMemo(() => mainItems.filter((item) => {
    if (item.requiresBilling && !settings?.billing_enabled) return false;
    if (item.requiresBilling && isIntegratedBilling) return false;
    if (item.requiresTickets && !settings?.tickets_enabled) return false;
    return true;
  }), [settings?.billing_enabled, settings?.tickets_enabled, isIntegratedBilling]);

  const filteredBillingItems = useMemo(() =>
    isIntegratedBilling
      ? billingIntegratedItems.filter((item) => !item.requiresBilling || settings?.billing_enabled)
      : [],
    [isIntegratedBilling, settings?.billing_enabled]
  );

  const filteredAdminSupportItems = useMemo(() =>
    adminSupportItems.filter((item) => !item.requiresTickets || settings?.tickets_enabled),
    [settings?.tickets_enabled]
  );

  const sections: NavSection[] = useMemo(() => {
    const s: NavSection[] = [{ id: 'main', label: 'Main', items: filteredMainItems }];
    if (filteredBillingItems.length > 0) {
      s.push({ id: 'billing', label: 'Billing', items: filteredBillingItems });
    }
    if (hasAdminAccess) {
      s.push({ id: 'admin', label: 'Admin', items: adminItems });
      s.push({ id: 'support', label: 'Support', items: filteredAdminSupportItems });
    }
    return s;
  }, [filteredMainItems, filteredBillingItems, hasAdminAccess, filteredAdminSupportItems]);

  const isItemActive = useCallback((href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/billing' && isIntegratedBilling) return pathname === '/billing';
    return pathname === href || pathname?.startsWith(href + '/');
  }, [pathname, isIntegratedBilling]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}
    logout();
    window.location.href = '/auth/login';
  };

  const logoUrl = resolveUrl(settings?.logo_url) || resolveUrl(settings?.logo_dark_url);

  return (
    <aside
      className="sleek-rail fixed left-0 top-0 z-40 flex h-screen flex-col"
      style={{
        width: `${RAIL_WIDTH}px`,
        background: 'hsl(232, 28%, 7%)',
        boxShadow: '4px 0 24px -4px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{ height: '60px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link href="/dashboard" className="flex items-center justify-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-7 w-7 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              <Shield className="h-4 w-4 text-white" />
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-0 scrollbar-hide">
        {sections.map((section, sIdx) => (
          <RailSection
            key={section.id}
            section={section}
            isItemActive={isItemActive}
            showDivider={sIdx > 0}
          />
        ))}

        {hasAdminAccess && (
          <div className="px-2 mt-2">
            <RailItem
              item={{ title: 'Admin Panel', href: '/admin', icon: Shield }}
              isActive={pathname?.startsWith('/admin') && !pathname?.startsWith('/admin/users') && !pathname?.startsWith('/admin/servers') && !pathname?.startsWith('/admin/nodes') && !pathname?.startsWith('/admin/support') && !pathname?.startsWith('/admin/notifications')}
              accent
            />
          </div>
        )}
      </nav>

      <div
        className="flex-shrink-0 flex items-center justify-center py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={handleLogout}
          className="flex items-center justify-center rounded-lg transition-colors relative group"
          style={{ width: 36, height: 36, color: 'rgba(255,255,255,0.35)' }}
          title="Logout"
        >
          <LogOut className="h-[18px] w-[18px]" />
          <RailTooltip label="Logout" />
        </button>
      </div>
    </aside>
  );
}

function RailSection({
  section,
  isItemActive,
  showDivider,
}: {
  section: NavSection;
  isItemActive: (href: string) => boolean;
  showDivider: boolean;
}) {
  return (
    <>
      {showDivider && (
        <div className="mx-3 my-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
      )}
      <div className="px-2 space-y-0.5">
        {section.items.map((item) => (
          <RailItem
            key={item.href}
            item={item}
            isActive={isItemActive(item.href)}
          />
        ))}
      </div>
    </>
  );
}

const RailItem = memo(function RailItem({
  item,
  isActive,
  accent,
}: {
  item: NavItem;
  isActive: boolean;
  accent?: boolean;
}) {
  return (
    <Link
      href={item.href}
      className="flex items-center justify-center rounded-lg transition-all relative group"
      style={{
        width: '100%',
        height: 36,
        ...(isActive
          ? {
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 4px 12px -2px rgba(124, 58, 237, 0.4)',
            }
          : accent
          ? {
              background: 'rgba(124, 58, 237, 0.1)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
            }
          : {}),
      }}
      title={item.title}
    >
      <item.icon
        className="h-[18px] w-[18px]"
        style={{
          color: isActive
            ? 'white'
            : accent
            ? 'rgba(167, 139, 250, 0.9)'
            : 'rgba(255,255,255,0.45)',
        }}
      />
      <RailTooltip label={item.title} />
    </Link>
  );
});

function RailTooltip({ label }: { label: string }) {
  return (
    <span
      className="absolute left-full ml-3 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50"
      style={{
        background: 'hsl(230, 22%, 16%)',
        color: 'rgba(255,255,255,0.9)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      {label}
    </span>
  );
}
