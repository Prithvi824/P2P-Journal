import * as Accordion from '@radix-ui/react-accordion';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import type { PhaseStatus } from '../../types';
import Badge from '../common/Badge';

interface Props {
  title: string;
  status: PhaseStatus;
  isActive: boolean;
  isLocked: boolean;
  completedAt?: string;
  children: ReactNode;
}

export default function PhaseAccordion({ title, status, isActive, isLocked, completedAt, children }: Props) {
  const open = isActive || status === 'completed';
  const value = open ? 'open' : 'closed';

  const dotClass = status === 'completed'
    ? 'bg-success shadow-[0_0_8px_rgba(0,230,118,0.4)]'
    : isActive
    ? 'bg-primary animate-glow-pulse'
    : 'bg-border';

  return (
    <Accordion.Root type="single" value={value} collapsible={false}>
      <Accordion.Item
        value="open"
        className={clsx(
          'bg-card border border-border border-t-border-subtle rounded-md overflow-hidden transition-[border-color,box-shadow]',
          isActive && 'border-[rgba(0,229,168,0.25)] shadow-[0_0_0_1px_rgba(0,229,168,0.08)_inset,var(--shadow-md)]',
          status === 'completed' && 'border-[rgba(0,230,118,0.15)]',
        )}
      >
        <div className="w-full flex items-center justify-between px-5 py-4.5 bg-transparent border-none cursor-default text-left gap-3">
          <div className="flex items-center gap-3.5 flex-wrap min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotClass}`} />
            <span className="text-[15px] font-bold text-text tracking-[-0.01em]">{title}</span>
            {completedAt && status === 'completed' && (
              <span className="text-[11px] text-muted font-normal">
                Completed {new Date(completedAt).toLocaleDateString('en-IN')}
              </span>
            )}
          </div>
          <Badge status={status} />
        </div>

        <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="px-5 pt-5 pb-5 border-t border-border">
            {!isActive && !isLocked && status !== 'completed' && (
              <p className="text-[12px] text-muted italic mb-4">Complete the previous phase to unlock this one.</p>
            )}
            {children}
          </div>
        </Accordion.Content>

        {!open && (
          <p className="px-5 pt-3 pb-4 text-[12px] text-muted italic">Waiting for previous phase to complete.</p>
        )}
      </Accordion.Item>
    </Accordion.Root>
  );
}
