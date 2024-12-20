import { create } from 'zustand';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Load } from '../types';
import { cleanFirestoreData } from '../utils/firestore';

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
      
      loads = loads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('LoadsStore - Processed loads:', loads);
      set({ loads, loading: false });
    } catch (error: any) {
      console.error('LoadsStore - Error fetching loads:', error);
      set({ 
        error: `Failed to fetch loads: ${error.message}`,
        loading: false 
      });
    }
  },
  addLoad: async (loadData) => {
    try {
      console.log('LoadsStore - Adding load:', loadData);
      if (!loadData.userId) {
        throw new Error('userId is required');
      }

      // Clean the data before sending to Firestore
      const cleanedData = cleanFirestoreData({
        ...loadData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const docRef = await addDoc(collection(db, 'loads'), cleanedData);
      
      const newLoad = { 
        id: docRef.id, 
        ...loadData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Load;
      
      console.log('LoadsStore - Successfully added load:', newLoad);
      set(state => ({ loads: [newLoad, ...state.loads] }));
    } catch (error: any) {
      console.error('LoadsStore - Error adding load:', error);
      set({ error: `Failed to add load: ${error.message}` });
      throw error;
    }
  },
  updateLoad: async (id, data) => {
    try {
      // Clean the data before sending to Firestore
      const cleanedData = cleanFirestoreData({
        ...data,
        updatedAt: new Date(),
      });

      await updateDoc(doc(db, 'loads', id), cleanedData);
      set(state => ({
        loads: state.loads.map(load =>
          load.id === id ? { ...load, ...data, updatedAt: new Date() } : load
        ),
      }));
    } catch (error: any) {
      console.error('LoadsStore - Error updating load:', error);
      set({ error: `Failed to update load: ${error.message}` });
      throw error;
    }
  },
  deleteLoad: async (id) => {
    try {
      await deleteDoc(doc(db, 'loads', id));
      set(state => ({
        loads: state.loads.filter(load => load.id !== id),
      }));
    } catch (error: any) {
      console.error('LoadsStore - Error deleting load:', error);
      set({ error: `Failed to delete load: ${error.message}` });
      throw error;
    }
  },
}));