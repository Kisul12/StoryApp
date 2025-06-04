import AddNewPresenter from './add-new-presenter';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Atur ikon default Leaflet agar tidak broken
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

export default class AddNewPage {
  #map = null;
  #currentMarker = null;
  #cameraStream = null;

  async render() {
    return `
      <section style="padding: 20px; max-width: 600px; margin: auto;">
        <a href="#/home" style="text-decoration: none; display: flex; align-items: center; margin-bottom: 20px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px;">
            <path d="M19 12H5M12 5l-7 7 7 7"></path>
          </svg>
          <span style="font-size: 18px; color: #2196F3;">Kembali</span>
        </a>

        <h2 style="text-align: center; color: #2196F3;">Tambah Cerita Baru</h2>
        <form id="add-form">
          <div style="margin-bottom: 15px;">
            <label for="description" style="display: block; margin-bottom: 5px; font-weight: 500;">Deskripsi</label>
            <textarea id="description" rows="4" required
              style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc;"></textarea>
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Pratinjau Kamera</label>
            <video id="camera-preview" autoplay playsinline style="width: 100%; height: auto; border-radius: 5px; border: 1px solid #ccc; margin-bottom: 15px;"></video>
            <canvas id="capture-canvas" style="display: none;"></canvas>
          </div>
          <div style="margin-bottom: 20px;">
            <label for="photo-upload" style="display: block; margin-bottom: 5px; font-weight: 500;">Unggah Foto (Opsional)</label>
            <input type="file" id="photo-upload" accept="image/*"
              style="display: block; width: 100%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;" />
          </div>
          <div style="margin-bottom: 20px;">
            <label for="location" style="display: block; margin-bottom: 5px; font-weight: 500;">Lokasi</label>
            <p id="location-status" style="margin: 10px 0; color: #4CAF50;">📍 Mencari lokasi...</p>
            <input type="hidden" id="lat" />
            <input type="hidden" id="lon" />
          </div>
          <div id="map" style="height: 300px; border-radius: 5px; border: 1px solid #ccc;"></div>

          <button type="submit"
            style="width: 100%; padding: 12px; background-color: #2196F3; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer;">
            Kirim
          </button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    // Aktifkan kamera
    const video = document.getElementById('camera-preview');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      this.#cameraStream = stream;
      video.srcObject = stream;
    } catch (err) {
      console.warn('Gagal membuka kamera:', err);
      video.replaceWith('Tidak dapat mengakses kamera.');
    }

    // Inisialisasi peta
    const defaultLatLng = [0, 0];
    this.#map = L.map('map').setView(defaultLatLng, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.#map);

    const getAddressFromCoordinates = async (lat, lon) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const data = await response.json();
        return data.display_name || `Lokasi: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      } catch {
        return `Lokasi: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      }
    };

    const setLocation = async (lat, lon) => {
      document.getElementById('lat').value = lat;
      document.getElementById('lon').value = lon;
      const address = await getAddressFromCoordinates(lat, lon);
      document.getElementById('location-status').textContent = `📍 ${address}`;

      if (this.#currentMarker) {
        this.#currentMarker.setLatLng([lat, lon]);
      } else {
        this.#currentMarker = L.marker([lat, lon]).addTo(this.#map);
      }
      this.#currentMarker.bindPopup(address).openPopup();
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.#map.setView([latitude, longitude], 15);
        setLocation(latitude, longitude);
      },
      () => {
        document.getElementById('location-status').textContent = '📍 Gagal mengambil lokasi otomatis.';
      }
    );

    this.#map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      await setLocation(lat, lng);
    });

    // Tangkap referensi elemen
    const form = document.getElementById('add-form');
    const descriptionInput = document.getElementById('description');
    const photoUploadInput = document.getElementById('photo-upload');
    const latInput = document.getElementById('lat');
    const lonInput = document.getElementById('lon');
    const locationStatus = document.getElementById('location-status');
    const canvas = document.getElementById('capture-canvas');

    // Lewatkan callback onSubmitSuccess ke AddNewPresenter
    AddNewPresenter.init({
      form,
      descriptionInput,
      photoUploadInput,
      latInput,
      lonInput,
      locationStatus,
      map: this.#map,
      onCaptureImage: () => {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'captured.jpg', { type: 'image/jpeg' });
              resolve(file);
            } else {
              resolve(null);
            }
          }, 'image/jpeg');
        });
      },
      onSubmitSuccess: () => this.onSubmitSuccess(), // Callback untuk membersihkan setelah sukses
    });

    const backLink = document.querySelector('a[href="#/home"]');
    if (backLink) {
      backLink.addEventListener('click', () => {
        this.cleanup();
      });
    }

    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  cleanup() {
    if (this.#currentMarker) {
      this.#map.removeLayer(this.#currentMarker);
      this.#currentMarker = null;
    }

    if (this.#map) {
      this.#map.off();
      this.#map.remove();
      this.#map = null;
    }

    if (this.#cameraStream) {
      this.#cameraStream.getTracks().forEach((track) => {
        track.stop();
        console.log('Camera track stopped:', track.kind);
      });
      this.#cameraStream = null;
    }

    console.log('Cleanup performed: removed map, marker, and stopped camera.');
  }

  async onSubmitSuccess() {
    this.cleanup(); // Panggil cleanup sebelum navigasi
    window.location.hash = '#/home'; // Navigasi ke home setelah cleanup
  }
}