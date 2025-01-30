import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { ChangelogEntry } from '../types';

interface ChangelogState {
  entries: ChangelogEntry[];
  loading: boolean;
  error: string | null;
  fetchEntries: () => Promise<void>;
  addEntry: (entry: Omit<ChangelogEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEntry: (id: string, data: Partial<ChangelogEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useChangelogStore = create<ChangelogState>((set) => ({
  entries: [],
  loading: false,
  error: null,

  fetchEntries: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('changelog')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const entries = data.map(entry => ({
        id: entry.id,
        title: entry.title,
        content: entry.content,
        version: entry.version,
        createdAt: new Date(entry.created_at),
        updatedAt: new Date(entry.updated_at)
      })) as ChangelogEntry[];

      set({ entries, loading: false });
    } catch (error: any) {
      console.error('Error fetching changelog entries:', error);
      set({ error: error.message, loading: false });
    }
  },

  addEntry: async (entryData) => {
    try {
      const { data, error } = await supabase
        .from('changelog')
        .insert({
          title: entryData.title,
          content: entryData.content,
          version: entryData.version
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry = {
        id: data.id,
        title: data.title,
        content: data.content,
        version: data.version,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } as ChangelogEntry;

      set(state => ({
        entries: [newEntry, ...state.entries]
      }));
    } catch (error: any) {
      console.error('Error adding changelog entry:', error);
      set({ error: error.message });
      throw error;
    }
  },

  updateEntry: async (id, data) => {
    try {
      const { error } = await supabase
        .from('changelog')
        .update({
          title: data.title,
          content: data.content,
          version: data.version
        })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        entries: state.entries.map(entry =>
          entry.id === id ? { ...entry, ...data, updatedAt: new Date() } : entry
        )
      }));
    } catch (error: any) {
      console.error('Error updating changelog entry:', error);
      set({ error: error.message });
      throw error;
    }
  },

  deleteEntry: async (id) => {
    try {
      const { error } = await supabase
        .from('changelog')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        entries: state.entries.filter(entry => entry.id !== id)
      }));
    } catch (error: any) {
      console.error('Error deleting changelog entry:', error);
      set({ error: error.message });
      throw error;
    }
  }
}));