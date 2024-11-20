import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { User, LoadFormConfig } from '../types';

interface AuthState {
  user: (FirebaseUser & Partial<User>) | null;
  loading: boolean;
  setUser: (user: (FirebaseUser & Partial<User>) | null) => void;
  setLoading: (loading: boolean) => void;
  updateUserConfig: (config: LoadFormConfig) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  updateUserConfig: (config) => set((state) => ({
    user: state.user ? { ...state.user, loadFormConfig: config } : null
  }))
}));