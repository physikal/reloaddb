import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '../types';

interface AuthState {
  user: (FirebaseUser & Partial<User>) | null;
  loading: boolean;
  setUser: (user: (FirebaseUser & Partial<User>) | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));