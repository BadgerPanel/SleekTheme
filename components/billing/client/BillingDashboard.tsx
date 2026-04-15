'use client';

import Link from 'next/link';
import { useRef, useEffect } from 'react';
import {
  Server, FileText, CreditCard, Wallet, Clock, ArrowRight, Loader2,
  ShoppingCart, User, Settings, Plus, ExternalLink, Receipt, Package,
  HelpCircle, Zap, TrendingUp, ArrowUpRight, Sparkles,
} from 'lucide-react';
import { useBillingDashboard, useCredits } from '@/hooks/useBilling';
import { useAuthStore } from '@/stores/auth';
import { useSettings } from '@/contexts/SettingsContext';
import { CurrencyDisplay, StatusBadge } from '../shared';

export function BillingDashboard() {
  const { data: dashboard, isLoading } = useBillingDashboard();
  const { data: credits } = useCredits();
  const { user } = useAuthStore();
  const { settings } = useSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#7c3aed' }} />
      </div>
    );
  }

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.username || 'User';

  const creditBalance = credits?.balance || 0;

  return (
    <div className="space-y-8">
      <div
        className="relative rounded-2xl overflow-hidden p-8"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 40%, #6366f1 70%, #8b5cf6 100%)',
          minHeight: 160,
        }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(30%, -50%)' }} />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(-50%, 50%)' }} />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-violet-200" />
              <span className="text-sm font-medium text-violet-200">Billing Portal</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {displayName}</h1>
            <p className="text-violet-200 text-sm">Manage your services, invoices, and payments</p>
          </div>
          <Link
            href="/billing/order"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-violet-900 transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
          >
            <ShoppingCart className="h-4 w-4" />
            Order New Service
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassStatCard
          icon={Server}
          value={dashboard?.active_services || 0}
          label="Active Services"
          href="/billing/services"
          color="#7c3aed"
        />
        <GlassStatCard
          icon={FileText}
          value={dashboard?.pending_invoices || 0}
          label="Pending Invoices"
          href="/billing/invoices?status=pending"
          color={dashboard?.pending_invoices ? '#f59e0b' : '#6b7280'}
        />
        <GlassStatCard
          icon={Receipt}
          value={<CurrencyDisplay amount={dashboard?.total_due || 0} />}
          label="Amount Due"
          href="/billing/invoices"
          color={dashboard?.total_due ? '#ef4444' : '#6b7280'}
        />
        <GlassStatCard
          icon={Wallet}
          value={<CurrencyDisplay amount={creditBalance} />}
          label="Credit Balance"
          href="/billing/credits"
          color="#22c55e"
        />
      </div>

      {dashboard?.next_due_date && dashboard?.next_due_amount && (
        <div className="flex items-center gap-4 rounded-xl p-4 border" style={{ background: 'rgba(245, 158, 11, 0.06)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <Clock className="h-6 w-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Upcoming Payment</p>
            <p className="text-sm text-muted-foreground">
              <CurrencyDisplay amount={dashboard.next_due_amount} /> due on{' '}
              {new Date(dashboard.next_due_date).toLocaleDateString()}
            </p>
          </div>
          <Link href="/billing/invoices" className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style={{ background: '#f59e0b' }}>
            Pay Now
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SleekSection icon={Package} title="Your Services" linkHref="/billing/services" linkText="View All">
            {dashboard?.active_services && dashboard.active_services > 0 ? (
              <div className="space-y-2 p-4">
                {dashboard?.recent_orders?.slice(0, 4).map((order) => (
                  <Link
                    key={order.id}
                    href={`/billing/orders/${order.id}`}
                    className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-accent/50"
                    style={{ background: 'hsl(var(--muted))' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(124, 58, 237, 0.1)' }}>
                        <Server className="h-4 w-4" style={{ color: '#7c3aed' }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={order.status} type="order" />
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(124, 58, 237, 0.08)' }}>
                  <Package className="h-8 w-8" style={{ color: '#7c3aed' }} />
                </div>
                <p className="text-muted-foreground mb-4">No active services yet</p>
                <Link href="/billing/order" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: '#a78bfa' }}>
                  Browse available products <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </SleekSection>

          <SleekSection icon={FileText} title="Recent Invoices" linkHref="/billing/invoices" linkText="View All">
            {dashboard?.recent_invoices && dashboard.recent_invoices.length > 0 ? (
              <div className="divide-y divide-border">
                {dashboard.recent_invoices.slice(0, 5).map((invoice) => (
                  <Link
                    key={invoice.id}
                    href={`/billing/invoices/${invoice.id}`}
                    className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-accent/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--muted))' }}>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{invoice.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <CurrencyDisplay amount={invoice.total} className="text-sm font-semibold text-foreground" />
                      <StatusBadge status={invoice.status} type="invoice" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-muted-foreground text-sm">No invoices yet</div>
            )}
          </SleekSection>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(79,70,229,0.04))' }}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </div>
              <p className="font-semibold text-foreground">{displayName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="p-4">
              <Link
                href="/account"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              >
                <Settings className="h-4 w-4" /> Manage Account
              </Link>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" style={{ color: '#7c3aed' }} /> Quick Actions
              </h3>
            </div>
            <div className="p-2">
              <ActionLink icon={ShoppingCart} label="Order New Services" href="/billing/order" />
              <ActionLink icon={CreditCard} label="Payment Methods" href="/billing/payment-methods" />
              <ActionLink icon={Wallet} label="Add Credits" href="/billing/credits" />
              <ActionLink icon={FileText} label="View Invoices" href="/billing/invoices" />
              {settings?.tickets_enabled && (
                <ActionLink
                  icon={HelpCircle}
                  label="Get Support"
                  href={settings?.support_url || '/support/tickets'}
                  external={!!settings?.support_url}
                />
              )}
            </div>
          </div>

          <div className="rounded-2xl border overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02))', borderColor: 'rgba(34,197,94,0.2)' }}>
            <div className="p-5 flex items-center gap-4">
              <CreditRing balance={creditBalance} />
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Account Credit</p>
                <p className="text-2xl font-bold text-foreground">
                  <CurrencyDisplay amount={creditBalance} />
                </p>
              </div>
            </div>
            <div className="px-5 pb-5">
              <Link
                href="/billing/credits"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
                style={{ background: '#22c55e' }}
              >
                <Plus className="h-4 w-4" /> Add Funds
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlassStatCard({ icon: Icon, value, label, href, color }: {
  icon: typeof Server; value: React.ReactNode; label: string; href: string; color: string;
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-2xl border p-5 text-center transition-all hover:scale-[1.02] hover:shadow-lg overflow-hidden"
      style={{ borderColor: `${color}30`, background: `${color}08` }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 70%)` }} />
      <div className="relative z-10">
        <div className="flex justify-center mb-3">
          <div className="p-2.5 rounded-xl" style={{ background: `${color}15` }}>
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
        </div>
        <p className="text-2xl font-bold text-foreground mb-0.5">{value}</p>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
    </Link>
  );
}

function SleekSection({ icon: Icon, title, linkHref, linkText, children }: {
  icon: typeof Server; title: string; linkHref: string; linkText: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: '#7c3aed' }} />
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        <Link href={linkHref} className="text-xs font-medium flex items-center gap-1" style={{ color: '#a78bfa' }}>
          {linkText} <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      {children}
    </div>
  );
}

function ActionLink({ icon: Icon, label, href, external }: { icon: typeof Server; label: string; href: string; external?: boolean }) {
  const El = external ? 'a' : Link;
  const extra = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <El
      href={href}
      {...(extra as any)}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
      {external && <ExternalLink className="h-3 w-3 ml-auto opacity-40" />}
    </El>
  );
}

function CreditRing({ balance }: { balance: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 56;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 22;
    const lineWidth = 5;

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.15)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    const pct = Math.min(balance / 100, 1);
    if (pct > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    ctx.fillStyle = '#22c55e';
    ctx.font = `bold ${size * 0.3}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', cx, cy);
  }, [balance]);

  return <canvas ref={canvasRef} style={{ width: 56, height: 56, flexShrink: 0 }} />;
}

export default BillingDashboard;
