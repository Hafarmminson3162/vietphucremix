// Client & Server Unified Store for Costume Heritage Images, User Faces & AI History

const DB_NAME = 'VietPhucHeritageDB';
const STORE_NAME = 'costume_images';
const DB_VERSION = 1;

// In-memory cache for fast synchronous lookup
const inMemoryCache = new Map<string, string>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'fileName' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function normalizeFileName(name: string): string {
  if (!name) return '';
  return name.trim().toLowerCase().normalize('NFC');
}

export async function saveImageToStore(fileName: string, dataUrl: string): Promise<void> {
  const normKey = normalizeFileName(fileName);
  const rawKey = fileName.trim();
  inMemoryCache.set(normKey, dataUrl);
  inMemoryCache.set(rawKey, dataUrl);

  // 1. Save to IndexedDB
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ fileName: normKey, originalName: rawKey, dataUrl, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB write warning:', err);
  }

  // 2. Save manifest to localStorage for resilience
  try {
    const manifestStr = localStorage.getItem('vp_image_keys') || '[]';
    const keys = new Set<string>(JSON.parse(manifestStr));
    keys.add(rawKey);
    localStorage.setItem('vp_image_keys', JSON.stringify(Array.from(keys)));
  } catch {}
}

export async function getImageFromStore(fileName: string): Promise<string | null> {
  if (!fileName) return null;
  const normKey = normalizeFileName(fileName);
  const rawKey = fileName.trim();

  // 1. Check in-memory cache
  if (inMemoryCache.has(normKey)) return inMemoryCache.get(normKey)!;
  if (inMemoryCache.has(rawKey)) return inMemoryCache.get(rawKey)!;

  // 2. Check IndexedDB
  try {
    const db = await openDB();
    const dbVal = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(normKey);
      req.onsuccess = () => {
        resolve(req.result ? req.result.dataUrl : null);
      };
      req.onerror = () => reject(req.error);
    });

    if (dbVal) {
      inMemoryCache.set(normKey, dbVal);
      inMemoryCache.set(rawKey, dbVal);
      return dbVal;
    }
  } catch (err) {}

  return null;
}

export async function getAllImagesFromStore(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // Copy memory cache first
  inMemoryCache.forEach((v, k) => {
    result[k] = v;
  });

  // Merge with IndexedDB
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        if (req.result) {
          req.result.forEach((item: { fileName: string; dataUrl: string }) => {
            result[item.fileName] = item.dataUrl;
            inMemoryCache.set(item.fileName, item.dataUrl);
          });
        }
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {}

  return result;
}

// Sync images stored on the backend server into client store
export async function syncServerImagesToStore(): Promise<number> {
  try {
    const res = await fetch('/api/saved-images');
    if (!res.ok) return 0;
    const data = await res.json();
    if (!data.success || !data.images) return 0;

    let synced = 0;
    const keys = Object.keys(data.images);
    for (const key of keys) {
      const imgInfo = data.images[key];
      const norm = normalizeFileName(key);
      const url = imgInfo.url;
      // Register in memory and store
      inMemoryCache.set(norm, url);
      inMemoryCache.set(key, url);
      // Also register without file extension
      const baseName = key.replace(/\.[^/.]+$/, '').toLowerCase();
      inMemoryCache.set(baseName, url);
      synced++;
    }
    return synced;
  } catch (e) {
    return 0;
  }
}

// User Face persistence
export async function saveUserFaceToStore(dataUrl: string): Promise<void> {
  try {
    localStorage.setItem('vp_user_face', dataUrl);
  } catch {}

  // Also sync to server
  try {
    await fetch('/api/save-user-face', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl }),
    });
  } catch {}
}

export async function getUserFaceFromStore(): Promise<string | null> {
  try {
    const local = localStorage.getItem('vp_user_face');
    if (local) return local;
  } catch {}

  try {
    const res = await fetch('/api/get-user-face');
    const data = await res.json();
    if (data.exists && data.url) {
      return data.url;
    }
  } catch {}

  return null;
}

// AI Generated Try-On History persistence
export function saveAiHistoryToStore(history: any[]): void {
  try {
    localStorage.setItem('vp_ai_history', JSON.stringify(history.slice(0, 20)));
  } catch {}
}

export function getAiHistoryFromStore(): any[] {
  try {
    const str = localStorage.getItem('vp_ai_history');
    if (str) {
      return JSON.parse(str);
    }
  } catch {}
  return [];
}
