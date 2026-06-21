import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateCycle,
  useDeleteCycle,
  useGetCycles,
} from "../../hooks/useCycles";
import type { TradeCycleListItem } from "../../types";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Card from "../common/Card";
import ConfirmModal from "../common/ConfirmModal";
import Spinner from "../common/Spinner";

function fmt(n: number, sign = false) {
  const s =
    "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  if (!sign) return s;
  return (n >= 0 ? "+" : "-") + s;
}

function CycleRow({ cycle }: { cycle: TradeCycleListItem }) {
  const navigate = useNavigate();
  const { mutate: del, isPending } = useDeleteCycle();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <tr
        className="group cursor-pointer transition-[background] hover:bg-white/2.5"
        onClick={() => navigate(`/journal/${cycle.id}`)}
      >
        <td className="px-3.5 py-3.25 text-base text-text border-b border-white/3 whitespace-nowrap group-hover:border-l-2 group-hover:border-l-primary group-hover:pl-3">
          {new Date(cycle.created_at).toLocaleDateString("en-IN")}
        </td>
        <td className="px-3.5 py-3.25 text-base text-text border-b border-white/3 whitespace-nowrap">
          <Badge status={cycle.status} />
        </td>
        <td className="px-3.5 py-3.25 text-base text-text border-b border-white/3 whitespace-nowrap tabular-nums">
          {fmt(cycle.total_inr_spent)}
        </td>
        <td className="px-3.5 py-3.25 text-base text-text border-b border-white/3 whitespace-nowrap tabular-nums">
          {fmt(cycle.total_inr_received)}
        </td>
        <td className="px-3.5 py-3.25 text-base text-text border-b border-white/3 whitespace-nowrap tabular-nums">
          {cycle.remaining_usdt.toFixed(2)} USDT
        </td>
        <td className="px-3.5 py-3.25 text-base border-b border-white/3 whitespace-nowrap tabular-nums">
          <span
            className={
              cycle.pnl >= 0
                ? "text-success! font-bold"
                : "text-danger! font-bold"
            }
          >
            {fmt(cycle.pnl, true)}
          </span>
        </td>
        <td
          className="px-3.5 py-3.25 border-b border-white/3"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="sm"
            loading={isPending}
            onClick={() => setShowConfirm(true)}
            disabled={cycle.status === "completed"}
          >
            Delete
          </Button>
        </td>
      </tr>
      {showConfirm && (
        <ConfirmModal
          title="Delete Cycle"
          message="This cycle and all its phases and orders will be permanently deleted. This cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            del(cycle.id);
            setShowConfirm(false);
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

export default function CycleTable() {
  const { data: cycles, isLoading } = useGetCycles();
  const { mutate: create, isPending } = useCreateCycle();
  const navigate = useNavigate();

  return (
    <Card>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-extrabold text-text tracking-[-0.02em]">
          Trade Cycles
        </h2>
        <Button
          loading={isPending}
          onClick={() =>
            create(undefined, {
              onSuccess: (c) => navigate(`/journal/${c.id}`),
            })
          }
        >
          + New Cycle
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !cycles?.length ? (
        <p className="text-center text-muted py-12 px-6 text-base">
          No cycles yet. Create your first one!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {[
                  "Date",
                  "Status",
                  "INR Spent",
                  "INR Received",
                  "Remaining USDT",
                  "PNL",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-bold text-muted uppercase tracking-[0.07em] px-3.5 py-2 border-b border-border whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cycles.map((c) => (
                <CycleRow key={c.id} cycle={c} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
