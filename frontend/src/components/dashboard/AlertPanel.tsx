import { useState } from 'react';
import clsx from 'clsx';
import Card from '../common/Card';
import Button from '../common/Button';
import { useGetAlertThreshold, useSetAlertThreshold } from '../../hooks/useAlerts';

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AlertPanel() {
  const { data } = useGetAlertThreshold();
  const { mutate: setThreshold, isPending } = useSetAlertThreshold();
  const [inputVal, setInputVal] = useState('');

  const active = data?.threshold != null;

  function handleSet() {
    const val = parseFloat(inputVal);
    if (!inputVal || isNaN(val) || val <= 0) return;
    setThreshold({ threshold: val });
    setInputVal('');
  }

  function handleClear() {
    setThreshold({ threshold: null });
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-4">
        <h2 className="text-sm font-bold text-muted uppercase tracking-[0.08em] flex-1">Price Alert</h2>
        <span className={clsx(
          'text-lg leading-none',
          active
            ? 'animate-bell-pulse filter-[drop-shadow(0_0_6px_var(--color-success))]'
            : 'opacity-40 grayscale',
        )}>
          🔔
        </span>
      </div>

      <p className={clsx(
        'text-sm mb-3.5 min-h-4.5 leading-[1.4]',
        active ? 'text-success font-semibold' : 'text-muted',
      )}>
        {active
          ? `Alerting when buy price < ₹${data!.threshold!.toLocaleString('en-IN')}`
          : 'No alert set'}
      </p>

      {data?.last_alert_sent_at && (
        <p className="text-xs text-muted mb-4 opacity-80">
          Last notified: {formatRelativeTime(data.last_alert_sent_at)}
        </p>
      )}

      <div className="flex gap-2 items-end mt-auto">
        <div className="flex-1 flex flex-col gap-1.25">
          <label className="text-xs font-bold text-muted uppercase tracking-[0.06em]">Threshold (INR)</label>
          <input
            className="bg-white/3.5 border border-border rounded-sm text-text text-base font-[inherit] px-3 py-2.25 w-full outline-none tabular-nums transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,229,168,0.1)] placeholder:text-muted placeholder:opacity-70"
            type="number"
            placeholder="e.g. 89.50"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSet()}
          />
        </div>
        <Button size="sm" onClick={handleSet} loading={isPending} disabled={!inputVal}>
          Set
        </Button>
        {active && (
          <button
            className="bg-transparent border border-border rounded-sm text-muted text-sm font-[inherit] font-semibold px-3 h-9 cursor-pointer whitespace-nowrap transition-[border-color,color,background] hover:border-danger hover:text-danger hover:bg-danger-dim disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleClear}
            disabled={isPending}
          >
            Clear
          </button>
        )}
      </div>
    </Card>
  );
}
