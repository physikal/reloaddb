import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { User, LoadFormConfig, LoadCardConfig } from '../types';

interface AuthState {
  user: (FirebaseUser & Partial<User>) | null;
  loading: boolean;
  setUser: (user: (FirebaseUser & Partial<User>) | null) => void;
  setLoading: (loading: boolean) => void;
  updateUserConfig: (config: LoadFormConfig | LoadCardConfig) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  updateUserConfig: (config) => set((state) => {
    if (!state.user) return { user: null };
    
    // Determine which config to update based on the presence of fields
    const isCardConfig = 'cartridgeBaseToOgive' in config;
    
    return {
      user: {
        ...state.user,
        [isCardConfig ? 'loadCardConfig' : 'loadFormConfig']: config
      }
    };
  })
}));