import { openDB } from 'idb'; // REKOMENDASI: Gunakan library 'idb' agar lebih ringkas
import CONFIG from './../config.js';

// Kode di bawah ini menggunakan 'idb' library yang lebih modern dan direkomendasikan.
const { DATABASE_NAME, DATABASE_VERSION, OBJECT_STORE_NAME } = CONFIG;

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
  },
});

const FavoriteStoryIdb = {
  async getStory(id) {
    if (!id) {
      return undefined;
    }
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },
  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },
  async putStory(story) {
    if (!story || !story.id) {
      return undefined;
    }
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },
  async deleteStory(id) {
    if (!id) {
      return undefined;
    }
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default FavoriteStoryIdb;