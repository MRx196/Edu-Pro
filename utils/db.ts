
import { AppState } from '../types';
import { supabase, isSupabaseEnabled } from './supabaseClient';

const DB_NAME = 'NakomkopeSaaSDB';
const STORE_NAME = 'global_data';
const DB_VERSION = 2;


// --- IndexedDB (local) fallback ---
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

// --- Save state (either Supabase or IndexedDB) ---
export const saveToDB = async (state: AppState): Promise<void> => {
  if (isSupabaseEnabled()) {
    // Ensure you have created a table `app_state` in Supabase with columns:
    // id (text, primary key), state (jsonb), updated_at (timestamp)
    const { error } = await supabase
      .from('app_state')
      .upsert({ id: 'app_state', state, updated_at: new Date() });
    if (error) throw error;
    return;
  }

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
  if (isSupabaseEnabled()) {
    const { data, error } = await supabase
      .from('app_state')
      .select('state')
      .eq('id', 'app_state')
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    // `data.state` contains the JSON stored in the row
    return data.state as AppState | null;
  }

  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get('app_state');
    request.onsuccess = (event: any) => resolve(event.target.result || null);
    request.onerror = (event: any) => reject(event.target.error);
  });
};

// Export DB (backup) as JSON string
export const exportDatabase = async (): Promise<string> => {
  const state = await loadFromDB();
  return JSON.stringify(state);
};

// Import DB from JSON string (restore)
export const importDatabase = async (json: string): Promise<void> => {
  const state = JSON.parse(json);
  if (!state) return;

  if (isSupabaseEnabled()) {
    const { error } = await supabase
      .from('app_state')
      .upsert({ id: 'app_state', state, updated_at: new Date() });
    if (error) throw error;
    return;
  }

  await saveToDB(state);
};

// --- Realtime subscription (Supabase) ---
export const subscribeToAppState = (onChange: (state: AppState | null) => void) => {
  if (!isSupabaseEnabled()) {
    console.warn('subscribeToAppState called but Supabase is disabled.');
    return () => {};
  }

  // Subscribe to changes on the app_state row
  // supabase-js v2: use channels
  const channel = supabase.channel('public:app_state');

  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'app_state', filter: "id=eq.app_state" }, (payload: any) => {
    try {
      // payload.record or payload.new may contain the row depending on event
      const record = payload.new || payload.record || payload;
      if (record && record.state) {
        onChange(record.state as AppState);
      } else {
        // fallback: re-load from DB
        loadFromDB().then(s => onChange(s)).catch(err => console.error('Failed to reload state after realtime event', err));
      }
    } catch (err) {
      console.error('Error handling realtime payload', err, payload);
    }
  });

  channel.subscribe();

  return () => {
    try {
      channel.unsubscribe();
    } catch (e) {
      // supabase client may also support removeChannel
      try { supabase.removeChannel(channel); } catch (er) {}
    }
  };
};
