import type { TradeCycle, TradeCycleListItem, TradeCycleUpdate } from '../types';
import client from './client';

export async function getCycles(): Promise<TradeCycleListItem[]> {
  const res = await client.get<TradeCycleListItem[]>('/journal/get-cycles');
  return res.data;
}

export async function getCycle(id: string): Promise<TradeCycle> {
  const res = await client.get<TradeCycle>(`/journal/get-cycle/${id}`);
  return res.data;
}

export async function createCycle(): Promise<TradeCycle> {
  const res = await client.post<TradeCycle>('/journal/create-cycle', {});
  return res.data;
}

export async function updateCycle(id: string, payload: TradeCycleUpdate): Promise<TradeCycle> {
  const res = await client.put<TradeCycle>(`/journal/update-cycle/${id}`, payload);
  return res.data;
}

export async function deleteCycle(id: string): Promise<void> {
  await client.delete(`/journal/delete-cycle/${id}`);
}
