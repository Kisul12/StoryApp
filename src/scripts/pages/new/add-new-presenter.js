import API from '../../data/api';
import Loading from '../views/components/loading';
import L from 'leaflet';

const AddNewPresenter = {
  init({ form, descriptionInput, photoUploadInput, latInput, lonInput, locationStatus, map, onCaptureImage, onSubmitSuccess }) {
    if (!form || !descriptionInput || !photoUploadInput || !latInput || !lonInput || !map) {
      console.error('[AddNewPresenter] One or more required DOM elements or map instance are missing for init!');
      alert('Gagal menginisialisasi halaman tambah cerita. Beberapa komponen hilang.');
      return;
    }

    let marker = null;

    map.on('click', (e) => {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      latInput.value = lat;
      lonInput.value = lon;

      if (marker) {
        map.removeLayer(marker);
      }

      marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>Lokasi Terpilih:</b><br>Lat: ${lat.toFixed(5)}<br>Lon: ${lon.toFixed(5)}`)
        .openPopup();

      if (locationStatus) {
        locationStatus.textContent = `📍 Lokasi: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('[AddNewPresenter] Form submitted.');

      const description = descriptionInput.value.trim();
      const latValue = latInput.value;
      const lonValue = lonInput.value;

      if (!description) {
        alert('Deskripsi cerita tidak boleh kosong.');
        descriptionInput.focus();
        return;
      }

      if (!latValue || !lonValue) {
        alert('Harap pilih lokasi di peta untuk cerita Anda.');
        return;
      }

      const lat = parseFloat(latValue);
      const lon = parseFloat(lonValue);
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        alert('Koordinat lokasi tidak valid.');
        return;
      }

      let imageFile;
      try {
        if (photoUploadInput.files && photoUploadInput.files.length > 0) {
          imageFile = photoUploadInput.files[0];
          console.log('[AddNewPresenter] Using file from local input:', imageFile);
        } else if (typeof onCaptureImage === 'function') {
          imageFile = await onCaptureImage();
          console.log('[AddNewPresenter] Using file from camera/capture:', imageFile);
        }

        if (!imageFile || !(imageFile instanceof Blob)) {
          throw new Error('Anda harus memilih atau mengambil gambar untuk cerita.');
        }

        if (!imageFile.type.startsWith('image/')) {
          throw new Error('File yang diunggah harus berupa gambar (PNG, JPG, dll.).');
        }

        const maxSize = 1 * 1024 * 1024;
        if (imageFile.size > maxSize) {
          throw new Error('Ukuran gambar maksimum adalah 1MB. Silakan pilih gambar yang lebih kecil.');
        }
      } catch (error) {
        console.error('[AddNewPresenter] Image processing error:', error.message);
        alert(error.message);
        return;
      }

      document.getElementById('loading-container')?.remove();
      document.body.insertAdjacentHTML('beforeend', Loading.create());

      if (!navigator.onLine) {
        console.warn('[AddNewPresenter] Application is offline. Cannot submit story now.');
        document.getElementById('loading-container')?.remove();
        alert('Anda sedang offline. Cerita tidak dapat dikirim. Periksa koneksi internet Anda dan coba lagi.');
        return;
      }

      try {
        console.log('[AddNewPresenter] Attempting to add story via API...');
        const response = await API.addStory({
          description,
          photo: imageFile,
          lat,
          lon,
        });
        console.log('[AddNewPresenter] API addStory response:', response);
        document.getElementById('loading-container')?.remove();

        if (response && !response.error) {
          this._showSuccessPopup();

          if (onSubmitSuccess && typeof onSubmitSuccess === 'function') {
            setTimeout(() => {
              onSubmitSuccess();
            }, 1500);
          }
        } else {
          throw new Error(response.message || 'Terjadi kesalahan dari server saat menambahkan cerita.');
        }
      } catch (err) {
        console.error('[AddNewPresenter] Failed to add story via API:', err);
        document.getElementById('loading-container')?.remove();
        if (err.message.toLowerCase().includes('failed to fetch') || err.message.toLowerCase().includes('networkerror')) {
          alert(`Gagal menambahkan cerita: Masalah koneksi. Periksa internet Anda dan coba lagi.`);
        } else {
          alert(`Gagal menambahkan cerita: ${err.message}`);
        }
      }
    });
  },

  _showSuccessPopup() {
    const popup = document.createElement('div');
    popup.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #4CAF50;
      color: white;
      padding: 20px 40px;
      border-radius: 8px;
      font-size: 1.2rem;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      text-align: center;
      z-index: 9999;
    `;
    popup.innerText = 'Cerita berhasil ditambahkan!';
    document.body.appendChild(popup);
    setTimeout(() => {
      if (document.body.contains(popup)) {
        popup.remove();
      }
    }, 2500);
  },
};

export default AddNewPresenter;
