import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { LoadFormConfig, LoadCardConfig } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updateUserConfig: (config: LoadFormConfig | LoadCardConfig) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  updateUserConfig: async (config) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');
      
      // Get current metadata
      const currentMetadata = user.user_metadata || {};
      
      // Determine which config to update based on the presence of fields
      const isCardConfig = 'cartridgeBaseToOgive' in config;
      const configKey = isCardConfig ? 'load_card_config' : 'load_form_config';
      
      // Update user metadata
      const { data, error } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          [configKey]: config
        }
      });

      if (error) throw error;

      // Update local state with the new user data
      set({ user: data.user });
    } catch (error: any) {
      console.error('Failed to update user config:', error);
      throw new Error(error.message || 'Failed to update configuration');
    }
  }
}));