'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'text-white shadow-sm',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline',
        success: 'bg-green-600 text-white shadow hover:bg-green-700',
        warning: 'bg-yellow-500 text-white shadow hover:bg-yellow-600',
        glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-white/20',
        'glass-primary': 'bg-violet-500/20 backdrop-blur-md border border-violet-500/30 text-white shadow-lg hover:bg-violet-500/30',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-lg px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  animation?: 'none' | 'lift' | 'glow' | 'pulse' | 'shine' | 'border-glow' | 'scale' | 'ripple' | 'default';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, animation = 'none', children, disabled, ...props }, ref) => {
    const isDefault = !variant || variant === 'default';
    const gradientStyle = isDefault ? {
      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
      boxShadow: '0 2px 8px -2px rgba(124, 58, 237, 0.4)',
    } : undefined;

    const linkStyle = variant === 'link' ? { color: '#a78bfa' } : undefined;

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || isLoading}
        style={{ ...gradientStyle, ...linkStyle }}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
