import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { RangeDay } from '../types/range';

interface RangeState {
  rangeDays: RangeDay[];
  loading: boolean;
  error: string | null;
  fetchRangeDays: (userId: string) => Promise<RangeDay[]>;
  addRangeDay: (rangeDay: Omit<RangeDay, 'id' | 'createdAt' | 'updatedAt' | 'stats'>) => Promise<RangeDay>;
  updateRangeDay: (id: string, data: Partial<RangeDay>) => Promise<RangeDay>;
  deleteRangeDay: (id: string) => Promise<void>;
}

export const useRangeStore = create<RangeState>((set, get) => ({
  rangeDays: [],
  loading: false,
  error: null,

  fetchRangeDays: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data: rangeDays, error } = await supabase
        .from('range_days')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      const { data: stats, error: statsError } = await supabase
        .from('range_day_stats')
        .select('id, avg_muzzle_velocity, total_shots')
        .in('id', rangeDays.map(day => day.id));

      if (statsError) throw statsError;

      const processedRangeDays = rangeDays.map(day => {
        const dayStats = stats.find(s => s.id === day.id);
        return {
          id: day.id,
          userId: day.user_id,
          title: day.title,
          date: new Date(day.date),
          firearms: day.firearms || [],
          ammunition: day.ammunition || [],
          shots: day.shots || [],
          notes: day.notes,
          stats: dayStats ? {
            avgMuzzleVelocity: dayStats.avg_muzzle_velocity,
            totalShots: dayStats.total_shots
          } : {
            avgMuzzleVelocity: null,
            totalShots: 0
          },
          createdAt: new Date(day.created_at),
          updatedAt: new Date(day.updated_at)
        };
      }) as RangeDay[];

      set({ rangeDays: processedRangeDays, loading: false });
      return processedRangeDays;
    } catch (error: any) {
      console.error('Error fetching range days:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  addRangeDay: async (rangeDayData) => {
    try {
      const { data, error } = await supabase
        .from('range_days')
        .insert({
          user_id: rangeDayData.userId,
          title: rangeDayData.title,
          date: rangeDayData.date.toISOString(),
          firearms: rangeDayData.firearms,
          ammunition: rangeDayData.ammunition,
          shots: rangeDayData.shots || [],
          notes: rangeDayData.notes
        })
        .select('*')
        .single();

      if (error) throw error;

      const { data: stats, error: statsError } = await supabase
        .from('range_day_stats')
        .select('*')
        .eq('id', data.id)
        .single();

      if (statsError) throw statsError;

      const newRangeDay = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        date: new Date(data.date),
        firearms: data.firearms,
        ammunition: data.ammunition,
        shots: data.shots || [],
        notes: data.notes,
        stats: {
          avgMuzzleVelocity: stats.avg_muzzle_velocity,
          totalShots: stats.total_shots
        },
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } as RangeDay;

      set(state => ({
        rangeDays: [newRangeDay, ...state.rangeDays]
      }));

      return newRangeDay;
    } catch (error: any) {
      console.error('Error adding range day:', error);
      set({ error: error.message });
      throw error;
    }
  },

  updateRangeDay: async (id, data) => {
    try {
      const updateData = {
        ...(data.title && { title: data.title }),
        ...(data.date && { date: data.date.toISOString() }),
        ...(data.firearms && { firearms: data.firearms }),
        ...(data.ammunition && { ammunition: data.ammunition }),
        ...(data.shots !== undefined && { shots: data.shots }),
        ...(data.notes !== undefined && { notes: data.notes })
      };

      const { data: updatedData, error } = await supabase
        .from('range_days')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      const { data: stats, error: statsError } = await supabase
        .from('range_day_stats')
        .select('*')
        .eq('id', id)
        .single();

      if (statsError) throw statsError;

      const updatedRangeDay = {
        ...updatedData,
        id: updatedData.id,
        userId: updatedData.user_id,
        date: new Date(updatedData.date),
        stats: {
          avgMuzzleVelocity: stats.avg_muzzle_velocity,
          totalShots: stats.total_shots
        },
        createdAt: new Date(updatedData.created_at),
        updatedAt: new Date(updatedData.updated_at)
      } as RangeDay;

      set(state => ({
        rangeDays: state.rangeDays.map(day =>
          day.id === id ? updatedRangeDay : day
        )
      }));

      return updatedRangeDay;
    } catch (error: any) {
      console.error('Error updating range day:', error);
      set({ error: error.message });
      throw error;
    }
  },

  deleteRangeDay: async (id) => {
    try {
      const { error } = await supabase
        .from('range_days')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        rangeDays: state.rangeDays.filter(day => day.id !== id)
      }));
    } catch (error: any) {
      console.error('Error deleting range day:', error);
      set({ error: error.message });
      throw error;
    }
  }
}));