import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SALE_PAYMENT_METHODS } from "../../constants";
import { useAutoSaveCycle, useUpdateCycle } from "../../hooks/useCycles";
import type { SalePhase, SalePhaseUpdate } from "../../types";
import Button from "../common/Button";
import Input from "../common/Input";
import MultiSelect from "../common/MultiSelect";
import AddOrderForm from "./AddOrderForm";
import SaleOrderItem from "./SaleOrderItem";

interface Props {
  cycleId: string;
  phase: SalePhase | null;
  disabled: boolean;
}

export default function SalePhaseForm({ cycleId, phase, disabled }: Props) {
  const { mutate: autoSave, isPending: isSaving } = useAutoSaveCycle(cycleId);
  const { mutate: complete, isPending: isCompleting } = useUpdateCycle(cycleId);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const isFirstRender = useRef(true);
  const skipRef = useRef(false);

  const [form, setForm] = useState({
    min_order_inr: phase?.min_order_inr ?? "",
    max_order_inr: phase?.max_order_inr ?? "",
    usdt_for_sale: phase?.usdt_for_sale ?? "",
    payment_methods: phase?.payment_methods ?? [],
    sale_fees_inr: String(phase?.sale_fees_inr ?? 0),
  });

  useEffect(() => {
    skipRef.current = true;
    setForm({
      min_order_inr: phase?.min_order_inr ?? "",
      max_order_inr: phase?.max_order_inr ?? "",
      usdt_for_sale: phase?.usdt_for_sale ?? "",
      payment_methods: phase?.payment_methods ?? [],
      sale_fees_inr: String(phase?.sale_fees_inr ?? 0),
    });
  }, [phase]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      autoSave({ sale_phase: buildPayload() });
    }, 800);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const orders = phase?.orders ?? [];
  const totalUsdt = orders.reduce((s, o) => s + (o.usdt_sold ?? 0), 0);
  const totalInr = orders.reduce((s, o) => s + (o.inr_received ?? 0), 0);
  const avgPrice = totalUsdt > 0 ? totalInr / totalUsdt : 0;
  const remaining = Number(form.usdt_for_sale) - totalUsdt;

  function buildPayload(status?: SalePhase["status"]): SalePhaseUpdate {
    return {
      min_order_inr:
        form.min_order_inr !== "" ? Number(form.min_order_inr) : undefined,
      max_order_inr:
        form.max_order_inr !== "" ? Number(form.max_order_inr) : undefined,
      usdt_for_sale:
        form.usdt_for_sale !== "" ? Number(form.usdt_for_sale) : undefined,
      payment_methods: form.payment_methods.length
        ? form.payment_methods
        : undefined,
      sale_fees_inr:
        form.sale_fees_inr !== "" ? Number(form.sale_fees_inr) : undefined,
      ...(status ? { status } : {}),
    };
  }

  const canComplete =
    form.min_order_inr &&
    form.max_order_inr &&
    form.usdt_for_sale &&
    form.payment_methods.length > 0 &&
    form.sale_fees_inr !== "";

  return (
    <div className="flex flex-col gap-5.5">
      <div className="grid grid-cols-2 gap-3.5 max-[540px]:grid-cols-1">
        <Input
          label="Min Order (INR)"
          type="number"
          min="0"
          value={String(form.min_order_inr)}
          onChange={(e) => setForm({ ...form, min_order_inr: e.target.value })}
          placeholder="e.g. 500"
          disabled={disabled}
        />
        <Input
          label="Max Order (INR)"
          type="number"
          min="0"
          value={String(form.max_order_inr)}
          onChange={(e) => setForm({ ...form, max_order_inr: e.target.value })}
          placeholder="e.g. 50000"
          disabled={disabled}
        />
        <Input
          label="USDT for Sale"
          type="number"
          min="0"
          value={String(form.usdt_for_sale)}
          onChange={(e) => setForm({ ...form, usdt_for_sale: e.target.value })}
          placeholder="e.g. 598"
          disabled={disabled}
        />
        <Input
          label="Sale Fees (INR)"
          type="number"
          min="0"
          value={String(form.sale_fees_inr)}
          onChange={(e) => setForm({ ...form, sale_fees_inr: e.target.value })}
          placeholder="e.g. 0"
          disabled={disabled}
        />
      </div>

      <MultiSelect
        label="Payment Methods"
        options={SALE_PAYMENT_METHODS}
        value={form.payment_methods}
        onChange={(v) => setForm({ ...form, payment_methods: v })}
        disabled={disabled}
      />

      <div className="flex flex-wrap bg-white/2 border border-border rounded-sm overflow-hidden">
        <div className="flex flex-col gap-1.25 px-4.5 py-3 border-r border-white/4 flex-1 min-w-25">
          <span className="text-[11px] text-muted uppercase font-bold tracking-[0.06em]">
            USDT Sold
          </span>
          <span className="text-[18px] font-extrabold text-text tracking-[-0.02em] tabular-nums">
            {totalUsdt.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col gap-1.25 px-4.5 py-3 border-r border-white/4 flex-1 min-w-25">
          <span className="text-[11px] text-muted uppercase font-bold tracking-[0.06em]">
            Avg Price / USDT
          </span>
          <span className="text-[18px] font-extrabold text-text tracking-[-0.02em] tabular-nums">
            ₹{avgPrice.toFixed(4)}
          </span>
        </div>
        <div className="flex flex-col gap-1.25 px-4.5 py-3 border-r border-white/4 flex-1 min-w-25">
          <span className="text-[11px] text-muted uppercase font-bold tracking-[0.06em]">
            INR Received
          </span>
          <span className="text-[18px] font-extrabold text-text tracking-[-0.02em] tabular-nums">
            ₹{totalInr.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex flex-col gap-1.25 px-4.5 py-3 flex-1 min-w-25">
          <span className="text-[11px] text-muted uppercase font-bold tracking-[0.06em]">
            Remaining USDT
          </span>
          <span
            className={`text-[18px] tracking-[-0.02em] tabular-nums font-extrabold ${remaining > 0 ? "text-warning" : "text-success"}`}
          >
            {remaining.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-[13px] font-bold text-text tracking-[-0.01em]">
            Sale Orders ({orders.length})
          </h4>
          {!disabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddOrder(!showAddOrder)}
            >
              {showAddOrder ? "Cancel" : "+ Add Order"}
            </Button>
          )}
        </div>

        <AnimatePresence>
          {showAddOrder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AddOrderForm
                cycleId={cycleId}
                onDone={() => setShowAddOrder(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {orders.length === 0 ? (
          <p className="text-[12px] text-muted text-center py-6 px-4 bg-white/1.5 border border-dashed border-border rounded-sm">
            No orders yet. Add your first sale order.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {orders.map((o) => (
              <SaleOrderItem
                key={o.id}
                cycleId={cycleId}
                order={o}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      </div>

      {!disabled && (
        <div className="flex gap-2.5 justify-end items-center pt-1">
          {isSaving && (
            <span className="text-[11px] text-muted tracking-[0.03em] mr-1 opacity-80">
              Saving…
            </span>
          )}
          <Button
            loading={isCompleting}
            disabled={!canComplete}
            title={!canComplete ? "Fill all required fields to complete" : ""}
            onClick={() => complete({ sale_phase: buildPayload("completed") })}
          >
            Mark Complete ✓
          </Button>
        </div>
      )}
    </div>
  );
}
