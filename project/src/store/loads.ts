import { create } from 'zustand';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
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

export const useLoadsStore = create<LoadsState>((set, get) => ({
  loads: [],
  loading: false,
  error: null,
  fetchLoads: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      console.log('LoadsStore - Fetching loads for userId:', userId);
      const q = query(
        collection(db, 'loads'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      console.log('LoadsStore - Firestore response:', snapshot.docs.length, 'documents');
      let loads = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as Load));
      
      // Sort in memory if index is not available
      loads = loads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('LoadsStore - Processed loads:', loads);
      set({ loads, loading: false });
    } catch (error) {
      console.error('LoadsStore - Error fetching loads:', error);
      console.error('LoadsStore - Error fetching loads:', error);
      // Handle missing index error specifically
      if (error.code === 'failed-precondition') {
        set({ 
          error: 'Database index is being created. Please try again in a few minutes.',
          loading: false 
        });
      } else {
        set({ error: 'Failed to fetch loads', loading: false });
      }
    }
  },
  addLoad: async (loadData) => {
    try {
      const docRef = await addDoc(collection(db, 'loads'), {
        ...loadData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const newLoad = { id: docRef.id, ...loadData } as Load;
      set(state => ({ loads: [newLoad, ...state.loads] }));
    } catch (error) {
      set({ error: 'Failed to add load' });
    }
  },
  updateLoad: async (id, data) => {
    try {
      await updateDoc(doc(db, 'loads', id), {
        ...data,
        updatedAt: new Date(),
      });
      set(state => ({
        loads: state.loads.map(load =>
          load.id === id ? { ...load, ...data, updatedAt: new Date() } : load
        ),
      }));
    } catch (error) {
      set({ error: 'Failed to update load' });
    }
  },
  deleteLoad: async (id) => {
    try {
      await deleteDoc(doc(db, 'loads', id));
      set(state => ({
        loads: state.loads.filter(load => load.id !== id),
      }));
    } catch (error) {
      set({ error: 'Failed to delete load' });
    }
  },
}));