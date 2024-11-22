import { create } from 'zustand';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
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

// Helper function to convert Firestore timestamp to Date
function convertTimestamps(data: any) {
  const converted = { ...data };
  
  if (converted.createdAt instanceof Timestamp) {
    converted.createdAt = converted.createdAt.toDate();
  }
  if (converted.updatedAt instanceof Timestamp) {
    converted.updatedAt = converted.updatedAt.toDate();
  }
  if (converted.purchaseDate instanceof Timestamp) {
    converted.purchaseDate = converted.purchaseDate.toDate();
  }
  
  return converted;
}

// Helper function to prepare data for Firestore
function prepareDataForFirestore(data: any) {
  const prepared = { ...data };
  
  // Convert Date objects to Firestore timestamps
  if (prepared.purchaseDate instanceof Date) {
    prepared.purchaseDate = Timestamp.fromDate(prepared.purchaseDate);
  }
  if (prepared.createdAt instanceof Date) {
    prepared.createdAt = Timestamp.fromDate(prepared.createdAt);
  }
  if (prepared.updatedAt instanceof Date) {
    prepared.updatedAt = Timestamp.fromDate(prepared.updatedAt);
  }

  // Remove undefined values
  Object.keys(prepared).forEach(key => {
    if (prepared[key] === undefined) {
      delete prepared[key];
    }
  });

  return prepared;
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
      console.log(`[DEBUG] Fetching ${type} for user:`, userId);
      const q = query(
        collection(db, type),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      console.log(`[DEBUG] Found ${snapshot.docs.length} ${type} documents`);
      
      const items = snapshot.docs.map(doc => {
        const data = convertTimestamps(doc.data());
        return {
          id: doc.id,
          ...data
        };
      });

      set(state => ({
        ...state,
        [type]: items,
        loading: false
      }));
    } catch (error) {
      console.error(`[DEBUG] Error fetching ${type}:`, error);
      set({ error: `Failed to fetch ${type}`, loading: false });
    }
  },

  addItem: async (type: InventoryType, itemData) => {
    try {
      const preparedData = prepareDataForFirestore({
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const docRef = await addDoc(collection(db, type), preparedData);

      const newItem = {
        id: docRef.id,
        ...itemData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      set(state => ({
        ...state,
        [type]: [newItem, ...state[type]]
      }));
    } catch (error) {
      console.error(`[DEBUG] Error adding ${type}:`, error);
      set({ error: `Failed to add ${type}` });
      throw error;
    }
  },

  updateItem: async (type: InventoryType, id: string, data) => {
    try {
      const preparedData = prepareDataForFirestore({
        ...data,
        updatedAt: new Date()
      });

      await updateDoc(doc(db, type, id), preparedData);

      set(state => ({
        ...state,
        [type]: state[type].map(item =>
          item.id === id ? { ...item, ...data, updatedAt: new Date() } : item
        )
      }));
    } catch (error) {
      console.error(`[DEBUG] Error updating ${type}:`, error);
      set({ error: `Failed to update ${type}` });
      throw error;
    }
  },

  deleteItem: async (type: InventoryType, id: string) => {
    try {
      await deleteDoc(doc(db, type, id));
      
      set(state => ({
        ...state,
        [type]: state[type].filter(item => item.id !== id)
      }));
    } catch (error) {
      console.error(`[DEBUG] Error deleting ${type}:`, error);
      set({ error: `Failed to delete ${type}` });
      throw error;
    }
  }
}));