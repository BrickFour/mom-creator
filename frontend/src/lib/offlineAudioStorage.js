/**
 * Persistent offline audio storage for browser recordings using IndexedDB.
 * Ensures recorded audio blobs survive accidental page reloads, tab crashes,
 * offline periods, and mobile OS memory reclamation.
 */

const DB_NAME = 'mom_creator_recorder_db';
const DB_VERSION = 1;
const STORE_NAME = 'cached_recordings';

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported on this device.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'meetingId' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error || new Error('Failed to open IndexedDB.'));
    };
  });
}

/**
 * Saves a completed audio recording to local IndexedDB.
 */
export async function saveOfflineRecording({
  meetingId,
  blob,
  duration,
  detectedExt,
}) {
  if (!meetingId || !blob) return;

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const record = {
        meetingId: String(meetingId),
        blob,
        duration: Number(duration) || 0,
        detectedExt: detectedExt || 'webm',
        savedAt: Date.now(),
      };

      const request = store.put(record);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('Failed to save offline recording to IndexedDB:', err);
  }
}

/**
 * Retrieves a cached recording for a meeting from local IndexedDB.
 */
export async function getOfflineRecording(meetingId) {
  if (!meetingId) return null;

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(String(meetingId));

      request.onsuccess = (event) => {
        resolve(event.target.result || null);
      };

      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('Failed to read offline recording from IndexedDB:', err);
    return null;
  }
}

/**
 * Deletes a cached recording once successfully uploaded or discarded.
 */
export async function deleteOfflineRecording(meetingId) {
  if (!meetingId) return;

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(String(meetingId));

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('Failed to delete offline recording from IndexedDB:', err);
  }
}
