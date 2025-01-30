import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Ammunition, Bullet, Powder, Primer, Brass, Firearm, InventoryType } from '../types/inventory';

type InventoryItem = Ammunition | Bullet | Powder | Primer | Brass | Firearm;

interface InventoryState {
  ammunition: Ammunition[];
  bullets: Bullet[];
  powder: Powder[];
  primers: Primer[];
  brass: Brass[];
  firearms: Firearm[];
  loading: boolean;
  error: string | null;
  fetchInventory: (userId: string, type: InventoryType) => Promise<void>;
  addItem: (type: InventoryType, item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (type: InventoryType, id: string, data: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (type: InventoryType, id: string) => Promise<void>;
}

// Helper function to convert snake_case to camelCase
function snakeToCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {} as any);
}

// Helper function to convert camelCase to snake_case
function camelToSnake(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {} as any);
}

// Helper function to prepare data for Supabase
function prepareDataForUpdate(data: any): any {
  // Convert the data to snake_case first
  const snakeData = camelToSnake(data);

  // Remove any empty objects or undefined values
  const cleanData = Object.entries(snakeData).reduce((acc, [key, value]) => {
    // Skip empty objects and undefined values
    if (value === undefined || (typeof value === 'object' && value !== null && Object.keys(value).length === 0)) {
      return acc;
    }
    
    // Handle Date objects
    if (value instanceof Date) {
      acc[key] = value.toISOString();
    } else {
      acc[key] = value;
    }
    
    return acc;
  }, {} as any);

  return cleanData;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  ammunition: [],
  bullets: [],
  powder: [],
  primers: [],
  brass: [],
  firearms: [],
  loading: false,
  error: null,

  fetchInventory: async (userId: string, type: InventoryType) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from(type)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items = data.map(item => ({
        ...snakeToCamel(item),
        id: item.id,
        userId: item.user_id,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        ...(item.purchase_date && { purchaseDate: new Date(item.purchase_date) })
      }));

      set(state => ({
        ...state,
        [type]: items,
        loading: false
      }));
    } catch (error: any) {
      console.error(`Error fetching ${type}:`, error);
      set({ error: error.message, loading: false });
    }
  },

  addItem: async (type: InventoryType, itemData) => {
    try {
      const data = {
        user_id: itemData.userId,
        ...prepareDataForUpdate(itemData)
      };

      const { data: newItem, error } = await supabase
        .from(type)
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      const processedItem = {
        ...snakeToCamel(newItem),
        id: newItem.id,
        userId: newItem.user_id,
        createdAt: new Date(newItem.created_at),
        updatedAt: new Date(newItem.updated_at),
        ...(newItem.purchase_date && { purchaseDate: new Date(newItem.purchase_date) })
      };

      set(state => ({
        ...state,
        [type]: [processedItem, ...state[type]]
      }));
    } catch (error: any) {
      console.error(`Error adding ${type}:`, error);
      set({ error: error.message });
      throw error;
    }
  },

  updateItem: async (type: InventoryType, id: string, data) => {
    try {
      const updateData = prepareDataForUpdate(data);

      const { error } = await supabase
        .from(type)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        ...state,
        [type]: state[type].map(item =>
          item.id === id ? { ...item, ...data, updatedAt: new Date() } : item
        )
      }));
    } catch (error: any) {
      console.error(`Error updating ${type}:`, error);
      set({ error: error.message });
      throw error;
    }
  },

  deleteItem: async (type: InventoryType, id: string) => {
    try {
      const { error } = await supabase
        .from(type)
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        ...state,
        [type]: state[type].filter(item => item.id !== id)
      }));
    } catch (error: any) {
      console.error(`Error deleting ${type}:`, error);
      set({ error: error.message });
      throw error;
    }
  }
}));