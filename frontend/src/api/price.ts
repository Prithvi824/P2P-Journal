import type { BinanceAdsResponse, PricePoint } from '../types';
import client from './client';

export async function getP2pMePrice(): Promise<PricePoint> {
  const res = await client.get<PricePoint>('/p2p-me/get-price');
  return res.data;
}

export async function getBinanceAds(params?: {
  trade_type?: string;
  pay_types?: string;
  trans_amount?: number;
}): Promise<BinanceAdsResponse> {
  const res = await client.get<BinanceAdsResponse>('/binance/get-p2p-ads', { params });
  return res.data;
}
