import { useQuery } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import { useAuthStore } from '../store/authStore';

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.me,
    enabled: isAuthenticated,
    staleTime: Infinity,
  });
}
