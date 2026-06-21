export type PhaseStatus = 'not_started' | 'in_progress' | 'completed';
export type CycleStatus = 'buying' | 'depositing' | 'selling' | 'completed';

export interface BuyingPhase {
  id: string;
  platform: string | null;
  price_per_coin: number | null;
  coins_received: number | null;
  inr_spent: number | null;
  coin_value_inr: number | null;
  purchase_fees_inr: number | null;
  status: PhaseStatus;
  created_at: string;
  updated_at: string;
}

export interface DepositPhase {
  id: string;
  source_platform: string | null;
  coin_symbol: string | null;
  network: string | null;
  coins_deposited: number | null;
  usdt_received: number | null;
  cost_per_usdt_inr: number | null;
  status: PhaseStatus;
  created_at: string;
  updated_at: string;
}

export interface SaleOrder {
  id: string;
  price_per_usdt: number | null;
  usdt_sold: number | null;
  inr_received: number | null;
  buyer_username: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalePhase {
  id: string;
  min_order_inr: number | null;
  max_order_inr: number | null;
  usdt_for_sale: number | null;
  payment_methods: string[] | null;
  sale_fees_inr: number | null;
  avg_price_per_usdt: number | null;
  total_usdt_sold: number | null;
  total_inr_received: number | null;
  status: PhaseStatus;
  orders: SaleOrder[];
  created_at: string;
  updated_at: string;
}

export interface TradeCycle {
  id: string;
  status: CycleStatus;
  pnl: number;
  total_inr_spent: number;
  total_inr_received: number;
  remaining_usdt: number;
  remaining_value_inr: number;
  total_fees_inr: number;
  buy_phase: BuyingPhase | null;
  deposit_phase: DepositPhase | null;
  sale_phase: SalePhase | null;
  created_at: string;
  updated_at: string;
}

export interface TradeCycleListItem {
  id: string;
  status: CycleStatus;
  pnl: number;
  total_inr_spent: number;
  total_inr_received: number;
  remaining_usdt: number;
  total_fees_inr: number;
  created_at: string;
  updated_at: string;
}

export interface PricePoint {
  timestamp: string;
  buy_price: number;
  sell_price: number;
}

export interface BinanceAd {
  seller_name: string;
  price_per_usdt: number;
  available_usdt: number;
  min_order_inr: number;
  max_order_inr: number;
  payment_methods: string[];
  monthly_orders: number;
}

export interface BinanceAdsResponse {
  ads: BinanceAd[];
  total: number;
}

// Update payloads
export interface BuyingPhaseUpdate {
  platform?: string;
  price_per_coin?: number;
  coins_received?: number;
  inr_spent?: number;
  status?: PhaseStatus;
}

export interface DepositPhaseUpdate {
  source_platform?: string;
  coin_symbol?: string;
  network?: string;
  coins_deposited?: number;
  usdt_received?: number;
  status?: PhaseStatus;
}

export interface SaleOrderCreate {
  price_per_usdt: number;
  usdt_sold: number;
  inr_received: number;
  buyer_username?: string;
}

export interface SalePhaseUpdate {
  min_order_inr?: number;
  max_order_inr?: number;
  usdt_for_sale?: number;
  payment_methods?: string[];
  sale_fees_inr?: number;
  status?: PhaseStatus;
  add_orders?: SaleOrderCreate[];
  delete_order_ids?: string[];
}

export interface TradeCycleUpdate {
  buy_phase?: BuyingPhaseUpdate;
  deposit_phase?: DepositPhaseUpdate;
  sale_phase?: SalePhaseUpdate;
}

export interface AlertThreshold {
  threshold: number | null;
  last_alert_sent_at: string | null;
}

export interface AlertThresholdUpdate {
  threshold: number | null;
}
