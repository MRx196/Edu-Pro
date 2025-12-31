
import { AppState } from '../types';

const DB_NAME = 'NakomkopeSaaSDB';
const STORE_NAME = 'global_data';
const DB_VERSION = 2;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
};

export const saveToDB = async (state: AppState): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    // Persist everything
    const request = store.put(state, 'app_state');
    request.onsuccess = () => resolve();
    request.onerror = (event: any) => reject(event.target.error);
  });
};

export const loadFromDB = async (): Promise<AppState | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('app_state');
    request.onsuccess = (event: any) => resolve(event.target.result || null);
    request.onerror = (event: any) => reject(event.target.error);
  });
};

// Fix: Implement exportDatabase to handle JSON data export for backups
export const exportDatabase = async (): Promise<string> => {
  const state = await loadFromDB();
  return JSON.stringify(state);
};

// Fix: Implement importDatabase to restore the global app state from a backup file
export const importDatabase = async (json: string): Promise<void> => {
  const state = JSON.parse(json);
  if (state) {
    await saveToDB(state);
  }
};
