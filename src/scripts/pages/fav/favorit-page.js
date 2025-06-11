// src/scripts/pages/fav/favorite-page.js

import FavoritePresenter from './favorit-presenter.js';

export default class FavoritePage {
  #presenter = null;

  render() {
    return `
      <div class="content">
        <h2 class="content__heading" style="text-align: center; color: #333; margin-bottom: 2rem;">Cerita Favorit Anda</h2>
        <div id="stories-list">
          </div>
      </div>
    `;
  }

  async afterRender() {
    this.#presenter = new FavoritePresenter({
      view: this,
    });
    this._setupEventListeners();
  }

  showSavedStories(stories) {
    const listContainer = document.querySelector('#stories-list');
    if (!listContainer) return;

    // Menerapkan style grid ke kontainer utama via JavaScript
    listContainer.style.display = 'grid';
    listContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    listContainer.style.gap = '1.5rem';
    listContainer.style.padding = '1rem';

    if (!stories || stories.length === 0) {
      listContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: #777; font-size: 1.2rem;">Anda belum memiliki cerita favorit.</p>';
      return;
    }

    listContainer.innerHTML = ''; // Kosongkan container
    stories.forEach(story => {
      listContainer.innerHTML += `
        <div class="story-card" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); overflow: hidden; display: flex; flex-direction: column;">
            <img src="${story.photoUrl}" alt="${story.name}" class="story-card__image" style="width: 100%; height: 200px; object-fit: cover;">
            
            <div class="story-card__content" style="padding: 1.25rem; display: flex; flex-direction: column; flex-grow: 1;">
                
                <h3 class="story-card__title" style="margin-top: 0; margin-bottom: 0.5rem; font-size: 1.25rem; font-weight: 700; color: #333;">
                    <a href="#/story-detail/${story.id}" style="text-decoration: none; color: inherit;">${story.name}</a>
                </h3>
                
                <p class="story-card__description" style="font-size: 0.95rem; color: #666; line-height: 1.5; flex-grow: 1; margin-bottom: 1rem;">
                    ${story.description.substring(0, 100)}...
                </p>
                
                <div class="story-card__actions" style="margin-top: auto; padding-top: 1rem; border-top: 1px solid #f0f0f0;">
                    <button 
                        class="delete-story-btn" 
                        data-id="${story.id}" 
                        style="width: 100%; background-color: #e74c3c; color: white; border: none; padding: 12px 16px; border-radius: 8px; font-size: 0.9rem; font-weight: bold; text-transform: uppercase; cursor: pointer;"
                    >
                        Hapus Favorit
                    </button>
                </div>

            </div>
        </div>
      `;
    });
  }

  _setupEventListeners() {
    const listContainer = document.querySelector('#stories-list');
    if (!listContainer) return;

    listContainer.addEventListener('click', (event) => {
      const target = event.target;
      if (target.classList.contains('delete-story-btn')) {
        const storyId = target.dataset.id;
        if (confirm('Anda yakin ingin menghapus cerita ini dari favorit?')) {
          this.#presenter.deleteStory(storyId);
        }
      }
    });
  }

  showSuccessMessage(message) {
    alert(message);
  }

  showErrorMessage(message) {
    alert(message);
  }
}