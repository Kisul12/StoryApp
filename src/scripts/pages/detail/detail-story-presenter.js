import API from '../../data/api.js'; // Sesuaikan path API yang kamu gunakan

export default class DetailStoryPresenter {
  constructor({ onStoryLoaded }) {
    this.onStoryLoaded = onStoryLoaded;
  }

  async loadStoryDetails(storyId) {
    try {
      const story = await this.fetchStoryById(storyId);
      if (story) {
        this.onStoryLoaded(story); // Mengirimkan data cerita ke view
      } else {
        console.error('Cerita tidak ditemukan');
      }
    } catch (error) {
      console.error('Gagal mengambil cerita:', error);
    }
  }

  async fetchStoryById(storyId) {
    try {
      const response = await API.getStoryDetail(storyId);
      return response;
    } catch (error) {
      console.error('Gagal mengambil cerita:', error);
    }
  }
}
