import { motion } from 'framer-motion';
import { useGetCycles } from '../../hooks/useCycles';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function MetricsPanel() {
  const { data: cycles, isLoading } = useGetCycles();

  if (isLoading) return <Card><Spinner /></Card>;
  if (!cycles) return null;

  const totalPnl    = cycles.reduce((s, c) => s + c.pnl, 0);
  const totalVolume = cycles.reduce((s, c) => s + c.total_inr_spent, 0);
  const active      = cycles.filter((c) => c.status !== 'completed').length;
  const completed   = cycles.filter((c) => c.status === 'completed').length;

  const metrics = [
    { label: 'Total PNL',    value: fmt(totalPnl),     color: totalPnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)',  accent: totalPnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)' },
    { label: 'Trade Volume', value: fmt(totalVolume),  color: 'var(--color-text)',      accent: 'var(--color-secondary)' },
    { label: 'Active',       value: String(active),    color: 'var(--color-secondary)', accent: 'var(--color-secondary)' },
    { label: 'Completed',    value: String(completed), color: 'var(--color-primary)',   accent: 'var(--color-primary)' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 h-full">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.3 }}
        >
          <Card
            className="flex flex-col gap-1.5 relative overflow-hidden after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:h-0.5 after:rounded-t-md after:opacity-60 after:bg-(--accent-color)"
            style={{ '--accent-color': m.accent } as React.CSSProperties}
          >
            <span className="text-xs font-bold text-muted uppercase tracking-[0.07em] mt-1">{m.label}</span>
            <span
              className="text-2xl font-extrabold tracking-[-0.03em] leading-[1.1] tabular-nums"
              style={{ color: m.color }}
            >
              {m.value}
            </span>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
