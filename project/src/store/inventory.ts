import { create } from 'zustand';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ammunition, Bullet, Powder, Primer, Brass, InventoryType } from '../types/inventory';

type InventoryItem = Ammunition | Bullet | Powder | Primer | Brass;

interface InventoryState {
  ammunition: Ammunition[];
  bullets: Bullet[];
  powder: Powder[];
  primers: Primer[];
  brass: Brass[];
  loading: boolean;
  error: string | null;
  fetchInventory: (userId: string, type: InventoryType) => Promise<void>;
  addItem: (type: InventoryType, item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (type: InventoryType, id: string, data: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (type: InventoryType, id: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  ammunition: [],
  bullets: [],
  powder: [],
  primers: [],
  brass: [],
  loading: false,
  error: null,

  fetchInventory: async (userId: string, type: InventoryType) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, type),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));

      set(state => ({ 
        [type]: items,
        loading: false 
      }));
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      set({ error: `Failed to fetch ${type}`, loading: false });
    }
  },

  addItem: async (type: InventoryType, itemData) => {
    try {
      const docRef = await addDoc(collection(db, type), {
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const newItem = {
        id: docRef.id,
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      set(state => ({
        [type]: [newItem, ...state[type]]
      }));
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
      set({ error: `Failed to add ${type}` });
    }
  },

  updateItem: async (type: InventoryType, id: string, data) => {
    try {
      await updateDoc(doc(db, type, id), {
        ...data,
        updatedAt: new Date()
      });

      set(state => ({
        [type]: state[type].map(item =>
          item.id === id ? { ...item, ...data, updatedAt: new Date() } : item
        )
      }));
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      set({ error: `Failed to update ${type}` });
    }
  },

  deleteItem: async (type: InventoryType, id: string) => {
    try {
      await deleteDoc(doc(db, type, id));
      set(state => ({
        [type]: state[type].filter(item => item.id !== id)
      }));
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      set({ error: `Failed to delete ${type}` });
    }
  }
}));