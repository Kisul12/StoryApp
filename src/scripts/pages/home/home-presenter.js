import API from '../../data/api.js';
import Map from '../../utils/map.js';
import { putStories, getAllStories } from '../../utils/indexeddb-helper.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default class HomePresenter {
  constructor({ view, onStoriesLoaded }) {
    this.view = view;
    this.onStoriesLoaded = onStoriesLoaded;
    this.map = null;
    this._isSubscribedToNotifications = false;
  }

  async initMap() {
    try {
      this.map = await Map.build('#map', {
        zoom: 5,
        locate: true,
      });
      console.log('[HomePresenter] Map initialized successfully.');
    } catch (error) {
      console.error('[HomePresenter] Error initializing map:', error);
      if (this.view && typeof this.view.showMapError === 'function') {
        this.view.showMapError('Gagal memuat peta.');
      }
    }
  }

  async loadStories() {
    if (this.view && typeof this.view.showLoading === 'function') {
      this.view.showLoading();
    }
    console.log('[HomePresenter] Attempting to load stories from API...');

    try {
      const storiesDataFromAPI = await API.getStories({ page: 1, size: 10 });

      if (storiesDataFromAPI && Array.isArray(storiesDataFromAPI) && storiesDataFromAPI.length > 0) {
        this.onStoriesLoaded(storiesDataFromAPI);
        this.addMarkersToMap(storiesDataFromAPI);
        try {
          await putStories(storiesDataFromAPI);
        } catch (dbError) {
          console.error('[HomePresenter] Failed to save stories from API to IndexedDB:', dbError);
        }
      } else if (storiesDataFromAPI && Array.isArray(storiesDataFromAPI) && storiesDataFromAPI.length === 0) {
        this.onStoriesLoaded([]);
        if (this.view && typeof this.view.showNoStoriesMessage === 'function') {
          this.view.showNoStoriesMessage('Tidak ada cerita baru yang ditemukan dari server.');
        }
      } else {
        this.onStoriesLoaded([]);
        if (this.view && typeof this.view.showErrorMessage === 'function') {
          this.view.showErrorMessage('Format data cerita tidak sesuai.');
        }
      }
    } catch (error) {
      try {
        const storiesFromDB = await getAllStories();
        if (storiesFromDB && storiesFromDB.length > 0) {
          this.onStoriesLoaded(storiesFromDB);
          this.addMarkersToMap(storiesFromDB);
          if (this.view && typeof this.view.showOfflineMessage === 'function') {
            this.view.showOfflineMessage('Menampilkan data offline. Periksa koneksi internet Anda.');
          }
        } else {
          this.onStoriesLoaded([]);
          if (this.view && typeof this.view.showErrorMessage === 'function') {
            this.view.showErrorMessage(`Gagal memuat cerita: ${error.message}. Tidak ada data offline yang tersedia.`);
          }
        }
      } catch (dbError) {
        this.onStoriesLoaded([]);
        if (this.view && typeof this.view.showErrorMessage === 'function') {
          this.view.showErrorMessage(`Gagal memuat cerita: ${error.message}. Gagal memuat data offline.`);
        }
      }
    } finally {
      if (this.view && typeof this.view.hideLoading === 'function') {
        this.view.hideLoading();
      }
    }
  }

  addMarkersToMap(stories) {
    if (!this.map || !stories) {
      return;
    }

    stories.forEach((story) => {
      const { lat, lon, name, photoUrl, description, id } = story;

      if (lat != null && lon != null) {
        const coordinates = [lat, lon];
        const photoHtml = photoUrl ? `<img src="${photoUrl}" width="100" alt="Foto cerita ${name || ''}" style="display:block; margin-bottom:5px;"><br>` : '';
        const popupContent = `
          <div style="font-family: sans-serif; max-width: 200px;">
            <strong style="font-size: 1.1em;">${name || 'Tidak ada nama'}</strong><br>
            ${photoHtml}
            <p style="font-size: 0.9em; margin: 5px 0;">${description || 'Tidak ada deskripsi'}</p>
            <button style="padding: 5px 10px; background-color: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer;" onclick="window.location.hash='#/story-detail/${id}'">Lihat Detail</button>
          </div>
        `;
        this.map.addMarker(coordinates, {}, { content: popupContent });
      }
    });
  }

  handleAddStory() {
    window.location.hash = '#/add-story';
  }

  async checkNotificationSubscriptionStatus() {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      if (this.view && typeof this.view.updateNotificationButtonState === 'function') {
        this.view.updateNotificationButtonState(false, true);
      }
      return;
    }
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      this._isSubscribedToNotifications = !!existingSubscription;
      if (this.view && typeof this.view.updateNotificationButtonState === 'function') {
        this.view.updateNotificationButtonState(this._isSubscribedToNotifications, false);
      }
    } catch (error) {
      if (this.view && typeof this.view.updateNotificationButtonState === 'function') {
        this.view.updateNotificationButtonState(false, true);
      }
    }
  }

  async handleToggleNotificationSubscription() {
    if (this._isSubscribedToNotifications) {
      await this._unsubscribeUserFromPush();
    } else {
      await this._askPermissionAndSubscribe();
    }
  }

  async _askPermissionAndSubscribe() {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      if (this.view && typeof this.view.showNotificationMessage === 'function') {
        this.view.showNotificationMessage('Browser Anda tidak mendukung Push Notification.', false);
      }
      return;
    }

    try {
      const permissionResult = await Notification.requestPermission();
      if (permissionResult === 'granted') {
        await this._subscribeUserToPush();
      } else {
        if (this.view && typeof this.view.showNotificationMessage === 'function') {
          this.view.showNotificationMessage('Anda menolak izin notifikasi.', false);
        }
      }
    } catch (error) {
      if (this.view && typeof this.view.showNotificationMessage === 'function') {
        this.view.showNotificationMessage('Gagal meminta izin notifikasi. Lihat console untuk detail.', false);
      }
    }
  }

  async _subscribeUserToPush() {
    const vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    try {
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      const existingSubscription = await serviceWorkerRegistration.pushManager.getSubscription();

      if (existingSubscription) {
        this._isSubscribedToNotifications = true;
        if (this.view && typeof this.view.showNotificationMessage === 'function') {
          this.view.showNotificationMessage('Anda sudah berlangganan notifikasi.');
        }
        if (this.view && typeof this.view.updateNotificationButtonState === 'function') {
          this.view.updateNotificationButtonState(true);
        }
        return;
      }

      const subscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      await this._sendSubscriptionToServer(subscription, true);

    } catch (error) {
      this._isSubscribedToNotifications = false;
      if (this.view && typeof this.view.updateNotificationButtonState === 'function') {
        this.view.updateNotificationButtonState(false);
      }
    }
  }

  async _sendSubscriptionToServer(subscription, isSubscribing) {
    const action = isSubscribing ? 'subscribe' : 'unsubscribe (implisit)';
    try {
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth,
        },
      };

      await API.subscribeNotification(subscriptionData);

      this._isSubscribedToNotifications = true;
      if (this.view && typeof this.view.showNotificationMessage === 'function') {
        this.view.showNotificationMessage('Berhasil berlangganan notifikasi!');
      }
      if (this.view && typeof this.view.updateNotificationButtonState === 'function') {
        this.view.updateNotificationButtonState(true);
      }
    } catch (error) {
      this._isSubscribedToNotifications = false;
      if (this.view && typeof this.view.showNotificationMessage === 'function') {
        this.view.showNotificationMessage(`Gagal memproses langganan notifikasi di server: ${error.message}`, false);
      }
      if (this.view && typeof this.view.updateNotificationButtonState === 'function') {
        this.view.updateNotificationButtonState(false);
      }
      if (isSubscribing && subscription) {
        try {
          await subscription.unsubscribe();
        } catch (unsubError) {
          console.error('[HomePresenter] Error saat mencoba unsubscribe setelah gagal kirim:', unsubError);
        }
      }
    }
  }

  async _unsubscribeUserFromPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpointToUnsubscribe = subscription.endpoint;
        const unsubscribedSuccessfully = await subscription.unsubscribe();

        if (unsubscribedSuccessfully) {
          await this._sendUnsubscribeToServer(endpointToUnsubscribe);
        } else {
          if (this.view && typeof this.view.showNotificationMessage === 'function') {
            this.view.showNotificationMessage('Gagal membatalkan langganan notifikasi di browser.', false);
          }
        }
      } else {
        this._isSubscribedToNotifications = false;
        if (this.view && typeof this.view.updateNotificationButtonState === 'function') {
          this.view.updateNotificationButtonState(false);
        }
        if (this.view && typeof this.view.showNotificationMessage === 'function') {
          this.view.showNotificationMessage('Anda belum berlangganan notifikasi.', false);
        }
      }
    } catch (error) {
      if (this.view && typeof this.view.showNotificationMessage === 'function') {
        this.view.showNotificationMessage('Terjadi error saat membatalkan langganan.', false);
      }
    }
  }

  async _sendUnsubscribeToServer(endpoint) {
    try {
      await API.unsubscribeNotification(endpoint);
      this._isSubscribedToNotifications = false;
      if (this.view && typeof this.view.showNotificationMessage === 'function') {
        this.view.showNotificationMessage('Langganan notifikasi berhasil dibatalkan.');
      }
      if (this.view && typeof this.view.updateNotificationButtonState === 'function') {
        this.view.updateNotificationButtonState(false);
      }
    } catch (error) {
      if (this.view && typeof this.view.showNotificationMessage === 'function') {
        this.view.showNotificationMessage(`Gagal membatalkan langganan di server: ${error.message}. Mungkin perlu dicoba lagi.`, false);
      }
    }
  }
}
