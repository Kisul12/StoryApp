// src/scripts/pages/fav/favorit-presenter.js

// [PERBAIKAN] Impor default object FavoriteStoryIdb, bukan fungsi terpisah
import FavoriteStoryIdb from '../../utils/indexeddb-helper.js';

export default class FavoritePresenter {
  #view;

  constructor({ view }) {
    this.#view = view;

    this._loadSavedStories();
  }

  async _loadSavedStories() {
    try {
      // [PERBAIKAN] Panggil metode dari object FavoriteStoryIdb
      const stories = await FavoriteStoryIdb.getAllStories();
      this.#view.showSavedStories(stories);
    } catch (error) {
      console.error('[FavoritePresenter] Failed to load saved stories:', error);
      this.#view.showErrorMessage('Gagal memuat cerita tersimpan.');
    }
  }

  // Ubah dari _deleteStory menjadi metode 'publik' agar bisa dipanggil view
  async deleteStory(id) {
    try {
      // [PERBAIKAN] Panggil metode dari object FavoriteStoryIdb
      await FavoriteStoryIdb.deleteStory(id);
      
      // Muat ulang daftar cerita untuk memperbarui UI setelah hapus
      await this._loadSavedStories();
      
      this.#view.showSuccessMessage('Cerita berhasil dihapus dari favorit.');
    } catch (error) {
      console.error(`[FavoritePresenter] Failed to delete story ${id}:`, error);
      this.#view.showErrorMessage('Gagal menghapus cerita.');
    }
  }
}