
import FavoriteStoryIdb from './indexeddb-helper';

const FavoriteButtonPresenter = {
  async init({ favoriteButtonContainer, story }) {
    this._favoriteButtonContainer = favoriteButtonContainer;
    this._story = story;

    await this._renderButton();
  },

  async _renderButton() {
    const { id } = this._story;
    const isFavorited = await this._isStoryExist(id);

    if (isFavorited) {
      this._renderFavorited();
    } else {
      this._renderFavorite();
    }
  },

  async _isStoryExist(id) {
    const story = await FavoriteStoryIdb.getStory(id);
    return !!story;
  },

  _renderFavorite() {
    this._favoriteButtonContainer.innerHTML = `
      <button 
        aria-label="add to favorites" 
        id="favoriteButton" 
        class="favorite-button"
        style="
          display: inline-block;
          width: 100%;
          max-width: 350px;
          padding: 14px 28px;
          border: none;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 700;
          text-align: center;
          color: #ffffff;
          cursor: pointer;
          background: linear-gradient(45deg, #3498db, #2980b9);
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
          transition: all 0.3s ease-in-out;
        "
      >
        Tambahkan ke Favorit ❤️
      </button>
    `;

    const favoriteButton = document.querySelector('#favoriteButton');
    favoriteButton.addEventListener('click', async () => {
      await FavoriteStoryIdb.putStory(this._story);
      this._renderButton();
    });
  },

  _renderFavorited() {
    this._favoriteButtonContainer.innerHTML = `
      <button 
        aria-label="remove from favorites" 
        id="favoriteButton" 
        class="favorite-button"
        style="
          display: inline-block;
          width: 100%;
          max-width: 350px;
          padding: 14px 28px;
          border: none;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 700;
          text-align: center;
          color: #ffffff;
          cursor: pointer;
          background: linear-gradient(45deg, #e74c3c, #c0392b);
          box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
          transition: all 0.3s ease-in-out;
        "
        >
        Hapus dari Favorit 💔
        </button>
    `;

    const favoriteButton = document.querySelector('#favoriteButton');
    favoriteButton.addEventListener('click', async () => {
      await FavoriteStoryIdb.deleteStory(this._story.id);
      this._renderButton();
    });
  },
};

export default FavoriteButtonPresenter;