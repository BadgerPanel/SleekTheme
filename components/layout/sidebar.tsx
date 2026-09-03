'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore, useHasAdminAccess } from '@/stores/auth';
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
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useState, memo, useMemo, useCallback, useEffect } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  requiresBilling?: boolean;
  requiresTickets?: boolean;
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

export const TOP_BAR_HEIGHT = 56;

// Sleek puts navigation along the top rather than down the side.
//
// It used to be the same 60px icon rail as the Neon theme with different
// colours in it, so the two themes were one layout twice and choosing between
// them changed nothing but the palette. A bar is the other shape a panel comes
// in, and the one most people have used before: the destinations are written
// out rather than guessed from an icon, and the page underneath gets the whole
// width instead of starting 60px in.
//
// Still exported as Sidebar, because that is the name the layout imports and
// the override replaces a file rather than a concept.
interface SidebarProps {
  /** Driven by the layout's own menu button, the same as the base sidebar. */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar = memo(function Sidebar({
  mobileOpen: mobileOpenProp,
  onMobileClose,
}: SidebarProps = {}) {
  const pathname = usePathname();
  const hasAdminAccess = useHasAdminAccess();
  const logout = useAuthStore((state) => state.logout);
  const { settings } = useSettings();
  const { resolveUrl } = useUploadUrl();

  const [adminOpen, setAdminOpen] = useState(false);
  // Own state when nothing drives it from outside, which is what a layout that
  // has no menu button of its own does.
  const [ownMobileOpen, setOwnMobileOpen] = useState(false);
  const controlled = mobileOpenProp !== undefined;
  const mobileOpen = controlled ? mobileOpenProp : ownMobileOpen;
  const setMobileOpen = (next: boolean) => {
    if (controlled) {
      if (!next) onMobileClose?.();
      return;
    }
    setOwnMobileOpen(next);
  };

  // Any move closes what was open, so a menu never outlives the page it was
  // opened on.
  useEffect(() => {
    setAdminOpen(false);
    setOwnMobileOpen(false);
  }, [pathname]);

  const isIntegratedBilling =
    settings?.billing_enabled && settings?.billing_layout_mode === 'integrated';

  const filteredMainItems = useMemo(
    () =>
      mainItems.filter((item) => {
        if (item.requiresBilling && !settings?.billing_enabled) return false;
        if (item.requiresBilling && isIntegratedBilling) return false;
        if (item.requiresTickets && !settings?.tickets_enabled) return false;
        return true;
      }),
    [settings?.billing_enabled, settings?.tickets_enabled, isIntegratedBilling]
  );

  const filteredBillingItems = useMemo(
    () =>
      isIntegratedBilling
        ? billingIntegratedItems.filter((item) => !item.requiresBilling || settings?.billing_enabled)
        : [],
    [isIntegratedBilling, settings?.billing_enabled]
  );

  const filteredAdminSupportItems = useMemo(
    () => adminSupportItems.filter((item) => !item.requiresTickets || settings?.tickets_enabled),
    [settings?.tickets_enabled]
  );

  const primaryItems = useMemo(
    () => [...filteredMainItems, ...filteredBillingItems],
    [filteredMainItems, filteredBillingItems]
  );

  const adminGroup = useMemo(
    () => [...adminItems, ...filteredAdminSupportItems],
    [filteredAdminSupportItems]
  );

  const isItemActive = useCallback(
    (href: string) => {
      if (href === '/dashboard') return pathname === '/dashboard';
      if (href === '/billing' && isIntegratedBilling) return pathname === '/billing';
      return pathname === href || pathname?.startsWith(href + '/');
    },
    [pathname, isIntegratedBilling]
  );

  const adminActive = adminGroup.some((item) => isItemActive(item.href));

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

  const link = (item: NavItem, onNavigate?: () => void) => {
    const active = isItemActive(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'sleek-nav-link flex items-center gap-2 rounded-md px-3 text-sm transition-colors',
          'h-9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          active
            ? 'bg-accent text-foreground font-medium'
            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {item.title}
      </Link>
    );
  };

  return (
    <header
      className="sleek-topbar fixed inset-x-0 top-0 z-40 border-b border-border"
      style={{
        height: TOP_BAR_HEIGHT,
        background: 'hsl(var(--background) / 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <nav aria-label="Main" className="mx-auto flex h-full max-w-[1600px] items-center gap-2 px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-md pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-6 w-6 rounded object-contain" />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-background">
              <Shield className="h-3.5 w-3.5" />
            </span>
          )}
          <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:block">
            {settings?.panel_name || 'BadgerPanel'}
          </span>
        </Link>

        <span className="mx-1 hidden h-5 w-px bg-border md:block" aria-hidden="true" />

        <div className="hidden items-center gap-1 md:flex">
          {primaryItems.map((item) => link(item))}

          {hasAdminAccess && adminGroup.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAdminOpen((v) => !v)}
                aria-expanded={adminOpen}
                aria-haspopup="true"
                className={cn(
                  'flex h-9 items-center gap-2 rounded-md px-3 text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  adminActive || adminOpen
                    ? 'bg-accent text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                )}
              >
                <Shield className="h-4 w-4" />
                Admin
                <ChevronDown
                  className={cn('h-3.5 w-3.5 transition-transform', adminOpen && 'rotate-180')}
                />
              </button>

              {adminOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setAdminOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-border bg-card p-1 shadow-lg">
                    {adminGroup.map((item) => link(item, () => setAdminOpen(false)))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* The same destinations stacked, for a screen too narrow to lay them out
          in a row. */}
      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-2 md:hidden">
          <div className="flex flex-col gap-1">
            {primaryItems.map((item) => link(item, () => setMobileOpen(false)))}
            {hasAdminAccess && adminGroup.length > 0 && (
              <>
                <span className="mt-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Admin
                </span>
                {adminGroup.map((item) => link(item, () => setMobileOpen(false)))}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
});

export default Sidebar;
