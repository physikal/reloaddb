import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useAuthStore } from '../store/auth';

export function useAuthInit() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        let userData = userDoc.data();
        
        if (!userData) {
          // Create new user document if it doesn't exist
          userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'user',
            createdAt: new Date()
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        }
        
        setUser({ ...firebaseUser, ...userData });
      } else {
        setUser(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setLoading(false);
      setUser(null);
    });
    
    return () => unsubscribe();
  }, [setUser, setLoading]);
}