import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';

import { openDB } from './utils/indexeddb-helper.js';
import App from './pages/app.js';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  try {
    await app.renderPage();
  } catch (error) {
    console.error('Error rendering initial page:', error);
    const mainContent = document.querySelector('#main-content');
    if (mainContent) {
      mainContent.innerHTML = '<p class="error-message">Gagal memuat konten aplikasi. Silakan coba lagi nanti.</p>';
    }
  }

  window.addEventListener('hashchange', async () => {
    try {
      await app.renderPage();
    } catch (error) {
      console.error('Error rendering page on hashchange:', error);
    }
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker: Registration SUCCEEDED with scope: ', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker: Registration FAILED: ', error);
        });
    });
  } else {
    console.log('Service Worker is not supported by this browser.');
  }

  try {
    await openDB();
    console.log('IndexedDB is ready to use (database initialized).');
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
  }
});
