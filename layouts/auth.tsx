'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useUploadUrl } from '@/hooks/useUploadUrl';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const { isDark } = useTheme();
  const { resolveUrl } = useUploadUrl();
  const [logoError, setLogoError] = useState(false);

  const rawLogoUrl = isDark
    ? (settings?.logo_dark_url || settings?.logo_url)
    : settings?.logo_url;
  const logoUrl = resolveUrl(rawLogoUrl);
  const panelName = settings?.panel_name || 'Badger Panel';

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4 sleek-content"
      style={{ background: 'hsl(var(--background))' }}
    >
      <div className="mb-8 flex items-center gap-3">
        {logoUrl && !logoError ? (
          <div className="flex h-14 w-14 items-center justify-center flex-shrink-0">
            <img
              src={logoUrl}
              alt={panelName}
              className="h-14 w-14 object-contain rounded-2xl"
              onError={() => setLogoError(true)}
            />
          </div>
        ) : (
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <Shield className="h-7 w-7 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{panelName}</h1>
          <p className="text-sm text-muted-foreground">Game Server Management</p>
        </div>
      </div>
      {children}
    </div>
  );
}
