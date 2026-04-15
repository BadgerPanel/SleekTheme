'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Shield, Key, Terminal, Clock, ArrowLeft, FileDown } from 'lucide-react';

const navItems = [
  { href: '/account', label: 'Profile', icon: User },
  { href: '/account/security', label: 'Security', icon: Shield },
  { href: '/account/api-tokens', label: 'API Tokens', icon: Key },
  { href: '/account/ssh-keys', label: 'SSH Keys', icon: Terminal },
  { href: '/account/sessions', label: 'Sessions', icon: Clock },
  { href: '/account/privacy', label: 'Privacy & Data', icon: FileDown },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background sleek-content">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and security settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <nav className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-l-2 border-violet-500'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border-l-2 border-transparent'
                    }`}
                    style={isActive ? { color: '#a78bfa', backgroundColor: 'rgba(124, 58, 237, 0.08)' } : {}}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
