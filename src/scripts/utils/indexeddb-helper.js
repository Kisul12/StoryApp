const DB_NAME = 'story-app-db';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

const putStories = async (stories) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(OBJECT_STORE_NAME);
    const itemsToPut = Array.isArray(stories) ? stories : [stories];

    for (const story of itemsToPut) {
      if (story && typeof story.id !== 'undefined') {
        store.put(story);
      }
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

const getAllStories = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(OBJECT_STORE_NAME, 'readonly');
    const store = transaction.objectStore(OBJECT_STORE_NAME);
    const stories = await store.getAll();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(stories || []);
      transaction.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

const clearAllStories = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(OBJECT_STORE_NAME);
    store.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(event.target.error);
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

export { openDB, OBJECT_STORE_NAME, putStories, getAllStories, clearAllStories };
