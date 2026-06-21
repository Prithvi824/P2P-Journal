import { useAuthStore } from '../store/authStore';
import * as authApi from '../api/auth';

export function useAuth() {
  const { isAuthenticated, login: storeLogin, logout } = useAuthStore();

  async function login(username: string, password: string) {
    const token = await authApi.login(username, password);
    storeLogin(token);
  }

  return { isAuthenticated, login, logout };
}
