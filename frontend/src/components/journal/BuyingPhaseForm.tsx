import { useEffect, useRef, useState } from 'react';
import { useAutoSaveCycle, useUpdateCycle } from '../../hooks/useCycles';
import type { BuyingPhase, BuyingPhaseUpdate } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';

interface Props {
  cycleId: string;
  phase: BuyingPhase;
  disabled: boolean;
}

export default function BuyingPhaseForm({ cycleId, phase, disabled }: Props) {
  const { mutate: autoSave, isPending: isSaving } = useAutoSaveCycle(cycleId);
  const { mutate: complete, isPending: isCompleting } = useUpdateCycle(cycleId);
  const isFirstRender = useRef(true);
  const skipRef = useRef(false);

  const [form, setForm] = useState({
    platform: phase.platform ?? '',
    price_per_coin: phase.price_per_coin ?? '',
    coins_received: phase.coins_received ?? '',
    inr_spent: phase.inr_spent ?? '',
  });

  useEffect(() => {
    skipRef.current = true;
    setForm({
      platform: phase.platform ?? '',
      price_per_coin: phase.price_per_coin ?? '',
      coins_received: phase.coins_received ?? '',
      inr_spent: phase.inr_spent ?? '',
    });
  }, [phase]);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (skipRef.current) { skipRef.current = false; return; }
    const timeout = setTimeout(() => {
      autoSave({ buy_phase: buildPayload() });
    }, 800);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const coinValueInr = Number(form.price_per_coin) * Number(form.coins_received) || 0;
  const purchaseFees = Number(form.inr_spent) - coinValueInr || 0;

  function buildPayload(status?: BuyingPhase['status']): BuyingPhaseUpdate {
    return {
      platform: form.platform || undefined,
      price_per_coin: form.price_per_coin !== '' ? Number(form.price_per_coin) : undefined,
      coins_received: form.coins_received !== '' ? Number(form.coins_received) : undefined,
      inr_spent: form.inr_spent !== '' ? Number(form.inr_spent) : undefined,
      ...(status ? { status } : {}),
    };
  }

  const canComplete = form.platform && form.price_per_coin && form.coins_received && form.inr_spent;

  return (
    <div className="flex flex-col gap-5.5">
      <div className="grid grid-cols-2 gap-3.5 max-[540px]:grid-cols-1">
        <Input label="Platform" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="e.g. WazirX, CoinDCX" disabled={disabled} />
        <Input label="Price per Coin (INR)" type="number" value={String(form.price_per_coin)} onChange={(e) => setForm({ ...form, price_per_coin: e.target.value })} placeholder="e.g. 83.5" disabled={disabled} />
        <Input label="Coins Received" type="number" value={String(form.coins_received)} onChange={(e) => setForm({ ...form, coins_received: e.target.value })} placeholder="e.g. 600" disabled={disabled} />
        <Input label="INR Spent" type="number" value={String(form.inr_spent)} onChange={(e) => setForm({ ...form, inr_spent: e.target.value })} placeholder="e.g. 50000" disabled={disabled} />
      </div>

      <div className="flex flex-wrap bg-white/2 border border-border rounded-sm overflow-hidden">
        <div className="flex flex-col gap-1.25 px-4.5 py-3 border-r border-white/4 flex-1 min-w-25">
          <span className="text-[11px] text-muted uppercase font-bold tracking-[0.06em]">Coin Value (INR)</span>
          <span className="text-[18px] font-extrabold text-text tracking-[-0.02em] tabular-nums">₹{coinValueInr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex flex-col gap-1.25 px-4.5 py-3 flex-1 min-w-25">
          <span className="text-[11px] text-muted uppercase font-bold tracking-[0.06em]">Purchase Fees</span>
          <span className="text-[18px] font-extrabold text-text tracking-[-0.02em] tabular-nums">₹{purchaseFees.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {!disabled && (
        <div className="flex gap-2.5 justify-end items-center pt-1">
          {isSaving && <span className="text-[11px] text-muted tracking-[0.03em] mr-1 opacity-80">Saving…</span>}
          <Button
            loading={isCompleting}
            disabled={!canComplete}
            title={!canComplete ? 'Fill all fields before completing' : ''}
            onClick={() => complete({ buy_phase: buildPayload('completed') })}
          >
            Mark Complete ✓
          </Button>
        </div>
      )}
    </div>
  );
}
