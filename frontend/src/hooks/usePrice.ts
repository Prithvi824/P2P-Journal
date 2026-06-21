import { useQuery } from '@tanstack/react-query';
import { getBinanceAds, getP2pMePrice } from '../api/price';

export function useP2pMePrice() {
  return useQuery({
    queryKey: ['p2p-me-price'],
    queryFn: getP2pMePrice,
    refetchInterval: 60_000,
    staleTime: 55_000,
  });
}

export function useBinanceAds(params?: {
  trade_type?: string;
  pay_types?: string;
  trans_amount?: number;
}) {
  return useQuery({
    queryKey: ['binance-ads', params],
    queryFn: () => getBinanceAds(params),
    refetchInterval: 120_000,
    staleTime: 110_000,
  });
}
