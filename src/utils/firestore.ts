/**
 * Removes undefined values from an object recursively
 * Firestore doesn't accept undefined values
 */
export function cleanFirestoreData<T extends object>(data: T): Partial<T> {
  const cleaned: Partial<T> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    // Skip undefined values
    if (value === undefined) {
      return;
    }
    
    // Recursively clean objects
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      cleaned[key as keyof T] = cleanFirestoreData(value) as T[keyof T];
    } else {
      cleaned[key as keyof T] = value as T[keyof T];
    }
  });
  
  return cleaned;
}