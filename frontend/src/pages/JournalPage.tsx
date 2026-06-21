import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Layout from '../components/common/Layout';
import Spinner from '../components/common/Spinner';
import BuyingPhaseForm from '../components/journal/BuyingPhaseForm';
import DepositPhaseForm from '../components/journal/DepositPhaseForm';
import PhaseAccordion from '../components/journal/PhaseAccordion';
import PhaseStepper from '../components/journal/PhaseStepper';
import SalePhaseForm from '../components/journal/SalePhaseForm';
import { useGetCycle } from '../hooks/useCycles';

export default function JournalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: cycle, isLoading, error } = useGetCycle(id!);

  if (isLoading) return <Layout><Spinner size={48} /></Layout>;
  if (error || !cycle) return (
    <Layout>
      <div className="flex flex-col items-center gap-4 py-16 px-6 text-muted text-[13px]">
        <p>Cycle not found.</p>
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>← Back to Dashboard</Button>
      </div>
    </Layout>
  );

  const locked      = cycle.status === 'completed';
  const buyDone     = cycle.buy_phase?.status === 'completed';
  const depositDone = cycle.deposit_phase?.status === 'completed';

  const summaryItems = [
    { label: 'INR Spent',    value: `₹${cycle.total_inr_spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
    { label: 'INR Received', value: `₹${cycle.total_inr_received.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
    { label: 'Remaining',    value: `${cycle.remaining_usdt.toFixed(2)} USDT` },
    { label: 'PNL',          value: `${cycle.pnl >= 0 ? '+' : ''}₹${Math.abs(cycle.pnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: cycle.pnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)' },
    { label: 'Total Fees',   value: `₹${cycle.total_fees_inr.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` },
  ];

  return (
    <Layout>
      <motion.div
        className="flex flex-col gap-5.5 animate-fade-up"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="flex justify-between items-start gap-4">
          <div>
            <button
              className="inline-flex items-center gap-1.25 bg-transparent border-none text-muted text-[12px] font-[inherit] font-medium cursor-pointer p-0 mb-2 transition-[color] hover:text-text"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={13} /> Dashboard
            </button>
            <h1 className="text-[26px] font-extrabold tracking-[-0.03em] text-text">Trade Cycle</h1>
            <p className="text-[11px] text-muted mt-0.75 font-mono opacity-70">{cycle.id}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge status={cycle.status} />
            {locked && (
              <span className="text-[11px] text-muted italic py-1 px-2.5 bg-white/3 border border-border rounded-full">
                Locked — completed
              </span>
            )}
          </div>
        </div>

        <PhaseStepper steps={[
          { label: 'Buy',     status: cycle.buy_phase?.status     ?? 'not_started', completedAt: cycle.buy_phase?.updated_at },
          { label: 'Deposit', status: cycle.deposit_phase?.status ?? 'not_started', completedAt: cycle.deposit_phase?.updated_at },
          { label: 'Sale',    status: cycle.sale_phase?.status    ?? 'not_started', completedAt: cycle.sale_phase?.updated_at },
        ]} />

        <div className="flex bg-card border border-border border-t-[rgba(255,255,255,0.07)] rounded-md overflow-hidden shadow-sm max-[700px]:flex-wrap">
          {summaryItems.map((s, i) => (
            <div
              key={s.label}
              className={`flex-1 flex flex-col gap-1.5 px-5.5 py-4.5 relative max-[700px]:flex-[1_1_45%] ${i < summaryItems.length - 1 ? 'border-r border-white/4' : ''}`}
            >
              <span className="text-[11px] font-bold text-muted uppercase tracking-[0.07em]">{s.label}</span>
              <span
                className="text-[20px] font-extrabold tracking-tight tabular-nums"
                style={s.color ? { color: s.color } : {}}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          <PhaseAccordion
            title="1. Buying Phase"
            status={cycle.buy_phase?.status ?? 'not_started'}
            isActive={!buyDone && !locked}
            isLocked={locked}
            completedAt={cycle.buy_phase?.updated_at}
          >
            {cycle.buy_phase && (
              <BuyingPhaseForm cycleId={cycle.id} phase={cycle.buy_phase} disabled={locked || buyDone} />
            )}
          </PhaseAccordion>

          <PhaseAccordion
            title="2. Deposit Phase"
            status={cycle.deposit_phase?.status ?? 'not_started'}
            isActive={buyDone && !depositDone && !locked}
            isLocked={locked}
            completedAt={cycle.deposit_phase?.updated_at}
          >
            {buyDone && (
              <DepositPhaseForm
                cycleId={cycle.id}
                phase={cycle.deposit_phase}
                totalInrSpent={cycle.total_inr_spent}
                disabled={locked || depositDone}
              />
            )}
          </PhaseAccordion>

          <PhaseAccordion
            title="3. Sale Phase"
            status={cycle.sale_phase?.status ?? 'not_started'}
            isActive={depositDone && cycle.sale_phase?.status !== 'completed' && !locked}
            isLocked={locked}
            completedAt={cycle.sale_phase?.updated_at}
          >
            {depositDone && (
              <SalePhaseForm
                cycleId={cycle.id}
                phase={cycle.sale_phase}
                disabled={locked || cycle.sale_phase?.status === 'completed'}
              />
            )}
          </PhaseAccordion>
        </div>
      </motion.div>
    </Layout>
  );
}
