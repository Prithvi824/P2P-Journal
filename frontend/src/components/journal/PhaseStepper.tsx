import { Check } from 'lucide-react';
import type { PhaseStatus } from '../../types';

interface StepDef {
  label: string;
  status: PhaseStatus | 'not_started';
  completedAt?: string;
}

interface Props {
  steps: StepDef[];
}

function formatShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function PhaseStepper({ steps }: Props) {
  return (
    <div className="flex items-center gap-0 py-5 px-6 bg-card border border-border border-t-[rgba(255,255,255,0.07)] rounded-md shadow-sm relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_100%)] before:pointer-events-none max-[480px]:px-3 max-[480px]:py-4">
      {steps.map((step, i) => {
        const isDone   = step.status === 'completed';
        const prevDone = i === 0 || steps.slice(0, i).every((s) => s.status === 'completed');
        const isActive = !isDone && prevDone;
        const lineColor = isDone ? 'var(--color-success)' : 'var(--color-border)';

        const dotClass = isDone
          ? 'bg-success-dim border-success text-success shadow-[0_0_10px_rgba(0,230,118,0.25)]'
          : isActive
          ? 'bg-primary-dim border-primary text-primary shadow-[0_0_16px_rgba(0,229,168,0.3)] [animation:stepPulse_2.5s_infinite]'
          : 'bg-surface border-border text-muted';

        const labelClass = isDone
          ? 'text-success'
          : isActive
          ? 'text-primary'
          : 'text-muted';

        return (
          <div key={step.label} className="flex flex-col items-center gap-2 flex-1 relative z-1">
            {i < steps.length - 1 && (
              <div
                className="absolute top-3.5 left-[calc(50%+14px)] right-[calc(-50%+14px)] h-0.5 z-0 transition-[background] duration-400"
                style={{ background: lineColor }}
              />
            )}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold border-2 border-transparent transition-all duration-300 relative z-1 shrink-0 ${dotClass}`}>
              {isDone ? <Check size={13} strokeWidth={3} /> : <span>{i + 1}</span>}
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-[0.06em] text-center transition-[color] duration-300 whitespace-nowrap max-[480px]:text-[9px] max-[480px]:tracking-[0.02em] ${labelClass}`}>
              {step.label}
            </span>
            <span className="text-[9px] text-muted opacity-70 text-center">
              {isDone && step.completedAt ? formatShort(step.completedAt) : isActive ? 'Active' : 'Pending'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
