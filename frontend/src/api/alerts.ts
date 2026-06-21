import client from './client';
import type { AlertThreshold, AlertThresholdUpdate } from '../types';

export async function getAlertThreshold(): Promise<AlertThreshold> {
  const { data } = await client.get<AlertThreshold>('/alerts/threshold');
  return data;
}

export async function setAlertThreshold(payload: AlertThresholdUpdate): Promise<AlertThreshold> {
  const { data } = await client.put<AlertThreshold>('/alerts/threshold', payload);
  return data;
}
