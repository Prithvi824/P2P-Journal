import { useUpdateCycle } from '../../hooks/useCycles';
import type { SaleOrder } from '../../types';

interface Props {
  cycleId: string;
  order: SaleOrder;
  disabled: boolean;
}

export default function SaleOrderItem({ cycleId, order, disabled }: Props) {
  const { mutate: update, isPending } = useUpdateCycle(cycleId);

  return (
    <div className="grid gap-3 items-center px-3.5 py-2.75 bg-white/2 border border-border rounded-sm transition-[background] hover:bg-white/3.5 grid-cols-[repeat(4,1fr)_32px]">
      <div className="flex flex-col gap-1.25">
        <span className="text-[11px] text-muted uppercase font-bold tracking-[0.06em]">Price / USDT</span>
        <span className="text-[13px] text-text tabular-nums">₹{order.price_per_usdt?.toFixed(2)}</span>
      </div>
      <div className="flex flex-col gap-1.25">
        <span className="text-[11px] text-muted uppercase font-bold tracking-[0.06em]">USDT Sold</span>
        <span className="text-[13px] text-text tabular-nums">{order.usdt_sold} USDT</span>
      </div>
      <div className="flex flex-col gap-1.25">
        <span className="text-[11px] text-muted uppercase font-bold tracking-[0.06em]">INR Received</span>
        <span className="text-[13px] text-primary font-bold tabular-nums">₹{order.inr_received?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
      </div>
      <div className="flex flex-col gap-1.25">
        <span className="text-[11px] text-muted uppercase font-bold tracking-[0.06em]">Buyer</span>
        <span className="text-[13px] text-text tabular-nums">{order.buyer_username ?? '—'}</span>
      </div>
      {!disabled && (
        <button
          className="flex items-center justify-center bg-transparent border border-transparent text-muted text-[13px] cursor-pointer p-1.25 rounded-xs transition-[color,background,border-color] leading-none hover:text-danger hover:bg-danger-dim hover:border-[rgba(255,77,77,0.2)] disabled:opacity-35 disabled:cursor-not-allowed"
          disabled={isPending}
          onClick={() => update({ sale_phase: { delete_order_ids: [order.id] } })}
          title="Delete order"
        >
          ✕
        </button>
      )}
    </div>
  );
}
