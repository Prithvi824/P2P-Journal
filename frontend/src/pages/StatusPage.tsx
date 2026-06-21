import { useQuery } from '@tanstack/react-query';
import { type HealthResponse, getHealth } from '../api/health';
import Card from '../components/common/Card';
import Layout from '../components/common/Layout';

function StatusDot({ status }: { status: string }) {
  const ok = status === 'ok';
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${ok ? 'bg-success' : 'bg-danger'}`}
    />
  );
}

function CheckRow({ label, status }: { label: string; status: string }) {
  const ok = status === 'ok';
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/3 last:border-0">
      <span className="text-base text-text-dim font-medium">{label}</span>
      <span className={`flex items-center gap-2 text-sm font-semibold ${ok ? 'text-success' : 'text-danger'}`}>
        <StatusDot status={status} />
        {ok ? 'Operational' : 'Unreachable'}
      </span>
    </div>
  );
}

export default function StatusPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: getHealth,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const overallOk = data?.status === 'healthy';

  return (
    <Layout>
    <div className="max-w-lg mx-auto pt-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-text tracking-[-0.02em]">System Status</h1>
          <p className="text-sm text-muted mt-0.5">
            {data?.service ?? 'p2p-trade-journal'} · v{data?.version ?? '—'}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-4 py-1.5 rounded-sm text-sm font-semibold border border-border text-muted hover:text-text hover:border-muted transition-[color,border-color] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isFetching ? 'Checking…' : 'Refresh'}
        </button>
      </div>

      {isLoading ? (
        <Card>
          <p className="text-center text-muted py-8 text-base">Checking services…</p>
        </Card>
      ) : isError ? (
        <Card>
          <div className="flex items-center gap-3 py-2">
            <StatusDot status="error" />
            <p className="text-base text-danger font-medium">Backend unreachable</p>
          </div>
        </Card>
      ) : (
        <>
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-md mb-5 ${
              overallOk
                ? 'bg-success/10 border border-success/20'
                : 'bg-danger/10 border border-danger/20'
            }`}
          >
            <StatusDot status={overallOk ? 'ok' : 'error'} />
            <span className={`font-semibold text-base ${overallOk ? 'text-success' : 'text-danger'}`}>
              {overallOk ? 'All systems operational' : 'One or more services degraded'}
            </span>
          </div>

          <Card>
            <CheckRow label="Database" status={data?.checks.database ?? 'error'} />
            <CheckRow label="Binance P2P" status={data?.checks.binance ?? 'error'} />
            <CheckRow label="P2P.me (Base Chain RPC)" status={data?.checks.p2p_me ?? 'error'} />
          </Card>
        </>
      )}
    </div>
    </Layout>
  );
}
