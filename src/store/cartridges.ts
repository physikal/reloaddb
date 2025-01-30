import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Cartridge {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
}

interface CartridgesState {
  cartridges: Cartridge[];
  loading: boolean;
  error: string | null;
  fetchCartridges: (userId: string) => Promise<void>;
  addCartridge: (name: string, userId: string) => Promise<void>;
  deleteCartridge: (id: string) => Promise<void>;
}

export const useCartridgesStore = create<CartridgesState>((set) => ({
  cartridges: [],
  loading: false,
  error: null,

  fetchCartridges: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('cartridges')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;

      const cartridges = data.map(cartridge => ({
        id: cartridge.id,
        name: cartridge.name,
        userId: cartridge.user_id,
        createdAt: new Date(cartridge.created_at)
      }));

      set({ cartridges, loading: false });
    } catch (error: any) {
      console.error('Error fetching cartridges:', error);
      set({ error: error.message, loading: false });
    }
  },

  addCartridge: async (name: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cartridges')
        .insert({
          name,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;

      const newCartridge = {
        id: data.id,
        name: data.name,
        userId: data.user_id,
        createdAt: new Date(data.created_at)
      };

      set(state => ({
        cartridges: [...state.cartridges, newCartridge].sort((a, b) => a.name.localeCompare(b.name))
      }));
    } catch (error: any) {
      console.error('Error adding cartridge:', error);
      set({ error: error.message });
      throw error;
    }
  },

  deleteCartridge: async (id: string) => {
    try {
      const { error } = await supabase
        .from('cartridges')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        cartridges: state.cartridges.filter(cartridge => cartridge.id !== id)
      }));
    } catch (error: any) {
      console.error('Error deleting cartridge:', error);
      set({ error: error.message });
      throw error;
    }
  }
}));