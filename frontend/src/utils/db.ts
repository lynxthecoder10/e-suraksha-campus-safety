const DB_NAME = 'e-suraksha-db';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';

let dbPromise: Promise<IDBDatabase> | null = null;

export const dbAPI = {
  // 1. OPEN DATABASE
  open(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // Define Schema: Using out-of-line keys for flexibility
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
      request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
    });

    return dbPromise;
  },

  // 2. GENERIC HELPER (Reduces code repetition)
  async _tx<T>(storeName: string, mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);

      // Execute the request
      const request = callback(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // 3. PUBLIC API METHODS
  async add(key: IDBValidKey, item: any): Promise<IDBValidKey> {
    return this._tx(STORE_NAME, 'readwrite', (store) => store.add(item, key));
  },

  async get(key: IDBValidKey): Promise<any> {
    return this._tx(STORE_NAME, 'readonly', (store) => store.get(key));
  },

  async getAll(): Promise<any[]> {
    return this._tx(STORE_NAME, 'readonly', (store) => store.getAll());
  },

  async put(key: IDBValidKey, item: any): Promise<IDBValidKey> {
    return this._tx(STORE_NAME, 'readwrite', (store) => store.put(item, key));
  },

  async delete(key: IDBValidKey): Promise<undefined> {
    return this._tx(STORE_NAME, 'readwrite', (store) => store.delete(key));
  }
};
