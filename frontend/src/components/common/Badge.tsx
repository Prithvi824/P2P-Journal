import clsx from 'clsx';
import type { CycleStatus, PhaseStatus } from '../../types';

type Status = CycleStatus | PhaseStatus;

const colorMap: Record<string, string> = {
  buying: 'secondary',
  depositing: 'warning',
  selling: 'primary',
  completed: 'success',
  not_started: 'muted',
  in_progress: 'warning',
};

const labelMap: Record<string, string> = {
  buying: 'Buying',
  depositing: 'Depositing',
  selling: 'Selling',
  completed: 'Completed',
  not_started: 'Not Started',
  in_progress: 'In Progress',
};

const variantClasses: Record<string, string> = {
  primary:   'bg-primary-dim text-primary border-[rgba(0,229,168,0.2)]',
  secondary: 'bg-secondary-dim text-secondary border-[rgba(79,140,255,0.2)]',
  success:   'bg-success-dim text-success border-[rgba(0,230,118,0.2)]',
  warning:   'bg-warning-dim text-warning border-[rgba(255,176,32,0.2)]',
  muted:     'bg-[rgba(122,139,165,0.1)] text-muted border-[rgba(122,139,165,0.15)]',
};

interface BadgeProps { status: Status }

export default function Badge({ status }: BadgeProps) {
  const color = colorMap[status] ?? 'muted';
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.25 px-2.25 py-0.75 rounded-full text-[10px] font-bold tracking-[0.06em] uppercase border',
      "before:content-[''] before:w-1.25 before:h-1.25 before:rounded-full before:bg-current before:opacity-90 before:shrink-0",
      variantClasses[color],
    )}>
      {labelMap[status] ?? status}
    </span>
  );
}
