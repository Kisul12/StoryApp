// src/scripts/views/pages/home-page.js (atau path yang sesuai)

import Loading from '../views/components/loading.js';
import { clearAllStories } from '../../utils/indexeddb-helper.js';

export default class HomePage {
  #presenter = null;

  render() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Saya memisahkan bagian tombol agar lebih mudah dibaca
    const authButtons = isLoggedIn
      ? `
        <button id="addStoryBtn" style="background-color: #FF5722; color: white; border: none; padding: 12px 25px; font-size: 1.1rem; cursor: pointer; border-radius: 5px;">Tambah Cerita</button>
        <button id="logoutBtn" style="background-color: #999; color: white; border: none; padding: 12px 25px; font-size: 1.1rem; cursor: pointer; border-radius: 5px;">Logout</button>
      `
      : `
        <button id="loginBtn" style="background-color: #2196F3; color: white; border: none; padding: 12px 25px; font-size: 1.1rem; cursor: pointer; border-radius: 5px;">Login</button>
      `;

    return `
      <section>
        <header style="background-color: #fff; padding: 40px 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); max-width: 900px; margin: 40px auto;">
          <div id="hero" style="text-align: center; padding: 40px 20px; background-color: #fff; color: #333; border-radius: 10px;">
            <h1 style="font-size: 2.5rem; font-weight: 700; letter-spacing: 1px; margin-bottom: 10px; color: #2196F3;">
              Selamat datang di Cerita Kami!
            </h1>
            <p style="font-size: 1.2rem; margin-bottom: 20px; color: #555;">
              ${isLoggedIn ? 'Selamat datang kembali! Yuk, tambahkan ceritamu.' : 'Baca cerita seru dari teman-teman, dan bagikan cerita kamu juga!'}
            </p>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; gap: 15px; margin-top: 30px; padding: 20px 30px; border-radius: 10px;">
            <div style="display: flex; justify-content: center; gap: 20px;">
              ${authButtons}
            </div>
            <button id="clearOfflineStoriesBtn" style="background-color: #f44336; color: white; border: none; padding: 10px 20px; font-size: 1rem; cursor: pointer; border-radius: 5px; margin-top: 10px;">Hapus Cerita Offline</button>
            <button id="enableNotificationsBtn" style="background-color: #4CAF50; color: white; border: none; padding: 10px 20px; font-size: 1rem; cursor: pointer; border-radius: 5px; margin-top: 10px;">Aktifkan Notifikasi Cerita</button>
          </div>
        </header>

        <div id="map" style="height: 300px; width: 100%; max-width: 100%; margin-top: 20px;"></div>

        <div style="text-align: center; margin-top: 40px; background-color:rgb(255, 255, 255); padding: 30px 20px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="font-size: 2rem; color: #2196F3; font-weight: 700; margin-bottom: 10px;">Cerita Terbaru</h2>
          <p style="font-size: 1.1rem; color: #666; font-style: italic;">Berikut adalah beberapa cerita terbaru dari teman-teman kita.</p>
        </div>

        <div id="storySliderContainer" style="max-width: 100%; margin: 0 auto; padding: 20px;">
          <div style="display: flex; align-items: center;">
            <button id="prevBtn" style="background-color: rgba(0,0,0,0.5); border: none; color: white; padding: 10px 15px; border-radius: 50%; cursor: pointer; margin-right: 10px;">❮</button>
            <div style="flex: 1; overflow: hidden;">
              <div id="storySlider" style="display: flex; transition: transform 0.5s ease-in-out;"></div>
            </div>
            <button id="nextBtn" style="background-color: rgba(0,0,0,0.5); border: none; color: white; padding: 10px 15px; border-radius: 50%; cursor: pointer; margin-left: 10px;">❯</button>
          </div>
          <div id="dots" style="text-align: center; margin-top: 10px;"></div>
        </div>

        <div id="logoutPopup" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); justify-content: center; align-items: center;">
          <div style="background-color: white; padding: 20px; border-radius: 8px; width: 300px; text-align: center;">
            <h3 style="margin-bottom: 20px;">Apakah Anda yakin ingin logout?</h3>
            <button id="confirmLogoutBtn" style="background-color: #FF5722; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px;">Logout</button>
            <button id="cancelLogoutBtn" style="background-color: #2196F3; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px; margin-left: 10px;">Batal</button>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    console.log('[HomePage] Starting afterRender...');
    const HomePresenterModule = await import('./home-presenter.js');
    console.log('[HomePage] HomePresenterModule:', HomePresenterModule);
    const HomePresenter = HomePresenterModule.default;
    console.log('[HomePage] HomePresenter constructor:', HomePresenter);

    if (!HomePresenter) {
      console.error('[HomePage] CRITICAL: HomePresenter constructor is undefined. Check import path to presenter.');
      this.showErrorMessage('Komponen utama aplikasi gagal dimuat. Silakan coba refresh halaman.');
      return;
    }

    this.#presenter = new HomePresenter({
      view: this, // Meneruskan instance HomePage sebagai view
      onStoriesLoaded: this.showStories.bind(this),
    });
    console.log('[HomePage] HomePresenter instance created:', this.#presenter);

    try {
      if (typeof this.#presenter.initMap === 'function') {
        await this.#presenter.initMap();
      }
      if (typeof this.#presenter.loadStories === 'function') {
        await this.#presenter.loadStories();
      }
      // Panggil untuk memeriksa status langganan saat halaman dimuat
      if (this.#presenter && typeof this.#presenter.checkNotificationSubscriptionStatus === 'function') {
        await this.#presenter.checkNotificationSubscriptionStatus();
      }
    } catch (error) {
      console.error('[HomePage] Error during initial content load (map, stories, or notification status):', error);
      this.showErrorMessage('Gagal memuat konten utama. Silakan coba lagi nanti.');
    }

    this._setupEventListeners(); // Panggil metode terpisah untuk setup event listener
  }

  // Metode terpisah untuk mendaftarkan semua event listener
  _setupEventListeners() {
    console.log('[HomePage] Setting up event listeners...');
    const addStoryBtn = document.getElementById('addStoryBtn');
    if (addStoryBtn) {
      addStoryBtn.addEventListener('click', () => {
        if (this.#presenter && typeof this.#presenter.handleAddStory === 'function') {
          this.#presenter.handleAddStory();
        }
      });
    }

    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        window.location.hash = '#/login';
      });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.showLogoutPopup();
      });
    }
    
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    if (cancelLogoutBtn) {
      cancelLogoutBtn.addEventListener('click', () => {
        this.hideLogoutPopup();
      });
    }

    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    if (confirmLogoutBtn) {
      confirmLogoutBtn.addEventListener('click', () => {
        this.handleLogout();
      });
    }

    const clearOfflineBtn = document.getElementById('clearOfflineStoriesBtn');
    if (clearOfflineBtn) {
      clearOfflineBtn.addEventListener('click', async () => {
        console.log('[HomePage] Tombol HAPUS DATA OFFLINE DIKLIK!');
        if (confirm('Apakah Anda yakin ingin menghapus semua cerita yang tersimpan secara offline? Data di server tidak akan terpengaruh.')) {
          console.log('[HomePage] Clear button confirmed. Attempting to clear IndexedDB...');
          try {
            await clearAllStories();
            console.log('[HomePage] clearAllStories() promise resolved. Data should be cleared.');
            alert('Semua cerita offline berhasil dihapus!');
            
            if (this.#presenter && typeof this.#presenter.loadStories === 'function') {
              console.log('[HomePage] Now attempting to reload stories after clearing IndexedDB...');
              await this.#presenter.loadStories();
            }
          } catch (error) {
            console.error('[HomePage] Failed to clear offline stories:', error);
            alert('Gagal menghapus cerita offline.');
          }
        } else {
          console.log('[HomePage] Clear offline stories cancelled by user.');
        }
      });
    } else {
      console.error('[HomePage] Tombol clearOfflineStoriesBtn TIDAK DITEMUKAN di DOM!');
    }

    const enableNotificationsBtn = document.getElementById('enableNotificationsBtn');
    if (enableNotificationsBtn) {
      enableNotificationsBtn.addEventListener('click', async () => {
        console.log('[HomePage] Tombol Aktifkan Notifikasi diklik. Memanggil presenter...');
        if (this.#presenter && typeof this.#presenter.handleToggleNotificationSubscription === 'function') {
          await this.#presenter.handleToggleNotificationSubscription();
        } else {
          console.error('[HomePage] Presenter or handleToggleNotificationSubscription method not found.');
          if (!this.#presenter) {
              console.error('[HomePage] Detail: this.#presenter is null or undefined at the moment of click.');
          } else {
              console.error(`[HomePage] Detail: this.#presenter is initialized, but handleToggleNotificationSubscription method is missing. Available methods on presenter: ${Object.getOwnPropertyNames(Object.getPrototypeOf(this.#presenter))}`);
          }
        }
      });
    } else {
      console.error('[HomePage] Tombol enableNotificationsBtn TIDAK DITEMUKAN di DOM!');
    }
  }

  showLogoutPopup() {
    const popup = document.getElementById('logoutPopup');
    if (popup) popup.style.display = 'flex';
  }

  hideLogoutPopup() {
    const popup = document.getElementById('logoutPopup');
    if (popup) popup.style.display = 'none';
  }

  async handleLogout() {
    const loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) loadingContainer.remove(); 

    document.body.insertAdjacentHTML('beforeend', Loading.create());

    setTimeout(() => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token');
      window.location.hash = '#/';
      window.location.reload(); 
    }, 1000);
  }

  showStories(stories) {
    // ... (kode showStories Anda tidak banyak berubah, mungkin tambahkan pengecekan elemen slider/dots di awal) ...
    console.log('[HomePage] Rendering stories received in view:', stories);

    const slider = document.getElementById('storySlider');
    const dotsContainer = document.getElementById('dots');
    if (!slider || !dotsContainer) {
      console.error('[HomePage] Slider or dots container not found in DOM for showStories.');
      return;
    }
    slider.innerHTML = '';
    dotsContainer.innerHTML = '';

    if (!stories || stories.length === 0) {
      slider.innerHTML = '<p style="text-align: center; width: 100%; padding: 20px;">Tidak ada cerita untuk ditampilkan saat ini.</p>';
      const prevButton = document.getElementById('prevBtn');
      const nextButton = document.getElementById('nextBtn');
      if (prevButton) prevButton.style.display = 'none';
      if (nextButton) nextButton.style.display = 'none';
      return;
    }

    const visibleCount = 4; 
    const cardWidth = 320; 
    let currentIndex = 0;
    const totalPages = Math.ceil(stories.length / visibleCount);

    stories.forEach((story) => {
      if (!story || typeof story.id === 'undefined') { 
        console.warn('[HomePage] Story data is missing or invalid (missing id):', story);
        return; 
      }

      const card = document.createElement('div');
      card.style.cssText = `
        flex: 0 0 ${cardWidth}px;
        max-width: ${cardWidth}px;
        margin: 0 10px;
        box-sizing: border-box;
        height: 100%;
      `;

      card.innerHTML = `
        <div style="background: white; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); overflow: hidden; height: 100%; display: flex; flex-direction: column;">
          <img src="${story.photoUrl || 'https://via.placeholder.com/300x250.png?text=No+Image'}" alt="Foto oleh ${story.name || 'Anonim'}" style="width: 100%; height: 250px; object-fit: cover; display: block;">
          <div style="padding: 15px; display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1;">
            <div>
              <p style="font-weight: bold; font-size: 1.2rem; margin-bottom: 5px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${story.name || 'Nama Tidak Diketahui'}</p>
              <p style="color: #555; font-size: 0.9rem; margin-bottom: 10px; height: 3.6em; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">${story.description || 'Deskripsi Tidak Ada'}</p>
              <p style="font-size: 0.8rem; color: #999;">${story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'Tanggal Tidak Diketahui'}</p>
            </div>
            <button class="detail-btn" style="background-color: #2196F3; color: white; border: none; padding: 10px 0; width:100%; font-size: 1rem; cursor: pointer; border-radius: 5px; margin-top: 10px;" data-id="${story.id}">Lihat Detail</button>
          </div>
        </div>
      `;
      slider.appendChild(card);
    });

    slider.style.width = `${Math.max(stories.length, visibleCount) * (cardWidth + 20)}px`;

    dotsContainer.innerHTML = '';
    if (totalPages > 0 && stories.length > visibleCount) {
        for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('span');
        dot.style.cssText = `
            display: inline-block;
            width: 10px;
            height: 10px;
            margin: 0 4px;
            background-color: ${i === 0 ? '#2196F3' : '#bbb'};
            border-radius: 50%;
            cursor: pointer;
        `;
        dot.addEventListener('click', () => {
            currentIndex = i;
            updateSlider();
        });
        dotsContainer.appendChild(dot);
        }
    }

    const updateSlider = () => {
      if (!slider || !dotsContainer) return;
      slider.style.transform = `translateX(-${currentIndex * visibleCount * (cardWidth + 20)}px)`;
      Array.from(dotsContainer.children).forEach((dot, i) => {
        if(dot instanceof HTMLElement) { 
            dot.style.backgroundColor = i === currentIndex ? '#2196F3' : '#bbb';
        }
      });
    };

    const prevButton = document.getElementById('prevBtn');
    const nextButton = document.getElementById('nextBtn');

    const showSliderControls = stories.length > visibleCount;
    if (prevButton) prevButton.style.display = showSliderControls ? 'block' : 'none';
    if (nextButton) nextButton.style.display = showSliderControls ? 'block' : 'none';
    if (dotsContainer) dotsContainer.style.display = showSliderControls ? 'block' : 'none';

    if(showSliderControls) {
        if(prevButton) {
            prevButton.onclick = () => {
                currentIndex = (currentIndex - 1 + totalPages) % totalPages;
                updateSlider();
            };
        }
        if(nextButton) {
            nextButton.onclick = () => {
                currentIndex = (currentIndex + 1) % totalPages;
                updateSlider();
            };
        }
    }
    
    updateSlider(); 

    const detailButtons = document.querySelectorAll('.detail-btn');
    detailButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const storyId = e.target.getAttribute('data-id');
        if (storyId) { 
          console.log(`[HomePage] Navigating to detail with ID: ${storyId}`);
          window.location.hash = `#/story-detail/${storyId}`;
        } else {
          console.error('[HomePage] Story ID not found on detail button.');
        }
      });
    });
  }

  // --- Metode untuk mengupdate tombol notifikasi, dipanggil oleh Presenter ---
  updateNotificationButtonState(isSubscribed, isDisabled = false) {
    const btn = document.getElementById('enableNotificationsBtn');
    if (btn) {
      if (isDisabled) {
        btn.textContent = 'Notifikasi Tdk Didukung';
        btn.disabled = true;
        btn.style.backgroundColor = '#ccc';
        btn.style.cursor = 'not-allowed';
      } else if (isSubscribed) {
        btn.textContent = 'Nonaktifkan Notifikasi';
        btn.style.backgroundColor = '#FFC107'; // Warna kuning
        btn.disabled = false;
        btn.style.cursor = 'pointer';
      } else {
        btn.textContent = 'Aktifkan Notifikasi Cerita';
        btn.style.backgroundColor = '#4CAF50'; // Warna hijau
        btn.disabled = false;
        btn.style.cursor = 'pointer';
      }
    } else {
        console.warn('[HomePage] Tombol enableNotificationsBtn tidak ditemukan saat update state.');
    }
  }

  // --- Metode untuk menampilkan pesan dari Presenter ---
  showNotificationMessage(message, isSuccess = true) {
    if (isSuccess) {
      console.log('[HomePage] Notification Feedback:', message);
      alert(message); // Anda bisa ganti dengan sistem notifikasi UI yang lebih baik
    } else {
      console.error('[HomePage] Notification Feedback (Error):', message);
      alert(message); // Anda bisa ganti dengan sistem notifikasi UI yang lebih baik
    }
  }
  
  // Metode view lain yang bisa dipanggil presenter
  showLoading() { 
      const existingLoading = document.getElementById('loading-container');
      if (!existingLoading) {
          document.body.insertAdjacentHTML('beforeend', Loading.create());
      }
      console.log('[HomePage] Show loading UI...');
  }
  hideLoading() { 
      const loadingContainer = document.getElementById('loading-container');
      if (loadingContainer) {
          loadingContainer.remove();
      }
      console.log('[HomePage] Hide loading UI...');
  }
  showErrorMessage(message) { 
    const storySlider = document.getElementById('storySlider');
    if (storySlider) {
        storySlider.innerHTML = `<p class="error-message" style="text-align: center; width: 100%; padding: 20px; color: red;">${message}</p>`;
    }
    console.error('[HomePage] Error Message Displayed:', message);
  }
  showOfflineMessage(message) { 
      const storySliderContainer = document.getElementById('storySliderContainer');
      if (storySliderContainer) {
          let offlineMsgElement = document.getElementById('offline-message-ui');
          if (!offlineMsgElement) {
              offlineMsgElement = document.createElement('p');
              offlineMsgElement.id = 'offline-message-ui';
              offlineMsgElement.style.cssText = "text-align: center; color: orange; padding: 10px; background-color: #fff3e0; border: 1px solid orange; border-radius: 5px; margin-bottom: 15px;";
              // Sisipkan sebelum storySliderContainer
              storySliderContainer.parentNode.insertBefore(offlineMsgElement, storySliderContainer);
          }
          offlineMsgElement.textContent = message;
          offlineMsgElement.style.display = 'block'; // Pastikan terlihat
      }
      console.warn('[HomePage] OFFLINE MESSAGE Displayed:', message);
  }
  showNoStoriesMessage(message) {
    const storySlider = document.getElementById('storySlider');
    if (storySlider) {
        storySlider.innerHTML = `<p style="text-align: center; width: 100%; padding: 20px;">${message || 'Tidak ada cerita untuk ditampilkan saat ini.'}</p>`;
    }
    const prevButton = document.getElementById('prevBtn');
    const nextButton = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('dots');
    if (prevButton) prevButton.style.display = 'none';
    if (nextButton) nextButton.style.display = 'none';
    if (dotsContainer) dotsContainer.style.display = 'none'; // Juga sembunyikan dots
    console.log('[HomePage] No Stories Message Displayed:', message);
  }
  showMapError(message) {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = `<p style="text-align: center; padding: 20px; color: red;">${message}</p>`;
    }
    console.error('[HomePage] Map Error Displayed:', message);
  }
}