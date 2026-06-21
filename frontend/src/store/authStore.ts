import { create } from 'zustand';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const storedToken = localStorage.getItem('token');

export const useAuthStore = create<AuthState>(() => ({
  token: storedToken,
  isAuthenticated: !!storedToken,

  login: (token: string) => {
    localStorage.setItem('token', token);
    useAuthStore.setState({ token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    useAuthStore.setState({ token: null, isAuthenticated: false });
  },
}));
