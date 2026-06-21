import { useEffect, useState } from 'react';
import { useUpdateCycle } from '../../hooks/useCycles';
import Button from '../common/Button';
import Input from '../common/Input';

interface Props {
  cycleId: string;
  onDone: () => void;
}

export default function AddOrderForm({ cycleId, onDone }: Props) {
  const { mutate: update, isPending } = useUpdateCycle(cycleId);
  const [form, setForm] = useState({ price_per_usdt: '', usdt_sold: '', inr_received: '', buyer_username: '' });

  const { price_per_usdt, usdt_sold } = form;
  useEffect(() => {
    const price = Number(price_per_usdt);
    const usdt = Number(usdt_sold);
    if (price > 0 && usdt > 0) {
      setForm((prev) => ({ ...prev, inr_received: (price * usdt).toFixed(2) }));
    }
  }, [price_per_usdt, usdt_sold]);

  const preview = Number(form.price_per_usdt) * Number(form.usdt_sold);

  function submit() {
    if (!form.price_per_usdt || !form.usdt_sold || !form.inr_received) return;
    update(
      {
        sale_phase: {
          add_orders: [{
            price_per_usdt: Number(form.price_per_usdt),
            usdt_sold: Number(form.usdt_sold),
            inr_received: Number(form.inr_received),
            buyer_username: form.buyer_username || undefined,
          }],
        },
      },
      { onSuccess: onDone }
    );
  }

  return (
    <div className="bg-[rgba(0,229,168,0.03)] border border-[rgba(0,229,168,0.18)] rounded-md p-4.5">
      <h4 className="text-[13px] font-bold text-primary mb-3.5 tracking-[-0.01em]">Add Order</h4>
      <div className="grid grid-cols-2 gap-3 mb-3.5 max-[540px]:grid-cols-1">
        <Input label="Price / USDT (INR)" type="number" min="0" value={form.price_per_usdt} onChange={(e) => setForm({ ...form, price_per_usdt: e.target.value })} placeholder="e.g. 86.5" />
        <Input label="USDT Sold" type="number" min="0" value={form.usdt_sold} onChange={(e) => setForm({ ...form, usdt_sold: e.target.value })} placeholder="e.g. 300" />
        <Input label="INR Received" type="number" min="0" value={form.inr_received} onChange={(e) => setForm({ ...form, inr_received: e.target.value })} placeholder="e.g. 25950" />
        <Input label="Buyer Username (optional)" value={form.buyer_username} onChange={(e) => setForm({ ...form, buyer_username: e.target.value })} placeholder="Optional" />
      </div>
      {preview > 0 && (
        <p className="text-[12px] text-muted mb-3.5 py-2 px-3 bg-white/3 rounded-xs">
          Expected INR: ₹{preview.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
      )}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onDone}>Cancel</Button>
        <Button size="sm" loading={isPending} disabled={!form.price_per_usdt || !form.usdt_sold || !form.inr_received} onClick={submit}>
          Add Order
        </Button>
      </div>
    </div>
  );
}
