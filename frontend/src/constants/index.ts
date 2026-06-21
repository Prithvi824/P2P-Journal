export const NETWORKS = [
  'SOL', 'XRP', 'TRON', 'TRC20', 'BEP20',
  'ERC20', 'MATIC', 'AVAX', 'LTC', 'BTC',
  'BASE', 'XLM', 'ADA', 'ALGO', 'DOT',
] as const;

export const COINS = [
  'USDT', 'USDC', 'XRP', 'SOL', 'BNB',
  'XLM', 'TRX', 'ETH', 'ADA', 'MATIC',
] as const;

export const PAYMENT_METHODS = [
  'UPI', 'GPay', 'PhonePe', 'Paytm',
  'IMPS', 'NEFT', 'Bank Transfer', 'Digital E-Rupee',
] as const;

export const SALE_PAYMENT_METHODS = [
  'UPI', 'GPay', 'PhonePe', 'Paytm',
  'IMPS', 'NEFT', 'Bank Transfer', 'Digital E-Rupee',
] as const;

export type SalePaymentMethod = typeof SALE_PAYMENT_METHODS[number];

export const TRADE_TYPES = ['BUY', 'SELL'] as const;

export type Network = typeof NETWORKS[number];
export type Coin = typeof COINS[number];
export type PaymentMethod = typeof PAYMENT_METHODS[number];
export type TradeType = typeof TRADE_TYPES[number];
