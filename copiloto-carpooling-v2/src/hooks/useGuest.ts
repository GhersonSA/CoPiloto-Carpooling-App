import { useAuth } from './useAuth';

export function useGuest() {
  const { user, loading } = useAuth();
  
  const isGuest = !loading && user?.role === 'guest';
  
  return { isGuest, loading, user };
}