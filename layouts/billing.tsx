'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, useIsAdmin } from '@/stores/auth';
import type { User as UserType } from '@/types';
import { useSettings } from '@/contexts/SettingsContext';
import { useUploadUrl } from '@/hooks/useUploadUrl';
import { Loading } from '@/components/ui/spinner';
import { Sidebar, Footer } from '@/components/layout';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, useDropdownContext } from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import {
  Home, Server, FileText, CreditCard, Wallet, ShoppingCart,
  ChevronDown, User, LogOut, Bell, LayoutDashboard, Shield,
  ShoppingBag, LifeBuoy,
} from 'lucide-react';

interface BillingTheme {
  primary: string; secondary: string; accent: string; background: string;
  surface: string; header: string; nav: string; text: string;
  textMuted: string; border: string; success: string; warning: string;
  error: string; customCSS: string;
}

const defaultTheme: BillingTheme = {
  primary: '#7c3aed', secondary: '#4f46e5', accent: '#a78bfa',
  background: '#111827', surface: '#1f2937', header: '#1f2937',
  nav: '#7c3aed', text: '#ffffff', textMuted: '#9ca3af',
  border: '#374151', success: '#22c55e', warning: '#f59e0b',
  error: '#ef4444', customCSS: '',
};

const baseBillingNavItems = [
  { label: 'Home', href: '/billing', icon: Home, exact: true },
  { label: 'Services', href: '/billing/services', icon: Server },
  { label: 'Invoices', href: '/billing/invoices', icon: FileText },
  { label: 'Order New', href: '/billing/order', icon: ShoppingBag },
  { label: 'Support', href: '/billing/tickets', icon: LifeBuoy, requiresTickets: true },
];

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, setLoading } = useAuthStore();
  const isAdmin = useIsAdmin();
  const { settings } = useSettings();
  const { resolveUrl } = useUploadUrl();
  const [checking, setChecking] = useState(true);
  const [billingTheme, setBillingTheme] = useState<BillingTheme>(defaultTheme);

  const isIntegrated = settings?.billing_layout_mode === 'integrated';

  const billingNavItems = baseBillingNavItems
    .filter(item => !('requiresTickets' in item && item.requiresTickets) || settings?.tickets_enabled)
    .map(item => {
      if (item.requiresTickets && settings?.support_url) {
        return { ...item, href: settings.support_url, external: true };
      }
      return { ...item, external: false };
    });

  const loadBillingTheme = useCallback(async () => {
    if (isIntegrated) return;
    try {
      const response = await api.get('/settings/billing-theme');
      const data = response.data?.data || {};
      setBillingTheme({
        primary: '#7c3aed', secondary: '#4f46e5', accent: '#a78bfa',
        background: data.billing_background_color || defaultTheme.background,
        surface: data.billing_surface_color || defaultTheme.surface,
        header: data.billing_header_color || defaultTheme.header,
        nav: '#7c3aed', text: data.billing_text_color || defaultTheme.text,
        textMuted: data.billing_text_muted_color || defaultTheme.textMuted,
        border: data.billing_border_color || defaultTheme.border,
        success: data.billing_success_color || defaultTheme.success,
        warning: data.billing_warning_color || defaultTheme.warning,
        error: data.billing_error_color || defaultTheme.error,
        customCSS: data.billing_custom_css || '',
      });
    } catch {}
  }, [isIntegrated]);

  useEffect(() => { loadBillingTheme(); }, [loadBillingTheme]);

  useEffect(() => {
    const currentState = useAuthStore.getState();
    if (currentState.isAuthenticated && currentState.accessToken) {
      setLoading(false); setChecking(false); return;
    }
    try {
      const stored = localStorage.getItem('badger-auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state?._hasSession && parsed?.state?.user) {
          setLoading(false); setChecking(false); return;
        }
      }
    } catch { localStorage.removeItem('badger-auth'); }
    router.replace('/auth/login');
  }, [router, setLoading]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/logout`, {
        method: 'POST', credentials: 'include',
      });
    } catch {}
    logout();
    window.location.href = '/auth/login';
  };

  const isNavActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname?.startsWith(href + '/');
  };

  if (checking) return <Loading fullScreen message="Loading..." />;
  if (!isAuthenticated) return <Loading fullScreen message="Redirecting..." />;

  if (isIntegrated) {
    const themeVars = {
      '--billing-primary': '#7c3aed',
      '--billing-secondary': '#4f46e5',
      '--billing-accent': '#a78bfa',
      '--billing-success': '#22c55e',
      '--billing-warning': '#f59e0b',
      '--billing-error': '#ef4444',
    } as React.CSSProperties;

    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 pl-[60px] flex flex-col min-h-screen transition-all duration-300 billing-area sleek-content" style={themeVars}>
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </div>
    );
  }

  const panelName = settings?.panel_name || 'BadgerPanel';
  const billingLogoUrl = resolveUrl(settings?.billing_logo_url);
  const logoUrl = billingLogoUrl || resolveUrl(settings?.logo_url) || resolveUrl(settings?.logo_dark_url);

  return (
    <div className="min-h-screen flex flex-col billing-area sleek-content" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
      <header className="border-b border-border sticky top-0 z-50 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/billing" className="flex items-center gap-3 flex-shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={panelName} className="h-10 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  <Shield className="h-6 w-6 text-white" />
                </div>
              )}
              <span className="font-bold text-xl hidden sm:block text-foreground">{panelName}</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link href="/billing/cart" className="p-2 transition-colors text-muted-foreground hover:text-foreground">
                <ShoppingCart className="h-5 w-5" />
              </Link>
              <button className="p-2 transition-colors text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ml-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                    <span className="text-sm font-medium text-white">{user?.first_name?.[0] || user?.username?.[0] || 'U'}</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-foreground">Hello, {user?.first_name || user?.username}!</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="right" className="w-56 !p-0 overflow-hidden">
                  <BillingUserMenuBody user={user} isAdmin={isAdmin} handleLogout={handleLogout} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <nav style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {billingNavItems.map((item) => {
                const isActive = isNavActive(item.href, item.exact);
                const El = item.external ? 'a' : Link;
                const extra = item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
                return (
                  <El key={item.href} href={item.href} {...(extra as any)}
                    className="flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors"
                    style={{ backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : 'transparent', color: isActive ? '#fff' : 'rgba(255,255,255,0.85)' }}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </El>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>

      <footer className="border-t border-border py-6 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {settings?.footer_text || `\u00A9 ${new Date().getFullYear()} ${panelName}. All rights reserved.`}
            </p>
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Server Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BillingUserMenuBody({ user, isAdmin, handleLogout }: { user: UserType | null; isAdmin: boolean; handleLogout: () => void }) {
  const { setOpen } = useDropdownContext();
  return (
    <>
      <div className="p-3 border-b border-border">
        <p className="text-sm font-medium text-foreground">{user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}</p>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
      </div>
      <div className="py-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
          <LayoutDashboard className="h-4 w-4" /> Server Dashboard
        </Link>
        <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
          <User className="h-4 w-4" /> My Account
        </Link>
        <Link href="/billing/payment-methods" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
          <CreditCard className="h-4 w-4" /> Payment Methods
        </Link>
        <Link href="/billing/credits" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setOpen(false)}>
          <Wallet className="h-4 w-4" /> Credits
        </Link>
        {isAdmin && (
          <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors" style={{ color: '#a78bfa' }} onClick={() => setOpen(false)}>
            <Shield className="h-4 w-4" /> Admin Area
          </Link>
        )}
      </div>
      <div className="border-t border-border py-1">
        <button onClick={() => { setOpen(false); handleLogout(); }} className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:opacity-80 transition-colors w-full">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </>
  );
}
