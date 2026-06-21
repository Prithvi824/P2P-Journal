import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.75 rounded-sm font-semibold font-[inherit] cursor-pointer whitespace-nowrap transition-all relative tracking-[0.01em] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-97',
  {
    variants: {
      variant: {
        primary:   'bg-primary text-[#060e1c] shadow-[0_1px_4px_rgba(0,229,168,0.2)] hover:bg-[#00ffba] hover:shadow-[0_2px_12px_rgba(0,229,168,0.35)]',
        secondary: 'bg-secondary text-white shadow-[0_1px_4px_rgba(79,140,255,0.2)] hover:bg-[#6fa0ff] hover:shadow-[0_2px_12px_rgba(79,140,255,0.35)]',
        ghost:     'bg-transparent text-text-dim border border-border hover:bg-white/5 hover:border-muted hover:text-text',
        danger:    'bg-danger text-white shadow-[0_1px_4px_rgba(255,77,77,0.2)] hover:bg-[#ff6b6b] hover:shadow-[0_2px_12px_rgba(255,77,77,0.35)]',
      },
      size: {
        sm: 'px-3.5 py-1.5 text-sm h-8',
        md: 'px-4.5 text-base h-9.5',
        lg: 'px-6 text-md h-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  children: ReactNode;
}

export default function Button({ variant, size, loading = false, children, disabled, className, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="w-3.25 h-3.25 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
      )}
      {children}
    </button>
  );
}
