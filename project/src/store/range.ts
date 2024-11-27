import { create } from 'zustand';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { RangeDay } from '../types/range';

interface RangeState {
  rangeDays: RangeDay[];
  loading: boolean;
  error: string | null;
  fetchRangeDays: (userId: string) => Promise<void>;
  addRangeDay: (rangeDay: Omit<RangeDay, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRangeDay: (id: string, data: Partial<RangeDay>) => Promise<void>;
  deleteRangeDay: (id: string) => Promise<void>;
}

// Helper function to prepare data for Firestore
function prepareDataForFirestore(data: any) {
  const prepared = { ...data };
  
  // Convert Date objects to Firestore timestamps
  if (prepared.date instanceof Date) {
    prepared.date = Timestamp.fromDate(prepared.date);
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

  // Clean up firearms array
  if (prepared.firearms) {
    prepared.firearms = prepared.firearms.map((f: any) => ({
      firearmId: f.firearmId,
      notes: f.notes || '',
      firearm: {
        id: f.firearm.id,
        manufacturer: f.firearm.manufacturer,
        model: f.firearm.model,
        caliber: f.firearm.caliber || null,
        type: f.firearm.type || null
      }
    }));
  }

  return prepared;
}

export const useRangeStore = create<RangeState>((set) => ({
  rangeDays: [],
  loading: false,
  error: null,

  fetchRangeDays: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'rangeDays'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const rangeDays = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as RangeDay[];

      set({ 
        rangeDays: rangeDays.sort((a, b) => b.date.getTime() - a.date.getTime()),
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching range days:', error);
      set({ error: 'Failed to fetch range days', loading: false });
    }
  },

  addRangeDay: async (rangeDayData) => {
    try {
      const preparedData = prepareDataForFirestore({
        ...rangeDayData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const docRef = await addDoc(collection(db, 'rangeDays'), preparedData);

      const newRangeDay = {
        id: docRef.id,
        ...rangeDayData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as RangeDay;

      set(state => ({
        rangeDays: [newRangeDay, ...state.rangeDays]
      }));
    } catch (error) {
      console.error('Error adding range day:', error);
      set({ error: 'Failed to add range day' });
      throw error;
    }
  },

  updateRangeDay: async (id, data) => {
    try {
      const preparedData = prepareDataForFirestore({
        ...data,
        updatedAt: new Date()
      });

      await updateDoc(doc(db, 'rangeDays', id), preparedData);

      set(state => ({
        rangeDays: state.rangeDays.map(day =>
          day.id === id ? { ...day, ...data, updatedAt: new Date() } : day
        )
      }));
    } catch (error) {
      console.error('Error updating range day:', error);
      set({ error: 'Failed to update range day' });
      throw error;
    }
  },

  deleteRangeDay: async (id) => {
    try {
      await deleteDoc(doc(db, 'rangeDays', id));
      set(state => ({
        rangeDays: state.rangeDays.filter(day => day.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting range day:', error);
      set({ error: 'Failed to delete range day' });
      throw error;
    }
  }
}));