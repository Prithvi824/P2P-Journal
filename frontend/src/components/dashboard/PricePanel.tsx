import Card from '../common/Card';
import Spinner from '../common/Spinner';
import { useP2pMePrice } from '../../hooks/usePrice';

export default function PricePanel() {
  const { data, isLoading, dataUpdatedAt } = useP2pMePrice();

  return (
    <Card className="h-full flex flex-col">
      <div className="mb-4.5">
        <div className="flex items-center gap-2.25">
          <h2 className="text-sm font-bold text-muted uppercase tracking-[0.08em]">P2P.me Live Price</h2>
          <div
            className="w-1.75 h-1.75 rounded-full bg-success text-success animate-glow-pulse"
            title="Updates every 60s"
          />
        </div>
        {dataUpdatedAt > 0 && (
          <span className="block mt-0.75 text-[10px] text-muted opacity-80">
            Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : data ? (
        <div className="flex items-stretch flex-1">
          <div className="flex-1 flex flex-col gap-1.25 px-4 py-3.5 rounded-sm bg-white/2.5 transition-[background] hover:bg-white/4">
            <span className="text-xs text-muted uppercase font-bold tracking-[0.07em]">Buy Price</span>
            <span className="text-3xl font-extrabold leading-none tracking-[-0.03em] tabular-nums text-success">
              ₹{data.buy_price.toFixed(2)}
            </span>
            <span className="text-xs text-muted opacity-80">INR / USDT</span>
          </div>
          <div className="w-px bg-border mx-3 self-stretch" />
          <div className="flex-1 flex flex-col gap-1.25 px-4 py-3.5 rounded-sm bg-white/2.5 transition-[background] hover:bg-white/4">
            <span className="text-xs text-muted uppercase font-bold tracking-[0.07em]">Sell Price</span>
            <span className="text-3xl font-extrabold leading-none tracking-[-0.03em] tabular-nums text-warning">
              ₹{data.sell_price.toFixed(2)}
            </span>
            <span className="text-xs text-muted opacity-80">INR / USDT</span>
          </div>
        </div>
      ) : (
        <p className="text-base text-muted mt-4">Unable to fetch price</p>
      )}
    </Card>
  );
}
