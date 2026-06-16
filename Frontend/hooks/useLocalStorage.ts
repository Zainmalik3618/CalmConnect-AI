
import { useState, useEffect, useCallback } from 'react';

// FIX: Implemented the useLocalStorage hook as it was intentionally left blank, causing import errors.
// This is used for persisting UI state like themes, which is a valid client-side concern.
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [isLoading, setIsLoading] = useState(true);
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    // Prevent build errors and issues with server-side rendering
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      setStoredValue(item ? JSON.parse(item) : initialValue);
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      setStoredValue(initialValue);
    } finally {
      setIsLoading(false);
    }
  }, [key, initialValue]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') {
        console.warn(
            `Tried setting localStorage key “${key}” even though environment is not a client`,
        );
    }
    
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue, isLoading];
}

export default useLocalStorage;