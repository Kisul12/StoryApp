import Loading from '../views/components/loading.js';

export default class DetailStoryPage {
  #presenter = null;
  #storyId = null;

  render() {
    return `
      <section style="max-width: 900px; margin: 40px auto; padding: 20px;">
        <div style="background-color: #fff; padding: 30px 20px; border-radius: 12px; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <h1 id="story-title" style="display: block; text-align: center; font-size: 2rem; font-weight: bold; color: #2196F3; margin-bottom: 10px;"></h1>
          <p id="story-date" style="display: block; text-align: center; font-size: 1rem; color: #666; margin-bottom: 20px;"></p>

          <div style="text-align: center; margin-bottom: 20px;">
            <img id="story-image" alt="" style="width: 100%; max-width: 600px; height: auto; border-radius: 10px;">
          </div>

          <div style="display: block; text-align: center; background-color:rgb(255, 255, 255); padding: 15px 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="font-size: 1.3rem; color: #2196F3; margin-bottom: 10px;">Deskripsi Cerita</h2>
            <p id="story-description" style="font-size: 1rem; color: #444;"></p>
          </div>

          <div id="map-container" style="height: 250px; border-radius: 10px;"></div>
        
          <div style="text-align: center; margin-top: 30px;">
            <button id="backBtn" style="background-color: #FF5722; color: white; border: none; padding: 10px 20px; font-size: 1rem; cursor: pointer; border-radius: 5px;">
              Kembali
            </button>
          </div>

        </div>
      </section>
    `;
  }

  async afterRender() {
    const loadingHTML = Loading.create();
    document.body.insertAdjacentHTML('beforeend', loadingHTML);

    const module = await import('./detail-story-presenter.js');
    const DetailStoryPresenter = module.default;

    this.#presenter = new DetailStoryPresenter({
      onStoryLoaded: this.showStoryDetails.bind(this),
    });

    this.#storyId = this.getStoryIdFromUrl();
    await this.#presenter.loadStoryDetails(this.#storyId);

    document.getElementById('loading-container').remove();

    const backBtn = document.getElementById('backBtn');
    backBtn.addEventListener('click', () => {
      window.location.hash = '#/';
    });
  }

  showStoryDetails(story) {
    document.getElementById('story-title').textContent = story.name;
    document.getElementById('story-date').textContent = new Date(story.createdAt).toLocaleString();
    document.getElementById('story-image').src = story.photoUrl;
    document.getElementById('story-description').textContent = story.description;

    if (story.lat && story.lon) {
      this.showMap(story.lat, story.lon, story.name);
    }
  }

    showMap(lat, lon, title = 'Lokasi') {
        const mapContainer = document.getElementById('map-container');
        const map = L.map(mapContainer).setView([lat, lon], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Reverse Geocoding to get location name from lat, lon
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
            .then(response => response.json())
            .then(data => {
            const locationName = data.display_name || title; // Use location name or fallback to title if not found

        L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>${locationName}</b><br>${title}`)
            .openPopup();
        })
        .catch(error => {
        console.error('Error during reverse geocoding:', error);

        // Fallback if geocoding fails, show lat/lon as a default in popup
        L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>${lat}, ${lon}</b><br>${title}`)
            .openPopup();
        });
    }


  getStoryIdFromUrl() {
    const hash = window.location.hash;
    const match = hash.match(/#\/story-detail\/(.+)/);
    return match ? match[1] : null;
  }
}
