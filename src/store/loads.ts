import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Load } from '../types';

interface LoadsState {
  loads: Load[];
  loading: boolean;
  error: string | null;
  fetchLoads: (userId: string) => Promise<void>;
  addLoad: (load: Omit<Load, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLoad: (id: string, data: Partial<Load>) => Promise<void>;
  deleteLoad: (id: string) => Promise<void>;
}

export const useLoadsStore = create<LoadsState>((set) => ({
  loads: [],
  loading: false,
  error: null,

  fetchLoads: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const loads = data.map(load => ({
        id: load.id,
        userId: load.user_id,
        cartridge: load.cartridge,
        bullet: {
          brand: load.bullet_brand,
          weight: load.bullet_weight,
          weightRaw: load.bullet_weight_raw || String(load.bullet_weight)
        },
        powder: {
          brand: load.powder_brand,
          weight: load.powder_weight,
          weightRaw: load.powder_weight_raw || String(load.powder_weight)
        },
        primer: load.primer,
        brass: {
          brand: load.brass_brand,
          length: load.brass_length,
          lengthRaw: load.brass_length_raw || String(load.brass_length)
        },
        cartridgeOverallLength: load.cartridge_overall_length,
        cartridgeOverallLengthRaw: load.cartridge_overall_length_raw || String(load.cartridge_overall_length),
        cartridgeBaseToOgive: load.cartridge_base_to_ogive,
        cartridgeBaseToOgiveRaw: load.cartridge_base_to_ogive_raw || (load.cartridge_base_to_ogive ? String(load.cartridge_base_to_ogive) : undefined),
        notes: load.notes,
        favorite: load.favorite,
        displayConfig: load.display_config,
        costPerRound: load.cost_per_round,
        costBreakdown: load.cost_breakdown,
        createdAt: new Date(load.created_at),
        updatedAt: new Date(load.updated_at)
      }));

      set({ loads, loading: false });
    } catch (error: any) {
      console.error('Error fetching loads:', error);
      set({ error: error.message, loading: false });
    }
  },

  addLoad: async (loadData) => {
    try {
      const { data, error } = await supabase
        .from('loads')
        .insert({
          user_id: loadData.userId,
          cartridge: loadData.cartridge,
          bullet_brand: loadData.bullet.brand,
          bullet_weight: loadData.bullet.weight,
          bullet_weight_raw: loadData.bullet.weightRaw || String(loadData.bullet.weight),
          powder_brand: loadData.powder.brand,
          powder_weight: loadData.powder.weight,
          powder_weight_raw: loadData.powder.weightRaw || String(loadData.powder.weight),
          primer: loadData.primer,
          brass_brand: loadData.brass.brand,
          brass_length: loadData.brass.length,
          brass_length_raw: loadData.brass.lengthRaw || String(loadData.brass.length),
          cartridge_overall_length: loadData.cartridgeOverallLength,
          cartridge_overall_length_raw: loadData.cartridgeOverallLengthRaw || String(loadData.cartridgeOverallLength),
          cartridge_base_to_ogive: loadData.cartridgeBaseToOgive,
          cartridge_base_to_ogive_raw: loadData.cartridgeBaseToOgive ? (loadData.cartridgeBaseToOgiveRaw || String(loadData.cartridgeBaseToOgive)) : null,
          notes: loadData.notes,
          favorite: loadData.favorite,
          display_config: loadData.displayConfig,
          cost_per_round: loadData.costPerRound,
          cost_breakdown: loadData.costBreakdown
        })
        .select()
        .single();

      if (error) throw error;

      const newLoad = {
        id: data.id,
        userId: data.user_id,
        cartridge: data.cartridge,
        bullet: {
          brand: data.bullet_brand,
          weight: data.bullet_weight,
          weightRaw: data.bullet_weight_raw || String(data.bullet_weight)
        },
        powder: {
          brand: data.powder_brand,
          weight: data.powder_weight,
          weightRaw: data.powder_weight_raw || String(data.powder_weight)
        },
        primer: data.primer,
        brass: {
          brand: data.brass_brand,
          length: data.brass_length,
          lengthRaw: data.brass_length_raw || String(data.brass_length)
        },
        cartridgeOverallLength: data.cartridge_overall_length,
        cartridgeOverallLengthRaw: data.cartridge_overall_length_raw || String(data.cartridge_overall_length),
        cartridgeBaseToOgive: data.cartridge_base_to_ogive,
        cartridgeBaseToOgiveRaw: data.cartridge_base_to_ogive_raw || (data.cartridge_base_to_ogive ? String(data.cartridge_base_to_ogive) : undefined),
        notes: data.notes,
        favorite: data.favorite,
        displayConfig: data.display_config,
        costPerRound: data.cost_per_round,
        costBreakdown: data.cost_breakdown,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } as Load;

      set(state => ({ loads: [newLoad, ...state.loads] }));
    } catch (error: any) {
      console.error('Error adding load:', error);
      set({ error: error.message });
      throw error;
    }
  },

  updateLoad: async (id, data) => {
    try {
      const updateData: any = {};

      // Add fields to update, including raw string values
      if (data.cartridge) updateData.cartridge = data.cartridge;
      if (data.bullet?.brand) updateData.bullet_brand = data.bullet.brand;
      if (data.bullet?.weight !== undefined) {
        updateData.bullet_weight = data.bullet.weight;
        updateData.bullet_weight_raw = data.bullet.weightRaw || String(data.bullet.weight);
      }
      if (data.powder?.brand) updateData.powder_brand = data.powder.brand;
      if (data.powder?.weight !== undefined) {
        updateData.powder_weight = data.powder.weight;
        updateData.powder_weight_raw = data.powder.weightRaw || String(data.powder.weight);
      }
      if (data.primer) updateData.primer = data.primer;
      if (data.brass?.brand) updateData.brass_brand = data.brass.brand;
      if (data.brass?.length !== undefined) {
        updateData.brass_length = data.brass.length;
        updateData.brass_length_raw = data.brass.lengthRaw || String(data.brass.length);
      }
      if (data.cartridgeOverallLength !== undefined) {
        updateData.cartridge_overall_length = data.cartridgeOverallLength;
        updateData.cartridge_overall_length_raw = data.cartridgeOverallLengthRaw || String(data.cartridgeOverallLength);
      }
      if (data.cartridgeBaseToOgive !== undefined) {
        updateData.cartridge_base_to_ogive = data.cartridgeBaseToOgive;
        updateData.cartridge_base_to_ogive_raw = data.cartridgeBaseToOgive ? (data.cartridgeBaseToOgiveRaw || String(data.cartridgeBaseToOgive)) : null;
      }
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.favorite !== undefined) updateData.favorite = data.favorite;
      if (data.displayConfig) updateData.display_config = data.displayConfig;
      if (data.costPerRound !== undefined) updateData.cost_per_round = data.costPerRound;
      if (data.costBreakdown) updateData.cost_breakdown = data.costBreakdown;

      const { error } = await supabase
        .from('loads')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        loads: state.loads.map(load =>
          load.id === id ? { ...load, ...data, updatedAt: new Date() } : load
        ),
      }));
    } catch (error: any) {
      console.error('Error updating load:', error);
      set({ error: error.message });
      throw error;
    }
  },

  deleteLoad: async (id) => {
    try {
      const { error } = await supabase
        .from('loads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        loads: state.loads.filter(load => load.id !== id),
      }));
    } catch (error: any) {
      console.error('Error deleting load:', error);
      set({ error: error.message });
      throw error;
    }
  },
}));