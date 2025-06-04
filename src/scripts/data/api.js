import CONFIG from '../config';

const ENDPOINTS = {
  // auth
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,

  // stories
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: `${CONFIG.BASE_URL}/stories`, 
  GUEST_STORY: `${CONFIG.BASE_URL}/stories/guest`,

  // notifications
  NOTIFICATION_SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

const API = {
  async getRegistered({ name, email, password }) {
    try {
      const response = await fetch(ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.message);
      return data;
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  },

  async getLogin({ email, password }) {
    try {
      const response = await fetch(ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.message);
      localStorage.setItem('token', data.loginResult.token);
      return data;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  },

  async getStories({ page, size, location } = {}) {
    console.log('Fetching stories with params:', { page, size, location });    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      // Membuat query parameters jika ada
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page);
      if (size) queryParams.append('size', size);
      if (location !== undefined) queryParams.append('location', location);

      const response = await fetch(
        `${ENDPOINTS.STORIES}${queryParams.toString() ? `?${queryParams}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.message);
      return data.listStory;
    } catch (error) {
      throw new Error(`Failed to fetch stories: ${error.message}`);
    }
  },

  async getStoryDetail(id) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${ENDPOINTS.STORY_DETAIL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.error) throw new Error(data.message);
      return data.story;
    } catch (error) {
      throw new Error(`Failed to fetch story detail: ${error.message}`);
    }
  },

  async addStory({ description, photo, lat, lon }) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      // Validasi photo
      if (!(photo instanceof Blob) || !photo.type.startsWith('image/')) {
        throw new Error('Photo must be a valid image file');
      }

      // Validasi ukuran file (max 1MB)
      const maxSize = 1 * 1024 * 1024; // 1MB dalam bytes
      if (photo.size > maxSize) {
        throw new Error('Photo size must be less than 1MB');
      }

      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photo, photo.name || 'captured.jpg'); // Gunakan nama file asli jika ada
      if (lat !== undefined) formData.append('lat', lat);
      if (lon !== undefined) formData.append('lon', lon);

      // Debugging: Log isi FormData
      for (let [key, value] of formData.entries()) {
        console.log(`[API] FormData ${key}:`, value);
      }

      const response = await fetch(ENDPOINTS.STORIES, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log('[API] Response:', data);

      if (!response.ok) {
        throw new Error(`Failed to add story: ${data.message || response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('[API] Error:', error);
      throw new Error(`Failed to add story: ${error.message}`);
    }
  },

  async addGuestStory({ description, photo, lat, lon }) {
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photo);
      if (lat !== undefined) formData.append('lat', lat);
      if (lon !== undefined) formData.append('lon', lon);

      const response = await fetch(ENDPOINTS.GUEST_STORY, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.error) throw new Error(data.message);
      return data;
    } catch (error) {
      throw new Error(`Failed to add guest story: ${error.message}`);
    }
  },

  async subscribeNotification({ endpoint, keys }) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(ENDPOINTS.NOTIFICATION_SUBSCRIBE, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint, keys }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.message);
      return data;
    } catch (error) {
      throw new Error(`Failed to subscribe notification: ${error.message}`);
    }
  },

  async unsubscribeNotification(endpoint) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(ENDPOINTS.NOTIFICATION_SUBSCRIBE, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.message);
      return data;
    } catch (error) {
      throw new Error(`Failed to unsubscribe notification: ${error.message}`);
    }
  },

  async getUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token tidak ditemukan');

    const response = await fetch(`${ENDPOINTS.USER_PROFILE}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.error) throw new Error(data.message);
    return data; // pastikan server mengembalikan { name, email, dsb }
  },
};

export default API;