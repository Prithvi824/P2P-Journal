import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { PAYMENT_METHODS, TRADE_TYPES } from '../../constants';
import { useBinanceAds } from '../../hooks/usePrice';
import type { BinanceAd } from '../../types';
import Card from '../common/Card';
import Select from '../common/Select';
import Spinner from '../common/Spinner';

function AdRow({ ad, rank }: { ad: BinanceAd; rank: number }) {
  return (
    <motion.div
      className="grid gap-3 items-center px-3 py-2.75 rounded-sm transition-[background] border-b border-white/2.5 last:border-b-0 hover:bg-white/3 grid-cols-[36px_1fr_110px_170px_1fr] max-[900px]:grid-cols-[1fr_1fr] max-[900px]:gap-2"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.04 }}
    >
      <span className="text-sm text-muted font-bold">#{rank + 1}</span>
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-semibold text-text">{ad.seller_name}</span>
        <span className="text-xs text-muted">{ad.monthly_orders} orders/mo</span>
      </div>
      <div className="flex items-baseline gap-0.75">
        <span className="text-[15px] font-extrabold text-primary tabular-nums">₹{parseFloat(String(ad.price_per_usdt)).toFixed(2)}</span>
        <span className="text-xs text-muted">/ USDT</span>
      </div>
      <div className="flex items-center gap-1 text-sm text-text-dim tabular-nums">
        <span>₹{Number(ad.min_order_inr).toLocaleString('en-IN')}</span>
        <span className="text-muted">–</span>
        <span>₹{Number(ad.max_order_inr).toLocaleString('en-IN')}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {ad.payment_methods.slice(0, 3).map((m) => (
          <span key={m} className="px-1.75 py-0.5 bg-secondary-dim text-secondary border border-[rgba(79,140,255,0.15)] rounded-full text-[9px] font-bold tracking-[0.03em] uppercase">{m}</span>
        ))}
        {ad.payment_methods.length > 3 && (
          <span className="px-1.75 py-0.5 bg-secondary-dim text-secondary border border-[rgba(79,140,255,0.15)] rounded-full text-[9px] font-bold tracking-[0.03em] uppercase">+{ad.payment_methods.length - 3}</span>
        )}
      </div>
    </motion.div>
  );
}

export default function BinanceAdsPanel() {
  const [expanded, setExpanded] = useState(false);
  const [tradeType, setTradeType] = useState('BUY');
  const [payType, setPayType] = useState('');
  const [transAmount, setTransAmount] = useState('');

  const { data, isLoading } = useBinanceAds({
    trade_type: tradeType,
    pay_types: payType || undefined,
    trans_amount: transAmount ? Number(transAmount) : undefined,
  });

  const displayedAds = expanded ? (data?.ads ?? []) : (data?.ads ?? []).slice(0, 4);

  return (
    <Card>
      <div className="flex justify-between items-start mb-4.5">
        <div>
          <h2 className="text-lg font-extrabold text-text tracking-[-0.02em]">Binance P2P Ads</h2>
          <span className="block text-xs text-muted mt-0.5 opacity-80">Updated every 2 minutes</span>
        </div>
        <button
          className="bg-transparent border border-border text-primary rounded-sm px-3.5 py-1.5 text-sm font-semibold font-[inherit] cursor-pointer transition-all whitespace-nowrap hover:bg-primary-dim hover:border-[rgba(0,229,168,0.35)]"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show Less ▲' : data && data.total > 10 ? `Show All ${data.total} ▼` : null}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5 pb-4.5 border-b border-border max-[768px]:grid-cols-2">
        <Select label="Trade Type" options={TRADE_TYPES} value={tradeType} onChange={setTradeType} />
        <Select label="Payment Method" options={PAYMENT_METHODS} value={payType} onChange={setPayType} placeholder="All methods" />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted uppercase tracking-[0.06em]">Trade Amount (INR)</label>
          <input
            className="bg-white/3.5 border border-border rounded-sm text-text px-3 py-2.25 text-base font-[inherit] outline-none w-full tabular-nums transition-[border-color,box-shadow] focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,229,168,0.1)] placeholder:text-muted placeholder:opacity-70"
            type="number"
            placeholder="e.g. 5000"
            value={transAmount}
            onChange={(e) => setTransAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 px-3 py-1.75 text-xs font-bold text-muted uppercase tracking-[0.07em] border-b border-border mb-0.5 grid-cols-[36px_1fr_110px_170px_1fr] max-[900px]:hidden">
        <span>#</span>
        <span>Seller</span>
        <span>Price</span>
        <span>Order Limit (INR)</span>
        <span>Payment Methods</span>
      </div>

      {isLoading ? (
        <Spinner />
      ) : displayedAds.length === 0 ? (
        <p className="text-center text-muted p-8 text-base">No ads match your filters.</p>
      ) : (
        <div className="flex flex-col">
          <AnimatePresence>
            {displayedAds.map((ad, i) => <AdRow key={`${ad.seller_name}-${i}`} ad={ad} rank={i} />)}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
}
