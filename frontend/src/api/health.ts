import axios from 'axios';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  checks: {
    database: string;
    binance: string;
    p2p_me: string;
  };
}

// /health lives at the server root, not under /api/v1
const serverRoot = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(
  /\/api\/v1\/?$/,
  ''
);

export async function getHealth(): Promise<HealthResponse> {
  const res = await axios.get<HealthResponse>(`${serverRoot}/health`);
  return res.data;
}
