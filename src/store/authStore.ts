import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

// Simple auth store using localStorage
const STORAGE_KEY = 'electrohub-auth';

const getStoredAuth = (): { user: User | null; token: string | null } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error parsing stored auth:', e);
  }
  return { user: null, token: null };
};

const setStoredAuth = (user: User | null, token: string | null) => {
  try {
    if (user && token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Error storing auth:', e);
  }
};

export const useAuthStore = () => {
  const state = getStoredAuth();
  
  return {
    user: state.user,
    token: state.token,
    setAuth: (user: User, token: string) => {
      setStoredAuth(user, token);
    },
    logout: () => {
      setStoredAuth(null, null);
    },
    isAuthenticated: () => !!state.token,
  };
};
