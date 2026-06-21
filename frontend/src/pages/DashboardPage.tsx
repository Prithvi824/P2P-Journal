import AlertPanel from '../components/dashboard/AlertPanel';
import Layout from '../components/common/Layout';
import BinanceAdsPanel from '../components/dashboard/BinanceAdsPanel';
import CycleTable from '../components/dashboard/CycleTable';
import MetricsPanel from '../components/dashboard/MetricsPanel';
import PricePanel from '../components/dashboard/PricePanel';

export default function DashboardPage() {
  return (
    <Layout>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-5 max-[1024px]:grid-cols-2 max-[768px]:grid-cols-1">
          <div className="min-h-45"><PricePanel /></div>
          <div className="min-h-45"><MetricsPanel /></div>
          <div className="min-h-45"><AlertPanel /></div>
        </div>
        <BinanceAdsPanel />
        <CycleTable />
      </div>
    </Layout>
  );
}
