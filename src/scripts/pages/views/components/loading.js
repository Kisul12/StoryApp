// loading.js
export default class Loading {
  static create() {
    return `
      <div id="loading-container" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.8); display: flex; justify-content: center; align-items: center;">
        <div class="loading-spinner" style="border: 8px solid #f3f3f3; border-top: 8px solid #2196F3; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite;"></div>
      </div>
    `;
  }
}
