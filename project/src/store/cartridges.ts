import { create } from 'zustand';
import { collection, query, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  addCartridge: (name: string) => Promise<void>;
  deleteCartridge: (id: string) => Promise<void>;
}

export const useCartridgesStore = create<CartridgesState>((set, get) => ({
  cartridges: [],
  loading: false,
  error: null,
  fetchCartridges: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      if (!userId) throw new Error('User ID is required');
      const q = query(collection(db, 'cartridges'));
      const snapshot = await getDocs(q);
      const cartridges = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      } as Cartridge));
      set({ cartridges: cartridges.sort((a, b) => a.name.localeCompare(b.name)), loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch cartridges', loading: false });
    }
  },
  addCartridge: async (name: string, userId: string) => {
    try {
      if (!userId) throw new Error('User ID is required');
      
      const docRef = await addDoc(collection(db, 'cartridges'), {
        name,
        createdAt: new Date(),
        userId
      });
      const newCartridge = { id: docRef.id, name, userId, createdAt: new Date() };
      set(state => ({ 
        cartridges: [...state.cartridges, newCartridge].sort((a, b) => a.name.localeCompare(b.name))
      }));
    } catch (error) {
      set({ error: 'Failed to add cartridge' });
    }
  },
  deleteCartridge: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'cartridges', id));
      set(state => ({
        cartridges: state.cartridges.filter(cartridge => cartridge.id !== id),
      }));
    } catch (error) {
      set({ error: 'Failed to delete cartridge' });
    }
  },
}));