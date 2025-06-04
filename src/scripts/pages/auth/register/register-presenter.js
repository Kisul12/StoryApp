// src/scripts/pages/auth/register/register-presenter.js
import API from '../../../data/api.js';

export default class RegisterPresenter {
  constructor({ form, loading, onStarted, onSuccess, onFailure }) {
    this._form = form;
    this._loading = loading;
    this._onStarted = onStarted;
    this._onSuccess = onSuccess;
    this._onFailure = onFailure;
    this._bindEvents();
  }

  _showLoading(show) {
    if (this._loading) this._loading.style.display = show ? 'flex' : 'none';
  }

  _bindEvents() {
    this._form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = this._form.querySelector('#name').value.trim();
      const email = this._form.querySelector('#email').value.trim();
      const password = this._form.querySelector('#password').value.trim();

      this._onStarted?.();
      this._showLoading(true);

      try {
        await API.getRegistered({ name, email, password });
        this._onSuccess?.();
      } catch (err) {
        this._onFailure?.(err);
      } finally {
        this._showLoading(false);
      }
    });
  }
}
