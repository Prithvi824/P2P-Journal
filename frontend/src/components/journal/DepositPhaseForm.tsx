import { useEffect, useRef, useState } from "react";
import { COINS, NETWORKS } from "../../constants";
import { useAutoSaveCycle, useUpdateCycle } from "../../hooks/useCycles";
import type { DepositPhase, DepositPhaseUpdate } from "../../types";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";

interface Props {
  cycleId: string;
  phase: DepositPhase | null;
  totalInrSpent: number;
  disabled: boolean;
}

export default function DepositPhaseForm({
  cycleId,
  phase,
  totalInrSpent,
  disabled,
}: Props) {
  const { mutate: autoSave, isPending: isSaving } = useAutoSaveCycle(cycleId);
  const { mutate: complete, isPending: isCompleting } = useUpdateCycle(cycleId);
  const isFirstRender = useRef(true);
  const skipRef = useRef(false);

  const [form, setForm] = useState({
    source_platform: phase?.source_platform ?? "",
    coin_symbol: phase?.coin_symbol ?? "",
    network: phase?.network ?? "",
    coins_deposited: phase?.coins_deposited ?? "",
    usdt_received: phase?.usdt_received ?? "",
  });

  useEffect(() => {
    skipRef.current = true;
    setForm({
      source_platform: phase?.source_platform ?? "",
      coin_symbol: phase?.coin_symbol ?? "",
      network: phase?.network ?? "",
      coins_deposited: phase?.coins_deposited ?? "",
      usdt_received: phase?.usdt_received ?? "",
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
      autoSave({ deposit_phase: buildPayload() });
    }, 800);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const costPerUsdt =
    form.usdt_received && totalInrSpent
      ? (totalInrSpent / Number(form.usdt_received)).toFixed(4)
      : "—";

  function buildPayload(status?: DepositPhase["status"]): DepositPhaseUpdate {
    return {
      source_platform: form.source_platform || undefined,
      coin_symbol: form.coin_symbol || undefined,
      network: form.network || undefined,
      coins_deposited:
        form.coins_deposited !== "" ? Number(form.coins_deposited) : undefined,
      usdt_received:
        form.usdt_received !== "" ? Number(form.usdt_received) : undefined,
      ...(status ? { status } : {}),
    };
  }

  const canComplete =
    form.source_platform &&
    form.coin_symbol &&
    form.network &&
    form.coins_deposited &&
    form.usdt_received;

  return (
    <div className="flex flex-col gap-5.5">
      <div className="grid grid-cols-2 gap-3.5 max-[540px]:grid-cols-1">
        <Input
          label="Source Platform"
          value={form.source_platform}
          onChange={(e) =>
            setForm({ ...form, source_platform: e.target.value })
          }
          placeholder="e.g. WazirX"
          disabled={disabled}
        />
        <Select
          label="Coin"
          options={COINS}
          value={form.coin_symbol}
          onChange={(v) => setForm({ ...form, coin_symbol: v })}
          disabled={disabled}
        />
        <Select
          label="Network"
          options={NETWORKS}
          value={form.network}
          onChange={(v) => setForm({ ...form, network: v })}
          disabled={disabled}
        />
        <Input
          label="Coins Deposited"
          type="number"
          value={String(form.coins_deposited)}
          onChange={(e) =>
            setForm({ ...form, coins_deposited: e.target.value })
          }
          placeholder="e.g. 600"
          disabled={disabled}
        />
        <Input
          label="USDT Received"
          type="number"
          value={String(form.usdt_received)}
          onChange={(e) => setForm({ ...form, usdt_received: e.target.value })}
          placeholder="e.g. 598.5"
          disabled={disabled}
        />
      </div>

      <div className="flex flex-wrap bg-white/2 border border-border rounded-sm overflow-hidden">
        <div className="flex flex-col gap-1.25 px-4.5 py-3 flex-1 min-w-25">
          <span className="text-[11px] text-muted uppercase font-bold tracking-[0.06em]">
            Cost per USDT (INR)
          </span>
          <span className="text-[18px] font-extrabold text-text tracking-[-0.02em] tabular-nums">
            ₹{costPerUsdt}
          </span>
        </div>
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
            title={!canComplete ? "Fill all fields before completing" : ""}
            onClick={() =>
              complete({ deposit_phase: buildPayload("completed") })
            }
          >
            Mark Complete ✓
          </Button>
        </div>
      )}
    </div>
  );
}
