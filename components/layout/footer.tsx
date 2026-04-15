'use client';

import { useSettings } from '@/contexts/SettingsContext';
import DOMPurify from 'dompurify';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const { settings } = useSettings();
  const year = new Date().getFullYear();
  const copyright = `\u00A9 ${year} BadgerPanel`;

  const isWhiteLabel = settings?.feature_white_label;
  const canCustomFooter = settings?.feature_custom_footer || isWhiteLabel;
  const customText = canCustomFooter && settings?.footer_text
    ? DOMPurify.sanitize(settings.footer_text)
    : null;

  const parts: string[] = [];
  if (customText) parts.push(customText);
  if (!isWhiteLabel) parts.push(copyright);
  if (parts.length === 0) return null;

  return (
    <footer className={`py-3 px-6 text-center text-xs text-muted-foreground border-t border-border ${className}`}>
      <div dangerouslySetInnerHTML={{ __html: parts.join('<span class="mx-2 opacity-40">\u00B7</span>') }} />
    </footer>
  );
}

export default Footer;
