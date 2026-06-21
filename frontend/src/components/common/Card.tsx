import type { CSSProperties, ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  style?: CSSProperties;
}

const paddingClasses = { sm: 'p-3.5', md: 'p-5.5', lg: 'p-7.5' };

export default function Card({ children, className = '', padding = 'md', style }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-card border border-border border-t-[rgba(255,255,255,0.07)] rounded-md shadow-sm relative',
        "before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.025)_0%,transparent_60%)] before:pointer-events-none",
        paddingClasses[padding],
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
