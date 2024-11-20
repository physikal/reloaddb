import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function setUserAsAdmin(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Query for the user document with the given email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: 'User not found' };
    }

    const userDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, 'users', userDoc.id), {
      role: 'admin'
    });

    return { success: true, message: 'User successfully set as admin' };
  } catch (error) {
    console.error('Error setting admin:', error);
    return { success: false, message: 'Failed to set user as admin' };
  }
}</content></file>
<boltAction type="file" filePath="src/pages/AdminScript.tsx" contentType="content">import { setUserAsAdmin } from '../lib/admin';

export async function setInitialAdmin() {
  const result = await setUserAsAdmin('boody@physikal.com');
  console.log(result.message);
}</content></file>
<boltAction type="file" filePath="src/main.tsx" contentType="diff">@@ .. @@
 import { BrowserRouter } from 'react-router-dom';
 import App from './App';
 import './index.css';
+import { setInitialAdmin } from './pages/AdminScript';
 
+// Set initial admin
+setInitialAdmin();
+
 createRoot(document.getElementById('root')!).render(
   <StrictMode>
     <BrowserRouter>
       <App />
     </BrowserRouter>
   </StrictMode>
-);
\ No newline at end of file
);