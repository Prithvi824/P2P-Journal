import client from './client';

export async function login(username: string, password: string): Promise<string> {
  const res = await client.post<{ access_token: string }>('/auth/login', { username, password });
  return res.data.access_token;
}
